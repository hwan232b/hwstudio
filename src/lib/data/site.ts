import { createClient } from "@/lib/supabase/server";
import { listFolderImages, type DrivePhoto } from "@/lib/google/drive-service";
import {
  extractGoogleDriveFileId,
  extractGoogleDriveFolderId,
  isGoogleDriveFolderUrl,
} from "@/lib/google-drive";

/**
 * Server-side reads for public site content. Settings come from Supabase;
 * photos come from the collection's Google Drive folder (Option A).
 */

export type HomeSettings = {
  eyebrow: string;
  heading: string;
  lede: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  driveFolderId: string;
};

const HOME_DEFAULTS: HomeSettings = {
  eyebrow: "HWStudio",
  heading: "A curated gallery for every milestone.",
  lede: "Clean editorial photography for graduations, portraits, groups, events, and headshots.",
  primaryCtaLabel: "Explore Portfolio",
  primaryCtaHref: "/portfolio",
  secondaryCtaLabel: "Access Your Photos",
  secondaryCtaHref: "/client-access",
  driveFolderId: "",
};

export async function getHomeSettings(): Promise<HomeSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("home_settings").select("*").eq("id", "main").maybeSingle();
    if (!data) return HOME_DEFAULTS;
    return {
      eyebrow: data.eyebrow ?? HOME_DEFAULTS.eyebrow,
      heading: data.heading ?? HOME_DEFAULTS.heading,
      lede: data.lede ?? HOME_DEFAULTS.lede,
      primaryCtaLabel: data.primary_cta_label ?? HOME_DEFAULTS.primaryCtaLabel,
      primaryCtaHref: data.primary_cta_href ?? HOME_DEFAULTS.primaryCtaHref,
      secondaryCtaLabel: data.secondary_cta_label ?? HOME_DEFAULTS.secondaryCtaLabel,
      secondaryCtaHref: data.secondary_cta_href ?? HOME_DEFAULTS.secondaryCtaHref,
      driveFolderId: data.drive_folder_id ?? "",
    };
  } catch {
    return HOME_DEFAULTS;
  }
}

export type AboutSettings = { eyebrow: string; heading: string; body: string; driveFolderId: string };

export async function getAboutSettings(): Promise<AboutSettings> {
  const fallback: AboutSettings = {
    eyebrow: "About",
    heading: "Photography with a quiet point of view.",
    body: "",
    driveFolderId: "",
  };
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("about_settings").select("*").eq("id", "main").maybeSingle();
    return {
      eyebrow: data?.eyebrow ?? fallback.eyebrow,
      heading: data?.heading ?? fallback.heading,
      body: data?.body ?? fallback.body,
      driveFolderId: data?.drive_folder_id ?? "",
    };
  } catch {
    return fallback;
  }
}

export type PortfolioSettings = { eyebrow: string; heading: string };

export async function getPortfolioSettings(): Promise<PortfolioSettings> {
  const fallback = { eyebrow: "Portfolio", heading: "Selected work across portraits, events, and graduation stories." };
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("portfolio_settings").select("*").eq("id", "main").maybeSingle();
    return { eyebrow: data?.eyebrow ?? fallback.eyebrow, heading: data?.heading ?? fallback.heading };
  } catch {
    return fallback;
  }
}

export type PortfolioCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isVisible: boolean;
  driveFolderId: string;
};

export async function getPortfolioCategories(): Promise<PortfolioCategory[]> {
  let data: Record<string, unknown>[] | null = null;
  try {
    const supabase = await createClient();
    ({ data } = await supabase.from("portfolio_categories").select("*").order("display_order"));
  } catch {
    return [];
  }
  return (data ?? []).map((c: Record<string, any>) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    displayOrder: c.display_order ?? 1,
    isVisible: c.is_visible ?? true,
    driveFolderId: c.drive_folder_id ?? "",
  }));
}

export type PublicGallery = {
  id: string;
  title: string;
  slug: string;
  eventDate: string | null;
  description: string;
  requiresApprovedEmail: boolean;
  driveFolderId: string;
};

function mapPublicGallery(g: {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  description: string | null;
  requires_approved_email: boolean | null;
  drive_folder_id?: string | null;
}): PublicGallery {
  return {
    id: g.id,
    title: g.title,
    slug: g.slug,
    eventDate: g.event_date,
    description: g.description ?? "",
    requiresApprovedEmail: g.requires_approved_email ?? false,
    driveFolderId: g.drive_folder_id ?? "",
  };
}

/** The public "cover" for a gallery: the first photo in its folder, served as a
 *  public teaser (no unlock needed). Returns null if the folder is empty/unset. */
export async function getGalleryCover(folderId: string): Promise<{ previewUrl: string; alt: string } | null> {
  const photos = await getFolderPhotos(folderId);
  const first = photos[0];
  return first ? { previewUrl: `/api/drive-image?fileId=${first.driveFileId}&w=1000`, alt: first.alt } : null;
}

/** Listed galleries for the client-access directory (no passcode exposed). */
export async function getPublicGalleries(): Promise<PublicGallery[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("public_galleries").select("*").order("display_order");
    return (data ?? []).map(mapPublicGallery);
  } catch {
    return [];
  }
}

export async function getPublicGallery(slug: string): Promise<PublicGallery | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("public_galleries").select("*").eq("slug", slug).maybeSingle();
    return data ? mapPublicGallery(data) : null;
  } catch {
    return null;
  }
}

/**
 * Resolve an About-page portrait from whatever the admin pasted: a single Drive
 * photo link, a Drive folder link (first image used), or a bare id.
 */
export async function getAboutPortrait(raw: string): Promise<{ previewUrl: string; alt: string } | null> {
  const value = (raw || "").trim();
  if (!value) return null;

  const fileId = extractGoogleDriveFileId(value);
  if (fileId) {
    return { previewUrl: `/api/drive-image?fileId=${encodeURIComponent(fileId)}&w=1200`, alt: "Portrait" };
  }

  const folderId = isGoogleDriveFolderUrl(value) ? extractGoogleDriveFolderId(value) ?? value : value;
  return getGalleryCover(folderId);
}

/** List a Drive folder's photos, tolerating an unset/unreadable folder. */
export async function getFolderPhotos(folderId: string): Promise<DrivePhoto[]> {
  if (!folderId?.trim()) return [];
  try {
    return await listFolderImages(folderId.trim());
  } catch {
    return [];
  }
}
