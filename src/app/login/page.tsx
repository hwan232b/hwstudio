"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("That email and password don't match. Try again.");
      setPending(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next") || "/admin";
    router.push(next);
    router.refresh();
  }

  return (
    <main className="page-shell login-shell">
      <div className="login-panel">
        <p className="eyebrow">HWStudio</p>
        <h1>Sign in to your studio</h1>
        <p className="lede">Manage galleries, portfolio, and inquiries.</p>
        <form className="access-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="dark-button" type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <Link className="login-back" href="/">
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
