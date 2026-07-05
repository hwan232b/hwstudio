import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { AdminShell } from "./AdminShell";

describe("AdminShell", () => {
  it("renders the admin brand, navigation, title, and children", () => {
    render(
      <AdminShell title="Gallery">
        <p>Editor content</p>
      </AdminShell>
    );

    expect(screen.getByRole("link", { name: "HWStudio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("link", { name: "Gallery" })).toHaveAttribute("href", "/admin/gallery");
    expect(screen.getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", "/admin/portfolio");
    expect(screen.getByRole("link", { name: "Inquiries" })).toHaveAttribute("href", "/admin/inquiries");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute("href", "/admin/settings");
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gallery" })).toBeInTheDocument();
    expect(screen.getByText("Editor content")).toBeInTheDocument();
  });
});
