import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import ContactPage from "./page";

describe("ContactPage", () => {
  it("renders the prototype placeholder", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "Contact form is coming soon." })).toBeInTheDocument();
    expect(screen.getByText(/inquiry flow will be built in a later task/i)).toBeInTheDocument();
  });
});
