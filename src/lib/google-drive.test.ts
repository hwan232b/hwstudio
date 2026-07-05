import { describe, expect, it } from "vitest";
import {
  extractGoogleDriveFileId,
  extractGoogleDriveFolderId,
  getGoogleDrivePreviewUrl,
  isGoogleDriveFolderUrl,
  normalizePhotoUrl
} from "./google-drive";

describe("google-drive helpers", () => {
  it("extracts file IDs from common Google Drive file links", () => {
    expect(extractGoogleDriveFileId("https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing")).toBe(
      "1abcDEFghiJKLmnop"
    );
    expect(extractGoogleDriveFileId("https://drive.google.com/open?id=1abcDEFghiJKLmnop")).toBe(
      "1abcDEFghiJKLmnop"
    );
    expect(extractGoogleDriveFileId("https://drive.google.com/uc?export=view&id=1abcDEFghiJKLmnop")).toBe(
      "1abcDEFghiJKLmnop"
    );
    expect(extractGoogleDriveFileId("https://drive.google.com/thumbnail?id=1abcDEFghiJKLmnop&sz=w1600")).toBe(
      "1abcDEFghiJKLmnop"
    );
  });

  it("does not extract file IDs from non-Drive URLs", () => {
    expect(extractGoogleDriveFileId("https://example.com/photo.jpg")).toBeNull();
    expect(extractGoogleDriveFileId("not a url")).toBeNull();
  });

  it("detects Google Drive folder links", () => {
    expect(extractGoogleDriveFolderId("https://drive.google.com/drive/folders/1folderABCdef?usp=sharing")).toBe(
      "1folderABCdef"
    );
    expect(isGoogleDriveFolderUrl("https://drive.google.com/drive/folders/1folderABCdef?usp=sharing")).toBe(true);
    expect(isGoogleDriveFolderUrl("https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing")).toBe(false);
  });

  it("normalizes Drive file links while preserving direct image URLs", () => {
    expect(normalizePhotoUrl(" https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing ")).toEqual({
      previewUrl: "https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600",
      downloadUrl: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing",
      driveFileId: "1abcDEFghiJKLmnop"
    });
    expect(normalizePhotoUrl("https://example.com/photo.jpg")).toEqual({
      previewUrl: "https://example.com/photo.jpg",
      downloadUrl: "https://example.com/photo.jpg",
      driveFileId: null
    });
  });

  it("builds Drive preview URLs", () => {
    expect(getGoogleDrivePreviewUrl("1abcDEFghiJKLmnop")).toBe(
      "https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600"
    );
  });
});
