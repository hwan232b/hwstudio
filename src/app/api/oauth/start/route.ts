import { NextResponse } from "next/server";
import { authUrl } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

// Admin starts the "connect my Google account" flow.
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.redirect(authUrl("hwstudio"));
}
