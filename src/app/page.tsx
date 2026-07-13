import React from "react";
import { HomeMosaic } from "@/components/HomeMosaic";
import { SiteHeader } from "@/components/SiteHeader";
import { getFolderPhotos, getHomeSettings } from "@/lib/data/site";

// Always render fresh so new photos in Drive and edits in the admin show up.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getHomeSettings();
  const photos = await getFolderPhotos(settings.driveFolderId);

  return (
    <>
      <SiteHeader />
      <main className="page-shell home-shell">
        <HomeMosaic settings={settings} photos={photos} />
      </main>
    </>
  );
}
