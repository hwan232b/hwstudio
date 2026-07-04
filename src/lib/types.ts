export type GalleryStatus = "active" | "draft" | "archived";

export type Gallery = {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  description: string;
  coverPhotoId: string;
  isListed: boolean;
  displayOrder: number;
  passcode: string;
  requiresApprovedEmail: boolean;
  expirationDate: string | null;
  driveFolderId: string;
  fullDownloadUrl: string;
  status: GalleryStatus;
};

export type GalleryPhoto = {
  id: string;
  galleryId: string;
  driveFileId: string;
  previewUrl: string;
  downloadUrl: string;
  alt: string;
  displayOrder: number;
  isVisible: boolean;
  isPortfolioEligible: boolean;
};

export type ApprovedEmail = {
  id: string;
  galleryId: string;
  email: string;
  label: string;
};

export type PortfolioCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isVisible: boolean;
};

export type PortfolioPhoto = {
  id: string;
  sourceGalleryPhotoId: string | null;
  previewUrl: string;
  alt: string;
  categoryIds: string[];
  displayOrder: number;
  isFeatured: boolean;
};

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  photographyType: string;
  preferredDate: string;
  status: "new" | "reviewed" | "archived";
  createdAt: string;
};

export type PrototypeState = {
  galleries: Gallery[];
  galleryPhotos: GalleryPhoto[];
  approvedEmails: ApprovedEmail[];
  portfolioCategories: PortfolioCategory[];
  portfolioPhotos: PortfolioPhoto[];
  contactInquiries: ContactInquiry[];
};
