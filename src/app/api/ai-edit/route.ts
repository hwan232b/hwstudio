import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { extractGoogleDriveFolderId, isGoogleDriveFolderUrl } from "@/lib/google-drive";
import { listFolderImages } from "@/lib/google/drive-service";
import { driveClient, isConnected } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

// How many before/after pairs to send back for the on-screen overview. The rest
// still land in the Drive folder; we just don't inline hundreds of thumbnails.
const PREVIEW_MAX = 24;
const EDIT_TIMEOUT_MS = 1000 * 60 * 20;

type Dials = Record<string, number>;

function stem(name: string): string {
  return name.replace(/\.[^.]+$/, "").toLowerCase();
}

function parseFolder(raw: string): string {
  const value = (raw || "").trim();
  return isGoogleDriveFolderUrl(value) ? extractGoogleDriveFolderId(value) ?? value : value;
}

// Run the local Python editor, streaming its per-photo progress lines out via
// onProgress. Resolves when the folder is fully edited.
function runEditor(
  cmDir: string,
  beforeId: string,
  outDir: string,
  dialsPath: string,
  onProgress: (done: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      path.join(cmDir, ".venv/bin/python"),
      ["edit_folder.py", "--drive", beforeId, "--out", outDir, "--dials-json", dialsPath],
      { cwd: cmDir }
    );
    let buf = "";
    let stderr = "";
    let total = 0;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("Editing timed out after 20 minutes."));
    }, EDIT_TIMEOUT_MS);

    child.stdout.on("data", (chunk: Buffer) => {
      buf += chunk.toString();
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        const editing = line.match(/Editing\s+(\d+)\s+photos/);
        if (editing) total = Number(editing[1]);
        const per = line.match(/\[\s*(\d+)\s*\/\s*(\d+)\s*\]/);
        if (per) onProgress(Number(per[1]), Number(per[2]) || total);
      }
    });
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(stderr.trim().slice(-300) || `Editor exited with code ${code}.`));
    });
  });
}

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

  // Stream newline-delimited JSON events so the page can show live progress.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {
          // Client went away; nothing more to do.
        }
      };

      const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "aiedit-"));
      const dialsPath = path.join(outDir, "_dials.json");
      try {
        // 1) Edit the folder locally, streaming per-photo progress.
        send({ type: "phase", phase: "download" });
        await runEditor(cmDir, beforeId, outDir, dialsPath, (done, total) => {
          send({ type: "progress", stage: "edit", done, total });
        });

        // 2) Upload edited files into the after folder as you (OAuth).
        const drive = driveClient();
        const files = fs.readdirSync(outDir).filter((f) => /\.(jpe?g|png)$/i.test(f));
        send({ type: "phase", phase: "upload", total: files.length });
        let uploaded = 0;
        for (const name of files) {
          await drive.files.create({
            requestBody: { name, parents: [afterId] },
            media: { mimeType: "image/jpeg", body: fs.createReadStream(path.join(outDir, name)) },
          });
          uploaded += 1;
          send({ type: "progress", stage: "upload", done: uploaded, total: files.length });
        }

        // 3) Build the before/after overview + dials.
        const beforePhotos = await listFolderImages(beforeId).catch(() => []);
        const beforeByStem = new Map(beforePhotos.map((p) => [p.alt.toLowerCase(), p.driveFileId]));

        let dialsByStem: Record<string, Dials> = {};
        try {
          const raw = JSON.parse(fs.readFileSync(dialsPath, "utf8")) as Record<string, Dials>;
          dialsByStem = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), v]));
        } catch {
          // Dials are a nice-to-have; the edit still succeeded without them.
        }

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
          const key = stem(name);
          const beforeFileId = beforeByStem.get(key);
          previews.push({
            name,
            before: beforeFileId ? `/api/drive-image?fileId=${encodeURIComponent(beforeFileId)}&w=760` : null,
            after,
            dials: dialsByStem[key] ?? null,
          });
        }

        send({
          type: "done",
          ok: true,
          edited: files.length,
          uploaded,
          previews,
          truncated: files.length > PREVIEW_MAX,
        });
      } catch (error) {
        send({ type: "error", error: String((error as Error).message).slice(0, 300) });
      } finally {
        fs.rmSync(outDir, { recursive: true, force: true });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
