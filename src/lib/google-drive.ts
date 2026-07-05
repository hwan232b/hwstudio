export type NormalizedPhotoUrl = {
  previewUrl: string;
  downloadUrl: string;
  driveFileId: string | null;
};

export function extractGoogleDriveFileId(rawUrl: string): string | null {
  const trimmedUrl = rawUrl.trim();

  try {
    const url = new URL(trimmedUrl);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== "drive.google.com" && hostname !== "docs.google.com") {
      return null;
    }

    const pathFileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
    return pathFileId ?? url.searchParams.get("id");
  } catch {
    return null;
  }
}

export function getGoogleDriveThumbnailUrl(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600`;
}

export function normalizePhotoUrl(rawUrl: string): NormalizedPhotoUrl {
  const trimmedUrl = rawUrl.trim();
  const driveFileId = extractGoogleDriveFileId(trimmedUrl);

  if (!driveFileId) {
    return {
      previewUrl: trimmedUrl,
      downloadUrl: trimmedUrl,
      driveFileId: null
    };
  }

  return {
    previewUrl: getGoogleDriveThumbnailUrl(driveFileId),
    downloadUrl: trimmedUrl,
    driveFileId
  };
}
