import type { ApprovedEmail, Gallery } from "./types";

export type AccessFailureReason =
  | "gallery-inactive"
  | "expired"
  | "incorrect-passcode"
  | "email-required"
  | "email-not-approved";

export type AccessResult = { ok: true } | { ok: false; reason: AccessFailureReason };

export function canListGallery(gallery: Gallery): boolean {
  return gallery.isListed && gallery.status === "active";
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isGalleryExpired(gallery: Gallery, today = getLocalDateString()): boolean {
  if (!gallery.expirationDate) {
    return false;
  }

  return gallery.expirationDate < today;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailApproved(email: string, galleryId: string, approvedEmails: ApprovedEmail[]): boolean {
  const normalizedEmail = normalizeEmail(email);
  return approvedEmails.some(
    (approvedEmail) =>
      approvedEmail.galleryId === galleryId && normalizeEmail(approvedEmail.email) === normalizedEmail
  );
}

export function validateGalleryAccess({
  gallery,
  approvedEmails,
  passcode,
  email,
  today
}: {
  gallery: Gallery;
  approvedEmails: ApprovedEmail[];
  passcode: string;
  email?: string;
  today?: string;
}): AccessResult {
  if (gallery.status !== "active") {
    return { ok: false, reason: "gallery-inactive" };
  }

  if (isGalleryExpired(gallery, today)) {
    return { ok: false, reason: "expired" };
  }

  if (passcode.trim() !== gallery.passcode) {
    return { ok: false, reason: "incorrect-passcode" };
  }

  if (gallery.requiresApprovedEmail) {
    if (!email || normalizeEmail(email) === "") {
      return { ok: false, reason: "email-required" };
    }

    if (!isEmailApproved(email, gallery.id, approvedEmails)) {
      return { ok: false, reason: "email-not-approved" };
    }
  }

  return { ok: true };
}
