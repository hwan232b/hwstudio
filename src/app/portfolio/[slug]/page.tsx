import React from "react";
import { PhotoGrid } from "@/components/PhotoGrid";
import { SiteHeader } from "@/components/SiteHeader";
import { getFolderPhotos, getPortfolioCategories } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export default async function PortfolioCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = (await getPortfolioCategories()).find((item) => item.isVisible && item.slug === slug);

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

  const photos = await getFolderPhotos(category.driveFolderId);

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
            <p>Photos added to this category&apos;s Drive folder will appear here.</p>
          </section>
        )}
      </main>
    </>
  );
}
