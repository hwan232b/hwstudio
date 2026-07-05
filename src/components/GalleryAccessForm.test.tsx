import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { GalleryAccessForm } from "./GalleryAccessForm";
import type { Gallery } from "@/lib/types";

const gallery: Gallery = {
  id: "gallery-1",
  title: "Sample Gallery",
  slug: "sample-gallery",
  eventDate: "2026-06-01",
  description: "A test gallery.",
  coverPhotoId: "photo-1",
  isListed: true,
  displayOrder: 1,
  passcode: "secret",
  requiresApprovedEmail: true,
  expirationDate: "2099-01-01",
  driveFolderId: "drive-folder-1",
  fullDownloadUrl: "https://drive.google.com/example",
  status: "active"
};

describe("GalleryAccessForm", () => {
  it("submits passcode and email", () => {
    const onSubmit = vi.fn();
    render(<GalleryAccessForm gallery={gallery} error={null} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Passcode"), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("Approved email"), { target: { value: "client@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Open Gallery" }));

    expect(onSubmit).toHaveBeenCalledWith({ passcode: "secret", email: "client@example.com" });
  });

  it("shows access errors", () => {
    render(<GalleryAccessForm gallery={gallery} error="That email is not approved for this gallery." onSubmit={vi.fn()} />);

    expect(screen.getByText("That email is not approved for this gallery.")).toBeInTheDocument();
  });

  it("hides the approved email field when the gallery does not require it", () => {
    render(
      <GalleryAccessForm gallery={{ ...gallery, requiresApprovedEmail: false }} error={null} onSubmit={vi.fn()} />
    );

    expect(screen.getByLabelText("Passcode")).toBeInTheDocument();
    expect(screen.queryByLabelText("Approved email")).not.toBeInTheDocument();
  });
});
