import { describe, expect, it } from "vitest";
import { getVisibleCategories, getVisiblePortfolioPhotos, promoteGalleryPhoto } from "./portfolio";
import type { GalleryPhoto, PortfolioCategory, PortfolioPhoto } from "./types";

const categories: PortfolioCategory[] = [
  { id: "hidden", name: "Hidden", slug: "hidden", description: "", displayOrder: 2, isVisible: false },
  { id: "featured", name: "Featured", slug: "featured", description: "", displayOrder: 1, isVisible: true }
];

const existing: PortfolioPhoto[] = [
  {
    id: "portfolio-1",
    sourceGalleryPhotoId: "photo-1",
    previewUrl: "/one.jpg",
    alt: "One",
    categoryIds: ["featured"],
    displayOrder: 1,
    isFeatured: true
  }
];

const galleryPhoto: GalleryPhoto = {
  id: "photo-2",
  galleryId: "gallery-1",
  driveFileId: "drive-2",
  previewUrl: "/two.jpg",
  downloadUrl: "/two-download.jpg",
  alt: "Two",
  displayOrder: 2,
  isVisible: true,
  isPortfolioEligible: true
};

describe("portfolio helpers", () => {
  it("returns visible categories in display order", () => {
    expect(getVisibleCategories(categories).map((category) => category.id)).toEqual(["featured"]);
  });

  it("returns visible portfolio photos for a category", () => {
    expect(getVisiblePortfolioPhotos(existing, "featured").map((photo) => photo.id)).toEqual(["portfolio-1"]);
  });

  it("promotes an eligible gallery photo into a category", () => {
    const result = promoteGalleryPhoto(existing, galleryPhoto, ["featured"]);

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      sourceGalleryPhotoId: "photo-2",
      previewUrl: "/two.jpg",
      alt: "Two",
      categoryIds: ["featured"],
      displayOrder: 2
    });
  });

  it("does not duplicate an already promoted gallery photo", () => {
    const result = promoteGalleryPhoto(existing, { ...galleryPhoto, id: "photo-1" }, ["featured"]);
    expect(result).toEqual(existing);
  });
});
