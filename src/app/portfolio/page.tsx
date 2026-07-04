"use client";

import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getVisibleCategories, getVisiblePortfolioPhotos } from "@/lib/portfolio";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function PortfolioPage() {
  const { state } = usePrototypeStore();
  const categories = getVisibleCategories(state.portfolioCategories);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">Portfolio</p>
        <h1>Selected work across portraits, events, and graduation stories.</h1>
        <div className="category-stack">
          {categories.map((category) => {
            const photos = getVisiblePortfolioPhotos(state.portfolioPhotos, category.id);
            return (
              <section key={category.id} className="portfolio-section">
                <div className="section-heading">
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                </div>
                <PhotoGrid photos={photos} />
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
