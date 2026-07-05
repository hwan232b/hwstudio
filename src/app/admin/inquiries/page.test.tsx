import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import AdminInquiriesPage from "./page";

function renderAdminInquiriesPage() {
  return render(
    <PrototypeStoreProvider>
      <AdminInquiriesPage />
    </PrototypeStoreProvider>
  );
}

describe("AdminInquiriesPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows a no-inquiries message when the inquiry list is empty", () => {
    renderAdminInquiriesPage();

    expect(screen.getByRole("heading", { name: "Inquiries" })).toBeInTheDocument();
    expect(screen.getByText("No inquiries have been submitted yet.")).toBeInTheDocument();
  });

  it("shows submitted inquiries from the prototype store", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        contactInquiries: [
          {
            id: "inquiry-1",
            name: "Jordan Lee",
            email: "jordan@example.com",
            photographyType: "Graduation",
            preferredDate: "2026-08-20",
            message: "Looking for a quick campus session before commencement.",
            status: "new",
            createdAt: "2026-07-12T16:00:00.000Z"
          }
        ]
      })
    );

    renderAdminInquiriesPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Jordan Lee" })).toBeInTheDocument();
    });
    expect(screen.getByText("jordan@example.com")).toBeInTheDocument();
    expect(screen.getByText("Graduation")).toBeInTheDocument();
    expect(screen.getByText("2026-08-20")).toBeInTheDocument();
    expect(screen.getByText("Looking for a quick campus session before commencement.")).toBeInTheDocument();
    expect(screen.getByText("new")).toBeInTheDocument();
  });
});
