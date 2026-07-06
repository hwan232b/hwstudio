"use client";

import React, { useState } from "react";
import { PhotoLightbox } from "./PhotoLightbox";

type PhotoGridItem = {
  id: string;
  previewUrl: string;
  alt: string;
};

export function PhotoGrid({ photos }: { photos: PhotoGridItem[] }) {
  const [expandedPhoto, setExpandedPhoto] = useState<PhotoGridItem | null>(null);

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo) => (
          <figure key={photo.id} className="photo-tile">
            <button
              className="photo-tile-button"
              type="button"
              aria-label={`Enlarge ${photo.alt}`}
              onClick={() => setExpandedPhoto(photo)}
            >
              <img src={photo.previewUrl} alt={photo.alt} />
            </button>
          </figure>
        ))}
      </div>
      <PhotoLightbox photo={expandedPhoto} onClose={() => setExpandedPhoto(null)} />
    </>
  );
}
