import { NextResponse } from "next/server";
import { isConnected } from "@/lib/google/oauth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }
  return NextResponse.json({ connected: isConnected(), configured: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID) });
}
