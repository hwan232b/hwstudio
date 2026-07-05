"use client";

import React from "react";
import { ContactForm, type ContactFormValues } from "@/components/ContactForm";
import { SiteHeader } from "@/components/SiteHeader";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function ContactPage() {
  const { dispatch } = usePrototypeStore();

  function handleSubmit(values: ContactFormValues) {
    dispatch({
      type: "inquiry:add",
      inquiry: {
        id: `inquiry-${Date.now()}`,
        ...values,
        status: "new",
        createdAt: new Date().toISOString()
      }
    });
  }

  return (
    <>
      <SiteHeader />
      <main className="page-shell contact-shell">
        <section className="contact-intro">
          <p className="eyebrow">Contact</p>
          <h1>Tell us what you want this session to hold.</h1>
          <p className="lede">
            Share the date, format, and any details that should shape the shoot. HWStudio will review the inquiry and
            follow up with next steps.
          </p>
        </section>
        <ContactForm onSubmit={handleSubmit} />
      </main>
    </>
  );
}
