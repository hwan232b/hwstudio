import { redirect } from "next/navigation";
import React from "react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Gate every /admin page here (Node runtime — reliable on Vercel). If the auth
// check can't run (e.g. Supabase env vars missing), fail closed to /login rather
// than throwing a 500. redirect() must stay OUTSIDE the try/catch (it works by
// throwing a control-flow signal that must not be swallowed).
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let signedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    signedIn = Boolean(user);
  } catch {
    signedIn = false;
  }

  if (!signedIn) {
    redirect("/login");
  }

  return <>{children}</>;
}
