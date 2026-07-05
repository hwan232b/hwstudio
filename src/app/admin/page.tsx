"use client";

import React from "react";
import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminPage() {
  const { state } = usePrototypeStore();
  const gallery = state.galleries[0];
  const galleryPhotos = gallery ? state.galleryPhotos.filter((photo) => photo.galleryId === gallery.id) : [];
  const approvedEmails = gallery ? state.approvedEmails.filter((email) => email.galleryId === gallery.id) : [];

  return (
    <AdminShell title="Dashboard">
      <section className="admin-stat-grid" aria-label="Admin stats">
        <article className="admin-stat">
          <span>Gallery title</span>
          <strong>{gallery?.title ?? "No gallery"}</strong>
        </article>
        <article className="admin-stat">
          <span>Gallery photos</span>
          <strong>{galleryPhotos.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Approved emails</span>
          <strong>{approvedEmails.length}</strong>
        </article>
        <article className="admin-stat">
          <span>Inquiries</span>
          <strong>{state.contactInquiries.length}</strong>
        </article>
      </section>
    </AdminShell>
  );
}
