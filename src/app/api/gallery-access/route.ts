import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { listFolderImages } from "@/lib/google/drive-service";
import { GALLERY_COOKIE, readAccess, signAccess } from "@/lib/gallery-access";
import { createClient } from "@/lib/supabase/server";

/**
 * Validates a gallery passcode SERVER-SIDE (via the verify_gallery_access DB
 * function — the passcode never leaves the database). On success, returns the
 * gallery's photos and sets a signed cookie unlocking that gallery for the image
 * proxy. On failure, returns 401 with no gallery details.
 */
export async function POST(request: Request) {
  const { slug, passcode, email } = (await request.json()) as {
    slug?: string;
    passcode?: string;
    email?: string;
  };

  if (!slug) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_gallery_access", {
    p_slug: slug,
    p_passcode: passcode ?? "",
    p_email: email ?? "",
  });
  const gallery = Array.isArray(data) ? data[0] : data;

  if (error || !gallery) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let photos: Array<{ id: string; previewUrl: string; downloadUrl: string; alt: string }> = [];
  try {
    const raw = await listFolderImages(gallery.drive_folder_id || "");
    // Tag each proxied URL with the gallery id so the proxy can gate it.
    photos = raw.map((photo) => ({
      id: photo.id,
      alt: photo.alt,
      previewUrl: `${photo.previewUrl}&g=${encodeURIComponent(gallery.id)}`,
      downloadUrl: `${photo.downloadUrl}&g=${encodeURIComponent(gallery.id)}`,
    }));
  } catch {
    photos = [];
  }

  const jar = await cookies();
  const unlocked = readAccess(jar.get(GALLERY_COOKIE)?.value);
  const token = signAccess([...unlocked, gallery.id]);

  const response = NextResponse.json({
    ok: true,
    gallery: {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      eventDate: gallery.event_date,
      fullDownloadUrl: gallery.full_download_url,
    },
    photos,
  });
  response.cookies.set(GALLERY_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}
