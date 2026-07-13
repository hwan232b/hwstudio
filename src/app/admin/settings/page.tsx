"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/client";

type HomeForm = {
  eyebrow: string;
  heading: string;
  lede: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  driveFolder: string;
};

const EMPTY: HomeForm = {
  eyebrow: "",
  heading: "",
  lede: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  driveFolder: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<HomeForm>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("home_settings")
      .select("*")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            eyebrow: data.eyebrow ?? "",
            heading: data.heading ?? "",
            lede: data.lede ?? "",
            primaryCtaLabel: data.primary_cta_label ?? "",
            primaryCtaHref: data.primary_cta_href ?? "",
            secondaryCtaLabel: data.secondary_cta_label ?? "",
            secondaryCtaHref: data.secondary_cta_href ?? "",
            driveFolder: data.drive_folder_id ?? "",
          });
        }
        setLoading(false);
      });
  }, []);

  function update<K extends keyof HomeForm>(key: K, value: HomeForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Saving…");
    const raw = form.driveFolder.trim();
    const folderId = isGoogleDriveFolderUrl(raw) ? extractGoogleDriveFolderId(raw) ?? raw : raw;

    const supabase = createClient();
    const { error } = await supabase
      .from("home_settings")
      .update({
        eyebrow: form.eyebrow,
        heading: form.heading,
        lede: form.lede,
        primary_cta_label: form.primaryCtaLabel,
        primary_cta_href: form.primaryCtaHref,
        secondary_cta_label: form.secondaryCtaLabel,
        secondary_cta_href: form.secondaryCtaHref,
        drive_folder_id: folderId,
      })
      .eq("id", "main");

    setStatus(error ? `Couldn't save — ${error.message}` : "Homepage saved. Refresh the homepage to see it.");
  }

  if (loading) {
    return (
      <AdminShell title="Settings">
        <p className="admin-empty">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Settings">
      {status ? (
        <p className="admin-status" role="status">
          {status}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <form className="admin-panel admin-form" onSubmit={save}>
          <h2>Homepage</h2>
          <label>
            Eyebrow
            <input value={form.eyebrow} onChange={(event) => update("eyebrow", event.target.value)} />
          </label>
          <label>
            Heading
            <textarea rows={2} value={form.heading} onChange={(event) => update("heading", event.target.value)} />
          </label>
          <label>
            Intro
            <textarea rows={3} value={form.lede} onChange={(event) => update("lede", event.target.value)} />
          </label>
          <div className="admin-two-column">
            <label>
              Primary button label
              <input value={form.primaryCtaLabel} onChange={(event) => update("primaryCtaLabel", event.target.value)} />
            </label>
            <label>
              Primary button link
              <input value={form.primaryCtaHref} onChange={(event) => update("primaryCtaHref", event.target.value)} />
            </label>
            <label>
              Secondary button label
              <input value={form.secondaryCtaLabel} onChange={(event) => update("secondaryCtaLabel", event.target.value)} />
            </label>
            <label>
              Secondary button link
              <input value={form.secondaryCtaHref} onChange={(event) => update("secondaryCtaHref", event.target.value)} />
            </label>
          </div>
          <button className="dark-button" type="submit">
            Save homepage
          </button>
        </form>

        <section className="admin-panel">
          <h2>Homepage photos</h2>
          <form className="admin-form" onSubmit={save}>
            <label>
              Google Drive folder (link or ID)
              <input
                value={form.driveFolder}
                onChange={(event) => update("driveFolder", event.target.value)}
                placeholder="https://drive.google.com/drive/folders/…"
              />
            </label>
            <button className="text-button" type="submit">
              Save folder
            </button>
          </form>
          <p className="admin-hint">
            Photos in this folder appear on the homepage. First-time setup: share the folder (Viewer) with
            <br />
            <strong>hwstudio@photo-site-501601.iam.gserviceaccount.com</strong>
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
