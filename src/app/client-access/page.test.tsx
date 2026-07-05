import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import ClientAccessPage from "./page";

function renderClientAccessPage() {
  return render(
    <PrototypeStoreProvider>
      <ClientAccessPage />
    </PrototypeStoreProvider>
  );
}

describe("ClientAccessPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the listed client gallery directory", () => {
    renderClientAccessPage();

    expect(screen.getByRole("heading", { name: "Client galleries" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Spring Graduation Preview" })).toBeInTheDocument();
    expect(screen.getByText("May 18, 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Spring Graduation Preview" })).toHaveAttribute(
      "href",
      "/galleries/spring-graduation-preview"
    );
  });

  it("shows a clear message when no galleries are listed", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        galleries: initialState.galleries.map((gallery) => ({ ...gallery, isListed: false }))
      })
    );

    renderClientAccessPage();

    await waitFor(() => {
      expect(screen.getByText("No client galleries are currently listed.")).toBeInTheDocument();
    });
  });
});
