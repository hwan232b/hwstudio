import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

describe("GET /api/drive-folder", () => {
  const originalApiKey = process.env.GOOGLE_DRIVE_API_KEY;

  beforeEach(() => {
    process.env.GOOGLE_DRIVE_API_KEY = "test-api-key";
  });

  afterEach(() => {
    process.env.GOOGLE_DRIVE_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it("returns public Drive folder image files as gallery photos", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        files: [
          {
            id: "drive-file-1",
            name: "01 Portrait.jpg",
            mimeType: "image/jpeg",
            modifiedTime: "2026-07-01T12:00:00.000Z"
          }
        ]
      })
    } as Response);

    const response = await GET(new Request("http://localhost/api/drive-folder?folderId=folder-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("https://www.googleapis.com/drive/v3/files"));
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("key=test-api-key"));
    expect(body.photos).toEqual([
      {
        id: "drive-folder-photo-drive-file-1",
        driveFileId: "drive-file-1",
        previewUrl: "https://lh3.googleusercontent.com/d/drive-file-1=w1600",
        downloadUrl: "https://drive.google.com/file/d/drive-file-1/view",
        alt: "01 Portrait.jpg",
        displayOrder: 1,
        isVisible: true,
        isPortfolioEligible: true
      }
    ]);
  });

  it("returns a setup error when the Drive API key is missing", async () => {
    delete process.env.GOOGLE_DRIVE_API_KEY;

    const response = await GET(new Request("http://localhost/api/drive-folder?folderId=folder-1"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("Google Drive API key is not configured.");
  });
});
