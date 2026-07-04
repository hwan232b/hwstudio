import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "HWStudio",
  description: "Clean editorial photography portfolio and client gallery access."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrototypeStoreProvider>{children}</PrototypeStoreProvider>
      </body>
    </html>
  );
}
