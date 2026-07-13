"use client";

import React, { useState } from "react";
import { PhotoLightbox } from "@/components/PhotoLightbox";

type Photo = { id: string; previewUrl: string; downloadUrl: string; alt: string };
type UnlockedGallery = { id: string; title: string; description: string; fullDownloadUrl: string };

export function GalleryAccess({
  slug,
  title,
  requiresEmail,
}: {
  slug: string;
  title: string;
  requiresEmail: boolean;
}) {
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [gallery, setGallery] = useState<UnlockedGallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Photo | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const response = await fetch("/api/gallery-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, passcode, email }),
    });

    if (!response.ok) {
      setError(`That passcode${requiresEmail ? " or email" : ""} doesn't match. Please try again.`);
      setPending(false);
      return;
    }

    const data = (await response.json()) as { gallery: UnlockedGallery; photos: Photo[] };
    setGallery(data.gallery);
    setPhotos(data.photos);
    setActiveId(data.photos[0]?.id ?? null);
    setPending(false);
  }

  if (gallery) {
    const active = photos.find((photo) => photo.id === activeId) ?? photos[0] ?? null;
    return (
      <section className="gallery-viewer">
        <div className="gallery-toolbar">
          <div>
            <p className="eyebrow">Your gallery</p>
            <h2>{gallery.title}</h2>
          </div>
          {gallery.fullDownloadUrl ? (
            <a className="text-button" href={gallery.fullDownloadUrl} target="_blank" rel="noreferrer">
              Download full gallery
            </a>
          ) : null}
        </div>

        {active ? (
          <figure className="active-photo">
            <button
              className="active-photo-button"
              type="button"
              aria-label={`Enlarge ${active.alt}`}
              onClick={() => setExpanded(active)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.previewUrl} alt={active.alt} />
            </button>
            <figcaption>
              <span>{active.alt}</span>
              <a className="text-button" href={active.downloadUrl}>
                Download this photo
              </a>
            </figcaption>
          </figure>
        ) : (
          <p className="lede">This gallery doesn&apos;t have any photos yet.</p>
        )}

        <div className="photo-strip" aria-label="Gallery photos">
          {photos.map((photo) => (
            <button
              key={photo.id}
              className="photo-button"
              type="button"
              aria-pressed={photo.id === active?.id}
              aria-label={`View ${photo.alt}`}
              onClick={() => setActiveId(photo.id)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.previewUrl} alt="" />
            </button>
          ))}
        </div>

        <PhotoLightbox photo={expanded} onClose={() => setExpanded(null)} />
      </section>
    );
  }

  return (
    <section className="access-panel">
      <p className="eyebrow">Private gallery</p>
      <h1>{title}</h1>
      <p className="lede">
        Enter your passcode{requiresEmail ? " and approved email" : ""} to view and download your photos.
      </p>
      <form className="access-form" onSubmit={submit}>
        <label>
          Passcode
          <input value={passcode} onChange={(event) => setPasscode(event.target.value)} autoComplete="off" />
        </label>
        {requiresEmail ? (
          <label>
            Approved email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        ) : null}
        {error ? <p className="form-error">{error}</p> : null}
        <button className="dark-button" type="submit" disabled={pending}>
          {pending ? "Checking…" : "Open gallery"}
        </button>
      </form>
    </section>
  );
}
