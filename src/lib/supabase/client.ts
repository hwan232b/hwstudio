"use client";

import { createBrowserClient } from "@supabase/ssr";

// Guard against values pasted into the host with stray whitespace/newlines (even
// in the middle of the key) or wrapping quotes — otherwise fetch throws "Invalid
// value". The URL and a JWT anon key never contain legitimate whitespace, so it's
// safe to strip all of it.
function clean(value?: string): string {
  return (value ?? "").replace(/\s+/g, "").replace(/^["']+|["']+$/g, "");
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
