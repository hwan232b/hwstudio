import React from "react";
import { HomeMosaic } from "@/components/HomeMosaic";
import { SiteHeader } from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell home-shell">
        <HomeMosaic />
      </main>
    </>
  );
}
