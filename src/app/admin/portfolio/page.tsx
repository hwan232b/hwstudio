"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { isGoogleDriveFolderUrl, normalizePhotoUrl } from "@/lib/google-drive";
import { usePrototypeStore } from "@/lib/prototype-store";
import type { PortfolioCategory, PortfolioPhoto } from "@/lib/types";

type CategoryEditorProps = {
  category: PortfolioCategory;
  portfolioPhotos: PortfolioPhoto[];
  onStatusChange: (message: string) => void;
};

type CategoryEditorContent = Pick<PortfolioCategory, "id" | "name" | "description" | "isVisible">;

function CategoryEditor({ category, portfolioPhotos, onStatusChange }: CategoryEditorProps) {
  const { dispatch } = usePrototypeStore();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [isVisible, setIsVisible] = useState(category.isVisible);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoAlt, setPhotoAlt] = useState("");
  const categoryPhotos = useMemo(
    () =>
      portfolioPhotos
        .filter((photo) => photo.categoryIds.includes(category.id))
        .sort((first, second) => first.displayOrder - second.displayOrder),
    [category.id, portfolioPhotos]
  );
  const lastSyncedContent = useRef<CategoryEditorContent>({
    id: category.id,
    name: category.name,
    description: category.description,
    isVisible: category.isVisible
  });

  useEffect(() => {
    const previousContent = lastSyncedContent.current;
    const localFieldsMatchPreviousContent =
      name === previousContent.name &&
      description === previousContent.description &&
      isVisible === previousContent.isVisible;
    const categoryIdChanged = category.id !== previousContent.id;

    if (categoryIdChanged || localFieldsMatchPreviousContent) {
      setName(category.name);
      setDescription(category.description);
      setIsVisible(category.isVisible);
    }

    lastSyncedContent.current = {
      id: category.id,
      name: category.name,
      description: category.description,
      isVisible: category.isVisible
    };
  }, [category.description, category.id, category.isVisible, category.name, description, isVisible, name]);

  function saveSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({
      type: "portfolio-category:update",
      category: {
        ...category,
        name,
        description,
        isVisible
      }
    });
    onStatusChange("Portfolio section saved.");
  }

  function addPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = photoUrl.trim();
    const trimmedAlt = photoAlt.trim();
    if (!trimmedUrl || !trimmedAlt) {
      return;
    }
    if (isGoogleDriveFolderUrl(trimmedUrl)) {
      onStatusChange("Folder links cannot preview a single photo yet. Paste an individual Google Drive file link.");
      return;
    }

    const timestamp = Date.now();
    const nextDisplayOrder =
      portfolioPhotos.length === 0 ? 1 : Math.max(...portfolioPhotos.map((photo) => photo.displayOrder)) + 1;
    const normalizedPhoto = normalizePhotoUrl(trimmedUrl);
    dispatch({
      type: "portfolio-photo:add",
      photo: {
        id: `portfolio-photo-${timestamp}`,
        sourceGalleryPhotoId: null,
        previewUrl: normalizedPhoto.previewUrl,
        alt: trimmedAlt,
        categoryIds: [category.id],
        displayOrder: nextDisplayOrder,
        isFeatured: category.id === "cat-featured"
      }
    });
    setPhotoUrl("");
    setPhotoAlt("");
    onStatusChange("Portfolio photo added.");
  }

  return (
    <li className="portfolio-category-editor" aria-label={`Category: ${category.name}`}>
      <form className="admin-form" onSubmit={saveSection}>
        <label>
          Section name
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label>
          Section description
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={isVisible} onChange={(event) => setIsVisible(event.target.checked)} />
          Visible on portfolio
        </label>
        <button className="text-button" type="submit">
          Save section
        </button>
      </form>
      <form className="admin-inline-form portfolio-section-photo-form" onSubmit={addPhoto}>
        <label>
          Photo URL
          <input
            type="url"
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            placeholder="Direct image URL or Google Drive file link"
          />
        </label>
        <label>
          Alt text
          <input value={photoAlt} onChange={(event) => setPhotoAlt(event.target.value)} />
        </label>
        <button className="text-button" type="submit">
          Add photo to {category.name}
        </button>
      </form>
      {categoryPhotos.length > 0 ? (
        <div className="portfolio-section-photo-preview" aria-label={`${category.name} portfolio photos`}>
          {categoryPhotos.map((photo) => (
            <figure key={photo.id}>
              <img src={photo.previewUrl} alt={photo.alt} />
              <figcaption>{photo.alt}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="admin-empty portfolio-section-empty">No photos in this section yet.</p>
      )}
      <div className="admin-photo-actions">
        <button
          className="text-button"
          type="button"
          aria-label={`Move ${category.name} up`}
          onClick={() => {
            dispatch({ type: "portfolio-category:move", categoryId: category.id, direction: "up" });
            onStatusChange("Portfolio category moved.");
          }}
        >
          Move up
        </button>
        <button
          className="text-button"
          type="button"
          aria-label={`Move ${category.name} down`}
          onClick={() => {
            dispatch({ type: "portfolio-category:move", categoryId: category.id, direction: "down" });
            onStatusChange("Portfolio category moved.");
          }}
        >
          Move down
        </button>
      </div>
    </li>
  );
}

export default function AdminPortfolioPage() {
  const { state, dispatch } = usePrototypeStore();
  const [statusMessage, setStatusMessage] = useState("");
  const [portfolioEyebrow, setPortfolioEyebrow] = useState(state.portfolioSettings.eyebrow);
  const [portfolioHeading, setPortfolioHeading] = useState(state.portfolioSettings.heading);

  useEffect(() => {
    setPortfolioEyebrow(state.portfolioSettings.eyebrow);
    setPortfolioHeading(state.portfolioSettings.heading);
  }, [state.portfolioSettings]);

  const categories = useMemo(
    () => [...state.portfolioCategories].sort((first, second) => first.displayOrder - second.displayOrder),
    [state.portfolioCategories]
  );
  const photos = useMemo(
    () => [...state.portfolioPhotos].sort((first, second) => first.displayOrder - second.displayOrder),
    [state.portfolioPhotos]
  );

  function saveIntroCopy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({
      type: "portfolio-settings:update",
      settings: {
        eyebrow: portfolioEyebrow,
        heading: portfolioHeading
      }
    });
    setStatusMessage("Portfolio intro saved.");
  }

  return (
    <AdminShell title="Portfolio">
      {statusMessage ? (
        <p className="admin-status" role="status">
          {statusMessage}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <form className="admin-panel admin-form" onSubmit={saveIntroCopy}>
          <h2>Intro copy</h2>
          <label>
            Portfolio eyebrow
            <input value={portfolioEyebrow} onChange={(event) => setPortfolioEyebrow(event.target.value)} />
          </label>
          <label>
            Portfolio heading
            <textarea rows={3} value={portfolioHeading} onChange={(event) => setPortfolioHeading(event.target.value)} />
          </label>
          <button className="dark-button" type="submit">
            Save intro copy
          </button>
        </form>

        <section className="admin-panel">
          <h2>Categories</h2>
          {categories.length > 0 ? (
            <ul className="admin-list">
              {categories.map((category) => (
                <CategoryEditor
                  key={category.id}
                  category={category}
                  portfolioPhotos={state.portfolioPhotos}
                  onStatusChange={setStatusMessage}
                />
              ))}
            </ul>
          ) : (
            <p className="admin-empty">No portfolio categories are available.</p>
          )}
        </section>

        <section className="admin-panel">
          <h2>Portfolio photos</h2>
          {photos.length > 0 ? (
            <ul className="admin-photo-list">
              {photos.map((photo) => (
                <li key={photo.id} aria-label={`Portfolio photo: ${photo.alt}`}>
                  <img src={photo.previewUrl} alt={photo.alt} />
                  <div>
                    <strong>{photo.alt}</strong>
                    <span>{photo.previewUrl}</span>
                  </div>
                  <div className="admin-photo-actions">
                    <button
                      className="text-button"
                      type="button"
                      aria-label={`Remove ${photo.alt}`}
                      onClick={() => {
                        dispatch({ type: "portfolio-photo:remove", photoId: photo.id });
                        setStatusMessage("Portfolio photo removed.");
                      }}
                    >
                      Remove photo
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty">No portfolio photos are available.</p>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
