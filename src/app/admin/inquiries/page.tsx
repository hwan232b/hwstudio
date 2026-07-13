"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { createClient } from "@/lib/supabase/client";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string | null;
  photography_type: string | null;
  preferred_date: string | null;
  status: string;
  created_at: string;
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });
    setInquiries((data as Inquiry[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("contact_inquiries").update({ status }).eq("id", id);
    load();
  }

  if (loading) {
    return (
      <AdminShell title="Inquiries">
        <p className="admin-empty">Loading…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Inquiries">
      {inquiries.length > 0 ? (
        <div className="inquiry-list">
          {inquiries.map((inquiry) => (
            <article key={inquiry.id} className="inquiry-card">
              <div className="inquiry-card-heading">
                <div>
                  <h2>{inquiry.name}</h2>
                  <p>
                    <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                  </p>
                </div>
                <span>{inquiry.status}</span>
              </div>
              <dl className="inquiry-meta">
                <div>
                  <dt>Photography type</dt>
                  <dd>{inquiry.photography_type || "—"}</dd>
                </div>
                <div>
                  <dt>Preferred date</dt>
                  <dd>{inquiry.preferred_date || "Flexible"}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{new Date(inquiry.created_at).toLocaleDateString("en-US")}</dd>
                </div>
              </dl>
              <p className="inquiry-message">{inquiry.message}</p>
              <div className="admin-photo-actions">
                {inquiry.status !== "reviewed" ? (
                  <button className="text-button" type="button" onClick={() => setStatus(inquiry.id, "reviewed")}>
                    Mark reviewed
                  </button>
                ) : null}
                {inquiry.status !== "archived" ? (
                  <button className="text-button" type="button" onClick={() => setStatus(inquiry.id, "archived")}>
                    Archive
                  </button>
                ) : null}
                {inquiry.status !== "new" ? (
                  <button className="text-button" type="button" onClick={() => setStatus(inquiry.id, "new")}>
                    Mark new
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="admin-empty">
          <p>No inquiries have come in yet. When a client submits the contact form, it appears here.</p>
        </section>
      )}
    </AdminShell>
  );
}
