"use client";

import React from "react";
import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminInquiriesPage() {
  const { state } = usePrototypeStore();

  return (
    <AdminShell title="Inquiries">
      {state.contactInquiries.length > 0 ? (
        <div className="inquiry-list">
          {state.contactInquiries.map((inquiry) => (
            <article key={inquiry.id} className="inquiry-card">
              <div className="inquiry-card-heading">
                <div>
                  <h2>{inquiry.name}</h2>
                  <p>{inquiry.email}</p>
                </div>
                <span>{inquiry.status}</span>
              </div>
              <dl className="inquiry-meta">
                <div>
                  <dt>Photography type</dt>
                  <dd>{inquiry.photographyType}</dd>
                </div>
                <div>
                  <dt>Preferred date</dt>
                  <dd>{inquiry.preferredDate || "Flexible"}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{new Date(inquiry.createdAt).toLocaleDateString("en-US")}</dd>
                </div>
              </dl>
              <p className="inquiry-message">{inquiry.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-empty">
          <p>No inquiries have been submitted yet.</p>
        </section>
      )}
    </AdminShell>
  );
}
