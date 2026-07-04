import { render, screen, within } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renders the public navigation links", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "HWStudio home" })).toHaveAttribute("href", "/");

    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(within(navigation).getByRole("link", { name: "Portfolio" })).toHaveAttribute("href", "/portfolio");
    expect(within(navigation).getByRole("link", { name: "Client Access" })).toHaveAttribute(
      "href",
      "/client-access"
    );
    expect(within(navigation).getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
    expect(within(navigation).getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });
});
