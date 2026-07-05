import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { GalleryViewer } from "./GalleryViewer";
import type { Gallery, GalleryPhoto } from "@/lib/types";

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
  fullDownloadUrl: "https://drive.google.com/gallery",
  status: "active"
};

const photos: GalleryPhoto[] = [
  {
    id: "hidden-photo",
    galleryId: "gallery-1",
    driveFileId: "drive-hidden",
    previewUrl: "https://example.com/hidden.jpg",
    downloadUrl: "https://example.com/hidden-download.jpg",
    alt: "Hidden photo",
    displayOrder: 1,
    isVisible: false,
    isPortfolioEligible: false
  },
  {
    id: "second-photo",
    galleryId: "gallery-1",
    driveFileId: "drive-second",
    previewUrl: "https://example.com/second.jpg",
    downloadUrl: "https://example.com/second-download.jpg",
    alt: "Second visible photo",
    displayOrder: 2,
    isVisible: true,
    isPortfolioEligible: true
  },
  {
    id: "first-photo",
    galleryId: "gallery-1",
    driveFileId: "drive-first",
    previewUrl: "https://example.com/first.jpg",
    downloadUrl: "https://example.com/first-download.jpg",
    alt: "First visible photo",
    displayOrder: 1,
    isVisible: true,
    isPortfolioEligible: true
  }
];

describe("GalleryViewer", () => {
  it("shows visible photos in display order with gallery and photo downloads", () => {
    render(<GalleryViewer gallery={gallery} photos={photos} />);

    expect(screen.getByRole("link", { name: "Download full gallery" })).toHaveAttribute(
      "href",
      "https://drive.google.com/gallery"
    );
    expect(screen.getByRole("img", { name: "First visible photo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download this photo" })).toHaveAttribute(
      "href",
      "https://example.com/first-download.jpg"
    );
    expect(screen.queryByRole("img", { name: "Hidden photo" })).not.toBeInTheDocument();
  });

  it("switches the active photo from thumbnail buttons", () => {
    render(<GalleryViewer gallery={gallery} photos={photos} />);

    fireEvent.click(screen.getByRole("button", { name: "View Second visible photo" }));

    expect(screen.getByRole("img", { name: "Second visible photo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Download this photo" })).toHaveAttribute(
      "href",
      "https://example.com/second-download.jpg"
    );
  });
});
