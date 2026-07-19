import Link from "next/link";
import React from "react";

const links = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/client-access", label: "Client Access" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="HWStudio home">
        HWStudio
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        <Link href="/login" className="site-nav-login">
          Login
        </Link>
      </nav>
    </header>
  );
}
