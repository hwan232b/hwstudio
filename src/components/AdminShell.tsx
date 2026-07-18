import Link from "next/link";
import React from "react";
import { LogoutButton } from "./LogoutButton";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/ai-edit", label: "AI Edit" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/settings", label: "Settings" }
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="page-shell admin-shell">
      <header className="admin-header">
        <Link className="admin-brand" href="/">
          HWStudio
        </Link>
        <nav className="admin-nav" aria-label="Admin navigation">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <LogoutButton />
        </nav>
      </header>
      <section className="admin-title-block">
        <p className="eyebrow">Admin</p>
        <h1>{title}</h1>
      </section>
      {children}
    </main>
  );
}
