import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import HomePage from "./page";

function renderHomePage() {
  return render(
    <PrototypeStoreProvider>
      <HomePage />
    </PrototypeStoreProvider>
  );
}

describe("HomePage", () => {
  it("renders the public homepage shell", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", {
        name: "A curated gallery for every milestone."
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "HWStudio home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Portfolio" })).toBeInTheDocument();
  });

  it("renders persisted homepage copy and photos", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        homeSettings: {
          eyebrow: "Studio Stories",
          heading: "Personal photography for honest milestones.",
          lede: "A calmer homepage intro saved from the admin area.",
          primaryCtaLabel: "See the Work",
          primaryCtaHref: "/portfolio",
          secondaryCtaLabel: "Open Gallery",
          secondaryCtaHref: "/client-access",
          photos: [
            {
              id: "home-photo-custom",
              previewUrl: "https://example.com/home.jpg",
              alt: "Custom homepage image",
              displayOrder: 1
            }
          ]
        }
      })
    );

    renderHomePage();

    expect(await screen.findByRole("heading", { name: "Personal photography for honest milestones." })).toBeInTheDocument();
    expect(screen.getByText("A calmer homepage intro saved from the admin area.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See the Work" })).toHaveAttribute("href", "/portfolio");
    expect(screen.getByRole("img", { name: "Custom homepage image" })).toHaveAttribute(
      "src",
      "https://example.com/home.jpg"
    );
  });
});
