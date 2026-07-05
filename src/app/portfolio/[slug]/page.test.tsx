import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useParams } from "next/navigation";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import PortfolioCategoryPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: vi.fn()
}));

const mockedUseParams = vi.mocked(useParams);

function renderPortfolioCategoryPage(slug = "graduation") {
  mockedUseParams.mockReturnValue({ slug });

  return render(
    <PrototypeStoreProvider>
      <PortfolioCategoryPage />
    </PrototypeStoreProvider>
  );
}

describe("PortfolioCategoryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseParams.mockReset();
  });

  it("renders the selected portfolio category with its photos", () => {
    renderPortfolioCategoryPage();

    expect(screen.getByRole("heading", { name: "Graduation" })).toBeInTheDocument();
    expect(screen.getByText("Milestone sessions and campus stories.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Graduation portrait with warm outdoor light" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to portfolio" })).toHaveAttribute("href", "/portfolio");
  });

  it("handles missing portfolio categories", () => {
    renderPortfolioCategoryPage("missing");

    expect(screen.getByRole("heading", { name: "Portfolio category not found." })).toBeInTheDocument();
  });
});
