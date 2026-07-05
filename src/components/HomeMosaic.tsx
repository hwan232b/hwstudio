"use client";

import Link from "next/link";
import React, { useMemo } from "react";
import { usePrototypeStore } from "@/lib/prototype-store";

export function HomeMosaic() {
  const { state } = usePrototypeStore();
  const homeSettings = state.homeSettings;
  const photos = useMemo(
    () => [...homeSettings.photos].sort((first, second) => first.displayOrder - second.displayOrder).slice(0, 3),
    [homeSettings.photos]
  );

  return (
    <section className="home-mosaic" aria-label="HWStudio featured work">
      <div className="home-copy">
        <p className="eyebrow">{homeSettings.eyebrow}</p>
        <h1>{homeSettings.heading}</h1>
        <p className="lede">{homeSettings.lede}</p>
        <div className="button-row">
          <Link className="text-button" href={homeSettings.primaryCtaHref}>
            {homeSettings.primaryCtaLabel}
          </Link>
          <Link className="dark-button" href={homeSettings.secondaryCtaHref}>
            {homeSettings.secondaryCtaLabel}
          </Link>
        </div>
      </div>
      <div className="mosaic-grid">
        {photos.map((photo, index) => (
          <img
            key={photo.id}
            className={`mosaic-image mosaic-image-${index + 1}`}
            src={photo.previewUrl}
            alt={photo.alt}
          />
        ))}
      </div>
    </section>
  );
}
