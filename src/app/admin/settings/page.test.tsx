import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import AdminSettingsPage from "./page";

function renderAdminSettingsPage() {
  return render(
    <PrototypeStoreProvider>
      <AdminSettingsPage />
    </PrototypeStoreProvider>
  );
}

describe("AdminSettingsPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("resets prototype state", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        galleries: [{ ...initialState.galleries[0], title: "Changed Gallery" }]
      })
    );

    renderAdminSettingsPage();

    await screen.findByText("Changed Gallery");
    fireEvent.click(screen.getByRole("button", { name: "Reset prototype data" }));

    await waitFor(() => {
      expect(screen.getByText("Spring Graduation Preview")).toBeInTheDocument();
    });
  });
});
