import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "next/navigation";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import { initialState } from "@/lib/seed-data";
import GalleryPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: vi.fn()
}));

const mockedUseParams = vi.mocked(useParams);

function renderGalleryPage(slug = "spring-graduation-preview") {
  mockedUseParams.mockReturnValue({ slug });

  return render(
    <PrototypeStoreProvider>
      <GalleryPage />
    </PrototypeStoreProvider>
  );
}

describe("GalleryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseParams.mockReset();
  });

  it("shows a private gallery intro before access is granted", () => {
    renderGalleryPage();

    expect(screen.getByRole("heading", { name: "Spring Graduation Preview" })).toBeInTheDocument();
    expect(screen.getByText(/enter your passcode/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Passcode")).toBeInTheDocument();
    expect(screen.getByLabelText("Approved email")).toBeInTheDocument();
  });

  it("opens the gallery with the seeded passcode and approved email", () => {
    renderGalleryPage();

    fireEvent.change(screen.getByLabelText("Passcode"), { target: { value: "hwstudio" } });
    fireEvent.change(screen.getByLabelText("Approved email"), { target: { value: "client@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Open Gallery" }));

    expect(screen.getByRole("link", { name: "Download full gallery" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Graduation portrait session with warm outdoor light" })).toBeInTheDocument();
  });

  it("maps inactive galleries to a clear access error", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        galleries: initialState.galleries.map((gallery) => ({ ...gallery, status: "draft" }))
      })
    );

    renderGalleryPage();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Spring Graduation Preview" })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByLabelText("Passcode"), { target: { value: "hwstudio" } });
    fireEvent.change(screen.getByLabelText("Approved email"), { target: { value: "client@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Open Gallery" }));

    expect(screen.getByText("This gallery is not currently available.")).toBeInTheDocument();
  });

  it("shows an expired message without opening the access form", async () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        galleries: initialState.galleries.map((gallery) => ({ ...gallery, expirationDate: "2020-01-01" }))
      })
    );

    renderGalleryPage();

    await waitFor(() => {
      expect(screen.getByText("This gallery has expired.")).toBeInTheDocument();
    });
    expect(screen.queryByLabelText("Passcode")).not.toBeInTheDocument();
  });

  it("handles unknown gallery slugs", () => {
    renderGalleryPage("missing-gallery");

    expect(screen.getByText("Gallery not found.")).toBeInTheDocument();
  });
});
