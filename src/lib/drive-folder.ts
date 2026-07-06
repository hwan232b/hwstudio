import { getGoogleDrivePreviewUrl } from "./google-drive";

export type DriveFolderApiFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
};

export type DriveFolderPhoto = {
  id: string;
  driveFileId: string;
  previewUrl: string;
  downloadUrl: string;
  alt: string;
  displayOrder: number;
  isVisible: true;
  isPortfolioEligible: true;
};

export function getDriveFolderFilesUrl(folderId: string, apiKey: string) {
  const params = new URLSearchParams({
    key: apiKey,
    q: `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: "files(id,name,mimeType,modifiedTime)",
    orderBy: "name",
    pageSize: "1000",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true"
  });

  return `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
}

export function mapDriveFilesToPhotos(files: DriveFolderApiFile[]): DriveFolderPhoto[] {
  return files.map((file, index) => ({
    id: `drive-folder-photo-${file.id}`,
    driveFileId: file.id,
    previewUrl: getGoogleDrivePreviewUrl(file.id),
    downloadUrl: `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`,
    alt: file.name,
    displayOrder: index + 1,
    isVisible: true,
    isPortfolioEligible: true
  }));
}
