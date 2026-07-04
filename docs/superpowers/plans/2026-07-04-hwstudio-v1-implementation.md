# HWStudio V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js prototype for HWStudio with an editorial public portfolio, one-card client gallery directory, protected gallery access, and desktop-first admin management.

**Architecture:** Use a Next.js App Router project with TypeScript, CSS modules/global tokens, local mock data shaped like future Supabase/Google Drive records, and a client-side prototype store persisted to `localStorage`. Keep domain logic in plain TypeScript modules so Supabase and Google Drive can replace the mock layer later.

**Tech Stack:** Next.js, React, TypeScript, Vitest, React Testing Library, jsdom, plain CSS.

---

## File Structure

Create these files during implementation:

- `package.json` - scripts and dependencies.
- `next.config.mjs` - Next.js configuration.
- `tsconfig.json` - TypeScript configuration.
- `vitest.config.ts` - unit/component test configuration.
- `src/test/setup.ts` - React Testing Library matcher setup.
- `src/app/layout.tsx` - root layout and metadata.
- `src/app/page.tsx` - image-led mosaic homepage.
- `src/app/portfolio/page.tsx` - public portfolio category browser.
- `src/app/client-access/page.tsx` - one-card gallery directory.
- `src/app/galleries/[slug]/page.tsx` - protected gallery access and viewer.
- `src/app/about/page.tsx` - simple brand/about page.
- `src/app/contact/page.tsx` - contact/inquiry form.
- `src/app/admin/page.tsx` - admin dashboard.
- `src/app/admin/gallery/page.tsx` - single gallery management.
- `src/app/admin/portfolio/page.tsx` - portfolio management.
- `src/app/admin/inquiries/page.tsx` - inquiry review.
- `src/app/admin/settings/page.tsx` - prototype settings.
- `src/app/globals.css` - global visual system and reusable layout classes.
- `src/components/SiteHeader.tsx` - public navigation.
- `src/components/AdminShell.tsx` - admin navigation shell.
- `src/components/PhotoGrid.tsx` - reusable responsive image grid.
- `src/components/GalleryAccessForm.tsx` - passcode/email access form.
- `src/components/GalleryViewer.tsx` - gallery grid, detail view, downloads.
- `src/components/ContactForm.tsx` - local inquiry form.
- `src/lib/types.ts` - domain types.
- `src/lib/seed-data.ts` - one gallery, photos, categories, and sample inquiries.
- `src/lib/access.ts` - passcode, email, expiration, and listing checks.
- `src/lib/prototype-store.tsx` - React reducer/context plus `localStorage` persistence.
- `src/lib/portfolio.ts` - portfolio helper functions.
- `src/lib/reorder.ts` - deterministic reorder helpers.
- `src/lib/access.test.ts` - access logic tests.
- `src/lib/reorder.test.ts` - reorder helper tests.
- `src/lib/portfolio.test.ts` - portfolio helper tests.
- `src/components/GalleryAccessForm.test.tsx` - access form component tests.
- `src/components/ContactForm.test.tsx` - contact form component tests.

Do not commit `.superpowers/`, `.next/`, `node_modules/`, coverage output, or `.env` files.

---

### Task 1: Scaffold The Next.js Prototype

**Files:**
- Create: `package.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "hwstudio",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
```

- [ ] **Step 2: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" }
    ]
  }
};

export default nextConfig;
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

- [ ] **Step 5: Create test setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Create the root layout**

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HWStudio",
  description: "Clean editorial photography portfolio and client gallery access."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create temporary homepage**

Create `src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <main className="page-shell">
      <p className="eyebrow">HWStudio</p>
      <h1>Editorial photography for milestones, portraits, and gatherings.</h1>
      <p className="lede">
        A local prototype for the public portfolio and protected client gallery experience.
      </p>
    </main>
  );
}
```

- [ ] **Step 8: Create global CSS foundation**

Create `src/app/globals.css`:

```css
:root {
  --color-ink: #151515;
  --color-muted: #66615b;
  --color-paper: #f7f3ec;
  --color-surface: #fffdf9;
  --color-line: #d8d0c4;
  --color-accent: #3e5546;
  --color-warm: #b8a28a;
  --font-display: Georgia, "Times New Roman", serif;
  --font-body: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-body);
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

.page-shell {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 40px 0 72px;
}

.eyebrow {
  margin: 0 0 16px;
  font-size: 0.76rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-muted);
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  font-weight: 500;
  letter-spacing: 0;
}

h1 {
  max-width: 860px;
  margin: 0;
  font-size: clamp(2.6rem, 7vw, 6.5rem);
  line-height: 0.96;
}

.lede {
  max-width: 680px;
  margin: 24px 0 0;
  color: var(--color-muted);
  font-size: 1.1rem;
  line-height: 1.7;
}
```

- [ ] **Step 9: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and dependencies install without errors.

- [ ] **Step 10: Verify the scaffold builds**

Run: `npm run build`

Expected: Next.js completes a production build and reports no TypeScript errors.

- [ ] **Step 11: Commit scaffold**

```bash
git add package.json package-lock.json next.config.mjs tsconfig.json vitest.config.ts src/test/setup.ts src/app/layout.tsx src/app/page.tsx src/app/globals.css
git commit -m "feat: scaffold HWStudio prototype"
```

---

### Task 2: Add Domain Types, Seed Data, And Access Logic

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/seed-data.ts`
- Create: `src/lib/access.ts`
- Create: `src/lib/access.test.ts`

- [ ] **Step 1: Write access logic tests**

Create `src/lib/access.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  canListGallery,
  isEmailApproved,
  isGalleryExpired,
  validateGalleryAccess
} from "./access";
import type { ApprovedEmail, Gallery } from "./types";

const activeGallery: Gallery = {
  id: "gallery-1",
  title: "Sample Gallery",
  slug: "sample-gallery",
  eventDate: "2026-06-01",
  description: "A test gallery.",
  coverPhotoId: "photo-1",
  isListed: true,
  displayOrder: 1,
  passcode: "milestone",
  requiresApprovedEmail: true,
  expirationDate: "2099-01-01",
  driveFolderId: "drive-folder-1",
  fullDownloadUrl: "https://drive.google.com/example",
  status: "active"
};

const approvedEmails: ApprovedEmail[] = [
  { id: "email-1", galleryId: "gallery-1", email: "client@example.com", label: "Client" }
];

describe("gallery access logic", () => {
  it("lists only galleries marked as listed", () => {
    expect(canListGallery(activeGallery)).toBe(true);
    expect(canListGallery({ ...activeGallery, isListed: false })).toBe(false);
  });

  it("detects expired galleries by date", () => {
    expect(isGalleryExpired({ ...activeGallery, expirationDate: "2026-01-01" }, "2026-07-04")).toBe(true);
    expect(isGalleryExpired(activeGallery, "2026-07-04")).toBe(false);
    expect(isGalleryExpired({ ...activeGallery, expirationDate: null }, "2026-07-04")).toBe(false);
  });

  it("matches approved emails case-insensitively", () => {
    expect(isEmailApproved("CLIENT@example.com", "gallery-1", approvedEmails)).toBe(true);
    expect(isEmailApproved("guest@example.com", "gallery-1", approvedEmails)).toBe(false);
  });

  it("rejects incorrect passcodes", () => {
    const result = validateGalleryAccess({
      gallery: activeGallery,
      approvedEmails,
      passcode: "wrong",
      email: "client@example.com",
      today: "2026-07-04"
    });

    expect(result).toEqual({ ok: false, reason: "incorrect-passcode" });
  });

  it("rejects unapproved emails when email gate is enabled", () => {
    const result = validateGalleryAccess({
      gallery: activeGallery,
      approvedEmails,
      passcode: "milestone",
      email: "guest@example.com",
      today: "2026-07-04"
    });

    expect(result).toEqual({ ok: false, reason: "email-not-approved" });
  });

  it("grants access with correct passcode and approved email", () => {
    const result = validateGalleryAccess({
      gallery: activeGallery,
      approvedEmails,
      passcode: "milestone",
      email: "client@example.com",
      today: "2026-07-04"
    });

    expect(result).toEqual({ ok: true });
  });
});
```

- [ ] **Step 2: Run access tests and confirm failure**

Run: `npm test -- src/lib/access.test.ts`

Expected: FAIL because `src/lib/access.ts` and `src/lib/types.ts` do not exist yet.

- [ ] **Step 3: Create domain types**

Create `src/lib/types.ts`:

```ts
export type GalleryStatus = "active" | "draft" | "archived";

export type Gallery = {
  id: string;
  title: string;
  slug: string;
  eventDate: string;
  description: string;
  coverPhotoId: string;
  isListed: boolean;
  displayOrder: number;
  passcode: string;
  requiresApprovedEmail: boolean;
  expirationDate: string | null;
  driveFolderId: string;
  fullDownloadUrl: string;
  status: GalleryStatus;
};

export type GalleryPhoto = {
  id: string;
  galleryId: string;
  driveFileId: string;
  previewUrl: string;
  downloadUrl: string;
  alt: string;
  displayOrder: number;
  isVisible: boolean;
  isPortfolioEligible: boolean;
};

export type ApprovedEmail = {
  id: string;
  galleryId: string;
  email: string;
  label: string;
};

export type PortfolioCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isVisible: boolean;
};

export type PortfolioPhoto = {
  id: string;
  sourceGalleryPhotoId: string | null;
  previewUrl: string;
  alt: string;
  categoryIds: string[];
  displayOrder: number;
  isFeatured: boolean;
};

export type ContactInquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  photographyType: string;
  preferredDate: string;
  status: "new" | "reviewed" | "archived";
  createdAt: string;
};

export type PrototypeState = {
  galleries: Gallery[];
  galleryPhotos: GalleryPhoto[];
  approvedEmails: ApprovedEmail[];
  portfolioCategories: PortfolioCategory[];
  portfolioPhotos: PortfolioPhoto[];
  contactInquiries: ContactInquiry[];
};
```

- [ ] **Step 4: Create access logic**

Create `src/lib/access.ts`:

```ts
import type { ApprovedEmail, Gallery } from "./types";

export type AccessFailureReason =
  | "expired"
  | "incorrect-passcode"
  | "email-required"
  | "email-not-approved";

export type AccessResult = { ok: true } | { ok: false; reason: AccessFailureReason };

export function canListGallery(gallery: Gallery): boolean {
  return gallery.isListed && gallery.status === "active";
}

export function isGalleryExpired(gallery: Gallery, today = new Date().toISOString().slice(0, 10)): boolean {
  if (!gallery.expirationDate) {
    return false;
  }

  return gallery.expirationDate < today;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailApproved(email: string, galleryId: string, approvedEmails: ApprovedEmail[]): boolean {
  const normalizedEmail = normalizeEmail(email);
  return approvedEmails.some(
    (approvedEmail) =>
      approvedEmail.galleryId === galleryId && normalizeEmail(approvedEmail.email) === normalizedEmail
  );
}

export function validateGalleryAccess({
  gallery,
  approvedEmails,
  passcode,
  email,
  today
}: {
  gallery: Gallery;
  approvedEmails: ApprovedEmail[];
  passcode: string;
  email?: string;
  today?: string;
}): AccessResult {
  if (isGalleryExpired(gallery, today)) {
    return { ok: false, reason: "expired" };
  }

  if (passcode.trim() !== gallery.passcode) {
    return { ok: false, reason: "incorrect-passcode" };
  }

  if (gallery.requiresApprovedEmail) {
    if (!email || normalizeEmail(email) === "") {
      return { ok: false, reason: "email-required" };
    }

    if (!isEmailApproved(email, gallery.id, approvedEmails)) {
      return { ok: false, reason: "email-not-approved" };
    }
  }

  return { ok: true };
}
```

- [ ] **Step 5: Create seed data**

Create `src/lib/seed-data.ts`:

```ts
import type { PrototypeState } from "./types";

export const initialState: PrototypeState = {
  galleries: [
    {
      id: "gallery-spring-grads",
      title: "Spring Graduation Preview",
      slug: "spring-graduation-preview",
      eventDate: "2026-05-18",
      description: "A polished client gallery flow for final edited graduation images.",
      coverPhotoId: "gallery-photo-1",
      isListed: true,
      displayOrder: 1,
      passcode: "hwstudio",
      requiresApprovedEmail: true,
      expirationDate: "2099-12-31",
      driveFolderId: "mock-drive-folder-spring-grads",
      fullDownloadUrl: "https://drive.google.com/",
      status: "active"
    }
  ],
  galleryPhotos: [
    {
      id: "gallery-photo-1",
      galleryId: "gallery-spring-grads",
      driveFileId: "mock-drive-file-1",
      previewUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1800&q=90",
      alt: "Graduation portrait session with warm outdoor light",
      displayOrder: 1,
      isVisible: true,
      isPortfolioEligible: true
    },
    {
      id: "gallery-photo-2",
      galleryId: "gallery-spring-grads",
      driveFileId: "mock-drive-file-2",
      previewUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=90",
      alt: "Group of graduates walking through campus",
      displayOrder: 2,
      isVisible: true,
      isPortfolioEligible: true
    },
    {
      id: "gallery-photo-3",
      galleryId: "gallery-spring-grads",
      driveFileId: "mock-drive-file-3",
      previewUrl: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=1200&q=80",
      downloadUrl: "https://images.unsplash.com/photo-1496317899792-9d7dbcd928a1?auto=format&fit=crop&w=1800&q=90",
      alt: "Editorial portrait detail with soft neutral tones",
      displayOrder: 3,
      isVisible: true,
      isPortfolioEligible: true
    }
  ],
  approvedEmails: [
    {
      id: "approved-email-1",
      galleryId: "gallery-spring-grads",
      email: "client@example.com",
      label: "Sample client"
    }
  ],
  portfolioCategories: [
    { id: "cat-featured", name: "Featured", slug: "featured", description: "A curated first look.", displayOrder: 1, isVisible: true },
    { id: "cat-graduation", name: "Graduation", slug: "graduation", description: "Milestone sessions and campus stories.", displayOrder: 2, isVisible: true },
    { id: "cat-events", name: "Events", slug: "events", description: "Gatherings, ceremonies, and celebrations.", displayOrder: 3, isVisible: true },
    { id: "cat-headshots", name: "Headshots", slug: "headshots", description: "Clean portraits for professional use.", displayOrder: 4, isVisible: true },
    { id: "cat-portraits", name: "Portraits", slug: "portraits", description: "Personal and editorial portrait work.", displayOrder: 5, isVisible: true },
    { id: "cat-groups", name: "Groups", slug: "groups", description: "Friends, teams, and family groupings.", displayOrder: 6, isVisible: true }
  ],
  portfolioPhotos: [
    {
      id: "portfolio-photo-1",
      sourceGalleryPhotoId: "gallery-photo-1",
      previewUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
      alt: "Featured graduation portrait",
      categoryIds: ["cat-featured", "cat-graduation"],
      displayOrder: 1,
      isFeatured: true
    }
  ],
  contactInquiries: []
};
```

- [ ] **Step 6: Run access tests and confirm pass**

Run: `npm test -- src/lib/access.test.ts`

Expected: all tests in `src/lib/access.test.ts` pass.

- [ ] **Step 7: Commit domain foundation**

```bash
git add src/lib/types.ts src/lib/seed-data.ts src/lib/access.ts src/lib/access.test.ts
git commit -m "feat: add prototype domain data and access rules"
```

---

### Task 3: Add Reorder And Portfolio Helpers

**Files:**
- Create: `src/lib/reorder.ts`
- Create: `src/lib/reorder.test.ts`
- Create: `src/lib/portfolio.ts`
- Create: `src/lib/portfolio.test.ts`

- [ ] **Step 1: Write reorder helper tests**

Create `src/lib/reorder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { moveItemById, normalizeDisplayOrder } from "./reorder";

type Item = { id: string; displayOrder: number; label: string };

describe("reorder helpers", () => {
  it("moves an item up and normalizes display order", () => {
    const items: Item[] = [
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" },
      { id: "c", displayOrder: 3, label: "C" }
    ];

    expect(moveItemById(items, "c", "up")).toEqual([
      { id: "a", displayOrder: 1, label: "A" },
      { id: "c", displayOrder: 2, label: "C" },
      { id: "b", displayOrder: 3, label: "B" }
    ]);
  });

  it("moves an item down and keeps boundary moves stable", () => {
    const items: Item[] = [
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ];

    expect(moveItemById(items, "a", "down")).toEqual([
      { id: "b", displayOrder: 1, label: "B" },
      { id: "a", displayOrder: 2, label: "A" }
    ]);
    expect(moveItemById(items, "a", "up")).toEqual(items);
  });

  it("normalizes arbitrary display order values", () => {
    const items: Item[] = [
      { id: "b", displayOrder: 20, label: "B" },
      { id: "a", displayOrder: 10, label: "A" }
    ];

    expect(normalizeDisplayOrder(items)).toEqual([
      { id: "a", displayOrder: 1, label: "A" },
      { id: "b", displayOrder: 2, label: "B" }
    ]);
  });
});
```

- [ ] **Step 2: Write portfolio helper tests**

Create `src/lib/portfolio.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getVisibleCategories, getVisiblePortfolioPhotos, promoteGalleryPhoto } from "./portfolio";
import type { GalleryPhoto, PortfolioCategory, PortfolioPhoto } from "./types";

const categories: PortfolioCategory[] = [
  { id: "hidden", name: "Hidden", slug: "hidden", description: "", displayOrder: 2, isVisible: false },
  { id: "featured", name: "Featured", slug: "featured", description: "", displayOrder: 1, isVisible: true }
];

const existing: PortfolioPhoto[] = [
  {
    id: "portfolio-1",
    sourceGalleryPhotoId: "photo-1",
    previewUrl: "/one.jpg",
    alt: "One",
    categoryIds: ["featured"],
    displayOrder: 1,
    isFeatured: true
  }
];

const galleryPhoto: GalleryPhoto = {
  id: "photo-2",
  galleryId: "gallery-1",
  driveFileId: "drive-2",
  previewUrl: "/two.jpg",
  downloadUrl: "/two-download.jpg",
  alt: "Two",
  displayOrder: 2,
  isVisible: true,
  isPortfolioEligible: true
};

describe("portfolio helpers", () => {
  it("returns visible categories in display order", () => {
    expect(getVisibleCategories(categories).map((category) => category.id)).toEqual(["featured"]);
  });

  it("returns visible portfolio photos for a category", () => {
    expect(getVisiblePortfolioPhotos(existing, "featured").map((photo) => photo.id)).toEqual(["portfolio-1"]);
  });

  it("promotes an eligible gallery photo into a category", () => {
    const result = promoteGalleryPhoto(existing, galleryPhoto, ["featured"]);

    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({
      sourceGalleryPhotoId: "photo-2",
      previewUrl: "/two.jpg",
      alt: "Two",
      categoryIds: ["featured"],
      displayOrder: 2
    });
  });

  it("does not duplicate an already promoted gallery photo", () => {
    const result = promoteGalleryPhoto(existing, { ...galleryPhoto, id: "photo-1" }, ["featured"]);
    expect(result).toEqual(existing);
  });
});
```

- [ ] **Step 3: Run helper tests and confirm failure**

Run: `npm test -- src/lib/reorder.test.ts src/lib/portfolio.test.ts`

Expected: FAIL because helper modules do not exist yet.

- [ ] **Step 4: Create reorder helpers**

Create `src/lib/reorder.ts`:

```ts
export type OrderedItem = {
  id: string;
  displayOrder: number;
};

export function normalizeDisplayOrder<T extends OrderedItem>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item, index) => ({ ...item, displayOrder: index + 1 }));
}

export function moveItemById<T extends OrderedItem>(items: T[], itemId: string, direction: "up" | "down"): T[] {
  const ordered = normalizeDisplayOrder(items);
  const currentIndex = ordered.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    return ordered;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= ordered.length) {
    return ordered;
  }

  const next = [...ordered];
  const [item] = next.splice(currentIndex, 1);
  next.splice(targetIndex, 0, item);
  return next.map((nextItem, index) => ({ ...nextItem, displayOrder: index + 1 }));
}
```

- [ ] **Step 5: Create portfolio helpers**

Create `src/lib/portfolio.ts`:

```ts
import type { GalleryPhoto, PortfolioCategory, PortfolioPhoto } from "./types";

export function getVisibleCategories(categories: PortfolioCategory[]): PortfolioCategory[] {
  return [...categories]
    .filter((category) => category.isVisible)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getVisiblePortfolioPhotos(photos: PortfolioPhoto[], categoryId: string): PortfolioPhoto[] {
  return [...photos]
    .filter((photo) => photo.categoryIds.includes(categoryId))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function promoteGalleryPhoto(
  currentPhotos: PortfolioPhoto[],
  galleryPhoto: GalleryPhoto,
  categoryIds: string[]
): PortfolioPhoto[] {
  const alreadyPromoted = currentPhotos.some((photo) => photo.sourceGalleryPhotoId === galleryPhoto.id);

  if (alreadyPromoted || !galleryPhoto.isPortfolioEligible) {
    return currentPhotos;
  }

  const nextDisplayOrder =
    currentPhotos.length === 0 ? 1 : Math.max(...currentPhotos.map((photo) => photo.displayOrder)) + 1;

  return [
    ...currentPhotos,
    {
      id: `portfolio-${galleryPhoto.id}`,
      sourceGalleryPhotoId: galleryPhoto.id,
      previewUrl: galleryPhoto.previewUrl,
      alt: galleryPhoto.alt,
      categoryIds,
      displayOrder: nextDisplayOrder,
      isFeatured: categoryIds.includes("cat-featured")
    }
  ];
}
```

- [ ] **Step 6: Run helper tests and confirm pass**

Run: `npm test -- src/lib/reorder.test.ts src/lib/portfolio.test.ts`

Expected: all helper tests pass.

- [ ] **Step 7: Commit helper modules**

```bash
git add src/lib/reorder.ts src/lib/reorder.test.ts src/lib/portfolio.ts src/lib/portfolio.test.ts
git commit -m "feat: add gallery and portfolio helpers"
```

---

### Task 4: Add Prototype Store

**Files:**
- Create: `src/lib/prototype-store.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create client-side prototype store**

Create `src/lib/prototype-store.tsx`:

```tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { initialState } from "./seed-data";
import { moveItemById } from "./reorder";
import { promoteGalleryPhoto } from "./portfolio";
import type { ApprovedEmail, ContactInquiry, Gallery, GalleryPhoto, PortfolioCategory, PrototypeState } from "./types";

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
        portfolioCategories: moveItemById(state.portfolioCategories, action.categoryId, action.direction) as PortfolioCategory[]
      };
    case "inquiry:add":
      return {
        ...state,
        contactInquiries: [action.inquiry, ...state.contactInquiries]
      };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

function loadInitialState(): PrototypeState {
  if (typeof window === "undefined") {
    return initialState;
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return initialState;
  }

  try {
    return JSON.parse(stored) as PrototypeState;
  } catch {
    return initialState;
  }
}

const PrototypeStoreContext = createContext<{
  state: PrototypeState;
  dispatch: React.Dispatch<PrototypeAction>;
} | null>(null);

export function PrototypeStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadInitialState);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

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
```

- [ ] **Step 2: Wrap the app in the store provider**

Modify `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { PrototypeStoreProvider } from "@/lib/prototype-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "HWStudio",
  description: "Clean editorial photography portfolio and client gallery access."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrototypeStoreProvider>{children}</PrototypeStoreProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Run tests and build**

Run: `npm test`

Expected: all existing tests pass.

Run: `npm run build`

Expected: production build completes without TypeScript errors.

- [ ] **Step 4: Commit prototype store**

```bash
git add src/lib/prototype-store.tsx src/app/layout.tsx
git commit -m "feat: add local prototype store"
```

---

### Task 5: Build Public Site Shell And Portfolio

**Files:**
- Create: `src/components/SiteHeader.tsx`
- Create: `src/components/PhotoGrid.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/portfolio/page.tsx`
- Create: `src/app/about/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create public header**

Create `src/components/SiteHeader.tsx`:

```tsx
import Link from "next/link";

const links = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/client-access", label: "Client Access" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="HWStudio home">
        HWStudio
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create reusable photo grid**

Create `src/components/PhotoGrid.tsx`:

```tsx
type PhotoGridItem = {
  id: string;
  previewUrl: string;
  alt: string;
};

export function PhotoGrid({ photos }: { photos: PhotoGridItem[] }) {
  return (
    <div className="photo-grid">
      {photos.map((photo) => (
        <figure key={photo.id} className="photo-tile">
          <img src={photo.previewUrl} alt={photo.alt} />
        </figure>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Replace homepage with image-led mosaic**

Modify `src/app/page.tsx`:

```tsx
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { initialState } from "@/lib/seed-data";

export default function HomePage() {
  const photos = initialState.galleryPhotos.slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="page-shell home-shell">
        <section className="home-mosaic" aria-label="HWStudio featured work">
          <div className="home-copy">
            <p className="eyebrow">HWStudio</p>
            <h1>A curated gallery for every milestone.</h1>
            <p className="lede">
              Clean editorial photography for graduations, portraits, groups, events, and headshots.
            </p>
            <div className="button-row">
              <Link className="text-button" href="/portfolio">Explore Portfolio</Link>
              <Link className="dark-button" href="/client-access">Access Your Photos</Link>
            </div>
          </div>
          <div className="mosaic-grid">
            {photos.map((photo, index) => (
              <img key={photo.id} className={`mosaic-image mosaic-image-${index + 1}`} src={photo.previewUrl} alt={photo.alt} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 4: Create portfolio page**

Create `src/app/portfolio/page.tsx`:

```tsx
"use client";

import { SiteHeader } from "@/components/SiteHeader";
import { PhotoGrid } from "@/components/PhotoGrid";
import { getVisibleCategories, getVisiblePortfolioPhotos } from "@/lib/portfolio";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function PortfolioPage() {
  const { state } = usePrototypeStore();
  const categories = getVisibleCategories(state.portfolioCategories);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">Portfolio</p>
        <h1>Selected work across portraits, events, and graduation stories.</h1>
        <div className="category-stack">
          {categories.map((category) => {
            const photos = getVisiblePortfolioPhotos(state.portfolioPhotos, category.id);
            return (
              <section key={category.id} className="portfolio-section">
                <div className="section-heading">
                  <h2>{category.name}</h2>
                  <p>{category.description}</p>
                </div>
                <PhotoGrid photos={photos} />
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 5: Create about page**

Create `src/app/about/page.tsx`:

```tsx
import { SiteHeader } from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">About</p>
        <h1>Photography with a quiet point of view.</h1>
        <p className="lede">
          HWStudio is a working prototype for a photography brand that balances public portfolio presentation with private client gallery delivery.
        </p>
      </main>
    </>
  );
}
```

- [ ] **Step 6: Extend global styles for public pages**

Append to `src/app/globals.css`:

```css
.site-header {
  width: min(1180px, calc(100% - 40px));
  margin: 0 auto;
  padding: 26px 0;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
}

.brand-mark {
  font-family: var(--font-display);
  font-size: 1.35rem;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 18px;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.home-shell {
  padding-top: 16px;
}

.home-mosaic {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(320px, 1.15fr);
  gap: 44px;
  align-items: stretch;
}

.home-copy {
  padding: 28px 0;
  border-top: 1px solid var(--color-ink);
  border-bottom: 1px solid var(--color-ink);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.button-row {
  margin-top: 32px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.text-button,
.dark-button {
  min-height: 44px;
  padding: 12px 18px;
  border: 1px solid var(--color-ink);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dark-button {
  background: var(--color-ink);
  color: var(--color-surface);
}

.mosaic-grid {
  min-height: 560px;
  display: grid;
  grid-template-columns: 1fr 0.75fr;
  grid-template-rows: 1fr 0.85fr;
  gap: 14px;
}

.mosaic-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mosaic-image-1 {
  grid-row: span 2;
}

.category-stack {
  margin-top: 56px;
  display: grid;
  gap: 64px;
}

.portfolio-section {
  border-top: 1px solid var(--color-line);
  padding-top: 28px;
}

.section-heading {
  margin-bottom: 22px;
  display: flex;
  justify-content: space-between;
  gap: 32px;
  align-items: end;
}

.section-heading h2 {
  margin: 0;
  font-size: 2.1rem;
}

.section-heading p {
  max-width: 420px;
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.photo-tile {
  margin: 0;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: var(--color-line);
}

.photo-tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.narrow-page {
  max-width: 840px;
}

@media (max-width: 780px) {
  .site-header,
  .section-heading,
  .home-mosaic {
    display: block;
  }

  .site-nav {
    justify-content: flex-start;
    margin-top: 16px;
  }

  .mosaic-grid {
    margin-top: 28px;
    min-height: 420px;
  }
}
```

- [ ] **Step 7: Verify public pages build**

Run: `npm run build`

Expected: build passes and routes include `/`, `/portfolio`, and `/about`.

- [ ] **Step 8: Commit public shell**

```bash
git add src/components/SiteHeader.tsx src/components/PhotoGrid.tsx src/app/page.tsx src/app/portfolio/page.tsx src/app/about/page.tsx src/app/globals.css
git commit -m "feat: build public portfolio shell"
```

---

### Task 6: Build Client Access And Gallery Viewer

**Files:**
- Create: `src/components/GalleryAccessForm.tsx`
- Create: `src/components/GalleryAccessForm.test.tsx`
- Create: `src/components/GalleryViewer.tsx`
- Create: `src/app/client-access/page.tsx`
- Create: `src/app/galleries/[slug]/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write access form component tests**

Create `src/components/GalleryAccessForm.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GalleryAccessForm } from "./GalleryAccessForm";
import type { Gallery } from "@/lib/types";

const gallery: Gallery = {
  id: "gallery-1",
  title: "Sample Gallery",
  slug: "sample-gallery",
  eventDate: "2026-06-01",
  description: "A test gallery.",
  coverPhotoId: "photo-1",
  isListed: true,
  displayOrder: 1,
  passcode: "secret",
  requiresApprovedEmail: true,
  expirationDate: "2099-01-01",
  driveFolderId: "drive-folder-1",
  fullDownloadUrl: "https://drive.google.com/example",
  status: "active"
};

describe("GalleryAccessForm", () => {
  it("submits passcode and email", () => {
    const onSubmit = vi.fn();
    render(<GalleryAccessForm gallery={gallery} error={null} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Passcode"), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("Approved email"), { target: { value: "client@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Open Gallery" }));

    expect(onSubmit).toHaveBeenCalledWith({ passcode: "secret", email: "client@example.com" });
  });

  it("shows access errors", () => {
    render(<GalleryAccessForm gallery={gallery} error="That email is not approved for this gallery." onSubmit={vi.fn()} />);

    expect(screen.getByText("That email is not approved for this gallery.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run access form tests and confirm failure**

Run: `npm test -- src/components/GalleryAccessForm.test.tsx`

Expected: FAIL because `GalleryAccessForm` does not exist yet.

- [ ] **Step 3: Create access form component**

Create `src/components/GalleryAccessForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Gallery } from "@/lib/types";

export function GalleryAccessForm({
  gallery,
  error,
  onSubmit
}: {
  gallery: Gallery;
  error: string | null;
  onSubmit: (values: { passcode: string; email?: string }) => void;
}) {
  const [passcode, setPasscode] = useState("");
  const [email, setEmail] = useState("");

  return (
    <form
      className="access-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({ passcode, email });
      }}
    >
      <div>
        <label htmlFor="passcode">Passcode</label>
        <input id="passcode" value={passcode} onChange={(event) => setPasscode(event.target.value)} />
      </div>
      {gallery.requiresApprovedEmail ? (
        <div>
          <label htmlFor="approved-email">Approved email</label>
          <input id="approved-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      <button className="dark-button" type="submit">Open Gallery</button>
    </form>
  );
}
```

- [ ] **Step 4: Create gallery viewer component**

Create `src/components/GalleryViewer.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { Gallery, GalleryPhoto } from "@/lib/types";

export function GalleryViewer({ gallery, photos }: { gallery: Gallery; photos: GalleryPhoto[] }) {
  const visiblePhotos = [...photos].filter((photo) => photo.isVisible).sort((a, b) => a.displayOrder - b.displayOrder);
  const [activePhotoId, setActivePhotoId] = useState(visiblePhotos[0]?.id ?? "");
  const activePhoto = visiblePhotos.find((photo) => photo.id === activePhotoId) ?? visiblePhotos[0];

  return (
    <section className="gallery-viewer">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Client Gallery</p>
          <h1>{gallery.title}</h1>
        </div>
        <a className="text-button" href={gallery.fullDownloadUrl} target="_blank" rel="noreferrer">
          Full Gallery Download
        </a>
      </div>
      {activePhoto ? (
        <figure className="active-photo">
          <img src={activePhoto.previewUrl} alt={activePhoto.alt} />
          <figcaption>
            <span>{activePhoto.alt}</span>
            <a href={activePhoto.downloadUrl} download>
              Download Photo
            </a>
          </figcaption>
        </figure>
      ) : null}
      <div className="photo-grid">
        {visiblePhotos.map((photo) => (
          <button key={photo.id} className="photo-tile photo-button" type="button" onClick={() => setActivePhotoId(photo.id)}>
            <img src={photo.previewUrl} alt={photo.alt} />
          </button>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create client access directory page**

Create `src/app/client-access/page.tsx`:

```tsx
"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { canListGallery } from "@/lib/access";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function ClientAccessPage() {
  const { state } = usePrototypeStore();
  const gallery = state.galleries.filter(canListGallery).sort((a, b) => a.displayOrder - b.displayOrder)[0];
  const coverPhoto = gallery ? state.galleryPhotos.find((photo) => photo.id === gallery.coverPhotoId) : null;

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        <p className="eyebrow">Client Access</p>
        <h1>Select your gallery.</h1>
        {gallery && coverPhoto ? (
          <Link className="gallery-card" href={`/galleries/${gallery.slug}`}>
            <img src={coverPhoto.previewUrl} alt={coverPhoto.alt} />
            <span>
              <strong>{gallery.title}</strong>
              <small>{gallery.eventDate}</small>
              <small>{gallery.description}</small>
            </span>
          </Link>
        ) : (
          <p className="lede">No public galleries are listed right now.</p>
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 6: Create protected gallery page**

Create `src/app/galleries/[slug]/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { GalleryAccessForm } from "@/components/GalleryAccessForm";
import { GalleryViewer } from "@/components/GalleryViewer";
import { SiteHeader } from "@/components/SiteHeader";
import { isGalleryExpired, validateGalleryAccess } from "@/lib/access";
import { usePrototypeStore } from "@/lib/prototype-store";

const errorMessages = {
  expired: "This gallery has expired. Please contact HWStudio for access.",
  "incorrect-passcode": "That passcode does not match this gallery.",
  "email-required": "Enter the approved email for this gallery.",
  "email-not-approved": "That email is not approved for this gallery."
};

export default function GalleryPage() {
  const params = useParams<{ slug: string }>();
  const { state } = usePrototypeStore();
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gallery = state.galleries.find((item) => item.slug === params.slug);

  if (!gallery) {
    return (
      <>
        <SiteHeader />
        <main className="page-shell">
          <h1>Gallery not found.</h1>
        </main>
      </>
    );
  }

  const photos = state.galleryPhotos.filter((photo) => photo.galleryId === gallery.id);

  return (
    <>
      <SiteHeader />
      <main className="page-shell">
        {hasAccess ? (
          <GalleryViewer gallery={gallery} photos={photos} />
        ) : (
          <section className="access-panel">
            <p className="eyebrow">Private Gallery</p>
            <h1>{gallery.title}</h1>
            <p className="lede">{gallery.description}</p>
            {isGalleryExpired(gallery) ? (
              <p className="form-error">This gallery has expired. Please contact HWStudio for access.</p>
            ) : (
              <GalleryAccessForm
                gallery={gallery}
                error={error}
                onSubmit={(values) => {
                  const result = validateGalleryAccess({
                    gallery,
                    approvedEmails: state.approvedEmails,
                    passcode: values.passcode,
                    email: values.email
                  });

                  if (result.ok) {
                    setError(null);
                    setHasAccess(true);
                    return;
                  }

                  setError(errorMessages[result.reason]);
                }}
              />
            )}
          </section>
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 7: Add gallery styles**

Append to `src/app/globals.css`:

```css
.gallery-card {
  margin-top: 40px;
  display: grid;
  grid-template-columns: minmax(220px, 420px) minmax(0, 1fr);
  gap: 28px;
  align-items: end;
  border-top: 1px solid var(--color-ink);
  padding-top: 24px;
}

.gallery-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.gallery-card span {
  display: grid;
  gap: 10px;
}

.gallery-card strong {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 500;
}

.gallery-card small {
  color: var(--color-muted);
  font-size: 0.95rem;
  line-height: 1.5;
}

.access-panel {
  max-width: 760px;
}

.access-form {
  margin-top: 32px;
  display: grid;
  gap: 18px;
}

.access-form label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-muted);
}

.access-form input,
.access-form textarea,
.admin-form input,
.admin-form textarea,
.admin-form select {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--color-line);
  background: var(--color-surface);
  padding: 10px 12px;
  color: var(--color-ink);
}

.form-error {
  color: #8a1f1f;
  font-weight: 600;
}

.gallery-viewer {
  display: grid;
  gap: 28px;
}

.active-photo {
  margin: 0;
  background: #111;
}

.active-photo img {
  width: 100%;
  max-height: 72vh;
  object-fit: contain;
  display: block;
}

.active-photo figcaption {
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--color-surface);
}

.photo-button {
  border: 0;
  padding: 0;
  cursor: pointer;
}

@media (max-width: 780px) {
  .gallery-card {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: Run component test and build**

Run: `npm test -- src/components/GalleryAccessForm.test.tsx`

Expected: access form tests pass.

Run: `npm run build`

Expected: routes include `/client-access` and `/galleries/[slug]`.

- [ ] **Step 9: Commit client gallery flow**

```bash
git add src/components/GalleryAccessForm.tsx src/components/GalleryAccessForm.test.tsx src/components/GalleryViewer.tsx src/app/client-access/page.tsx 'src/app/galleries/[slug]/page.tsx' src/app/globals.css
git commit -m "feat: build protected client gallery flow"
```

---

### Task 7: Build Contact Form And Inquiry Review

**Files:**
- Create: `src/components/ContactForm.tsx`
- Create: `src/components/ContactForm.test.tsx`
- Create: `src/app/contact/page.tsx`
- Create: `src/app/admin/inquiries/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write contact form tests**

Create `src/components/ContactForm.test.tsx`:

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("submits required inquiry fields", () => {
    const onSubmit = vi.fn();
    render(<ContactForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Hannah" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "hannah@example.com" } });
    fireEvent.change(screen.getByLabelText("Photography type"), { target: { value: "Graduation" } });
    fireEvent.change(screen.getByLabelText("Preferred date"), { target: { value: "2026-08-15" } });
    fireEvent.change(screen.getByLabelText("Message"), { target: { value: "I would like graduation photos." } });
    fireEvent.click(screen.getByRole("button", { name: "Send Inquiry" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Hannah",
      email: "hannah@example.com",
      photographyType: "Graduation",
      preferredDate: "2026-08-15",
      message: "I would like graduation photos."
    });
  });
});
```

- [ ] **Step 2: Run contact test and confirm failure**

Run: `npm test -- src/components/ContactForm.test.tsx`

Expected: FAIL because `ContactForm` does not exist yet.

- [ ] **Step 3: Create contact form**

Create `src/components/ContactForm.tsx`:

```tsx
"use client";

import { useState } from "react";

type ContactValues = {
  name: string;
  email: string;
  photographyType: string;
  preferredDate: string;
  message: string;
};

const initialValues: ContactValues = {
  name: "",
  email: "",
  photographyType: "Graduation",
  preferredDate: "",
  message: ""
};

export function ContactForm({ onSubmit }: { onSubmit: (values: ContactValues) => void }) {
  const [values, setValues] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof ContactValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form
      className="access-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
        setSubmitted(true);
        setValues(initialValues);
      }}
    >
      <div>
        <label htmlFor="contact-name">Name</label>
        <input id="contact-name" required value={values.name} onChange={(event) => updateField("name", event.target.value)} />
      </div>
      <div>
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" required type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} />
      </div>
      <div>
        <label htmlFor="photography-type">Photography type</label>
        <select id="photography-type" value={values.photographyType} onChange={(event) => updateField("photographyType", event.target.value)}>
          <option>Graduation</option>
          <option>Events</option>
          <option>Headshots</option>
          <option>Portraits</option>
          <option>Groups</option>
        </select>
      </div>
      <div>
        <label htmlFor="preferred-date">Preferred date</label>
        <input id="preferred-date" required type="date" value={values.preferredDate} onChange={(event) => updateField("preferredDate", event.target.value)} />
      </div>
      <div>
        <label htmlFor="message">Message</label>
        <textarea id="message" required rows={5} value={values.message} onChange={(event) => updateField("message", event.target.value)} />
      </div>
      {submitted ? <p className="success-message">Inquiry saved in the local prototype.</p> : null}
      <button className="dark-button" type="submit">Send Inquiry</button>
    </form>
  );
}
```

- [ ] **Step 4: Create contact page**

Create `src/app/contact/page.tsx`:

```tsx
"use client";

import { ContactForm } from "@/components/ContactForm";
import { SiteHeader } from "@/components/SiteHeader";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function ContactPage() {
  const { dispatch } = usePrototypeStore();

  return (
    <>
      <SiteHeader />
      <main className="page-shell narrow-page">
        <p className="eyebrow">Contact</p>
        <h1>Start a photography inquiry.</h1>
        <p className="lede">Share the session type, date, and what you want the photographs to feel like.</p>
        <ContactForm
          onSubmit={(values) => {
            dispatch({
              type: "inquiry:add",
              inquiry: {
                id: `inquiry-${Date.now()}`,
                ...values,
                status: "new",
                createdAt: new Date().toISOString()
              }
            });
          }}
        />
      </main>
    </>
  );
}
```

- [ ] **Step 5: Create admin inquiry review page**

Create `src/app/admin/inquiries/page.tsx`:

```tsx
"use client";

import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminInquiriesPage() {
  const { state } = usePrototypeStore();

  return (
    <AdminShell title="Inquiries">
      <div className="admin-list">
        {state.contactInquiries.length === 0 ? (
          <p>No inquiries have been submitted in this prototype.</p>
        ) : (
          state.contactInquiries.map((inquiry) => (
            <article key={inquiry.id} className="admin-row">
              <strong>{inquiry.name}</strong>
              <span>{inquiry.email}</span>
              <span>{inquiry.photographyType} / {inquiry.preferredDate}</span>
              <p>{inquiry.message}</p>
            </article>
          ))
        )}
      </div>
    </AdminShell>
  );
}
```

- [ ] **Step 6: Add form success style**

Append to `src/app/globals.css`:

```css
.success-message {
  color: var(--color-accent);
  font-weight: 600;
}
```

- [ ] **Step 7: Run contact tests and build**

Run: `npm test -- src/components/ContactForm.test.tsx`

Expected: contact form test passes.

Run: `npm run build`

Expected: `/contact` and `/admin/inquiries` build.

- [ ] **Step 8: Commit contact flow**

```bash
git add src/components/ContactForm.tsx src/components/ContactForm.test.tsx src/app/contact/page.tsx src/app/admin/inquiries/page.tsx src/app/globals.css
git commit -m "feat: add contact inquiry flow"
```

---

### Task 8: Build Admin Shell And Gallery Management

**Files:**
- Create: `src/components/AdminShell.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/gallery/page.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create admin shell**

Create `src/components/AdminShell.tsx`:

```tsx
import Link from "next/link";

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/portfolio", label: "Portfolio" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/settings", label: "Settings" }
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand-mark">HWStudio</Link>
        <nav aria-label="Admin navigation">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
        </nav>
      </aside>
      <section className="admin-main">
        <p className="eyebrow">Admin</p>
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Create admin dashboard**

Create `src/app/admin/page.tsx`:

```tsx
"use client";

import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminDashboardPage() {
  const { state } = usePrototypeStore();
  const gallery = state.galleries[0];

  return (
    <AdminShell title="Dashboard">
      <div className="stat-grid">
        <div className="stat-card"><span>Gallery</span><strong>{gallery.title}</strong></div>
        <div className="stat-card"><span>Photos</span><strong>{state.galleryPhotos.length}</strong></div>
        <div className="stat-card"><span>Approved emails</span><strong>{state.approvedEmails.length}</strong></div>
        <div className="stat-card"><span>Inquiries</span><strong>{state.contactInquiries.length}</strong></div>
      </div>
    </AdminShell>
  );
}
```

- [ ] **Step 3: Create gallery management page**

Create `src/app/admin/gallery/page.tsx`:

```tsx
"use client";

import { FormEvent, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";
import type { GalleryPhoto } from "@/lib/types";

export default function AdminGalleryPage() {
  const { state, dispatch } = usePrototypeStore();
  const gallery = state.galleries[0];
  const photos = state.galleryPhotos
    .filter((photo) => photo.galleryId === gallery.id)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  const approvedEmails = state.approvedEmails.filter((email) => email.galleryId === gallery.id);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newEmail, setNewEmail] = useState("");

  function saveGallery(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    const formData = new FormData(formEvent.currentTarget);
    dispatch({
      type: "gallery:update",
      gallery: {
        ...gallery,
        title: String(formData.get("title")),
        slug: String(formData.get("slug")),
        eventDate: String(formData.get("eventDate")),
        description: String(formData.get("description")),
        passcode: String(formData.get("passcode")),
        expirationDate: String(formData.get("expirationDate")) || null,
        fullDownloadUrl: String(formData.get("fullDownloadUrl")),
        isListed: formData.get("isListed") === "on",
        requiresApprovedEmail: formData.get("requiresApprovedEmail") === "on"
      }
    });
  }

  function addPhoto() {
    if (!newPhotoUrl.trim()) {
      return;
    }

    const nextOrder = photos.length === 0 ? 1 : Math.max(...photos.map((photo) => photo.displayOrder)) + 1;
    const photo: GalleryPhoto = {
      id: `gallery-photo-${Date.now()}`,
      galleryId: gallery.id,
      driveFileId: `mock-drive-${Date.now()}`,
      previewUrl: newPhotoUrl,
      downloadUrl: newPhotoUrl,
      alt: "Admin-added gallery photo",
      displayOrder: nextOrder,
      isVisible: true,
      isPortfolioEligible: true
    };
    dispatch({ type: "gallery-photo:add", photo });
    setNewPhotoUrl("");
  }

  return (
    <AdminShell title="Gallery">
      <form className="admin-form" onSubmit={saveGallery}>
        <label>Title<input name="title" defaultValue={gallery.title} /></label>
        <label>Slug<input name="slug" defaultValue={gallery.slug} /></label>
        <label>Event date<input name="eventDate" type="date" defaultValue={gallery.eventDate} /></label>
        <label>Description<textarea name="description" defaultValue={gallery.description} rows={4} /></label>
        <label>Passcode<input name="passcode" defaultValue={gallery.passcode} /></label>
        <label>Expiration date<input name="expirationDate" type="date" defaultValue={gallery.expirationDate ?? ""} /></label>
        <label>Full download link<input name="fullDownloadUrl" defaultValue={gallery.fullDownloadUrl} /></label>
        <label className="check-row"><input name="isListed" type="checkbox" defaultChecked={gallery.isListed} /> Publicly listed</label>
        <label className="check-row"><input name="requiresApprovedEmail" type="checkbox" defaultChecked={gallery.requiresApprovedEmail} /> Require preapproved email</label>
        <button className="dark-button" type="submit">Save Gallery</button>
      </form>

      <section className="admin-section">
        <h2>Approved emails</h2>
        <div className="inline-controls">
          <input aria-label="New approved email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} />
          <button
            className="text-button"
            type="button"
            onClick={() => {
              if (!newEmail.trim()) return;
              dispatch({
                type: "approved-email:add",
                email: { id: `approved-email-${Date.now()}`, galleryId: gallery.id, email: newEmail, label: "Client" }
              });
              setNewEmail("");
            }}
          >
            Add Email
          </button>
        </div>
        <div className="admin-list">
          {approvedEmails.map((email) => (
            <div key={email.id} className="admin-row compact-row">
              <span>{email.email}</span>
              <button type="button" onClick={() => dispatch({ type: "approved-email:remove", emailId: email.id })}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Photos</h2>
        <div className="inline-controls">
          <input aria-label="New photo URL" value={newPhotoUrl} onChange={(event) => setNewPhotoUrl(event.target.value)} />
          <button className="text-button" type="button" onClick={addPhoto}>Add Photo</button>
        </div>
        <div className="admin-list">
          {photos.map((photo) => (
            <div key={photo.id} className="admin-row photo-admin-row">
              <img src={photo.previewUrl} alt={photo.alt} />
              <span>{photo.alt}</span>
              <div className="row-actions">
                <button type="button" onClick={() => dispatch({ type: "gallery-photo:move", photoId: photo.id, direction: "up" })}>Up</button>
                <button type="button" onClick={() => dispatch({ type: "gallery-photo:move", photoId: photo.id, direction: "down" })}>Down</button>
                <button type="button" onClick={() => dispatch({ type: "gallery-photo:remove", photoId: photo.id })}>Remove</button>
                <button type="button" onClick={() => dispatch({ type: "portfolio:promote-gallery-photo", photoId: photo.id, categoryIds: ["cat-featured"] })}>Promote</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 4: Create settings page**

Create `src/app/admin/settings/page.tsx`:

```tsx
"use client";

import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminSettingsPage() {
  const { dispatch } = usePrototypeStore();

  return (
    <AdminShell title="Settings">
      <p className="lede">Prototype controls for local testing.</p>
      <button className="dark-button" type="button" onClick={() => dispatch({ type: "reset" })}>
        Reset Local Prototype Data
      </button>
    </AdminShell>
  );
}
```

- [ ] **Step 5: Add admin styles**

Append to `src/app/globals.css`:

```css
.admin-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  background: var(--color-surface);
}

.admin-sidebar {
  border-right: 1px solid var(--color-line);
  padding: 28px 22px;
}

.admin-sidebar nav {
  margin-top: 32px;
  display: grid;
  gap: 12px;
  color: var(--color-muted);
}

.admin-main {
  padding: 36px;
}

.stat-grid {
  margin-top: 32px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.stat-card {
  border: 1px solid var(--color-line);
  padding: 18px;
  display: grid;
  gap: 8px;
}

.stat-card span {
  color: var(--color-muted);
}

.stat-card strong {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 500;
}

.admin-form,
.admin-section {
  margin-top: 28px;
  max-width: 920px;
}

.admin-form {
  display: grid;
  gap: 16px;
}

.admin-form label {
  display: grid;
  gap: 8px;
  color: var(--color-muted);
}

.check-row {
  display: flex !important;
  grid-template-columns: none;
  align-items: center;
  gap: 10px !important;
}

.check-row input {
  width: auto;
  min-height: 0;
}

.inline-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.inline-controls input {
  border: 1px solid var(--color-line);
  min-height: 44px;
  padding: 10px 12px;
}

.admin-list {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.admin-row {
  border: 1px solid var(--color-line);
  padding: 14px;
  background: var(--color-surface);
}

.compact-row,
.photo-admin-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.photo-admin-row {
  grid-template-columns: 88px minmax(0, 1fr) auto;
}

.photo-admin-row img {
  width: 88px;
  height: 72px;
  object-fit: cover;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 900px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--color-line);
  }
}
```

- [ ] **Step 6: Run build**

Run: `npm run build`

Expected: admin dashboard, gallery, inquiries, and settings routes build.

- [ ] **Step 7: Commit admin gallery management**

```bash
git add src/components/AdminShell.tsx src/app/admin/page.tsx src/app/admin/gallery/page.tsx src/app/admin/settings/page.tsx src/app/globals.css
git commit -m "feat: add single-gallery admin management"
```

---

### Task 9: Build Admin Portfolio Management

**Files:**
- Create: `src/app/admin/portfolio/page.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create admin portfolio page**

Create `src/app/admin/portfolio/page.tsx`:

```tsx
"use client";

import { AdminShell } from "@/components/AdminShell";
import { usePrototypeStore } from "@/lib/prototype-store";

export default function AdminPortfolioPage() {
  const { state, dispatch } = usePrototypeStore();
  const categories = [...state.portfolioCategories].sort((a, b) => a.displayOrder - b.displayOrder);
  const photos = [...state.portfolioPhotos].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <AdminShell title="Portfolio">
      <section className="admin-section">
        <h2>Categories</h2>
        <div className="admin-list">
          {categories.map((category) => (
            <div key={category.id} className="admin-row compact-row">
              <span>{category.name}</span>
              <div className="row-actions">
                <button type="button" onClick={() => dispatch({ type: "portfolio-category:move", categoryId: category.id, direction: "up" })}>Up</button>
                <button type="button" onClick={() => dispatch({ type: "portfolio-category:move", categoryId: category.id, direction: "down" })}>Down</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Portfolio photos</h2>
        <div className="admin-list">
          {photos.map((photo) => (
            <div key={photo.id} className="admin-row photo-admin-row">
              <img src={photo.previewUrl} alt={photo.alt} />
              <span>{photo.alt}</span>
              <div className="row-actions">
                <button type="button" onClick={() => dispatch({ type: "portfolio-photo:remove", photoId: photo.id })}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
```

- [ ] **Step 2: Verify portfolio admin builds**

Run: `npm run build`

Expected: `/admin/portfolio` builds without TypeScript errors.

- [ ] **Step 3: Commit portfolio admin**

```bash
git add src/app/admin/portfolio/page.tsx
git commit -m "feat: add portfolio admin management"
```

---

### Task 10: Final Verification And Local Run

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/superpowers/specs/2026-07-04-hwstudio-v1-design.md` only if implementation changes approved scope.

- [ ] **Step 1: Update contributor guide commands**

Modify `AGENTS.md` so the command section reflects the actual Next.js scripts:

```md
## Build, Test, and Development Commands

- `npm install` - install project dependencies.
- `npm run dev` - start the local Next.js development server.
- `npm run build` - create a production build and run TypeScript checks.
- `npm test` - run Vitest unit and component tests.
```

- [ ] **Step 2: Run full automated verification**

Run: `npm test`

Expected: all Vitest suites pass.

Run: `npm run build`

Expected: production build completes.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev`

Expected: Next.js starts a local server, commonly `http://localhost:3000`.

- [ ] **Step 4: Manual browser smoke test**

Open the local URL and verify:

- Homepage shows HWStudio image-led mosaic.
- `/portfolio` shows the portfolio categories.
- `/client-access` shows one gallery card.
- Gallery opens with passcode `hwstudio` and approved email `client@example.com`.
- Wrong passcode shows an error.
- Unapproved email shows an error.
- `/contact` submits an inquiry.
- `/admin` dashboard loads.
- `/admin/gallery` can edit metadata, add email, add photo URL, reorder photos, remove photos, and promote a photo.
- `/admin/portfolio` shows promoted photos and supports category reorder.
- `/admin/inquiries` shows submitted inquiries.

- [ ] **Step 5: Commit final guide update**

```bash
git add AGENTS.md
git commit -m "docs: update contributor guide for Next.js prototype"
```

- [ ] **Step 6: Capture final status**

Run: `git status --short`

Expected: no uncommitted implementation changes except user-owned assets intentionally left untracked, such as `Photography Site Inspo.pdf`.
