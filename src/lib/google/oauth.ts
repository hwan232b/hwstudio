import fs from "fs";
import path from "path";
import { google } from "googleapis";

/**
 * Google OAuth for writing edited photos into YOUR Drive (the service account
 * can't write — it has no storage). You connect your account once; the refresh
 * token is stored locally (.oauth-token.json, gitignored) and used to upload.
 *
 * Scope drive.file = the app can only touch files it creates — it cannot read
 * the rest of your Drive.
 */

const TOKEN_PATH = path.join(process.cwd(), ".oauth-token.json");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.OAUTH_REDIRECT_URI || "http://localhost:3000/api/oauth/callback"
  );
}

export function authUrl(state: string): string {
  return oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

function saveTokens(tokens: Record<string, unknown>) {
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch {
    existing = {};
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify({ ...existing, ...tokens }), { mode: 0o600 });
}

function loadTokens(): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
  } catch {
    return null;
  }
}

export async function exchangeCode(code: string) {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  saveTokens(tokens as Record<string, unknown>);
}

export function isConnected(): boolean {
  const tokens = loadTokens();
  return Boolean(tokens && tokens.refresh_token);
}

export function driveClient() {
  const tokens = loadTokens();
  if (!tokens) {
    throw new Error("Google account not connected.");
  }
  const client = oauthClient();
  client.setCredentials(tokens);
  client.on("tokens", (t) => saveTokens(t as Record<string, unknown>));
  return google.drive({ version: "v3", auth: client });
}
