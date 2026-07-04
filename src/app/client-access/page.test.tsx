import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import ClientAccessPage from "./page";

describe("ClientAccessPage", () => {
  it("renders the prototype placeholder", () => {
    render(<ClientAccessPage />);

    expect(screen.getByRole("heading", { name: "Client access is coming soon." })).toBeInTheDocument();
    expect(screen.getByText(/private gallery flow will be built in a later task/i)).toBeInTheDocument();
  });
});
