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

    expect(screen.getByRole("status")).toHaveTextContent("Prototype data reset.");
    await waitFor(() => {
      expect(screen.getByText("Spring Graduation Preview")).toBeInTheDocument();
    });
  });

  it("saves homepage copy", async () => {
    renderAdminSettingsPage();

    fireEvent.change(await screen.findByLabelText("Homepage heading"), {
      target: { value: "Modern portraits for real milestones." }
    });
    fireEvent.change(screen.getByLabelText("Homepage intro"), {
      target: { value: "A homepage intro that can be changed from admin." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save homepage copy" }));

    expect(screen.getByRole("status")).toHaveTextContent("Homepage copy saved.");
    expect(screen.getByDisplayValue("Modern portraits for real milestones.")).toBeInTheDocument();
  });

  it("adds and removes homepage photos", async () => {
    renderAdminSettingsPage();

    fireEvent.change(await screen.findByLabelText("Homepage photo URL"), {
      target: { value: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing" }
    });
    fireEvent.change(screen.getByLabelText("Homepage photo alt text optional"), {
      target: { value: "Drive homepage portrait" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add homepage photo" }));

    expect(screen.getByRole("status")).toHaveTextContent("Homepage photo added.");
    expect(screen.getByRole("img", { name: "Drive homepage portrait" })).toHaveAttribute(
      "src",
      "https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600"
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Drive homepage portrait" }));

    expect(screen.getByRole("status")).toHaveTextContent("Homepage photo removed.");
    await waitFor(() => {
      expect(screen.queryByRole("img", { name: "Drive homepage portrait" })).not.toBeInTheDocument();
    });
  });

  it("rejects Google Drive folder links for homepage photos", async () => {
    renderAdminSettingsPage();

    fireEvent.change(await screen.findByLabelText("Homepage photo URL"), {
      target: { value: "https://drive.google.com/drive/folders/1folderId" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add homepage photo" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Folder links cannot preview a single photo yet. Paste an individual Google Drive file link."
    );
  });
});
