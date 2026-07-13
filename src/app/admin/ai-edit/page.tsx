"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";

export default function AdminAiEditPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [configured, setConfigured] = useState(true);
  const [beforeFolder, setBeforeFolder] = useState("");
  const [afterFolder, setAfterFolder] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/oauth/status")
      .then((r) => r.json())
      .then((d) => {
        setConnected(Boolean(d.connected));
        setConfigured(Boolean(d.configured));
      })
      .catch(() => setConnected(false));
    if (new URLSearchParams(window.location.search).get("connected") === "1") {
      setStatus("Google account connected.");
    }
  }, []);

  async function runEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Editing your photos… this can take a few minutes for a large folder.");
    try {
      const response = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beforeFolder, afterFolder }),
      });
      const data = await response.json();
      if (!response.ok) {
        setStatus(data.error ?? "Something went wrong.");
      } else {
        setStatus(`Done — edited ${data.edited} photos and added them to your after folder.`);
      }
    } catch {
      setStatus("Couldn't reach the editor. Make sure the site is running on your Mac.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title="AI Edit">
      {status ? (
        <p className="admin-status" role="status">
          {status}
        </p>
      ) : null}

      <div className="admin-editor-grid">
        <section className="admin-panel admin-form">
          <h2>Edit a shoot in your style</h2>
          {!configured ? (
            <p className="admin-hint">
              Google OAuth isn&apos;t configured yet. Add your OAuth client ID and secret to the site&apos;s
              environment, then reload.
            </p>
          ) : connected === false ? (
            <>
              <p className="admin-hint">
                Connect your Google account once so the site can save edited photos into your Drive.
              </p>
              <a className="dark-button" href="/api/oauth/start">
                Connect Google account
              </a>
            </>
          ) : connected === null ? (
            <p className="admin-empty">Checking connection…</p>
          ) : (
            <form className="admin-form" onSubmit={runEdit}>
              <label>
                Before folder (unedited photos) — Drive link
                <input
                  value={beforeFolder}
                  onChange={(e) => setBeforeFolder(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                  required
                />
              </label>
              <label>
                After folder (where edits go) — Drive link
                <input
                  value={afterFolder}
                  onChange={(e) => setAfterFolder(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/…"
                  required
                />
              </label>
              <button className="dark-button" type="submit" disabled={busy}>
                {busy ? "Editing…" : "Edit into after folder"}
              </button>
            </form>
          )}
        </section>

        <section className="admin-panel">
          <h2>How it works</h2>
          <p className="admin-hint">
            The before folder is read with the studio service account, each photo is edited in your learned style,
            and the results are saved into the after folder as you. Share the <strong>before</strong> folder (Viewer)
            with <strong>hwstudio@photo-site-501601.iam.gserviceaccount.com</strong>. This runs while the site is open
            on your Mac. The edit is your consistent <em>baseline</em> look — a fast starting point, not a final edit.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
