import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getAboutPortrait, getAboutSettings } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getAboutSettings();
  const portrait = await getAboutPortrait(about.driveFolderId);
  const paragraphs = about.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className={`page-shell ${portrait ? "about-shell" : "narrow-page"}`}>
        {portrait ? (
          <figure className="about-photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait.previewUrl} alt={portrait.alt} />
          </figure>
        ) : null}
        <div className="about-copy">
          <p className="eyebrow">{about.eyebrow}</p>
          <h1>{about.heading}</h1>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="lede">
              {paragraph}
            </p>
          ))}
        </div>
      </main>
    </>
  );
}
