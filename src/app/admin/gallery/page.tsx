"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";
import type { Gallery } from "@/lib/types";

type GalleryFormValues = Pick<
  Gallery,
  | "title"
  | "slug"
  | "eventDate"
  | "description"
  | "passcode"
  | "expirationDate"
  | "fullDownloadUrl"
  | "isListed"
  | "requiresApprovedEmail"
>;

function getGalleryFormValues(gallery: Gallery): GalleryFormValues {
  return {
    title: gallery.title,
    slug: gallery.slug,
    eventDate: gallery.eventDate,
    description: gallery.description,
    passcode: gallery.passcode,
    expirationDate: gallery.expirationDate,
    fullDownloadUrl: gallery.fullDownloadUrl,
    isListed: gallery.isListed,
    requiresApprovedEmail: gallery.requiresApprovedEmail
  };
}

export default function AdminGalleryPage() {
  const { state, dispatch } = usePrototypeStore();
  const gallery = state.galleries[0];
  const [values, setValues] = useState<GalleryFormValues | null>(gallery ? getGalleryFormValues(gallery) : null);
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (gallery) {
      setValues(getGalleryFormValues(gallery));
    }
  }, [gallery]);

  const approvedEmails = useMemo(
    () => (gallery ? state.approvedEmails.filter((approvedEmail) => approvedEmail.galleryId === gallery.id) : []),
    [gallery, state.approvedEmails]
  );
  const photos = useMemo(
    () =>
      gallery
        ? state.galleryPhotos
            .filter((photo) => photo.galleryId === gallery.id)
            .sort((first, second) => first.displayOrder - second.displayOrder)
        : [],
    [gallery, state.galleryPhotos]
  );

  function updateField(field: keyof GalleryFormValues, value: string | boolean) {
    setValues((currentValues) => (currentValues ? { ...currentValues, [field]: value } : currentValues));
  }

  function saveGallery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gallery || !values) {
      return;
    }

    dispatch({
      type: "gallery:update",
      gallery: {
        ...gallery,
        ...values,
        expirationDate: values.expirationDate?.trim() ? values.expirationDate : null
      }
    });
    setStatusMessage("Gallery saved.");
  }

  function addApprovedEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!gallery || !trimmedEmail) {
      return;
    }

    dispatch({
      type: "approved-email:add",
      email: {
        id: `approved-email-${Date.now()}`,
        galleryId: gallery.id,
        email: trimmedEmail,
        label: "Manual access"
      }
    });
    setEmail("");
    setStatusMessage("Email added.");
  }

  function addPhoto(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedUrl = photoUrl.trim();
    if (!gallery || !trimmedUrl) {
      return;
    }

    const nextDisplayOrder = photos.length === 0 ? 1 : Math.max(...photos.map((photo) => photo.displayOrder)) + 1;
    const timestamp = Date.now();
    dispatch({
      type: "gallery-photo:add",
      photo: {
        id: `gallery-photo-${timestamp}`,
        galleryId: gallery.id,
        driveFileId: `manual-drive-file-${timestamp}`,
        previewUrl: trimmedUrl,
        downloadUrl: trimmedUrl,
        alt: `Gallery photo ${nextDisplayOrder}`,
        displayOrder: nextDisplayOrder,
        isVisible: true,
        isPortfolioEligible: true
      }
    });
    setPhotoUrl("");
    setStatusMessage("Photo added.");
  }

  if (!gallery || !values) {
    return (
      <AdminShell title="Gallery">
        <section className="admin-empty">
          <p>No gallery is available.</p>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Gallery">
      {statusMessage ? (
        <p className="admin-status" role="status">
          {statusMessage}
        </p>
      ) : null}
      <div className="admin-editor-grid">
        <form className="admin-panel admin-form" onSubmit={saveGallery}>
          <h2>Gallery details</h2>
          <label>
            Title
            <input value={values.title} onChange={(event) => updateField("title", event.target.value)} required />
          </label>
          <label>
            Slug
            <input value={values.slug} onChange={(event) => updateField("slug", event.target.value)} required />
          </label>
          <label>
            Event date
            <input
              type="date"
              value={values.eventDate}
              onChange={(event) => updateField("eventDate", event.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              rows={4}
              value={values.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
          </label>
          <label>
            Passcode
            <input value={values.passcode} onChange={(event) => updateField("passcode", event.target.value)} />
          </label>
          <label>
            Expiration date
            <input
              type="date"
              value={values.expirationDate ?? ""}
              onChange={(event) => updateField("expirationDate", event.target.value)}
            />
          </label>
          <label>
            Full download URL
            <input
              type="url"
              value={values.fullDownloadUrl}
              onChange={(event) => updateField("fullDownloadUrl", event.target.value)}
            />
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={values.isListed}
              onChange={(event) => updateField("isListed", event.target.checked)}
            />
            Listed publicly
          </label>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={values.requiresApprovedEmail}
              onChange={(event) => updateField("requiresApprovedEmail", event.target.checked)}
            />
            Requires approved email
          </label>
          <button className="dark-button" type="submit">
            Save gallery
          </button>
        </form>

        <section className="admin-panel">
          <h2>Approved emails</h2>
          <form className="admin-inline-form" onSubmit={addApprovedEmail}>
            <label>
              Add approved email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="client@example.com"
              />
            </label>
            <button className="text-button" type="submit">
              Add email
            </button>
          </form>
          <ul className="admin-list">
            {approvedEmails.map((approvedEmail) => (
              <li key={approvedEmail.id}>
                <span>{approvedEmail.email}</span>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    dispatch({ type: "approved-email:remove", emailId: approvedEmail.id });
                    setStatusMessage("Email removed.");
                  }}
                >
                  Remove email
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="admin-panel admin-photo-panel">
        <div className="admin-section-heading">
          <h2>Photos</h2>
          <form className="admin-inline-form" onSubmit={addPhoto}>
            <label>
              Add photo URL
              <input
                type="url"
                value={photoUrl}
                onChange={(event) => setPhotoUrl(event.target.value)}
                placeholder="https://"
              />
            </label>
            <button className="text-button" type="submit">
              Add photo
            </button>
          </form>
        </div>
        <ul className="admin-photo-list">
          {photos.map((photo) => (
            <li key={photo.id}>
              <img src={photo.previewUrl} alt={photo.alt} />
              <div>
                <strong>{photo.alt}</strong>
                <span>{photo.previewUrl}</span>
              </div>
              <div className="admin-photo-actions">
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    dispatch({ type: "gallery-photo:move", photoId: photo.id, direction: "up" });
                    setStatusMessage("Photo moved up.");
                  }}
                >
                  Move up
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    dispatch({ type: "gallery-photo:move", photoId: photo.id, direction: "down" });
                    setStatusMessage("Photo moved down.");
                  }}
                >
                  Move down
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    dispatch({ type: "portfolio:promote-gallery-photo", photoId: photo.id, categoryIds: ["cat-featured"] });
                    setStatusMessage("Photo promoted to portfolio.");
                  }}
                >
                  Promote to featured
                </button>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    dispatch({ type: "gallery-photo:remove", photoId: photo.id });
                    setStatusMessage("Photo removed.");
                  }}
                >
                  Remove photo
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
