import React from "react";

type PhotoGridItem = {
  id: string;
  previewUrl: string;
  alt: string;
};

export function PhotoGrid({ photos }: { photos: PhotoGridItem[] }) {
  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <figure key={photo.id} className="photo-tile">
          <img src={photo.previewUrl} alt={photo.alt} />
        </figure>
      ))}
    </div>
  );
}
