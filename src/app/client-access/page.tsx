import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getGalleryCover, getPublicGalleries } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export default async function ClientAccessPage() {
  const galleries = await getPublicGalleries();
  const cards = await Promise.all(
    galleries.map(async (gallery) => ({ gallery, cover: await getGalleryCover(gallery.driveFolderId) }))
  );

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">Client Access</p>
        <h1 className="portfolio-heading">Find your gallery.</h1>
        <p className="lede">Open your private gallery with the passcode shared with you.</p>
        {cards.length > 0 ? (
          <div className="access-directory">
            {cards.map(({ gallery, cover }) => (
              <a key={gallery.id} className="access-card" href={`/galleries/${gallery.slug}`}>
                <span className="access-card-cover">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover.previewUrl} alt={cover.alt} />
                  ) : (
                    <span className="access-card-cover-empty" aria-hidden="true" />
                  )}
                </span>
                <span className="access-card-body">
                  {gallery.eventDate ? <span className="access-card-meta">{gallery.eventDate}</span> : null}
                  <span className="access-card-title">{gallery.title}</span>
                  {gallery.description ? <span className="access-card-desc">{gallery.description}</span> : null}
                  <span className="access-card-cta">Enter gallery →</span>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <section className="portfolio-empty">
            <p className="eyebrow">Coming soon</p>
            <h2>No galleries are listed yet.</h2>
            <p>When your photographer publishes a gallery, it will appear here.</p>
          </section>
        )}
      </main>
    </>
  );
}
