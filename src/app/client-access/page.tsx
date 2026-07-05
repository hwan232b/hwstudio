"use client";

import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { canListGallery } from "@/lib/access";
import { usePrototypeStore } from "@/lib/prototype-store";
import type { Gallery, GalleryPhoto } from "@/lib/types";

function formatEventDate(eventDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${eventDate}T00:00:00.000Z`));
}

export default function ClientAccessPage() {
  const { state } = usePrototypeStore();
  const listedGalleries = state.galleries
    .filter(canListGallery)
    .sort((left, right) => left.displayOrder - right.displayOrder);

  function getCoverPhoto(gallery: Gallery): GalleryPhoto | null {
    return (
      state.galleryPhotos.find((photo) => photo.id === gallery.coverPhotoId) ??
      state.galleryPhotos
        .filter((photo) => photo.galleryId === gallery.id && photo.isVisible)
        .sort((left, right) => left.displayOrder - right.displayOrder)[0] ??
      null
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">Client Access</p>
        <h1>Client galleries</h1>
        {listedGalleries.length > 0 ? (
          <div className="gallery-card-grid">
            {listedGalleries.map((gallery) => {
              const coverPhoto = getCoverPhoto(gallery);

              return (
                <article className="gallery-card" key={gallery.id}>
                  {coverPhoto ? <img src={coverPhoto.previewUrl} alt={coverPhoto.alt} /> : null}
                  <div className="gallery-card-copy">
                    <p className="eyebrow">{formatEventDate(gallery.eventDate)}</p>
                    <h2>{gallery.title}</h2>
                    <p>{gallery.description}</p>
                    <a className="dark-button" href={`/galleries/${gallery.slug}`} aria-label={`Open ${gallery.title}`}>
                      Open Gallery
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <section className="access-panel">
            <h2>No client galleries are currently listed.</h2>
            <p>When a preview gallery is ready, it will appear here with its access link.</p>
          </section>
        )}
      </main>
    </>
  );
}
