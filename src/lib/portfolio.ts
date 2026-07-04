import type { GalleryPhoto, PortfolioCategory, PortfolioPhoto } from "./types";

export function getVisibleCategories(categories: PortfolioCategory[]): PortfolioCategory[] {
  return [...categories]
    .filter((category) => category.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getVisiblePortfolioPhotos(photos: PortfolioPhoto[], categoryId: string): PortfolioPhoto[] {
  return [...photos]
    .filter((photo) => photo.categoryIds.includes(categoryId))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function promoteGalleryPhoto(
  currentPhotos: PortfolioPhoto[],
  galleryPhoto: GalleryPhoto,
  categoryIds: string[]
): PortfolioPhoto[] {
  const alreadyPromoted = currentPhotos.some((photo) => photo.sourceGalleryPhotoId === galleryPhoto.id);

  if (alreadyPromoted || !galleryPhoto.isPortfolioEligible) {
    return currentPhotos;
  }

  const nextDisplayOrder =
    currentPhotos.length === 0 ? 1 : Math.max(...currentPhotos.map((photo) => photo.displayOrder)) + 1;

  return [
    ...currentPhotos,
    {
      id: `portfolio-${galleryPhoto.id}`,
      sourceGalleryPhotoId: galleryPhoto.id,
      previewUrl: galleryPhoto.previewUrl,
      alt: galleryPhoto.alt,
      categoryIds,
      displayOrder: nextDisplayOrder,
      isFeatured: categoryIds.includes("cat-featured")
    }
  ];
}
