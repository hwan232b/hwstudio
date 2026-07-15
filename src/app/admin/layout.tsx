import { redirect } from "next/navigation";
import React from "react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Gate every /admin page here (Node runtime — reliable on Vercel), replacing the
// edge middleware. Unauthenticated visitors are sent to /login.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
