"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { isGoogleDriveFolderUrl, normalizePhotoUrl } from "@/lib/google-drive";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminSettingsPage() {
  const { state, dispatch } = usePrototypeStore();
  const gallery = state.galleries[0];
  const [statusMessage, setStatusMessage] = useState("");
  const [homeEyebrow, setHomeEyebrow] = useState(state.homeSettings.eyebrow);
  const [homeHeading, setHomeHeading] = useState(state.homeSettings.heading);
  const [homeLede, setHomeLede] = useState(state.homeSettings.lede);
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState(state.homeSettings.primaryCtaLabel);
  const [primaryCtaHref, setPrimaryCtaHref] = useState(state.homeSettings.primaryCtaHref);
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState(state.homeSettings.secondaryCtaLabel);
  const [secondaryCtaHref, setSecondaryCtaHref] = useState(state.homeSettings.secondaryCtaHref);
  const [homePhotoUrl, setHomePhotoUrl] = useState("");
  const [homePhotoAlt, setHomePhotoAlt] = useState("");
  const homePhotos = useMemo(
    () => [...state.homeSettings.photos].sort((first, second) => first.displayOrder - second.displayOrder),
    [state.homeSettings.photos]
  );

  useEffect(() => {
    setHomeEyebrow(state.homeSettings.eyebrow);
    setHomeHeading(state.homeSettings.heading);
    setHomeLede(state.homeSettings.lede);
    setPrimaryCtaLabel(state.homeSettings.primaryCtaLabel);
    setPrimaryCtaHref(state.homeSettings.primaryCtaHref);
    setSecondaryCtaLabel(state.homeSettings.secondaryCtaLabel);
    setSecondaryCtaHref(state.homeSettings.secondaryCtaHref);
  }, [state.homeSettings]);

  function saveHomepageCopy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({
      type: "home-settings:update",
      settings: {
        ...state.homeSettings,
        eyebrow: homeEyebrow,
        heading: homeHeading,
        lede: homeLede,
        primaryCtaLabel,
        primaryCtaHref,
        secondaryCtaLabel,
        secondaryCtaHref
      }
    });
    setStatusMessage("Homepage copy saved.");
  }

  function addHomepagePhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = homePhotoUrl.trim();
    const trimmedAlt = homePhotoAlt.trim();
    if (!trimmedUrl) {
      return;
    }
    if (isGoogleDriveFolderUrl(trimmedUrl)) {
      setStatusMessage("Folder links cannot preview a single photo yet. Paste an individual Google Drive file link.");
      return;
    }

    const normalizedPhoto = normalizePhotoUrl(trimmedUrl);
    const timestamp = Date.now();
    const nextDisplayOrder =
      state.homeSettings.photos.length === 0
        ? 1
        : Math.max(...state.homeSettings.photos.map((photo) => photo.displayOrder)) + 1;
    dispatch({
      type: "home-settings:update",
      settings: {
        ...state.homeSettings,
        photos: [
          ...state.homeSettings.photos,
          {
            id: `home-photo-${timestamp}`,
            previewUrl: normalizedPhoto.previewUrl,
            alt: trimmedAlt || `Homepage photo ${nextDisplayOrder}`,
            displayOrder: nextDisplayOrder
          }
        ]
      }
    });
    setHomePhotoUrl("");
    setHomePhotoAlt("");
    setStatusMessage("Homepage photo added.");
  }

  function removeHomepagePhoto(photoId: string) {
    dispatch({
      type: "home-settings:update",
      settings: {
        ...state.homeSettings,
        photos: state.homeSettings.photos.filter((photo) => photo.id !== photoId)
      }
    });
    setStatusMessage("Homepage photo removed.");
  }

  return (
    <AdminShell title="Settings">
      {statusMessage ? (
        <p className="admin-status" role="status">
          {statusMessage}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <form className="admin-panel admin-form" onSubmit={saveHomepageCopy}>
          <h2>Homepage copy</h2>
          <label>
            Homepage eyebrow
            <input value={homeEyebrow} onChange={(event) => setHomeEyebrow(event.target.value)} />
          </label>
          <label>
            Homepage heading
            <textarea rows={2} value={homeHeading} onChange={(event) => setHomeHeading(event.target.value)} />
          </label>
          <label>
            Homepage intro
            <textarea rows={3} value={homeLede} onChange={(event) => setHomeLede(event.target.value)} />
          </label>
          <div className="admin-two-column">
            <label>
              Primary button label
              <input value={primaryCtaLabel} onChange={(event) => setPrimaryCtaLabel(event.target.value)} />
            </label>
            <label>
              Primary button link
              <input value={primaryCtaHref} onChange={(event) => setPrimaryCtaHref(event.target.value)} />
            </label>
            <label>
              Secondary button label
              <input value={secondaryCtaLabel} onChange={(event) => setSecondaryCtaLabel(event.target.value)} />
            </label>
            <label>
              Secondary button link
              <input value={secondaryCtaHref} onChange={(event) => setSecondaryCtaHref(event.target.value)} />
            </label>
          </div>
          <button className="dark-button" type="submit">
            Save homepage copy
          </button>
        </form>

        <section className="admin-panel">
          <h2>Homepage photos</h2>
          <form className="admin-form" onSubmit={addHomepagePhoto}>
            <label>
              Homepage photo URL
              <input
                type="url"
                value={homePhotoUrl}
                onChange={(event) => setHomePhotoUrl(event.target.value)}
                placeholder="Direct image URL or Google Drive file link"
              />
            </label>
            <label>
              Homepage photo alt text optional
              <input value={homePhotoAlt} onChange={(event) => setHomePhotoAlt(event.target.value)} />
            </label>
            <button className="text-button" type="submit">
              Add homepage photo
            </button>
          </form>

          {homePhotos.length > 0 ? (
            <ul className="admin-photo-list homepage-photo-list">
              {homePhotos.map((photo) => (
                <li key={photo.id} aria-label={`Homepage photo: ${photo.alt}`}>
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
                      onClick={() => removeHomepagePhoto(photo.id)}
                    >
                      Remove photo
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty">No homepage photos are available.</p>
          )}
        </section>

        <section className="admin-panel admin-settings-panel">
          <div>
            <h2>Prototype data</h2>
            <p>
              Current gallery: <strong>{gallery?.title ?? "No gallery"}</strong>
            </p>
          </div>
          <button
            className="dark-button"
            type="button"
            onClick={() => {
              dispatch({ type: "reset" });
              setStatusMessage("Prototype data reset.");
            }}
          >
            Reset prototype data
          </button>
        </section>
      </div>
    </AdminShell>
  );
}
