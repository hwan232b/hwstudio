import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
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

  it("promotes a gallery photo through the store reducer", () => {
    render(
      <PrototypeStoreProvider>
        <PromotePhotoProbe />
      </PrototypeStoreProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Promote" }));

    expect(screen.getByText("cat-featured,cat-graduation")).toBeInTheDocument();
  });
});
