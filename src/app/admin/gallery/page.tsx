"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl, normalizePhotoUrl } from "@/lib/google-drive";
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

type NewGalleryFormValues = {
  title: string;
  eventDate: string;
  passcode: string;
  fullDownloadUrl: string;
};

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

function createSlug(title: string, existingSlugs: string[]) {
  const baseSlug =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "gallery";

  let slug = baseSlug;
  let suffix = 2;
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export default function AdminGalleryPage() {
  const { state, dispatch } = usePrototypeStore();
  const [selectedGalleryId, setSelectedGalleryId] = useState(state.galleries[0]?.id ?? "");
  const gallery =
    state.galleries.find((item) => item.id === selectedGalleryId) ?? state.galleries[0] ?? null;
  const [values, setValues] = useState<GalleryFormValues | null>(gallery ? getGalleryFormValues(gallery) : null);
  const [newGalleryValues, setNewGalleryValues] = useState<NewGalleryFormValues>({
    title: "",
    eventDate: "",
    passcode: "",
    fullDownloadUrl: ""
  });
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!selectedGalleryId && state.galleries[0]) {
      setSelectedGalleryId(state.galleries[0].id);
      return;
    }

    if (selectedGalleryId && !state.galleries.some((item) => item.id === selectedGalleryId) && state.galleries[0]) {
      setSelectedGalleryId(state.galleries[0].id);
      return;
    }

    if (gallery) {
      setValues(getGalleryFormValues(gallery));
    } else {
      setValues(null);
    }
  }, [gallery, selectedGalleryId, state.galleries]);

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

  function updateNewGalleryField(field: keyof NewGalleryFormValues, value: string) {
    setNewGalleryValues((currentValues) => ({ ...currentValues, [field]: value }));
  }

  function createGallery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newGalleryValues.title.trim();
    const eventDate = newGalleryValues.eventDate;
    const passcode = newGalleryValues.passcode.trim();
    const fullDownloadUrl = newGalleryValues.fullDownloadUrl.trim();
    if (!title || !eventDate || !passcode || !fullDownloadUrl) {
      return;
    }

    const timestamp = Date.now();
    const nextDisplayOrder =
      state.galleries.length === 0 ? 1 : Math.max(...state.galleries.map((item) => item.displayOrder)) + 1;
    const slug = createSlug(
      title,
      state.galleries.map((item) => item.slug)
    );
    const newGallery: Gallery = {
      id: `gallery-${timestamp}`,
      title,
      slug,
      eventDate,
      description: "A new client gallery ready for photos and access settings.",
      coverPhotoId: "",
      isListed: true,
      displayOrder: nextDisplayOrder,
      passcode,
      requiresApprovedEmail: true,
      expirationDate: "2099-12-31",
      driveFolderId: extractGoogleDriveFolderId(fullDownloadUrl) ?? "",
      fullDownloadUrl,
      status: "active"
    };

    dispatch({ type: "gallery:add", gallery: newGallery });
    setSelectedGalleryId(newGallery.id);
    setNewGalleryValues({
      title: "",
      eventDate: "",
      passcode: "",
      fullDownloadUrl: ""
    });
    setStatusMessage("Gallery created.");
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
    if (isGoogleDriveFolderUrl(trimmedUrl)) {
      setStatusMessage("Folder links cannot preview a single photo yet. Paste an individual Google Drive file link.");
      return;
    }

    const nextDisplayOrder = photos.length === 0 ? 1 : Math.max(...photos.map((photo) => photo.displayOrder)) + 1;
    const timestamp = Date.now();
    const normalizedPhoto = normalizePhotoUrl(trimmedUrl);
    dispatch({
      type: "gallery-photo:add",
      photo: {
        id: `gallery-photo-${timestamp}`,
        galleryId: gallery.id,
        driveFileId: normalizedPhoto.driveFileId ?? `manual-drive-file-${timestamp}`,
        previewUrl: normalizedPhoto.previewUrl,
        downloadUrl: normalizedPhoto.downloadUrl,
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
      <section className="admin-panel admin-gallery-management">
        <div>
          <h2>Galleries</h2>
          <div className="admin-gallery-selector" aria-label="Gallery selector">
            {state.galleries
              .slice()
              .sort((first, second) => first.displayOrder - second.displayOrder)
              .map((item) => (
                <button
                  key={item.id}
                  className={item.id === gallery.id ? "text-button selected-button" : "text-button"}
                  type="button"
                  aria-pressed={item.id === gallery.id}
                  onClick={() => {
                    setSelectedGalleryId(item.id);
                    setStatusMessage(`Editing ${item.title}.`);
                  }}
                >
                  {item.title}
                </button>
              ))}
          </div>
        </div>
        <form className="admin-form new-gallery-form" onSubmit={createGallery}>
          <h2>New gallery</h2>
          <label>
            New gallery title
            <input
              value={newGalleryValues.title}
              onChange={(event) => updateNewGalleryField("title", event.target.value)}
              required
            />
          </label>
          <div className="admin-two-column">
            <label>
              New gallery event date
              <input
                type="date"
                value={newGalleryValues.eventDate}
                onChange={(event) => updateNewGalleryField("eventDate", event.target.value)}
                required
              />
            </label>
            <label>
              New gallery passcode
              <input
                value={newGalleryValues.passcode}
                onChange={(event) => updateNewGalleryField("passcode", event.target.value)}
                required
              />
            </label>
          </div>
          <label>
            New gallery full download URL
            <input
              type="url"
              value={newGalleryValues.fullDownloadUrl}
              onChange={(event) => updateNewGalleryField("fullDownloadUrl", event.target.value)}
              required
            />
          </label>
          <button className="dark-button" type="submit">
            Create gallery
          </button>
        </form>
      </section>
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
                placeholder="Direct image URL or Google Drive file link"
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
                    dispatch({
                      type: "portfolio:promote-gallery-photo",
                      photoId: photo.id,
                      categoryIds: ["cat-graduation"]
                    });
                    setStatusMessage("Photo promoted to portfolio.");
                  }}
                >
                  Promote to graduation
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
