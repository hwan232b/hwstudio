import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the temporary homepage heading", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: "Editorial photography for milestones, portraits, and gatherings."
      })
    ).toBeInTheDocument();
  });
});
