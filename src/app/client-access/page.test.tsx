import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import ClientAccessPage from "./page";

describe("ClientAccessPage", () => {
  it("renders the prototype placeholder", () => {
    render(<ClientAccessPage />);

    expect(screen.getByRole("heading", { name: "Private galleries are almost ready." })).toBeInTheDocument();
    expect(screen.getByText(/client previews and downloads will open here soon/i)).toBeInTheDocument();
  });
});
