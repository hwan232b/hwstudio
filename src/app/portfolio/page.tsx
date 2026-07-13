import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getFolderPhotos, getPortfolioCategories, getPortfolioSettings } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const settings = await getPortfolioSettings();
  const categories = (await getPortfolioCategories()).filter((category) => category.isVisible);

  // Each category's cover is the first photo in its Drive folder.
  const withCovers = await Promise.all(
    categories.map(async (category) => ({
      category,
      cover: (await getFolderPhotos(category.driveFolderId))[0] ?? null,
    }))
  );
  const shown = withCovers.filter((entry) => entry.cover);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">{settings.eyebrow}</p>
        <h1 className="portfolio-heading">{settings.heading}</h1>
        {shown.length > 0 ? (
          <div className="portfolio-category-grid">
            {shown.map(({ category, cover }) => (
              <article key={category.id} className="portfolio-category-card">
                <a href={`/portfolio/${category.slug}`} aria-label={`Open ${category.name} portfolio`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover!.previewUrl} alt={cover!.alt} />
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
