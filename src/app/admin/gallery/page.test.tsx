import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import AdminGalleryPage from "./page";

function renderAdminGalleryPage() {
  return render(
    <PrototypeStoreProvider>
      <AdminGalleryPage />
    </PrototypeStoreProvider>
  );
}

describe("AdminGalleryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves gallery details through the prototype store", async () => {
    renderAdminGalleryPage();

    const title = await screen.findByLabelText("Title");
    fireEvent.change(title, { target: { value: "Summer Gallery" } });
    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "summer-gallery" } });
    fireEvent.click(screen.getByRole("button", { name: "Save gallery" }));

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("Summer Gallery");
    });
    expect(screen.getByLabelText("Slug")).toHaveValue("summer-gallery");
  });

  it("adds and removes approved emails", async () => {
    renderAdminGalleryPage();

    await screen.findByText("client@example.com");
    fireEvent.change(screen.getByLabelText("Add approved email"), {
      target: { value: "new-client@example.com" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add email" }));

    expect(await screen.findByText("new-client@example.com")).toBeInTheDocument();

    const emailRow = screen.getByText("new-client@example.com").closest("li");
    expect(emailRow).not.toBeNull();
    fireEvent.click(within(emailRow as HTMLElement).getByRole("button", { name: "Remove email" }));

    await waitFor(() => {
      expect(screen.queryByText("new-client@example.com")).not.toBeInTheDocument();
    });
  });

  it("adds, reorders, promotes, and removes gallery photos", async () => {
    renderAdminGalleryPage();

    fireEvent.change(await screen.findByLabelText("Add photo URL"), {
      target: { value: "https://example.com/new-photo.jpg" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

    const photo = await screen.findByAltText("Gallery photo 4");
    const photoRow = photo.closest("li");
    expect(photoRow).not.toBeNull();

    fireEvent.click(within(photoRow as HTMLElement).getByRole("button", { name: "Move up" }));
    fireEvent.click(within(photoRow as HTMLElement).getByRole("button", { name: "Promote to featured" }));
    fireEvent.click(within(photoRow as HTMLElement).getByRole("button", { name: "Remove photo" }));

    await waitFor(() => {
      expect(screen.queryByAltText("Gallery photo 4")).not.toBeInTheDocument();
    });
  });
});
