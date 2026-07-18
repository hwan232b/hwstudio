import React from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { getAboutSettings } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getAboutSettings();
  const paragraphs = about.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">{about.eyebrow}</p>
        <h1>{about.heading}</h1>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="lede">
            {paragraph}
          </p>
        ))}
      </main>
    </>
  );
}
