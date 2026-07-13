import { google } from "googleapis";

/**
 * Server-side Google Drive access via the service account.
 *
 * Photos live in Drive (not Supabase Storage). The service account can read
 * folders you share with it — WITHOUT the folders being public. Because the
 * files stay private, the browser can't load them directly; the site proxies
 * them through /api/drive-image (see route). This keeps client galleries private.
 */

const IMAGE_MIME_PREFIX = "image/";

type DriveFile = { id: string; name: string; mimeType: string };

export type DrivePhoto = {
  id: string;
  driveFileId: string;
  previewUrl: string;
  downloadUrl: string;
  alt: string;
  displayOrder: number;
  isVisible: true;
  isPortfolioEligible: true;
};

function getDrive() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not configured.");
  }
  const creds = JSON.parse(raw) as { client_email: string; private_key: string };
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
  return google.drive({ version: "v3", auth });
}

/** List every image in a Drive folder, ordered by filename. */
export async function listFolderImages(folderId: string): Promise<DrivePhoto[]> {
  const drive = getDrive();
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
      fields: "nextPageToken, files(id, name, mimeType)",
      orderBy: "name",
      pageSize: 1000,
      pageToken,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });
    for (const f of res.data.files ?? []) {
      if (f.id && f.mimeType?.startsWith(IMAGE_MIME_PREFIX)) {
        files.push({ id: f.id, name: f.name ?? f.id, mimeType: f.mimeType });
      }
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return files.map((file, index) => ({
    id: `drive-${file.id}`,
    driveFileId: file.id,
    // Display gets a resized JPEG; download gets the untouched original.
    previewUrl: `/api/drive-image?fileId=${encodeURIComponent(file.id)}&w=1500`,
    downloadUrl: `/api/drive-image?fileId=${encodeURIComponent(file.id)}&download=1`,
    alt: file.name.replace(/\.[^.]+$/, ""),
    displayOrder: index + 1,
    isVisible: true,
    isPortfolioEligible: true,
  }));
}

/** Fetch a single file's bytes (for the image proxy). */
export async function getFileMedia(fileId: string): Promise<{ data: Buffer; contentType: string; name: string }> {
  const drive = getDrive();
  const meta = await drive.files.get({
    fileId,
    fields: "name, mimeType",
    supportsAllDrives: true,
  });
  const res = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "arraybuffer" }
  );
  return {
    data: Buffer.from(res.data as ArrayBuffer),
    contentType: meta.data.mimeType ?? "image/jpeg",
    name: meta.data.name ?? fileId,
  };
}
