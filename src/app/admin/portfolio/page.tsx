"use client";

import React, { useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminPortfolioPage() {
  const { state, dispatch } = usePrototypeStore();
  const [statusMessage, setStatusMessage] = useState("");
  const categories = useMemo(
    () => [...state.portfolioCategories].sort((first, second) => first.displayOrder - second.displayOrder),
    [state.portfolioCategories]
  );
  const photos = useMemo(
    () => [...state.portfolioPhotos].sort((first, second) => first.displayOrder - second.displayOrder),
    [state.portfolioPhotos]
  );

  return (
    <AdminShell title="Portfolio">
      {statusMessage ? (
        <p className="admin-status" role="status">
          {statusMessage}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <section className="admin-panel">
          <h2>Categories</h2>
          {categories.length > 0 ? (
            <ul className="admin-list">
              {categories.map((category) => (
                <li key={category.id} aria-label={`Category: ${category.name}`}>
                  <span>{category.name}</span>
                  <div className="admin-photo-actions">
                    <button
                      className="text-button"
                      type="button"
                      aria-label={`Move ${category.name} up`}
                      onClick={() => {
                        dispatch({ type: "portfolio-category:move", categoryId: category.id, direction: "up" });
                        setStatusMessage("Portfolio category moved.");
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
                        setStatusMessage("Portfolio category moved.");
                      }}
                    >
                      Move down
                    </button>
                  </div>
                </li>
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
