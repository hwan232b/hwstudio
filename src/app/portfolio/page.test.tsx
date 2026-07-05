import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import PortfolioPage from "./page";

function renderPortfolioPage() {
  return render(
    <PrototypeStoreProvider>
      <PortfolioPage />
    </PrototypeStoreProvider>
  );
}

describe("PortfolioPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows visible portfolio categories as cover cards", () => {
    renderPortfolioPage();

    expect(screen.getByRole("heading", { name: "Graduation" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Featured" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open graduation portfolio/i })).toHaveAttribute(
      "href",
      "/portfolio/graduation"
    );
    expect(screen.getByRole("img", { name: "Graduation portrait with warm outdoor light" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Events" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Headshots" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Portraits" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Groups" })).not.toBeInTheDocument();
  });

  it("renders an editorial empty state when no categories have portfolio photos", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        portfolioPhotos: []
      })
    );

    renderPortfolioPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "The portfolio edit is in progress." })).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { name: "Featured" })).not.toBeInTheDocument();
  });

  it("renders persisted portfolio intro copy", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        portfolioSettings: {
          eyebrow: "Selected Work",
          heading: "A softer look at portraits and graduation days."
        }
      })
    );

    renderPortfolioPage();

    await waitFor(() => {
      expect(screen.getByText("Selected Work")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "A softer look at portraits and graduation days." })
      ).toBeInTheDocument();
    });
  });
});
