"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/client";

function parseFolder(raw: string): string {
  const value = raw.trim();
  return isGoogleDriveFolderUrl(value) ? extractGoogleDriveFolderId(value) ?? value : value;
}

export default function AdminAboutPage() {
  const [form, setForm] = useState({ eyebrow: "", heading: "", body: "", driveFolder: "" });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    createClient()
      .from("about_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            eyebrow: data.eyebrow ?? "",
            heading: data.heading ?? "",
            body: data.body ?? "",
            driveFolder: data.drive_folder_id ?? "",
          });
        }
        setLoading(false);
      });
  }, []);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving…");
    const { error } = await createClient()
      .from("about_settings")
      .update({
        eyebrow: form.eyebrow,
        heading: form.heading,
        body: form.body,
        drive_folder_id: parseFolder(form.driveFolder),
      })
      .eq("id", "main");
    setStatus(error ? `Couldn't save — ${error.message}` : "About page saved. Refresh the About page to see it.");
  }

  if (loading) {
    return (
      <AdminShell title="About">
        <p className="admin-empty">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="About">
      {status ? (
        <p className="admin-status" role="status">
          {status}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <form className="admin-panel admin-form" onSubmit={save}>
          <h2>About page</h2>
          <label>
            Eyebrow
            <input value={form.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
          </label>
          <label>
            Heading
            <textarea rows={2} value={form.heading} onChange={(e) => update("heading", e.target.value)} />
          </label>
          <label>
            Body
            <textarea rows={10} value={form.body} onChange={(e) => update("body", e.target.value)} />
          </label>
          <label>
            Portrait — Google Drive folder (first photo is shown on the left)
            <input
              value={form.driveFolder}
              onChange={(e) => update("driveFolder", e.target.value)}
              placeholder="https://drive.google.com/drive/folders/…"
            />
          </label>
          <button className="dark-button" type="submit">
            Save about page
          </button>
        </form>

        <section className="admin-panel">
          <h2>Tips</h2>
          <p className="admin-hint">
            Write in first person about you and your photography. Leave a <strong>blank line</strong> between
            paragraphs. For your photo, make a Drive folder with your portrait in it, share it (Viewer) with
            <br />
            <strong>hwstudio@photo-site-501601.iam.gserviceaccount.com</strong>, and paste its link above — the first
            image appears on the left.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
