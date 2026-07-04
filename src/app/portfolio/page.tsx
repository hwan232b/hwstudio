"use client";

import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getVisibleCategories, getVisiblePortfolioPhotos } from "@/lib/portfolio";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function PortfolioPage() {
  const { state } = usePrototypeStore();
  const categories = getVisibleCategories(state.portfolioCategories)
    .map((category) => ({
      category,
      photos: getVisiblePortfolioPhotos(state.portfolioPhotos, category.id)
    }))
    .filter(({ photos }) => photos.length > 0);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">Portfolio</p>
        <h1>Selected work across portraits, events, and graduation stories.</h1>
        {categories.length > 0 ? (
          <div className="category-stack">
            {categories.map(({ category, photos }) => (
              <section key={category.id} className="portfolio-section">
                <div className="section-heading">
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                </div>
                <PhotoGrid photos={photos} />
              </section>
            ))}
          </div>
        ) : (
          <section className="portfolio-empty">
            <p className="eyebrow">In edit</p>
            <h2>The portfolio edit is in progress.</h2>
            <p>New selections are being sequenced for this space. Check back soon for the finished gallery.</p>
          </section>
        )}
      </main>
    </>
  );
}
