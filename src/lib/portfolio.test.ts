import { describe, expect, it } from "vitest";
import { getVisibleCategories, getVisiblePortfolioPhotos, promoteGalleryPhoto } from "./portfolio";
import type { GalleryPhoto, PortfolioPhoto } from "./types";

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
  it("returns visible categories in display order and filters hidden categories", () => {
    const result = getVisibleCategories([
      { id: "hidden", name: "Hidden", slug: "hidden", description: "", displayOrder: 2, isVisible: false },
      { id: "editorial", name: "Editorial", slug: "editorial", description: "", displayOrder: 3, isVisible: true },
      { id: "featured", name: "Featured", slug: "featured", description: "", displayOrder: 1, isVisible: true }
    ]);

    expect(result.map((category) => category.id)).toEqual(["featured", "editorial"]);
  });

  it("returns portfolio photos for a category in display order and filters non-matching photos", () => {
    const result = getVisiblePortfolioPhotos(
      [
        { ...existing[0], id: "portfolio-late", displayOrder: 3 },
        { ...existing[0], id: "portfolio-other", categoryIds: ["editorial"], displayOrder: 1 },
        { ...existing[0], id: "portfolio-early", displayOrder: 2 }
      ],
      "featured"
    );

    expect(result.map((photo) => photo.id)).toEqual(["portfolio-early", "portfolio-late"]);
  });

  it("promotes an eligible gallery photo into a category", () => {
    const result = promoteGalleryPhoto(existing, galleryPhoto, ["featured"]);

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      sourceGalleryPhotoId: "photo-2",
      previewUrl: "/two.jpg",
      alt: "Two",
      categoryIds: ["featured"],
      displayOrder: 2,
      isFeatured: false
    });
  });

  it("copies category ids when promoting a gallery photo", () => {
    const categoryIds = ["featured"];

    const result = promoteGalleryPhoto(existing, galleryPhoto, categoryIds);
    categoryIds.push("hidden");

    expect(result[1]?.categoryIds).toEqual(["featured"]);
  });

  it("does not promote an ineligible gallery photo", () => {
    const result = promoteGalleryPhoto(existing, { ...galleryPhoto, isPortfolioEligible: false }, ["featured"]);

    expect(result).toEqual(existing);
  });

  it("marks promoted photos as featured for the featured category", () => {
    const result = promoteGalleryPhoto(existing, galleryPhoto, ["cat-featured"]);

    expect(result[1]?.isFeatured).toBe(true);
  });

  it("does not duplicate an already promoted gallery photo", () => {
    const result = promoteGalleryPhoto(existing, { ...galleryPhoto, id: "photo-1" }, ["featured"]);
    expect(result).toEqual(existing);
  });

  it("does not append a promoted photo when the generated portfolio id already exists", () => {
    const currentPhotos: PortfolioPhoto[] = [
      {
        id: "portfolio-photo-2",
        sourceGalleryPhotoId: null,
        previewUrl: "/manual.jpg",
        alt: "Manual",
        categoryIds: ["featured"],
        displayOrder: 1,
        isFeatured: false
      }
    ];

    expect(promoteGalleryPhoto(currentPhotos, galleryPhoto, ["featured"])).toEqual(currentPhotos);
  });
});
