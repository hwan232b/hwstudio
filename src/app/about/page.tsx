import { SiteHeader } from "@/components/SiteHeader";
import React from "react";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">About</p>
        <h1>Photography with a quiet point of view.</h1>
        <p className="lede">
          HWStudio is a working prototype for a photography brand that balances public portfolio presentation with
          private client gallery delivery.
        </p>
      </main>
    </>
  );
}
