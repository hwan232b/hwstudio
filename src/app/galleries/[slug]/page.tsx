"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { GalleryAccessForm } from "@/components/GalleryAccessForm";
import { GalleryViewer } from "@/components/GalleryViewer";
import { SiteHeader } from "@/components/SiteHeader";
import { isGalleryExpired, validateGalleryAccess, type AccessFailureReason } from "@/lib/access";
import { usePrototypeStore } from "@/lib/prototype-store";

const accessMessages: Record<AccessFailureReason, string> = {
  "gallery-inactive": "This gallery is not currently available.",
  expired: "This gallery has expired and is no longer available.",
  "incorrect-passcode": "That passcode does not match this gallery.",
  "email-required": "Enter the approved email address for this gallery.",
  "email-not-approved": "That email is not approved for this gallery."
};

function getSlug(params: ReturnType<typeof useParams>) {
  const slug = params?.slug;
  return Array.isArray(slug) ? slug[0] : slug;
}

export default function GalleryPage() {
  const params = useParams();
  const slug = getSlug(params);
  const { state } = usePrototypeStore();
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gallery = state.galleries.find((item) => item.slug === slug);
  const photos = useMemo(
    () => (gallery ? state.galleryPhotos.filter((photo) => photo.galleryId === gallery.id) : []),
    [gallery, state.galleryPhotos]
  );

  if (!gallery) {
    return (
      <>
        <SiteHeader />
        <main className="page-shell narrow-page">
          <p className="eyebrow">Client Gallery</p>
          <h1>Gallery not found.</h1>
        </main>
      </>
    );
  }

  if (isGalleryExpired(gallery)) {
    return (
      <>
        <SiteHeader />
        <main className="page-shell narrow-page">
          <p className="eyebrow">Client Gallery</p>
          <h1>{gallery.title}</h1>
          <section className="access-panel">
            <h2>This gallery has expired.</h2>
            <p>Contact HWStudio if you need download access restored.</p>
          </section>
        </main>
      </>
    );
  }

  function handleSubmit({ passcode, email }: { passcode: string; email: string }) {
    if (!gallery) {
      return;
    }

    const result = validateGalleryAccess({
      gallery,
      approvedEmails: state.approvedEmails,
      passcode,
      email
    });

    if (result.ok) {
      setError(null);
      setHasAccess(true);
      return;
    }

    setError(accessMessages[result.reason]);
  }

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        {hasAccess ? (
          <GalleryViewer gallery={gallery} photos={photos} />
        ) : (
          <section className="access-panel">
            <p className="eyebrow">Private Gallery</p>
            <h1>{gallery.title}</h1>
            <p className="lede">
              Enter your passcode{gallery.requiresApprovedEmail ? " and approved email" : ""} to view and download the
              finished gallery.
            </p>
            <GalleryAccessForm gallery={gallery} error={error} onSubmit={handleSubmit} />
          </section>
        )}
      </main>
    </>
  );
}
