import { describe, expect, it } from "vitest";
import {
  canListGallery,
  isEmailApproved,
  isGalleryExpired,
  validateGalleryAccess
} from "./access";
import type { ApprovedEmail, Gallery } from "./types";

const activeGallery: Gallery = {
  id: "gallery-1",
  title: "Sample Gallery",
  slug: "sample-gallery",
  eventDate: "2026-06-01",
  description: "A test gallery.",
  coverPhotoId: "photo-1",
  isListed: true,
  displayOrder: 1,
  passcode: "milestone",
  requiresApprovedEmail: true,
  expirationDate: "2099-01-01",
  driveFolderId: "drive-folder-1",
  fullDownloadUrl: "https://drive.google.com/example",
  status: "active"
};

const approvedEmails: ApprovedEmail[] = [
  { id: "email-1", galleryId: "gallery-1", email: "client@example.com", label: "Client" }
];

describe("gallery access logic", () => {
  it("lists only galleries marked as listed and active", () => {
    expect(canListGallery(activeGallery)).toBe(true);
    expect(canListGallery({ ...activeGallery, isListed: false })).toBe(false);
    expect(canListGallery({ ...activeGallery, status: "draft" })).toBe(false);
  });

  it("detects expired galleries by date", () => {
    expect(isGalleryExpired({ ...activeGallery, expirationDate: "2026-01-01" }, "2026-07-04")).toBe(true);
    expect(isGalleryExpired(activeGallery, "2026-07-04")).toBe(false);
    expect(isGalleryExpired({ ...activeGallery, expirationDate: null }, "2026-07-04")).toBe(false);
  });

  it("matches approved emails case-insensitively", () => {
    expect(isEmailApproved("CLIENT@example.com", "gallery-1", approvedEmails)).toBe(true);
    expect(isEmailApproved("guest@example.com", "gallery-1", approvedEmails)).toBe(false);
  });

  it("rejects incorrect passcodes", () => {
    const result = validateGalleryAccess({
      gallery: activeGallery,
      approvedEmails,
      passcode: "wrong",
      email: "client@example.com",
      today: "2026-07-04"
    });

    expect(result).toEqual({ ok: false, reason: "incorrect-passcode" });
  });

  it("rejects unapproved emails when email gate is enabled", () => {
    const result = validateGalleryAccess({
      gallery: activeGallery,
      approvedEmails,
      passcode: "milestone",
      email: "guest@example.com",
      today: "2026-07-04"
    });

    expect(result).toEqual({ ok: false, reason: "email-not-approved" });
  });

  it("grants access with correct passcode and approved email", () => {
    const result = validateGalleryAccess({
      gallery: activeGallery,
      approvedEmails,
      passcode: "milestone",
      email: "client@example.com",
      today: "2026-07-04"
    });

    expect(result).toEqual({ ok: true });
  });
});
