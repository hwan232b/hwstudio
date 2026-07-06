import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState } from "./seed-data";
import { PrototypeStoreProvider, usePrototypeStore } from "./prototype-store";

function PromotePhotoProbe() {
  const { state, dispatch } = usePrototypeStore();
  const promotedPhoto = state.portfolioPhotos.find((photo) => photo.sourceGalleryPhotoId === "gallery-photo-2");

  return (
    <div>
      <p>{promotedPhoto ? promotedPhoto.categoryIds.join(",") : "not promoted"}</p>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "portfolio:promote-gallery-photo",
            photoId: "gallery-photo-2",
            categoryIds: ["cat-graduation"]
          })
        }
      >
        Promote
      </button>
    </div>
  );
}

describe("PrototypeStoreProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("promotes a gallery photo through the store reducer", () => {
    render(
      <PrototypeStoreProvider>
        <PromotePhotoProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Promote" }));

    expect(screen.getByText("cat-graduation")).toBeInTheDocument();
  });

  it("adds a gallery through the store reducer", () => {
    function AddGalleryProbe() {
      const { state, dispatch } = usePrototypeStore();
      return (
        <div>
          <p>{state.galleries.map((gallery) => gallery.title).join(",")}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "gallery:add",
                gallery: {
                  ...initialState.galleries[0],
                  id: "gallery-new",
                  title: "New Gallery",
                  slug: "new-gallery",
                  displayOrder: 2,
                  coverPhotoId: ""
                }
              })
            }
          >
            Add gallery
          </button>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <AddGalleryProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add gallery" }));

    expect(screen.getByText("Spring Graduation Preview,New Gallery")).toBeInTheDocument();
  });

  it("renders seed state first before hydrating persisted state", () => {
    const renderSnapshots: string[] = [];
    const persistedState = {
      ...initialState,
      contactInquiries: [
        {
          id: "inquiry-persisted",
          name: "Persisted Client",
          email: "persisted@example.com",
          message: "Loaded from storage",
          photographyType: "Portraits",
          preferredDate: "2026-08-01",
          status: "new",
          createdAt: "2026-07-04T12:00:00.000Z"
        }
      ]
    };
    window.localStorage.setItem("hwstudio-prototype-state", JSON.stringify(persistedState));

    function HydrationProbe() {
      const { state } = usePrototypeStore();
      const currentInquiryName = state.contactInquiries[0]?.name ?? "seed";
      renderSnapshots.push(currentInquiryName);
      return <p>{currentInquiryName}</p>;
    }

    render(
      <PrototypeStoreProvider>
        <HydrationProbe />
      </PrototypeStoreProvider>
    );

    expect(renderSnapshots[0]).toBe("seed");
    expect(screen.getByText("Persisted Client")).toBeInTheDocument();
  });

  it("hydrates portfolio settings from persisted state", () => {
    const persistedState = {
      ...initialState,
      portfolioSettings: {
        eyebrow: "Stories",
        heading: "Editorial selections for prospective clients."
      }
    };
    window.localStorage.setItem("hwstudio-prototype-state", JSON.stringify(persistedState));

    function PortfolioSettingsHydrationProbe() {
      const { state } = usePrototypeStore();
      return (
        <div>
          <p>{state.portfolioSettings.eyebrow}</p>
          <p>{state.portfolioSettings.heading}</p>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <PortfolioSettingsHydrationProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("Stories")).toBeInTheDocument();
    expect(screen.getByText("Editorial selections for prospective clients.")).toBeInTheDocument();
  });

  it("migrates older persisted state without portfolio settings while preserving user data", () => {
    const { portfolioSettings: _portfolioSettings, ...olderPersistedState } = {
      ...initialState,
      galleries: [
        {
          ...initialState.galleries[0],
          title: "Persisted Gallery Title"
        },
        ...initialState.galleries.slice(1)
      ]
    };
    window.localStorage.setItem("hwstudio-prototype-state", JSON.stringify(olderPersistedState));

    function PortfolioSettingsMigrationProbe() {
      const { state } = usePrototypeStore();
      return (
        <div>
          <p>{state.galleries[0]?.title}</p>
          <p>{state.portfolioSettings.eyebrow}</p>
          <p>{state.portfolioSettings.heading}</p>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <PortfolioSettingsMigrationProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("Persisted Gallery Title")).toBeInTheDocument();
    expect(screen.getByText(initialState.portfolioSettings.eyebrow)).toBeInTheDocument();
    expect(screen.getByText(initialState.portfolioSettings.heading)).toBeInTheDocument();
  });

  it("migrates older persisted state without homepage settings while preserving user data", () => {
    const { homeSettings: _homeSettings, ...olderPersistedState } = {
      ...initialState,
      galleries: [
        {
          ...initialState.galleries[0],
          title: "Homepage Migration Gallery"
        },
        ...initialState.galleries.slice(1)
      ]
    };
    window.localStorage.setItem("hwstudio-prototype-state", JSON.stringify(olderPersistedState));

    function HomepageSettingsMigrationProbe() {
      const { state } = usePrototypeStore();
      return (
        <div>
          <p>{state.galleries[0]?.title}</p>
          <p>{state.homeSettings.heading}</p>
          <p>{state.homeSettings.photos[0]?.alt}</p>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <HomepageSettingsMigrationProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("Homepage Migration Gallery")).toBeInTheDocument();
    expect(screen.getByText(initialState.homeSettings.heading)).toBeInTheDocument();
    expect(screen.getByText(initialState.homeSettings.photos[0]?.alt ?? "")).toBeInTheDocument();
  });

  it("updates homepage settings through the store", () => {
    function HomepageUpdateProbe() {
      const { state, dispatch } = usePrototypeStore();
      return (
        <div>
          <p>{state.homeSettings.heading}</p>
          <p>{state.homeSettings.photos.map((photo) => photo.alt).join(",")}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "home-settings:update",
                settings: {
                  ...state.homeSettings,
                  heading: "Updated homepage heading",
                  photos: [
                    {
                      id: "home-photo-test",
                      previewUrl: "https://example.com/home-test.jpg",
                      alt: "Updated homepage photo",
                      displayOrder: 1
                    }
                  ]
                }
              })
            }
          >
            Update homepage
          </button>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <HomepageUpdateProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Update homepage" }));

    expect(screen.getByText("Updated homepage heading")).toBeInTheDocument();
    expect(screen.getByText("Updated homepage photo")).toBeInTheDocument();
  });

  it("removes retired featured portfolio category from persisted state", () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        portfolioCategories: [
          { id: "cat-featured", name: "Featured", slug: "featured", description: "Old featured edit.", displayOrder: 1, isVisible: true },
          ...initialState.portfolioCategories
        ],
        portfolioPhotos: [
          {
            ...initialState.portfolioPhotos[0],
            categoryIds: ["cat-featured", "cat-graduation"]
          }
        ]
      })
    );

    function RetiredCategoryProbe() {
      const { state } = usePrototypeStore();
      return (
        <div>
          <p>{state.portfolioCategories.map((category) => category.id).join(",")}</p>
          <p>{state.portfolioPhotos[0]?.categoryIds.join(",")}</p>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <RetiredCategoryProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.queryByText(/cat-featured/)).not.toBeInTheDocument();
    expect(screen.getAllByText("cat-graduation")).toHaveLength(1);
  });

  it("updates portfolio settings and categories through the store", () => {
    function PortfolioUpdateProbe() {
      const { state, dispatch } = usePrototypeStore();
      const category = state.portfolioCategories.find((item) => item.id === "cat-graduation");

      return (
        <div>
          <p>{state.portfolioSettings.eyebrow}</p>
          <p>{state.portfolioSettings.heading}</p>
          <p>{category?.name}</p>
          <p>{category?.description}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "portfolio-settings:update",
                settings: {
                  eyebrow: "Featured work",
                  heading: "A tighter edit for launch."
                }
              })
            }
          >
            Update settings
          </button>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "portfolio-category:update",
                category: {
                  ...initialState.portfolioCategories[0],
                  name: "Senior stories",
                  description: "Graduation sessions with campus context."
                }
              })
            }
          >
            Update category
          </button>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <PortfolioUpdateProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Update settings" }));
    fireEvent.click(screen.getByRole("button", { name: "Update category" }));

    expect(screen.getByText("Featured work")).toBeInTheDocument();
    expect(screen.getByText("A tighter edit for launch.")).toBeInTheDocument();
    expect(screen.getByText("Senior stories")).toBeInTheDocument();
    expect(screen.getByText("Graduation sessions with campus context.")).toBeInTheDocument();
  });

  it("adds a direct portfolio photo through the store", () => {
    function PortfolioPhotoAddProbe() {
      const { state, dispatch } = usePrototypeStore();
      const addedPhoto = state.portfolioPhotos.find((photo) => photo.id === "portfolio-photo-added");

      return (
        <div>
          <p>{addedPhoto ? addedPhoto.alt : "not added"}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "portfolio-photo:add",
                photo: {
                  id: "portfolio-photo-added",
                  sourceGalleryPhotoId: null,
                  previewUrl: "https://example.com/direct.jpg",
                  alt: "Direct portfolio photo",
                  categoryIds: ["cat-graduation"],
                  displayOrder: 2,
                  isFeatured: false
                }
              })
            }
          >
            Add portfolio photo
          </button>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <PortfolioPhotoAddProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add portfolio photo" }));

    expect(screen.getByText("Direct portfolio photo")).toBeInTheDocument();
  });

  it("normalizes persisted Google Drive file previews when hydrating", () => {
    const persistedState = {
      ...initialState,
      galleryPhotos: [
        {
          ...initialState.galleryPhotos[0],
          id: "drive-photo",
          driveFileId: "1abcDEFghiJKLmnop",
          previewUrl: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing",
          downloadUrl: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing"
        }
      ]
    };
    window.localStorage.setItem("hwstudio-prototype-state", JSON.stringify(persistedState));

    function DrivePreviewProbe() {
      const { state } = usePrototypeStore();
      const photo = state.galleryPhotos.find((item) => item.id === "drive-photo");
      return <p>{photo?.previewUrl ?? "missing"}</p>;
    }

    render(
      <PrototypeStoreProvider>
        <DrivePreviewProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600")).toBeInTheDocument();
  });

  it.each([
    ["malformed stored JSON", "{"],
    ["wrong-shaped stored JSON", JSON.stringify({ galleries: [] })]
  ])("falls back to seed state for %s", (_label, storedValue) => {
    window.localStorage.setItem("hwstudio-prototype-state", storedValue);

    function FallbackProbe() {
      const { state } = usePrototypeStore();
      return <p>{state.galleries[0]?.title}</p>;
    }

    render(
      <PrototypeStoreProvider>
        <FallbackProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("Spring Graduation Preview")).toBeInTheDocument();
  });

  it("falls back to seed state when a persisted gallery photo has a non-number display order", () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        galleryPhotos: [{ ...initialState.galleryPhotos[0], displayOrder: "bad" }]
      })
    );

    function GalleryPhotoValidationProbe() {
      const { state } = usePrototypeStore();
      const displayOrder = state.galleryPhotos[0]?.displayOrder;
      return <p>{typeof displayOrder === "number" ? `order:${displayOrder}` : "invalid order"}</p>;
    }

    render(
      <PrototypeStoreProvider>
        <GalleryPhotoValidationProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("order:1")).toBeInTheDocument();
  });

  it("falls back to seed state when a persisted portfolio photo has non-array category ids", () => {
    window.localStorage.setItem(
      "hwstudio-prototype-state",
      JSON.stringify({
        ...initialState,
        portfolioPhotos: [{ ...initialState.portfolioPhotos[0], categoryIds: "bad" }]
      })
    );

    function PortfolioPhotoValidationProbe() {
      const { state } = usePrototypeStore();
      const categoryIds = state.portfolioPhotos[0]?.categoryIds;
      return <p>{Array.isArray(categoryIds) ? categoryIds.join(",") : "invalid category ids"}</p>;
    }

    render(
      <PrototypeStoreProvider>
        <PortfolioPhotoValidationProbe />
      </PrototypeStoreProvider>
    );

    expect(screen.getByText("cat-graduation")).toBeInTheDocument();
  });

  it("removes portfolio photos sourced from a removed gallery photo and can reset the store", () => {
    function PhotoRemovalProbe() {
      const { state, dispatch } = usePrototypeStore();
      const galleryPhotoCount = state.galleryPhotos.length;
      const portfolioPhotoCount = state.portfolioPhotos.length;
      return (
        <div>
          <p>{`gallery:${galleryPhotoCount};portfolio:${portfolioPhotoCount}`}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: "gallery-photo:remove", photoId: "gallery-photo-1" })}
          >
            Remove source photo
          </button>
          <button type="button" onClick={() => dispatch({ type: "reset" })}>
            Reset
          </button>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <PhotoRemovalProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove source photo" }));

    expect(screen.getByText("gallery:2;portfolio:0")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("gallery:3;portfolio:1")).toBeInTheDocument();
  });

  it("does not crash provider updates when storage writes fail", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    function StorageFailureProbe() {
      const { state, dispatch } = usePrototypeStore();
      return (
        <div>
          <p>{state.contactInquiries[0]?.name ?? "none"}</p>
          <button
            type="button"
            onClick={() =>
              dispatch({
                type: "inquiry:add",
                inquiry: {
                  id: "inquiry-new",
                  name: "New Client",
                  email: "new@example.com",
                  message: "Storage writes should not block updates.",
                  photographyType: "Events",
                  preferredDate: "2026-09-01",
                  status: "new",
                  createdAt: "2026-07-04T12:00:00.000Z"
                }
              })
            }
          >
            Add inquiry
          </button>
        </div>
      );
    }

    render(
      <PrototypeStoreProvider>
        <StorageFailureProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Add inquiry" }));

    expect(screen.getByText("New Client")).toBeInTheDocument();
  });
});
