import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the public homepage shell", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "A curated gallery for every milestone."
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "HWStudio home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Portfolio" })).toBeInTheDocument();
  });
});
