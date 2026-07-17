import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Guard against values pasted into the host with stray whitespace/newlines or
// wrapping quotes — otherwise the Supabase URL becomes an invalid fetch target.
function clean(value?: string): string {
  return (value ?? "").trim().replace(/^["']+|["']+$/g, "");
}

/**
 * Supabase client for use in Server Components, Route Handlers, and Server Actions.
 * Reads/writes the auth session from cookies so login persists across requests.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    clean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware refreshes the session.
          }
        },
      },
    }
  );
}
