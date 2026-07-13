import { NextResponse } from "next/server";
import { listFolderImages } from "@/lib/google/drive-service";
import { createClient } from "@/lib/supabase/server";

/**
 * Lists the images in a Drive folder via the service account. ADMIN ONLY — used
 * for previewing folders in the admin. Public pages read folders server-side and
 * gallery photos are only revealed after passing the passcode check, so this
 * endpoint must not be open to visitors (it would let them enumerate galleries).
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const folderId = new URL(request.url).searchParams.get("folderId")?.trim();
  if (!folderId) {
    return NextResponse.json({ error: "Missing folderId." }, { status: 400 });
  }

  try {
    const photos = await listFolderImages(folderId);
    return NextResponse.json({ photos });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("GOOGLE_SERVICE_ACCOUNT_KEY")
        ? "Google Drive is not configured on the server."
        : "That Drive folder could not be read. Make sure it's shared with the studio service account.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
