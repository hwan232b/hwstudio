"use client";

import { createBrowserClient } from "@supabase/ssr";

// Guard against values pasted into the host with stray whitespace/newlines or
// wrapping quotes — otherwise the Supabase URL becomes an invalid fetch target.
function clean(value?: string): string {
  return (value ?? "").trim().replace(/^["']+|["']+$/g, "");
}

/**
 * Supabase client for use in Client Components (browser).
 * Uses the public anon key — safe to expose; row-level security enforces access.
 */
export function createClient() {
  return createBrowserClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
