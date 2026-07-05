"use client";

import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleCategories, getVisiblePortfolioPhotos } from "@/lib/portfolio";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function PortfolioPage() {
  const { state } = usePrototypeStore();
  const categories = getVisibleCategories(state.portfolioCategories)
    .map((category) => ({
      category,
      coverPhoto: getVisiblePortfolioPhotos(state.portfolioPhotos, category.id)[0] ?? null
    }))
    .filter(({ coverPhoto }) => coverPhoto);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">{state.portfolioSettings.eyebrow}</p>
        <h1 className="portfolio-heading">{state.portfolioSettings.heading}</h1>
        {categories.length > 0 ? (
          <div className="portfolio-category-grid">
            {categories.map(({ category, coverPhoto }) => (
              <article key={category.id} className="portfolio-category-card">
                <a href={`/portfolio/${category.slug}`} aria-label={`Open ${category.name} portfolio`}>
                  {coverPhoto ? <img src={coverPhoto.previewUrl} alt={coverPhoto.alt} /> : null}
                  <div>
                    <h2>{category.name}</h2>
                    <p>{category.description}</p>
                  </div>
                </a>
              </article>
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
