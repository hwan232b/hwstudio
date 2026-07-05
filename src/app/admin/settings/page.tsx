"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminSettingsPage() {
  const { state, dispatch } = usePrototypeStore();
  const gallery = state.galleries[0];
  const [statusMessage, setStatusMessage] = useState("");

  return (
    <AdminShell title="Settings">
      {statusMessage ? (
        <p className="admin-status" role="status">
          {statusMessage}
        </p>
      ) : null}
      <section className="admin-panel admin-settings-panel">
        <div>
          <h2>Prototype data</h2>
          <p>
            Current gallery: <strong>{gallery?.title ?? "No gallery"}</strong>
          </p>
        </div>
        <button
          className="dark-button"
          type="button"
          onClick={() => {
            dispatch({ type: "reset" });
            setStatusMessage("Prototype data reset.");
          }}
        >
          Reset prototype data
        </button>
      </section>
    </AdminShell>
  );
}
