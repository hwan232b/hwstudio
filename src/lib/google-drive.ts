export type NormalizedPhotoUrl = {
  previewUrl: string;
  downloadUrl: string;
  driveFileId: string | null;
};

function parseGoogleDriveUrl(rawUrl: string): URL | null {
  try {
    const url = new URL(rawUrl.trim());
    const hostname = url.hostname.toLowerCase();
    return hostname === "drive.google.com" || hostname === "docs.google.com" ? url : null;
  } catch {
    return null;
  }
}

export function extractGoogleDriveFileId(rawUrl: string): string | null {
  const url = parseGoogleDriveUrl(rawUrl);
  if (!url) {
    return null;
  }

  const pathFileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
  return pathFileId ?? url.searchParams.get("id");
}

export function extractGoogleDriveFolderId(rawUrl: string): string | null {
  const url = parseGoogleDriveUrl(rawUrl);
  if (!url) {
    return null;
  }

  return url.pathname.match(/\/drive\/folders\/([^/]+)/)?.[1] ?? null;
}

export function isGoogleDriveFolderUrl(rawUrl: string): boolean {
  return extractGoogleDriveFolderId(rawUrl) !== null;
}

export function getGoogleDrivePreviewUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=w1600`;
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
    previewUrl: getGoogleDrivePreviewUrl(driveFileId),
    downloadUrl: trimmedUrl,
    driveFileId
  };
}
