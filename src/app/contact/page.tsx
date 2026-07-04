import React from "react";
import { SiteHeader } from "@/components/SiteHeader";

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">Contact</p>
        <h1>Booking inquiries are almost ready.</h1>
        <p className="lede">
          Session requests and notes will open here soon. For now, this page is holding space for the studio inquiry
          experience.
        </p>
      </main>
    </>
  );
}
