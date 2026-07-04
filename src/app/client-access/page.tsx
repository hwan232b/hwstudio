import React from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function ClientAccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">Client Access</p>
        <h1>Private galleries are almost ready.</h1>
        <p className="lede">
          Client previews and downloads will open here soon, with a quiet space for viewing, selecting, and saving
          finished photographs.
        </p>
      </main>
    </>
  );
}
