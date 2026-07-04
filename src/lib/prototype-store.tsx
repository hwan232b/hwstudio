"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { promoteGalleryPhoto } from "./portfolio";
import { moveItemById } from "./reorder";
import { initialState } from "./seed-data";
import type {
  ApprovedEmail,
  ContactInquiry,
  Gallery,
  GalleryPhoto,
  PortfolioCategory,
  PrototypeState
} from "./types";

type PrototypeAction =
  | { type: "gallery:update"; gallery: Gallery }
  | { type: "gallery-photo:add"; photo: GalleryPhoto }
  | { type: "gallery-photo:remove"; photoId: string }
  | { type: "gallery-photo:move"; photoId: string; direction: "up" | "down" }
  | { type: "approved-email:add"; email: ApprovedEmail }
  | { type: "approved-email:remove"; emailId: string }
  | { type: "portfolio:promote-gallery-photo"; photoId: string; categoryIds: string[] }
  | { type: "portfolio-photo:remove"; photoId: string }
  | { type: "portfolio-category:move"; categoryId: string; direction: "up" | "down" }
  | { type: "inquiry:add"; inquiry: ContactInquiry }
  | { type: "hydrate"; state: PrototypeState }
  | { type: "reset" };

const storageKey = "hwstudio-prototype-state";

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
    case "portfolio-photo:remove":
      return {
        ...state,
        portfolioPhotos: state.portfolioPhotos.filter((photo) => photo.id !== action.photoId)
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

function isPrototypeState(value: unknown): value is PrototypeState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Record<keyof PrototypeState, unknown>>;
  return (
    Array.isArray(candidate.galleries) &&
    Array.isArray(candidate.galleryPhotos) &&
    Array.isArray(candidate.approvedEmails) &&
    Array.isArray(candidate.portfolioCategories) &&
    Array.isArray(candidate.portfolioPhotos) &&
    Array.isArray(candidate.contactInquiries)
  );
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
    return isPrototypeState(parsed) ? parsed : null;
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
