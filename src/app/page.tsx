import Link from "next/link";
import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { initialState } from "@/lib/seed-data";

export default function HomePage() {
  const photos = initialState.galleryPhotos.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="page-shell home-shell">
        <section className="home-mosaic" aria-label="HWStudio featured work">
          <div className="home-copy">
            <p className="eyebrow">HWStudio</p>
            <h1>A curated gallery for every milestone.</h1>
            <p className="lede">
              Clean editorial photography for graduations, portraits, groups, events, and headshots.
            </p>
            <div className="button-row">
              <Link className="text-button" href="/portfolio">
                Explore Portfolio
              </Link>
              <Link className="dark-button" href="/client-access">
                Access Your Photos
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
      </main>
    </>
  );
}
