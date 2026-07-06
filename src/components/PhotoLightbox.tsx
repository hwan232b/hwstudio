"use client";

import React, { useEffect } from "react";

type LightboxPhoto = {
  previewUrl: string;
  alt: string;
};

type PhotoLightboxProps = {
  photo: LightboxPhoto | null;
  onClose: () => void;
};

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  useEffect(() => {
    if (!photo) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, photo]);

  if (!photo) {
    return null;
  }

  return (
    <div
      className="photo-lightbox-backdrop"
      data-testid="photo-lightbox-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="photo-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Expanded photo">
        <button className="photo-lightbox-close" type="button" onClick={onClose} aria-label="Close expanded photo">
          Close
        </button>
        <img src={photo.previewUrl} alt={photo.alt} />
      </div>
    </div>
  );
}
