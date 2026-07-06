"use client";

import React, { useEffect, useMemo, useState } from "react";
import { PhotoLightbox } from "./PhotoLightbox";
import type { DriveFolderPhoto } from "@/lib/drive-folder";
import type { Gallery, GalleryPhoto } from "@/lib/types";

type GalleryViewerProps = {
  gallery: Gallery;
  photos: GalleryPhoto[];
};

export function GalleryViewer({ gallery, photos }: GalleryViewerProps) {
  const [syncedPhotos, setSyncedPhotos] = useState<GalleryPhoto[]>([]);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "synced" | "error">("idle");
  const [syncMessage, setSyncMessage] = useState("");
  const mergedPhotos = useMemo(() => {
    const manualDriveFileIds = new Set(photos.map((photo) => photo.driveFileId).filter(Boolean));
    const uniqueSyncedPhotos = syncedPhotos.filter((photo) => !manualDriveFileIds.has(photo.driveFileId));
    return [...photos, ...uniqueSyncedPhotos];
  }, [photos, syncedPhotos]);
  const visiblePhotos = useMemo(
    () => mergedPhotos.filter((photo) => photo.isVisible).sort((left, right) => left.displayOrder - right.displayOrder),
    [mergedPhotos]
  );
  const [activePhotoId, setActivePhotoId] = useState<string | null>(visiblePhotos[0]?.id ?? null);
  const [expandedPhoto, setExpandedPhoto] = useState<GalleryPhoto | null>(null);
  const activePhoto = visiblePhotos.find((photo) => photo.id === activePhotoId) ?? visiblePhotos[0] ?? null;

  useEffect(() => {
    if (!gallery.driveFolderId) {
      setSyncedPhotos([]);
      setSyncStatus("idle");
      setSyncMessage("");
      return;
    }

    let isMounted = true;
    setSyncStatus("loading");
    setSyncMessage("Syncing from Google Drive...");

    fetch(`/api/drive-folder?folderId=${encodeURIComponent(gallery.driveFolderId)}`)
      .then(async (response) => {
        const body = (await response.json()) as { photos?: DriveFolderPhoto[]; error?: string };
        if (!response.ok) {
          throw new Error(body.error ?? "Google Drive folder could not be loaded.");
        }
        return body.photos ?? [];
      })
      .then((drivePhotos) => {
        if (!isMounted) {
          return;
        }
        setSyncedPhotos(
          drivePhotos.map((photo) => ({
            ...photo,
            galleryId: gallery.id
          }))
        );
        setSyncStatus("synced");
        setSyncMessage("Synced from Google Drive.");
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }
        setSyncedPhotos([]);
        setSyncStatus("error");
        setSyncMessage(error.message);
      });

    return () => {
      isMounted = false;
    };
  }, [gallery.driveFolderId, gallery.id]);

  useEffect(() => {
    if (!activePhotoId && visiblePhotos[0]) {
      setActivePhotoId(visiblePhotos[0].id);
    }
  }, [activePhotoId, visiblePhotos]);

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
        {syncMessage ? <p className={`drive-sync-status drive-sync-status-${syncStatus}`}>{syncMessage}</p> : null}
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
        {syncMessage ? <p className={`drive-sync-status drive-sync-status-${syncStatus}`}>{syncMessage}</p> : null}

      <figure className="active-photo">
        <button
          className="active-photo-button"
          type="button"
          aria-label={`Enlarge ${activePhoto.alt}`}
          onClick={() => setExpandedPhoto(activePhoto)}
        >
          <img src={activePhoto.previewUrl} alt={activePhoto.alt} />
        </button>
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
      <PhotoLightbox photo={expandedPhoto} onClose={() => setExpandedPhoto(null)} />
    </section>
  );
}
