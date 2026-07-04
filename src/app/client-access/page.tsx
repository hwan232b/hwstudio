import React from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function ClientAccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">Client Access</p>
        <h1>Client access is coming soon.</h1>
        <p className="lede">
          This prototype placeholder keeps the public navigation live while the private gallery flow will be built in a
          later task.
        </p>
      </main>
    </>
  );
}
