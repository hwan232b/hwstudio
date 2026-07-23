import { execFile } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { promisify } from "util";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl } from "@/lib/google-drive";
import { listFolderImages } from "@/lib/google/drive-service";
import { driveClient, isConnected } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

const execFileAsync = promisify(execFile);

// How many before/after pairs to send back for the on-screen overview. The rest
// still land in the Drive folder; we just don't inline hundreds of thumbnails.
const PREVIEW_MAX = 24;

function stem(name: string): string {
  return name.replace(/\.[^.]+$/, "").toLowerCase();
}

function parseFolder(raw: string): string {
  const value = (raw || "").trim();
  return isGoogleDriveFolderUrl(value) ? extractGoogleDriveFolderId(value) ?? value : value;
}

// AI editing runs locally (Python), not on the deployed host, so no long duration needed here.

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  if (!isConnected()) {
    return NextResponse.json({ error: "Connect your Google account first." }, { status: 400 });
  }

  const { beforeFolder, afterFolder } = (await request.json()) as {
    beforeFolder?: string;
    afterFolder?: string;
  };
  const beforeId = parseFolder(beforeFolder ?? "");
  const afterId = parseFolder(afterFolder ?? "");
  if (!beforeId || !afterId) {
    return NextResponse.json({ error: "Paste both the before and after folder links." }, { status: 400 });
  }

  const cmDir =
    process.env.CONSISTENCY_MIRROR_DIR || "/Users/hannahwang/Documents/Photo Site/consistency-mirror";
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "aiedit-"));

  // 1) Run the local Python model: download the before folder + write edited files.
  try {
    await execFileAsync(
      path.join(cmDir, ".venv/bin/python"),
      ["edit_folder.py", "--drive", beforeId, "--out", outDir],
      { cwd: cmDir, maxBuffer: 64 * 1024 * 1024, timeout: 1000 * 60 * 20 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Editing failed. ${String((error as Error).message).slice(0, 300)}` },
      { status: 500 }
    );
  }

  // 2) Upload the edited files into the after folder as you (OAuth).
  const drive = driveClient();
  const files = fs.readdirSync(outDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
  let uploaded = 0;
  for (const name of files) {
    await drive.files.create({
      requestBody: { name, parents: [afterId] },
      media: { mimeType: "image/jpeg", body: fs.createReadStream(path.join(outDir, name)) },
    });
    uploaded += 1;
  }

  // 3) Build a before/after overview: "before" served through the existing proxy
  //    (that folder is shared with the service account), "after" thumbnailed
  //    straight from the freshly-edited files, since they're in your own Drive
  //    and the service account can't read those.
  const beforePhotos = await listFolderImages(beforeId).catch(() => []);
  const beforeByStem = new Map(beforePhotos.map((p) => [p.alt.toLowerCase(), p.driveFileId]));

  const previewNames = [...files].sort((a, b) => a.localeCompare(b)).slice(0, PREVIEW_MAX);
  const previews = [];
  for (const name of previewNames) {
    let after = "";
    try {
      const buf = await sharp(path.join(outDir, name))
        .rotate()
        .resize(640, null, { withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();
      after = `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch {
      // Skip a thumbnail we can't render; the file still uploaded fine.
    }
    const beforeFileId = beforeByStem.get(stem(name));
    previews.push({
      name,
      before: beforeFileId ? `/api/drive-image?fileId=${encodeURIComponent(beforeFileId)}&w=760` : null,
      after,
    });
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  return NextResponse.json({
    ok: true,
    edited: files.length,
    uploaded,
    previews,
    truncated: files.length > PREVIEW_MAX,
  });
}
