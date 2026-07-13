import React from "react";
import { GalleryAccess } from "@/components/GalleryAccess";
import { SiteHeader } from "@/components/SiteHeader";
import { getPublicGallery } from "@/lib/data/site";

export const dynamic = "force-dynamic";

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = await getPublicGallery(slug);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <GalleryAccess
          slug={slug}
          title={meta?.title ?? "Private gallery"}
          requiresEmail={meta?.requiresApprovedEmail ?? false}
        />
      </main>
    </>
  );
}
