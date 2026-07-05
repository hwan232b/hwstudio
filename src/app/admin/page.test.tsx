import { render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import AdminPage from "./page";

function renderAdminPage() {
  return render(
    <PrototypeStoreProvider>
      <AdminPage />
    </PrototypeStoreProvider>
  );
}

describe("AdminPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows dashboard stats from the prototype store", async () => {
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
            message: "Looking for a campus session.",
            status: "new",
            createdAt: "2026-07-12T16:00:00.000Z"
          }
        ]
      })
    );

    renderAdminPage();

    await waitFor(() => {
      expect(screen.getByText("Spring Graduation Preview")).toBeInTheDocument();
    });
    const stats = screen.getByLabelText("Admin stats");
    const photoStat = within(stats).getByText("Gallery photos").closest("article");
    const emailStat = within(stats).getByText("Approved emails").closest("article");
    const inquiryStat = within(stats).getByText("Inquiries").closest("article");

    expect(screen.getByText("Gallery title")).toBeInTheDocument();
    expect(photoStat).not.toBeNull();
    expect(emailStat).not.toBeNull();
    expect(inquiryStat).not.toBeNull();
    expect(within(photoStat as HTMLElement).getByText("3")).toBeInTheDocument();
    expect(within(emailStat as HTMLElement).getByText("1")).toBeInTheDocument();
    expect(within(inquiryStat as HTMLElement).getByText("1")).toBeInTheDocument();
  });
});
