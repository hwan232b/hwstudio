"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/client";

type Gallery = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  description: string | null;
  passcode: string | null;
  requires_approved_email: boolean;
  expiration_date: string | null;
  is_listed: boolean;
  display_order: number;
  drive_folder_id: string | null;
  full_download_url: string | null;
};

type ApprovedEmail = { id: string; gallery_id: string; email: string };

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function parseFolder(raw: string): string {
  const value = raw.trim();
  return isGoogleDriveFolderUrl(value) ? extractGoogleDriveFolderId(value) ?? value : value;
}

function GalleryEditor({
  gallery,
  onSave,
  onDelete,
}: {
  gallery: Gallery;
  onSave: (patch: Partial<Gallery>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: gallery.title,
    slug: gallery.slug,
    event_date: gallery.event_date ?? "",
    description: gallery.description ?? "",
    passcode: gallery.passcode ?? "",
    requires_approved_email: gallery.requires_approved_email,
    expiration_date: gallery.expiration_date ?? "",
    is_listed: gallery.is_listed,
    drive_folder_id: gallery.drive_folder_id ?? "",
    full_download_url: gallery.full_download_url ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave({
      title: form.title,
      slug: slugify(form.slug || form.title),
      event_date: form.event_date || null,
      description: form.description,
      passcode: form.passcode,
      requires_approved_email: form.requires_approved_email,
      expiration_date: form.expiration_date || null,
      is_listed: form.is_listed,
      drive_folder_id: parseFolder(form.drive_folder_id),
      full_download_url: form.full_download_url,
    });
  }

  return (
    <form className="admin-panel admin-form" onSubmit={save}>
      <h2>Edit gallery</h2>
      <label>
        Title
        <input value={form.title} onChange={(e) => set("title", e.target.value)} />
      </label>
      <div className="admin-two-column">
        <label>
          URL slug
          <input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </label>
        <label>
          Event date
          <input type="date" value={form.event_date} onChange={(e) => set("event_date", e.target.value)} />
        </label>
      </div>
      <label>
        Description
        <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </label>
      <label>
        Google Drive folder (link or ID)
        <input
          value={form.drive_folder_id}
          onChange={(e) => set("drive_folder_id", e.target.value)}
          placeholder="https://drive.google.com/drive/folders/…"
        />
      </label>
      <div className="admin-two-column">
        <label>
          Passcode
          <input value={form.passcode} onChange={(e) => set("passcode", e.target.value)} />
        </label>
        <label>
          Expiration date (optional)
          <input type="date" value={form.expiration_date} onChange={(e) => set("expiration_date", e.target.value)} />
        </label>
      </div>
      <label>
        Full-gallery download link (optional)
        <input value={form.full_download_url} onChange={(e) => set("full_download_url", e.target.value)} />
      </label>
      <label className="admin-check">
        <input type="checkbox" checked={form.is_listed} onChange={(e) => set("is_listed", e.target.checked)} />
        Show in the public client directory
      </label>
      <label className="admin-check">
        <input
          type="checkbox"
          checked={form.requires_approved_email}
          onChange={(e) => set("requires_approved_email", e.target.checked)}
        />
        Also require an approved email
      </label>
      <div className="admin-photo-actions">
        <button className="dark-button" type="submit">
          Save gallery
        </button>
        <button className="text-button" type="button" onClick={onDelete}>
          Delete gallery
        </button>
      </div>
    </form>
  );
}

export default function AdminGalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [emails, setEmails] = useState<ApprovedEmail[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const loadGalleries = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("galleries").select("*").order("display_order");
    const rows = (data as Gallery[]) ?? [];
    setGalleries(rows);
    setLoading(false);
    return rows;
  }, []);

  const loadEmails = useCallback(async (galleryId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("approved_emails").select("*").eq("gallery_id", galleryId);
    setEmails((data as ApprovedEmail[]) ?? []);
  }, []);

  useEffect(() => {
    loadGalleries().then((rows) => {
      setSelectedId((current) => current ?? rows[0]?.id ?? null);
    });
  }, [loadGalleries]);

  useEffect(() => {
    if (selectedId) loadEmails(selectedId);
  }, [selectedId, loadEmails]);

  const selected = galleries.find((g) => g.id === selectedId) ?? null;

  async function createGallery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const supabase = createClient();
    const order = galleries.length ? Math.max(...galleries.map((g) => g.display_order)) + 1 : 1;
    const { data, error } = await supabase
      .from("galleries")
      .insert({
        title,
        slug: slugify(title),
        passcode: newPass.trim(),
        drive_folder_id: parseFolder(newFolder),
        display_order: order,
      })
      .select()
      .single();
    if (error) {
      setStatus(`Couldn't create — ${error.message}`);
      return;
    }
    setNewTitle("");
    setNewPass("");
    setNewFolder("");
    await loadGalleries();
    setSelectedId(data.id);
    setStatus("Gallery created.");
  }

  async function saveGallery(patch: Partial<Gallery>) {
    if (!selected) return;
    const supabase = createClient();
    const { error } = await supabase.from("galleries").update(patch).eq("id", selected.id);
    if (error) {
      setStatus(`Couldn't save — ${error.message}`);
    } else {
      setStatus("Gallery saved.");
      loadGalleries();
    }
  }

  async function deleteGallery() {
    if (!selected) return;
    const supabase = createClient();
    await supabase.from("galleries").delete().eq("id", selected.id);
    const rows = await loadGalleries();
    setSelectedId(rows[0]?.id ?? null);
    setStatus("Gallery deleted.");
  }

  async function addEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const email = newEmail.trim();
    if (!email) return;
    const supabase = createClient();
    await supabase.from("approved_emails").insert({ gallery_id: selected.id, email });
    setNewEmail("");
    loadEmails(selected.id);
    setStatus("Approved email added.");
  }

  async function removeEmail(id: string) {
    const supabase = createClient();
    await supabase.from("approved_emails").delete().eq("id", id);
    if (selected) loadEmails(selected.id);
  }

  if (loading) {
    return (
      <AdminShell title="Galleries">
        <p className="admin-empty">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Galleries">
      {status ? (
        <p className="admin-status" role="status">
          {status}
        </p>
      ) : null}
      <div className="admin-gallery-management">
        <div>
          <form className="admin-panel admin-form new-gallery-form" onSubmit={createGallery}>
            <h2>New gallery</h2>
            <label>
              Title
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Smith Wedding" />
            </label>
            <label>
              Passcode
              <input value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            </label>
            <label>
              Google Drive folder (link or ID)
              <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} />
            </label>
            <button className="dark-button" type="submit">
              Create gallery
            </button>
          </form>

          <section className="admin-panel">
            <h2>Your galleries</h2>
            {galleries.length > 0 ? (
              <div className="admin-gallery-selector">
                {galleries.map((gallery) => (
                  <button
                    key={gallery.id}
                    type="button"
                    className={`text-button${gallery.id === selectedId ? " selected-button" : ""}`}
                    onClick={() => setSelectedId(gallery.id)}
                  >
                    {gallery.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No galleries yet — create your first above.</p>
            )}
            <p className="admin-hint">
              Share each gallery&apos;s Drive folder (Viewer) with
              <br />
              <strong>hwstudio@photo-site-501601.iam.gserviceaccount.com</strong>
            </p>
          </section>
        </div>

        {selected ? (
          <div>
            <GalleryEditor key={selected.id} gallery={selected} onSave={saveGallery} onDelete={deleteGallery} />
            {selected.requires_approved_email ? (
              <section className="admin-panel admin-photo-panel">
                <h2>Approved emails</h2>
                <form className="admin-inline-form" onSubmit={addEmail}>
                  <label>
                    Add an approved email
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  </label>
                  <button className="text-button" type="submit">
                    Add
                  </button>
                </form>
                {emails.length > 0 ? (
                  <ul className="admin-list">
                    {emails.map((entry) => (
                      <li key={entry.id}>
                        <span>{entry.email}</span>
                        <button className="text-button" type="button" onClick={() => removeEmail(entry.id)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-empty">No approved emails yet.</p>
                )}
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
