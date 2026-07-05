import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("submits controlled inquiry values, shows confirmation, and resets fields", () => {
    const handleSubmit = vi.fn();

    render(<ContactForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Hannah Wang" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "hannah@example.com" } });
    fireEvent.change(screen.getByLabelText("Photography type"), { target: { value: "Headshots" } });
    fireEvent.change(screen.getByLabelText("Preferred date"), { target: { value: "2026-09-12" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "I need a polished set of studio portraits." }
    });

    fireEvent.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(handleSubmit).toHaveBeenCalledWith({
      name: "Hannah Wang",
      email: "hannah@example.com",
      photographyType: "Headshots",
      preferredDate: "2026-09-12",
      message: "I need a polished set of studio portraits."
    });
    expect(screen.getByText("Inquiry sent. We will review the details and follow up soon.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Photography type")).toHaveValue("Graduation");
    expect(screen.getByLabelText("Preferred date")).toHaveValue("");
    expect(screen.getByLabelText("Message")).toHaveValue("");
  });

  it("offers the required photography type options", () => {
    render(<ContactForm onSubmit={vi.fn()} />);

    expect(screen.getByRole("option", { name: "Graduation" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Events" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Headshots" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Portraits" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Groups" })).toBeInTheDocument();
  });
});
