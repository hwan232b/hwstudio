import Link from "next/link";
import React from "react";
import type { HomeSettings } from "@/lib/data/site";

type MosaicPhoto = { id: string; previewUrl: string; alt: string };

export function HomeMosaic({ settings, photos }: { settings: HomeSettings; photos: MosaicPhoto[] }) {
  const shown = photos.slice(0, 3);

  return (
    <section className="home-mosaic" aria-label="HWStudio featured work">
      <div className="home-copy">
        <p className="eyebrow">{settings.eyebrow}</p>
        <h1>{settings.heading}</h1>
        <p className="lede">{settings.lede}</p>
        <div className="button-row">
          <Link className="text-button" href={settings.primaryCtaHref}>
            {settings.primaryCtaLabel}
          </Link>
          <Link className="dark-button" href={settings.secondaryCtaHref}>
            {settings.secondaryCtaLabel}
          </Link>
        </div>
      </div>
      <div className="mosaic-grid">
        {shown.length > 0 ? (
          shown.map((photo, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              className={`mosaic-image mosaic-image-${index + 1}`}
              src={photo.previewUrl}
              alt={photo.alt}
            />
          ))
        ) : (
          <p className="mosaic-empty">
            Add photos to your homepage Drive folder to feature them here.
          </p>
        )}
      </div>
    </section>
  );
}
