"use client";

import React, { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/client";

export default function AdminAboutPage() {
  const [form, setForm] = useState({ eyebrow: "", heading: "", body: "" });
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
          setForm({ eyebrow: data.eyebrow ?? "", heading: data.heading ?? "", body: data.body ?? "" });
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
      .update({ eyebrow: form.eyebrow, heading: form.heading, body: form.body })
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
          <button className="dark-button" type="submit">
            Save about page
          </button>
        </form>

        <section className="admin-panel">
          <h2>Tips</h2>
          <p className="admin-hint">
            Write in first person about you and your photography. Leave a <strong>blank line</strong> between
            paragraphs and they&apos;ll render as separate paragraphs on the page.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
