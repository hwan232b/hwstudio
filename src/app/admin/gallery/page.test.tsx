import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import AdminGalleryPage from "./page";

function renderAdminGalleryPage() {
  return render(
    <PrototypeStoreProvider>
      <AdminGalleryPage />
    </PrototypeStoreProvider>
  );
}

describe("AdminGalleryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves gallery details through the prototype store", async () => {
    renderAdminGalleryPage();

    const title = await screen.findByLabelText("Title");
    fireEvent.change(title, { target: { value: "Summer Gallery" } });
    fireEvent.change(screen.getByLabelText("Slug"), { target: { value: "summer-gallery" } });
    fireEvent.click(screen.getByRole("button", { name: "Save gallery" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Gallery saved.");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem("hwstudio-prototype-state") ?? "{}");
      expect(stored.galleries[0]).toMatchObject({
        title: "Summer Gallery",
        slug: "summer-gallery"
      });
    });
  });

  it("adds and removes approved emails", async () => {
    renderAdminGalleryPage();

    await screen.findByText("client@example.com");
    fireEvent.change(screen.getByLabelText("Add approved email"), {
      target: { value: "new-client@example.com" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add email" }));

    expect(await screen.findByText("new-client@example.com")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Email added.");

    const emailRow = screen.getByText("new-client@example.com").closest("li");
    expect(emailRow).not.toBeNull();
    fireEvent.click(within(emailRow as HTMLElement).getByRole("button", { name: "Remove email" }));

    expect(screen.getByRole("status")).toHaveTextContent("Email removed.");
    await waitFor(() => {
      expect(screen.queryByText("new-client@example.com")).not.toBeInTheDocument();
    });
  });

  it("adds and reorders gallery photos", async () => {
    renderAdminGalleryPage();

    fireEvent.change(await screen.findByLabelText("Add photo URL"), {
      target: { value: "https://example.com/new-photo.jpg" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

    const photo = await screen.findByAltText("Gallery photo 4");
    const photoRow = photo.closest("li");
    expect(photoRow).not.toBeNull();

    fireEvent.click(within(photoRow as HTMLElement).getByRole("button", { name: "Move up" }));

    expect(screen.getByRole("status")).toHaveTextContent("Photo moved up.");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem("hwstudio-prototype-state") ?? "{}");
      expect(
        stored.galleryPhotos.find(
          (item: { previewUrl: string }) => item.previewUrl === "https://example.com/new-photo.jpg"
        )
      ).toMatchObject({
        previewUrl: "https://example.com/new-photo.jpg",
        displayOrder: 3
      });
    });
  });

  it("converts Google Drive file links into preview image URLs", async () => {
    renderAdminGalleryPage();

    fireEvent.change(await screen.findByLabelText("Add photo URL"), {
      target: { value: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

    await screen.findByAltText("Gallery photo 4");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem("hwstudio-prototype-state") ?? "{}");
      expect(
        stored.galleryPhotos.find(
          (item: { downloadUrl: string }) =>
            item.downloadUrl === "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing"
        )
      ).toMatchObject({
        previewUrl: "https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600",
        downloadUrl: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing",
        driveFileId: "1abcDEFghiJKLmnop"
      });
    });
  });

  it("rejects Google Drive folder links because they cannot render as a single photo", async () => {
    renderAdminGalleryPage();

    fireEvent.change(await screen.findByLabelText("Add photo URL"), {
      target: { value: "https://drive.google.com/drive/folders/1folderABCdef?usp=sharing" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Folder links cannot preview a single photo yet. Paste an individual Google Drive file link."
    );
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem("hwstudio-prototype-state") ?? "{}");
      expect(
        stored.galleryPhotos.some(
          (item: { downloadUrl: string }) =>
            item.downloadUrl === "https://drive.google.com/drive/folders/1folderABCdef?usp=sharing"
        )
      ).toBe(false);
    });
  });

  it("promotes and removes gallery photos", async () => {
    renderAdminGalleryPage();

    fireEvent.change(await screen.findByLabelText("Add photo URL"), {
      target: { value: "https://example.com/new-photo.jpg" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Add photo" }));

    const photo = await screen.findByAltText("Gallery photo 4");
    expect(screen.getByRole("status")).toHaveTextContent("Photo added.");
    const photoRow = photo.closest("li");
    expect(photoRow).not.toBeNull();

    fireEvent.click(within(photoRow as HTMLElement).getByRole("button", { name: "Promote to featured" }));

    expect(screen.getByRole("status")).toHaveTextContent("Photo promoted to portfolio.");
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem("hwstudio-prototype-state") ?? "{}");
      const promotedSource = stored.galleryPhotos.find(
        (item: { id: string; previewUrl: string }) => item.previewUrl === "https://example.com/new-photo.jpg"
      );
      expect(
        stored.portfolioPhotos.some(
          (item: { sourceGalleryPhotoId: string }) => item.sourceGalleryPhotoId === promotedSource.id
        )
      ).toBe(true);
    });

    fireEvent.click(within(photoRow as HTMLElement).getByRole("button", { name: "Remove photo" }));

    expect(screen.getByRole("status")).toHaveTextContent("Photo removed.");
    await waitFor(() => {
      expect(screen.queryByAltText("Gallery photo 4")).not.toBeInTheDocument();
    });
  });
});
