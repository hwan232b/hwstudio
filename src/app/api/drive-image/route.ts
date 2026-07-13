import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getFileMedia } from "@/lib/google/drive-service";
import { GALLERY_COOKIE, readAccess } from "@/lib/gallery-access";

/**
 * Streams a private Drive image to the browser, authenticated as the service
 * account. Keeps the underlying files private (they're never public in Drive).
 * Cached aggressively so repeat views don't re-hit Drive.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const fileId = url.searchParams.get("fileId")?.trim();
  const download = url.searchParams.get("download") === "1";
  const widthParam = url.searchParams.get("w");
  const width = widthParam ? Math.min(Math.max(parseInt(widthParam, 10) || 0, 80), 3000) : 0;
  const galleryId = url.searchParams.get("g");

  if (!fileId) {
    return NextResponse.json({ error: "Missing fileId." }, { status: 400 });
  }

  // Gallery photos require the visitor to have unlocked that gallery.
  if (galleryId) {
    const jar = await cookies();
    const unlocked = readAccess(jar.get(GALLERY_COOKIE)?.value);
    if (!unlocked.includes(galleryId)) {
      return NextResponse.json({ error: "This gallery is locked." }, { status: 403 });
    }
  }

  try {
    const { data, contentType, name } = await getFileMedia(fileId);

    // Downloads get the untouched original; display requests get a resized JPEG.
    let body: Buffer = data;
    let outType = contentType;
    if (!download && width > 0) {
      body = await sharp(data).rotate().resize({ width, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
      outType = "image/jpeg";
    }

    const headers = new Headers({
      "Content-Type": outType,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    });
    if (download) {
      headers.set("Content-Disposition", `attachment; filename="${name}"`);
    }
    return new NextResponse(new Uint8Array(body), { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Image could not be loaded from Drive." }, { status: 502 });
  }
}
