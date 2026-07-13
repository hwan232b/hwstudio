"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl } from "@/lib/google-drive";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_visible: boolean;
  drive_folder_id: string | null;
};

function parseFolder(raw: string): string {
  const value = raw.trim();
  return isGoogleDriveFolderUrl(value) ? extractGoogleDriveFolderId(value) ?? value : value;
}

function CategoryRow({
  category,
  onSave,
  onMove,
}: {
  category: Category;
  onSave: (id: string, patch: Partial<Category>) => Promise<void>;
  onMove: (category: Category, direction: "up" | "down") => Promise<void>;
}) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? "");
  const [isVisible, setIsVisible] = useState(category.is_visible);
  const [folder, setFolder] = useState(category.drive_folder_id ?? "");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(category.id, {
      name,
      description,
      is_visible: isVisible,
      drive_folder_id: parseFolder(folder),
    });
  }

  return (
    <li className="portfolio-category-editor" aria-label={`Category: ${category.name}`}>
      <form className="admin-form" onSubmit={save}>
        <label>
          Section name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Section description
          <textarea rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          Google Drive folder (link or ID)
          <input
            value={folder}
            onChange={(event) => setFolder(event.target.value)}
            placeholder="https://drive.google.com/drive/folders/…"
          />
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} />
          Visible on portfolio
        </label>
        <button className="text-button" type="submit">
          Save {category.name}
        </button>
      </form>
      <div className="admin-photo-actions">
        <button className="text-button" type="button" onClick={() => onMove(category, "up")}>
          Move up
        </button>
        <button className="text-button" type="button" onClick={() => onMove(category, "down")}>
          Move down
        </button>
      </div>
    </li>
  );
}

export default function AdminPortfolioPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [eyebrow, setEyebrow] = useState("");
  const [heading, setHeading] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: settings }, { data: cats }] = await Promise.all([
      supabase.from("portfolio_settings").select("*").eq("id", "main").maybeSingle(),
      supabase.from("portfolio_categories").select("*").order("display_order"),
    ]);
    if (settings) {
      setEyebrow(settings.eyebrow ?? "");
      setHeading(settings.heading ?? "");
    }
    setCategories((cats as Category[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveIntro(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from("portfolio_settings").update({ eyebrow, heading }).eq("id", "main");
    setStatus(error ? `Couldn't save — ${error.message}` : "Portfolio intro saved.");
  }

  const saveCategory = useCallback(
    async (id: string, patch: Partial<Category>) => {
      const supabase = createClient();
      const { error } = await supabase.from("portfolio_categories").update(patch).eq("id", id);
      if (error) {
        setStatus(`Couldn't save — ${error.message}`);
      } else {
        setStatus("Category saved. Refresh the portfolio to see it.");
        load();
      }
    },
    [load]
  );

  const move = useCallback(
    async (category: Category, direction: "up" | "down") => {
      const sorted = [...categories].sort((a, b) => a.display_order - b.display_order);
      const index = sorted.findIndex((c) => c.id === category.id);
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= sorted.length) return;
      const a = sorted[index];
      const b = sorted[target];
      const supabase = createClient();
      await supabase.from("portfolio_categories").update({ display_order: b.display_order }).eq("id", a.id);
      await supabase.from("portfolio_categories").update({ display_order: a.display_order }).eq("id", b.id);
      setStatus("Category reordered.");
      load();
    },
    [categories, load]
  );

  if (loading) {
    return (
      <AdminShell title="Portfolio">
        <p className="admin-empty">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Portfolio">
      {status ? (
        <p className="admin-status" role="status">
          {status}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <form className="admin-panel admin-form" onSubmit={saveIntro}>
          <h2>Intro copy</h2>
          <label>
            Portfolio eyebrow
            <input value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} />
          </label>
          <label>
            Portfolio heading
            <textarea rows={3} value={heading} onChange={(event) => setHeading(event.target.value)} />
          </label>
          <button className="dark-button" type="submit">
            Save intro copy
          </button>
        </form>

        <section className="admin-panel">
          <h2>Categories</h2>
          <p className="admin-hint">
            Point each category at a Drive folder of photos. Share every folder (Viewer) with
            <br />
            <strong>hwstudio@photo-site-501601.iam.gserviceaccount.com</strong>
          </p>
          {categories.length > 0 ? (
            <ul className="admin-list">
              {[...categories]
                .sort((a, b) => a.display_order - b.display_order)
                .map((category) => (
                  <CategoryRow key={category.id} category={category} onSave={saveCategory} onMove={move} />
                ))}
            </ul>
          ) : (
            <p className="admin-empty">No portfolio categories yet.</p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
