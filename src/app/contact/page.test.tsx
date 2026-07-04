import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import ContactPage from "./page";

describe("ContactPage", () => {
  it("renders the prototype placeholder", () => {
    render(<ContactPage />);

    expect(screen.getByRole("heading", { name: "Booking inquiries are almost ready." })).toBeInTheDocument();
    expect(screen.getByText(/session requests and notes will open here soon/i)).toBeInTheDocument();
  });
});
