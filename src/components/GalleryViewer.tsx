"use client";

import React, { useMemo, useState } from "react";
import type { Gallery, GalleryPhoto } from "@/lib/types";

type GalleryViewerProps = {
  gallery: Gallery;
  photos: GalleryPhoto[];
};

export function GalleryViewer({ gallery, photos }: GalleryViewerProps) {
  const visiblePhotos = useMemo(
    () => photos.filter((photo) => photo.isVisible).sort((left, right) => left.displayOrder - right.displayOrder),
    [photos]
  );
  const [activePhotoId, setActivePhotoId] = useState<string | null>(visiblePhotos[0]?.id ?? null);
  const activePhoto = visiblePhotos.find((photo) => photo.id === activePhotoId) ?? visiblePhotos[0] ?? null;

  if (!activePhoto) {
    return (
      <section className="gallery-viewer">
        <div className="gallery-toolbar">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>{gallery.title}</h2>
          </div>
          <a className="text-button" href={gallery.fullDownloadUrl}>
            Download full gallery
          </a>
        </div>
        <p className="lede">No photos are currently visible in this gallery.</p>
      </section>
    );
  }

  return (
    <section className="gallery-viewer">
      <div className="gallery-toolbar">
        <div>
          <p className="eyebrow">Gallery</p>
          <h2>{gallery.title}</h2>
        </div>
        <a className="text-button" href={gallery.fullDownloadUrl}>
          Download full gallery
        </a>
      </div>

      <figure className="active-photo">
        <img src={activePhoto.previewUrl} alt={activePhoto.alt} />
        <figcaption>
          <span>{activePhoto.alt}</span>
          <a className="text-button" href={activePhoto.downloadUrl}>
            Download this photo
          </a>
        </figcaption>
      </figure>

      <div className="photo-strip" aria-label="Gallery photos">
        {visiblePhotos.map((photo) => (
          <button
            key={photo.id}
            className="photo-button"
            type="button"
            aria-label={`View ${photo.alt}`}
            aria-pressed={photo.id === activePhoto.id}
            onClick={() => setActivePhotoId(photo.id)}
          >
            <img src={photo.previewUrl} alt="" />
          </button>
        ))}
      </div>
    </section>
  );
}
