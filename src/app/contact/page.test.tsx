import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import ContactPage from "./page";

function renderContactPage() {
  return render(
    <PrototypeStoreProvider>
      <ContactPage />
    </PrototypeStoreProvider>
  );
}

describe("ContactPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("adds a submitted inquiry to the prototype store", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1783900800000);

    renderContactPage();

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Maya Chen" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "maya@example.com" } });
    fireEvent.change(screen.getByLabelText("Photography type"), { target: { value: "Events" } });
    fireEvent.change(screen.getByLabelText("Preferred date"), { target: { value: "2026-10-04" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Coverage for a small campus ceremony." }
    });

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem("hwstudio-prototype-state") ?? "{}");
      expect(stored.contactInquiries[0]).toMatchObject({
        id: "inquiry-1783900800000",
        name: "Maya Chen",
        email: "maya@example.com",
        photographyType: "Events",
        preferredDate: "2026-10-04",
        message: "Coverage for a small campus ceremony.",
        status: "new"
      });
      expect(stored.contactInquiries[0].createdAt).toEqual(expect.any(String));
    });
    expect(screen.getByText("Inquiry sent. We will review the details and follow up soon.")).toBeInTheDocument();
  });
});
