import type { PrototypeState } from "./types";

export const initialState: PrototypeState = {
  galleries: [
    {
      id: "gallery-spring-grads",
      title: "Spring Graduation Preview",
      slug: "spring-graduation-preview",
      eventDate: "2026-05-18",
      description: "A polished client gallery flow for final edited graduation images.",
      coverPhotoId: "gallery-photo-1",
      isListed: true,
      displayOrder: 1,
      passcode: "hwstudio",
      requiresApprovedEmail: true,
      expirationDate: "2099-12-31",
      driveFolderId: "mock-drive-folder-spring-grads",
      fullDownloadUrl: "https://drive.google.com/",
      status: "active"
    }
  ],
  galleryPhotos: [
    {
      id: "gallery-photo-1",
      galleryId: "gallery-spring-grads",
      driveFileId: "mock-drive-file-1",
      previewUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1800&q=90",
      alt: "Graduation portrait session with warm outdoor light",
      displayOrder: 1,
      isVisible: true,
      isPortfolioEligible: true
    },
    {
      id: "gallery-photo-2",
      galleryId: "gallery-spring-grads",
      driveFileId: "mock-drive-file-2",
      previewUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=90",
      alt: "Group of graduates walking through campus",
      displayOrder: 2,
      isVisible: true,
      isPortfolioEligible: true
    },
    {
      id: "gallery-photo-3",
      galleryId: "gallery-spring-grads",
      driveFileId: "mock-drive-file-3",
      previewUrl: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=1800&q=90",
      alt: "Editorial portrait detail with soft neutral tones",
      displayOrder: 3,
      isVisible: true,
      isPortfolioEligible: true
    }
  ],
  approvedEmails: [
    {
      id: "approved-email-1",
      galleryId: "gallery-spring-grads",
      email: "client@example.com",
      label: "Sample client"
    }
  ],
  homeSettings: {
    eyebrow: "HWStudio",
    heading: "A curated gallery for every milestone.",
    lede: "Clean editorial photography for graduations, portraits, groups, events, and headshots.",
    primaryCtaLabel: "Explore Portfolio",
    primaryCtaHref: "/portfolio",
    secondaryCtaLabel: "Access Your Photos",
    secondaryCtaHref: "/client-access",
    photos: [
      {
        id: "home-photo-1",
        previewUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
        alt: "Graduation portrait session with warm outdoor light",
        displayOrder: 1
      },
      {
        id: "home-photo-2",
        previewUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
        alt: "Group of graduates walking through campus",
        displayOrder: 2
      },
      {
        id: "home-photo-3",
        previewUrl: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=1200&q=80",
        alt: "Editorial portrait detail with soft neutral tones",
        displayOrder: 3
      }
    ]
  },
  portfolioSettings: {
    eyebrow: "Portfolio",
    heading: "Selected work across portraits, events, and graduation stories."
  },
  portfolioCategories: [
    { id: "cat-graduation", name: "Graduation", slug: "graduation", description: "Milestone sessions and campus stories.", displayOrder: 1, isVisible: true },
    { id: "cat-events", name: "Events", slug: "events", description: "Gatherings, ceremonies, and celebrations.", displayOrder: 2, isVisible: true },
    { id: "cat-headshots", name: "Headshots", slug: "headshots", description: "Clean portraits for professional use.", displayOrder: 3, isVisible: true },
    { id: "cat-portraits", name: "Portraits", slug: "portraits", description: "Personal and editorial portrait work.", displayOrder: 4, isVisible: true },
    { id: "cat-groups", name: "Groups", slug: "groups", description: "Friends, teams, and family groupings.", displayOrder: 5, isVisible: true }
  ],
  portfolioPhotos: [
    {
      id: "portfolio-photo-1",
      sourceGalleryPhotoId: "gallery-photo-1",
      previewUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      alt: "Graduation portrait with warm outdoor light",
      categoryIds: ["cat-graduation"],
      displayOrder: 1,
      isFeatured: false
    }
  ],
  contactInquiries: []
};
