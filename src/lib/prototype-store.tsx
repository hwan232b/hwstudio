"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { normalizePhotoUrl } from "./google-drive";
import { promoteGalleryPhoto } from "./portfolio";
import { moveItemById } from "./reorder";
import { initialState } from "./seed-data";
import type {
  ApprovedEmail,
  ContactInquiry,
  Gallery,
  GalleryPhoto,
  HomePhoto,
  HomeSettings,
  PortfolioPhoto,
  PortfolioCategory,
  PortfolioSettings,
  PrototypeState
} from "./types";

type PrototypeAction =
  | { type: "gallery:update"; gallery: Gallery }
  | { type: "gallery-photo:add"; photo: GalleryPhoto }
  | { type: "gallery-photo:remove"; photoId: string }
  | { type: "gallery-photo:move"; photoId: string; direction: "up" | "down" }
  | { type: "approved-email:add"; email: ApprovedEmail }
  | { type: "approved-email:remove"; emailId: string }
  | { type: "home-settings:update"; settings: HomeSettings }
  | { type: "portfolio:promote-gallery-photo"; photoId: string; categoryIds: string[] }
  | { type: "portfolio-settings:update"; settings: PortfolioSettings }
  | { type: "portfolio-photo:add"; photo: PortfolioPhoto }
  | { type: "portfolio-photo:remove"; photoId: string }
  | { type: "portfolio-category:update"; category: PortfolioCategory }
  | { type: "portfolio-category:move"; categoryId: string; direction: "up" | "down" }
  | { type: "inquiry:add"; inquiry: ContactInquiry }
  | { type: "hydrate"; state: PrototypeState }
  | { type: "reset" };

const storageKey = "hwstudio-prototype-state";
const galleryStatuses = ["active", "draft", "archived"] as const;
const inquiryStatuses = ["new", "reviewed", "archived"] as const;
const retiredPortfolioCategoryIds = ["cat-featured"];

function reducer(state: PrototypeState, action: PrototypeAction): PrototypeState {
  switch (action.type) {
    case "gallery:update":
      return {
        ...state,
        galleries: state.galleries.map((gallery) => (gallery.id === action.gallery.id ? action.gallery : gallery))
      };
    case "gallery-photo:add":
      return {
        ...state,
        galleryPhotos: [...state.galleryPhotos, action.photo]
      };
    case "gallery-photo:remove":
      return {
        ...state,
        galleryPhotos: state.galleryPhotos.filter((photo) => photo.id !== action.photoId),
        portfolioPhotos: state.portfolioPhotos.filter((photo) => photo.sourceGalleryPhotoId !== action.photoId)
      };
    case "gallery-photo:move":
      return {
        ...state,
        galleryPhotos: moveItemById(state.galleryPhotos, action.photoId, action.direction)
      };
    case "approved-email:add":
      return {
        ...state,
        approvedEmails: [...state.approvedEmails, action.email]
      };
    case "approved-email:remove":
      return {
        ...state,
        approvedEmails: state.approvedEmails.filter((email) => email.id !== action.emailId)
      };
    case "home-settings:update":
      return {
        ...state,
        homeSettings: action.settings
      };
    case "portfolio:promote-gallery-photo": {
      const galleryPhoto = state.galleryPhotos.find((photo) => photo.id === action.photoId);
      if (!galleryPhoto) {
        return state;
      }
      return {
        ...state,
        portfolioPhotos: promoteGalleryPhoto(state.portfolioPhotos, galleryPhoto, action.categoryIds)
      };
    }
    case "portfolio-settings:update":
      return {
        ...state,
        portfolioSettings: action.settings
      };
    case "portfolio-photo:add":
      return {
        ...state,
        portfolioPhotos: [...state.portfolioPhotos, action.photo]
      };
    case "portfolio-photo:remove":
      return {
        ...state,
        portfolioPhotos: state.portfolioPhotos.filter((photo) => photo.id !== action.photoId)
      };
    case "portfolio-category:update":
      return {
        ...state,
        portfolioCategories: state.portfolioCategories.map((category) =>
          category.id === action.category.id ? action.category : category
        )
      };
    case "portfolio-category:move":
      return {
        ...state,
        portfolioCategories: moveItemById(
          state.portfolioCategories,
          action.categoryId,
          action.direction
        ) as PortfolioCategory[]
      };
    case "inquiry:add":
      return {
        ...state,
        contactInquiries: [action.inquiry, ...state.contactInquiries]
      };
    case "hydrate":
      return action.state;
    case "reset":
      return initialState;
    default:
      return state;
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function hasStringFields(candidate: UnknownRecord, fields: string[]) {
  return fields.every((field) => isString(candidate[field]));
}

function isGalleryStatus(value: unknown): value is Gallery["status"] {
  return isString(value) && galleryStatuses.includes(value as Gallery["status"]);
}

function isInquiryStatus(value: unknown): value is ContactInquiry["status"] {
  return isString(value) && inquiryStatuses.includes(value as ContactInquiry["status"]);
}

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

function isGallery(value: unknown): value is Gallery {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, [
      "id",
      "title",
      "slug",
      "eventDate",
      "description",
      "coverPhotoId",
      "passcode",
      "driveFolderId",
      "fullDownloadUrl"
    ]) &&
    isBoolean(value.isListed) &&
    isNumber(value.displayOrder) &&
    isBoolean(value.requiresApprovedEmail) &&
    isNullableString(value.expirationDate) &&
    isGalleryStatus(value.status)
  );
}

function isGalleryPhoto(value: unknown): value is GalleryPhoto {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, ["id", "galleryId", "driveFileId", "previewUrl", "downloadUrl", "alt"]) &&
    isNumber(value.displayOrder) &&
    isBoolean(value.isVisible) &&
    isBoolean(value.isPortfolioEligible)
  );
}

function isApprovedEmail(value: unknown): value is ApprovedEmail {
  return isRecord(value) && hasStringFields(value, ["id", "galleryId", "email", "label"]);
}

function isPortfolioCategory(value: unknown): value is PortfolioCategory {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, ["id", "name", "slug", "description"]) &&
    isNumber(value.displayOrder) &&
    isBoolean(value.isVisible)
  );
}

function isPortfolioSettings(value: unknown): value is PortfolioSettings {
  return isRecord(value) && hasStringFields(value, ["eyebrow", "heading"]);
}

function isHomePhoto(value: unknown): value is HomePhoto {
  if (!isRecord(value)) {
    return false;
  }

  return hasStringFields(value, ["id", "previewUrl", "alt"]) && isNumber(value.displayOrder);
}

function isHomeSettings(value: unknown): value is HomeSettings {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, [
      "eyebrow",
      "heading",
      "lede",
      "primaryCtaLabel",
      "primaryCtaHref",
      "secondaryCtaLabel",
      "secondaryCtaHref"
    ]) && isArrayOf(value.photos, isHomePhoto)
  );
}

function isPortfolioPhoto(value: unknown): value is PortfolioPhoto {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, ["id", "previewUrl", "alt"]) &&
    isNullableString(value.sourceGalleryPhotoId) &&
    isStringArray(value.categoryIds) &&
    isNumber(value.displayOrder) &&
    isBoolean(value.isFeatured)
  );
}

function isContactInquiry(value: unknown): value is ContactInquiry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    hasStringFields(value, [
      "id",
      "name",
      "email",
      "message",
      "photographyType",
      "preferredDate",
      "createdAt"
    ]) && isInquiryStatus(value.status)
  );
}

function isPrototypeState(value: unknown): value is PrototypeState {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isArrayOf(value.galleries, isGallery) &&
    isArrayOf(value.galleryPhotos, isGalleryPhoto) &&
    isArrayOf(value.approvedEmails, isApprovedEmail) &&
    isHomeSettings(value.homeSettings) &&
    isPortfolioSettings(value.portfolioSettings) &&
    isArrayOf(value.portfolioCategories, isPortfolioCategory) &&
    isArrayOf(value.portfolioPhotos, isPortfolioPhoto) &&
    isArrayOf(value.contactInquiries, isContactInquiry)
  );
}

function normalizeStoredDrivePreviews(state: PrototypeState): PrototypeState {
  return {
    ...state,
    homeSettings: {
      ...state.homeSettings,
      photos: state.homeSettings.photos.map((photo) => {
        const normalizedPhoto = normalizePhotoUrl(photo.previewUrl);
        if (!normalizedPhoto.driveFileId) {
          return photo;
        }

        return {
          ...photo,
          previewUrl: normalizedPhoto.previewUrl
        };
      })
    },
    galleryPhotos: state.galleryPhotos.map((photo) => {
      const normalizedPhoto = normalizePhotoUrl(photo.downloadUrl);
      if (!normalizedPhoto.driveFileId) {
        return photo;
      }

      return {
        ...photo,
        driveFileId: normalizedPhoto.driveFileId,
        previewUrl: normalizedPhoto.previewUrl,
        downloadUrl: normalizedPhoto.downloadUrl
      };
    })
  };
}

function migrateStoredState(value: unknown): unknown {
  if (!isRecord(value)) {
    return value;
  }

  const valueWithHomeSettings =
    "homeSettings" in value ? value : { ...value, homeSettings: initialState.homeSettings };
  const nextValue =
    "portfolioSettings" in valueWithHomeSettings
      ? valueWithHomeSettings
      : { ...valueWithHomeSettings, portfolioSettings: initialState.portfolioSettings };
  if (!isRecord(nextValue)) {
    return nextValue;
  }

  return {
    ...nextValue,
    portfolioCategories: Array.isArray(nextValue.portfolioCategories)
      ? nextValue.portfolioCategories.filter(
          (category) => !isRecord(category) || !retiredPortfolioCategoryIds.includes(String(category.id))
        )
      : nextValue.portfolioCategories,
    portfolioPhotos: Array.isArray(nextValue.portfolioPhotos)
      ? nextValue.portfolioPhotos.map((photo) => {
          if (!isRecord(photo) || !Array.isArray(photo.categoryIds)) {
            return photo;
          }

          return {
            ...photo,
            categoryIds: photo.categoryIds.filter(
              (categoryId) => typeof categoryId === "string" && !retiredPortfolioCategoryIds.includes(categoryId)
            )
          };
        })
      : nextValue.portfolioPhotos
  };
}

function loadStoredState(): PrototypeState | null {
  if (typeof window === "undefined") {
    return null;
  }

  let stored: string | null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored);
    const migrated = migrateStoredState(parsed);
    return isPrototypeState(migrated) ? normalizeStoredDrivePreviews(migrated) : null;
  } catch {
    return null;
  }
}

const PrototypeStoreContext = createContext<{
  state: PrototypeState;
  dispatch: React.Dispatch<PrototypeAction>;
} | null>(null);

export function PrototypeStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hasLoadedStoredState, setHasLoadedStoredState] = useState(false);

  useEffect(() => {
    const storedState = loadStoredState();
    if (storedState) {
      dispatch({ type: "hydrate", state: storedState });
    }
    setHasLoadedStoredState(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredState) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      return;
    }
  }, [hasLoadedStoredState, state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <PrototypeStoreContext.Provider value={value}>{children}</PrototypeStoreContext.Provider>;
}

export function usePrototypeStore() {
  const context = useContext(PrototypeStoreContext);
  if (!context) {
    throw new Error("usePrototypeStore must be used inside PrototypeStoreProvider");
  }
  return context;
}
