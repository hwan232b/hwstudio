import { NextResponse } from "next/server";
import { getDriveFolderFilesUrl, mapDriveFilesToPhotos, type DriveFolderApiFile } from "@/lib/drive-folder";

type DriveFilesResponse = {
  files?: DriveFolderApiFile[];
  error?: {
    message?: string;
  };
};

export async function GET(request: Request) {
  const folderId = new URL(request.url).searchParams.get("folderId")?.trim();
  if (!folderId) {
    return NextResponse.json({ error: "Missing folderId." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_DRIVE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Google Drive API key is not configured." }, { status: 503 });
  }

  const response = await fetch(getDriveFolderFilesUrl(folderId, apiKey));
  const body = (await response.json()) as DriveFilesResponse;

  if (!response.ok) {
    return NextResponse.json(
      { error: body.error?.message ?? "Google Drive folder could not be loaded." },
      { status: response.status }
    );
  }

  return NextResponse.json({ photos: mapDriveFilesToPhotos(body.files ?? []) });
}
