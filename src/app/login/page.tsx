"use client";

import Link from "next/link";
import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(
          signInError.message.toLowerCase().includes("confirm")
            ? "Your account isn't confirmed yet. In Supabase → Authentication → Users, confirm it (or re-add with Auto Confirm)."
            : "That email and password don't match. Try again."
        );
        setPending(false);
        return;
      }

      // Full navigation so the server sees the new session cookie immediately.
      const next = new URLSearchParams(window.location.search).get("next") || "/admin";
      window.location.assign(next);
    } catch {
      setError("Couldn't reach the sign-in service — the site is missing its Supabase configuration in the host.");
      setPending(false);
    }
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
