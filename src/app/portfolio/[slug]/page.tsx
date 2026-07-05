"use client";

import React from "react";
import { useParams } from "next/navigation";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { getVisibleCategories, getVisiblePortfolioPhotos } from "@/lib/portfolio";
import { usePrototypeStore } from "@/lib/prototype-store";

function getSlug(params: ReturnType<typeof useParams>) {
  const slug = params?.slug;
  return Array.isArray(slug) ? slug[0] : slug;
}

export default function PortfolioCategoryPage() {
  const params = useParams();
  const slug = getSlug(params);
  const { state } = usePrototypeStore();
  const category = getVisibleCategories(state.portfolioCategories).find((item) => item.slug === slug);
  const photos = category ? getVisiblePortfolioPhotos(state.portfolioPhotos, category.id) : [];

  if (!category) {
    return (
      <>
        <SiteHeader />
        <main className="page-shell narrow-page">
          <p className="eyebrow">Portfolio</p>
          <h1>Portfolio category not found.</h1>
          <a className="text-button" href="/portfolio">
            Back to portfolio
          </a>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <a className="text-button portfolio-back-link" href="/portfolio">
          Back to portfolio
        </a>
        <p className="eyebrow">Portfolio</p>
        <h1 className="portfolio-heading">{category.name}</h1>
        <p className="lede">{category.description}</p>
        {photos.length > 0 ? (
          <div className="category-stack">
            <PhotoGrid photos={photos} />
          </div>
        ) : (
          <section className="portfolio-empty">
            <p className="eyebrow">In edit</p>
            <h2>This category is being sequenced.</h2>
            <p>Photos assigned here will appear once the portfolio edit is ready.</p>
          </section>
        )}
      </main>
    </>
  );
}
