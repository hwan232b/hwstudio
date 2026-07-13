import crypto from "crypto";

/**
 * A signed (HMAC) cookie listing the gallery IDs a visitor has unlocked.
 * It's tamper-proof: a visitor can't add gallery IDs they didn't unlock, because
 * they don't have the server secret. The image proxy checks it before serving a
 * gallery's photos.
 */

export const GALLERY_COOKIE = "gallery_access";

function secret(): string {
  return process.env.GALLERY_ACCESS_SECRET || "insecure-dev-secret";
}

export function signAccess(ids: string[]): string {
  const payload = Array.from(new Set(ids)).filter(Boolean).join(",");
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function readAccess(token: string | undefined): string[] {
  if (!token) return [];
  const [encoded, sig] = token.split(".");
  if (!encoded || !sig) return [];
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return [];
  }
  return payload ? payload.split(",") : [];
}
