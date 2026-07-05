import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import type { PrototypeState } from "@/lib/types";
import AdminPortfolioPage from "./page";

const storageKey = "hwstudio-prototype-state";

const portfolioState: PrototypeState = {
  galleries: [],
  galleryPhotos: [],
  approvedEmails: [],
  portfolioCategories: [
    {
      id: "cat-portraits",
      name: "Portraits",
      slug: "portraits",
      description: "Personal and editorial portrait work.",
      displayOrder: 2,
      isVisible: true
    },
    {
      id: "cat-featured",
      name: "Featured",
      slug: "featured",
      description: "A curated first look.",
      displayOrder: 1,
      isVisible: true
    }
  ],
  portfolioSettings: {
    eyebrow: "Portfolio",
    heading: "Selected work across portraits, events, and graduation stories."
  },
  portfolioPhotos: [
    {
      id: "portfolio-photo-portraits",
      sourceGalleryPhotoId: null,
      previewUrl: "https://example.com/portraits.jpg",
      alt: "Editorial portrait in a studio",
      categoryIds: ["cat-portraits"],
      displayOrder: 2,
      isFeatured: false
    },
    {
      id: "portfolio-photo-featured",
      sourceGalleryPhotoId: null,
      previewUrl: "https://example.com/featured.jpg",
      alt: "Graduation portrait with warm light",
      categoryIds: ["cat-featured"],
      displayOrder: 1,
      isFeatured: true
    }
  ],
  contactInquiries: []
};

function renderAdminPortfolioPage(state: PrototypeState = portfolioState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));

  return render(
    <PrototypeStoreProvider>
      <AdminPortfolioPage />
    </PrototypeStoreProvider>
  );
}

describe("AdminPortfolioPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("lists portfolio categories and photos by display order", async () => {
    renderAdminPortfolioPage();

    const categories = await screen.findAllByRole("listitem", { name: /category:/i });
    expect(categories).toHaveLength(2);
    expect(categories[0]).toHaveAccessibleName("Category: Featured");
    expect(categories[1]).toHaveAccessibleName("Category: Portraits");

    const photos = screen.getAllByRole("listitem", { name: /portfolio photo:/i });
    expect(photos).toHaveLength(2);
    expect(photos[0]).toHaveAccessibleName("Portfolio photo: Graduation portrait with warm light");
    expect(photos[1]).toHaveAccessibleName("Portfolio photo: Editorial portrait in a studio");
    expect(within(photos[0]).getByAltText("Graduation portrait with warm light")).toHaveAttribute(
      "src",
      "https://example.com/featured.jpg"
    );
  });

  it("moves portfolio categories through the prototype store", async () => {
    renderAdminPortfolioPage();

    const featuredCategory = await screen.findByRole("listitem", { name: "Category: Featured" });
    fireEvent.click(within(featuredCategory).getByRole("button", { name: "Move Featured down" }));

    expect(screen.getByRole("status")).toHaveTextContent("Portfolio category moved.");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
      expect(stored.portfolioCategories).toEqual([
        expect.objectContaining({ id: "cat-portraits", displayOrder: 1 }),
        expect.objectContaining({ id: "cat-featured", displayOrder: 2 })
      ]);
    });
  });

  it("saves portfolio intro copy and category details", async () => {
    renderAdminPortfolioPage();

    fireEvent.change(await screen.findByLabelText("Portfolio eyebrow"), {
      target: { value: "Featured stories" }
    });
    fireEvent.change(screen.getByLabelText("Portfolio heading"), {
      target: { value: "A refined edit for launch." }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save intro copy" }));

    expect(screen.getByRole("status")).toHaveTextContent("Portfolio intro saved.");

    const featuredCategory = screen.getByRole("listitem", { name: "Category: Featured" });
    fireEvent.change(within(featuredCategory).getByLabelText("Section name"), {
      target: { value: "Featured moments" }
    });
    fireEvent.change(within(featuredCategory).getByLabelText("Section description"), {
      target: { value: "A lead selection of portfolio images." }
    });
    fireEvent.click(within(featuredCategory).getByLabelText("Visible on portfolio"));
    fireEvent.click(within(featuredCategory).getByRole("button", { name: "Save section" }));

    expect(screen.getByRole("status")).toHaveTextContent("Portfolio section saved.");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
      expect(stored.portfolioSettings).toEqual({
        eyebrow: "Featured stories",
        heading: "A refined edit for launch."
      });
      expect(stored.portfolioCategories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "cat-featured",
            name: "Featured moments",
            description: "A lead selection of portfolio images.",
            isVisible: false
          })
        ])
      );
    });
  });

  it("adds Google Drive portfolio photo to a section", async () => {
    renderAdminPortfolioPage();

    const featuredCategory = await screen.findByRole("listitem", { name: "Category: Featured" });
    fireEvent.change(within(featuredCategory).getByLabelText("Photo URL"), {
      target: { value: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing" }
    });
    fireEvent.change(within(featuredCategory).getByLabelText("Alt text"), {
      target: { value: "Featured senior portrait" }
    });
    fireEvent.click(within(featuredCategory).getByRole("button", { name: "Add photo to Featured" }));

    expect(screen.getByRole("status")).toHaveTextContent("Portfolio photo added.");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
      expect(stored.portfolioPhotos).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            previewUrl: "https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600",
            alt: "Featured senior portrait",
            categoryIds: ["cat-featured"],
            displayOrder: 3,
            isFeatured: true
          })
        ])
      );
    });
  });

  it("rejects Google Drive folder links for portfolio photos", async () => {
    renderAdminPortfolioPage();

    const featuredCategory = await screen.findByRole("listitem", { name: "Category: Featured" });
    fireEvent.change(within(featuredCategory).getByLabelText("Photo URL"), {
      target: { value: "https://drive.google.com/drive/folders/1folderId" }
    });
    fireEvent.change(within(featuredCategory).getByLabelText("Alt text"), {
      target: { value: "Folder link" }
    });
    fireEvent.click(within(featuredCategory).getByRole("button", { name: "Add photo to Featured" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Folder links cannot preview a single photo yet. Paste an individual Google Drive file link."
    );
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
      expect(stored.portfolioPhotos).toHaveLength(2);
    });
  });

  it("removes portfolio photos through the prototype store", async () => {
    renderAdminPortfolioPage();

    const featuredPhoto = await screen.findByRole("listitem", {
      name: "Portfolio photo: Graduation portrait with warm light"
    });
    fireEvent.click(within(featuredPhoto).getByRole("button", { name: "Remove Graduation portrait with warm light" }));

    expect(screen.getByRole("status")).toHaveTextContent("Portfolio photo removed.");
    await waitFor(() => {
      expect(screen.queryByAltText("Graduation portrait with warm light")).not.toBeInTheDocument();
      const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
      expect(stored.portfolioPhotos).toEqual([
        expect.objectContaining({ id: "portfolio-photo-portraits", displayOrder: 2 })
      ]);
    });
  });
});
