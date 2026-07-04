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
            categoryIds: ["cat-featured", "cat-graduation"]
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

    expect(screen.getByText("cat-featured,cat-graduation")).toBeInTheDocument();
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
