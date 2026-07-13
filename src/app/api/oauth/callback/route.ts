import { NextResponse } from "next/server";
import { exchangeCode } from "@/lib/google/oauth";

// Google redirects here after you approve access.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/admin/ai-edit?connected=0", url.origin));
  }
  try {
    await exchangeCode(code);
    return NextResponse.redirect(new URL("/admin/ai-edit?connected=1", url.origin));
  } catch {
    return NextResponse.redirect(new URL("/admin/ai-edit?connected=0", url.origin));
  }
}
