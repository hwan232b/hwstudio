# Portfolio Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let admins edit portfolio intro copy, section headings, visibility, and section photos from `/admin/portfolio`.

**Architecture:** Extend the prototype store with `portfolioSettings` and portfolio category update actions. Reuse `portfolioCategories` for section copy/order/visibility and `portfolioPhotos.categoryIds` for section photo assignment. Reuse `normalizePhotoUrl` and `isGoogleDriveFolderUrl` for direct image/Drive file links.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest, Testing Library, browser `localStorage` prototype persistence.

---

### Task 1: Store Portfolio Settings And Category Updates

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/seed-data.ts`
- Modify: `src/lib/prototype-store.tsx`
- Test: `src/lib/prototype-store.test.tsx`

- [ ] **Step 1: Write failing store hydration/action tests**

Add tests in `src/lib/prototype-store.test.tsx`:

```tsx
it("hydrates portfolio settings from persisted state", () => {
  window.localStorage.setItem(
    "hwstudio-prototype-state",
    JSON.stringify({
      ...initialState,
      portfolioSettings: {
        eyebrow: "Selected Work",
        heading: "Portraits, groups, and graduation stories."
      }
    })
  );

  function PortfolioSettingsProbe() {
    const { state } = usePrototypeStore();
    return <p>{`${state.portfolioSettings.eyebrow}|${state.portfolioSettings.heading}`}</p>;
  }

  render(
    <PrototypeStoreProvider>
      <PortfolioSettingsProbe />
    </PrototypeStoreProvider>
  );

  expect(screen.getByText("Selected Work|Portraits, groups, and graduation stories.")).toBeInTheDocument();
});

it("updates portfolio settings and categories through the store", () => {
  function PortfolioUpdateProbe() {
    const { state, dispatch } = usePrototypeStore();
    const category = state.portfolioCategories.find((item) => item.id === "cat-featured");

    return (
      <div>
        <p>{state.portfolioSettings.heading}</p>
        <p>{category ? `${category.name}|${category.description}|${category.isVisible}` : "missing"}</p>
        <button
          type="button"
          onClick={() =>
            dispatch({
              type: "portfolio-settings:update",
              settings: { eyebrow: "Work", heading: "A quieter portfolio heading." }
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
                ...category!,
                name: "Highlights",
                description: "A tighter edit.",
                isVisible: false
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

  expect(screen.getByText("A quieter portfolio heading.")).toBeInTheDocument();
  expect(screen.getByText("Highlights|A tighter edit.|false")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/prototype-store.test.tsx`

Expected: FAIL because `portfolioSettings`, `portfolio-settings:update`, and `portfolio-category:update` do not exist yet.

- [ ] **Step 3: Implement store/types**

In `src/lib/types.ts`, add:

```ts
export type PortfolioSettings = {
  eyebrow: string;
  heading: string;
};
```

Add `portfolioSettings: PortfolioSettings;` to `PrototypeState`.

In `src/lib/seed-data.ts`, add:

```ts
portfolioSettings: {
  eyebrow: "Portfolio",
  heading: "Selected work across portraits, events, and graduation stories."
},
```

In `src/lib/prototype-store.tsx`, import `PortfolioSettings`, add actions:

```ts
| { type: "portfolio-settings:update"; settings: PortfolioSettings }
| { type: "portfolio-category:update"; category: PortfolioCategory }
```

Add reducer cases:

```ts
case "portfolio-settings:update":
  return { ...state, portfolioSettings: action.settings };
case "portfolio-category:update":
  return {
    ...state,
    portfolioCategories: state.portfolioCategories.map((category) =>
      category.id === action.category.id ? action.category : category
    )
  };
```

Add guard:

```ts
function isPortfolioSettings(value: unknown): value is PortfolioSettings {
  return isRecord(value) && hasStringFields(value, ["eyebrow", "heading"]);
}
```

Require `isPortfolioSettings(value.portfolioSettings)` inside `isPrototypeState`.

- [ ] **Step 4: Verify task**

Run: `npm test -- src/lib/prototype-store.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/seed-data.ts src/lib/prototype-store.tsx src/lib/prototype-store.test.tsx
git commit -m "feat: add portfolio settings store"
```

### Task 2: Render Editable Portfolio Intro And Smaller Heading

**Files:**
- Modify: `src/app/portfolio/page.tsx`
- Modify: `src/app/portfolio/page.test.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Write failing public page tests**

Add a test in `src/app/portfolio/page.test.tsx`:

```tsx
it("renders persisted portfolio intro copy", async () => {
  window.localStorage.setItem(
    "hwstudio-prototype-state",
    JSON.stringify({
      ...initialState,
      portfolioSettings: {
        eyebrow: "Selected Work",
        heading: "A softer look at portraits and graduation days."
      }
    })
  );

  renderPortfolioPage();

  await waitFor(() => {
    expect(screen.getByText("Selected Work")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A softer look at portraits and graduation days." })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/app/portfolio/page.test.tsx`

Expected: FAIL because `PortfolioPage` still renders hard-coded intro copy.

- [ ] **Step 3: Implement public rendering and style**

In `src/app/portfolio/page.tsx`, replace hard-coded intro with:

```tsx
<p className="eyebrow">{state.portfolioSettings.eyebrow}</p>
<h1 className="portfolio-heading">{state.portfolioSettings.heading}</h1>
```

In `src/app/globals.css`, add:

```css
.portfolio-heading {
  max-width: 780px;
  font-size: clamp(2.4rem, 6vw, 4.4rem);
}
```

- [ ] **Step 4: Verify task**

Run: `npm test -- src/app/portfolio/page.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/portfolio/page.tsx src/app/portfolio/page.test.tsx src/app/globals.css
git commit -m "feat: render editable portfolio intro"
```

### Task 3: Admin Portfolio Copy, Sections, And Photo Link Areas

**Files:**
- Modify: `src/app/admin/portfolio/page.tsx`
- Modify: `src/app/admin/portfolio/page.test.tsx`

- [ ] **Step 1: Write failing admin tests**

Add tests in `src/app/admin/portfolio/page.test.tsx`:

```tsx
it("saves portfolio intro copy and category details", async () => {
  renderAdminPortfolioPage({
    ...portfolioState,
    portfolioSettings: {
      eyebrow: "Portfolio",
      heading: "Selected work across portraits, events, and graduation stories."
    }
  });

  fireEvent.change(await screen.findByLabelText("Portfolio eyebrow"), { target: { value: "Selected Work" } });
  fireEvent.change(screen.getByLabelText("Portfolio heading"), {
    target: { value: "Portraits, groups, and graduation stories." }
  });
  fireEvent.click(screen.getByRole("button", { name: "Save intro copy" }));

  const featuredSection = screen.getByRole("listitem", { name: "Category: Featured" });
  fireEvent.change(within(featuredSection).getByLabelText("Section name"), { target: { value: "Highlights" } });
  fireEvent.change(within(featuredSection).getByLabelText("Section description"), {
    target: { value: "A tighter featured edit." }
  });
  fireEvent.click(within(featuredSection).getByLabelText("Visible on portfolio"));
  fireEvent.click(within(featuredSection).getByRole("button", { name: "Save section" }));

  expect(screen.getByRole("status")).toHaveTextContent("Portfolio section saved.");
  await waitFor(() => {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
    expect(stored.portfolioSettings).toEqual({
      eyebrow: "Selected Work",
      heading: "Portraits, groups, and graduation stories."
    });
    expect(stored.portfolioCategories.find((category) => category.id === "cat-featured")).toMatchObject({
      name: "Highlights",
      description: "A tighter featured edit.",
      isVisible: false
    });
  });
});

it("adds direct image and Google Drive portfolio photos to a section", async () => {
  renderAdminPortfolioPage({
    ...portfolioState,
    portfolioSettings: {
      eyebrow: "Portfolio",
      heading: "Selected work across portraits, events, and graduation stories."
    }
  });

  const featuredSection = await screen.findByRole("listitem", { name: "Category: Featured" });
  fireEvent.change(within(featuredSection).getByLabelText("Photo URL"), {
    target: { value: "https://drive.google.com/file/d/1abcDEFghiJKLmnop/view?usp=sharing" }
  });
  fireEvent.change(within(featuredSection).getByLabelText("Alt text"), {
    target: { value: "Graduate smiling downtown" }
  });
  fireEvent.click(within(featuredSection).getByRole("button", { name: "Add photo to Featured" }));

  expect(screen.getByRole("status")).toHaveTextContent("Portfolio photo added.");
  await waitFor(() => {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as PrototypeState;
    expect(stored.portfolioPhotos).toContainEqual(
      expect.objectContaining({
        previewUrl: "https://lh3.googleusercontent.com/d/1abcDEFghiJKLmnop=w1600",
        alt: "Graduate smiling downtown",
        categoryIds: ["cat-featured"]
      })
    );
  });
});

it("rejects Google Drive folder links in portfolio photo areas", async () => {
  renderAdminPortfolioPage({
    ...portfolioState,
    portfolioSettings: {
      eyebrow: "Portfolio",
      heading: "Selected work across portraits, events, and graduation stories."
    }
  });

  const featuredSection = await screen.findByRole("listitem", { name: "Category: Featured" });
  fireEvent.change(within(featuredSection).getByLabelText("Photo URL"), {
    target: { value: "https://drive.google.com/drive/folders/1folderABCdef?usp=sharing" }
  });
  fireEvent.change(within(featuredSection).getByLabelText("Alt text"), { target: { value: "Folder upload" } });
  fireEvent.click(within(featuredSection).getByRole("button", { name: "Add photo to Featured" }));

  expect(screen.getByRole("status")).toHaveTextContent(
    "Folder links cannot preview a single photo yet. Paste an individual Google Drive file link."
  );
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm test -- src/app/admin/portfolio/page.test.tsx`

Expected: FAIL because forms and actions are not implemented.

- [ ] **Step 3: Implement admin page**

In `src/app/admin/portfolio/page.tsx`:

- Import `isGoogleDriveFolderUrl` and `normalizePhotoUrl`.
- Add `introValues` state initialized from `state.portfolioSettings`.
- Add `categoryValues` state keyed by category ID.
- Add `photoForms` state keyed by category ID with `url` and `alt`.
- Add form handlers for intro save, section save, and add photo.
- For add photo, reject folder links, normalize Drive file links, create `PortfolioPhoto` with `sourceGalleryPhotoId: null`, `categoryIds: [category.id]`, `displayOrder` as next max plus one, and `isFeatured: category.id === "cat-featured"`.

Use existing classes: `admin-panel`, `admin-form`, `admin-inline-form`, `admin-list`, `admin-photo-list`, `text-button`, and `dark-button`.

- [ ] **Step 4: Verify admin task**

Run: `npm test -- src/app/admin/portfolio/page.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/portfolio/page.tsx src/app/admin/portfolio/page.test.tsx
git commit -m "feat: add portfolio admin editing"
```

### Task 4: Full Verification And Push

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run full tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build completes successfully.

- [ ] **Step 3: Check whitespace**

Run: `git diff --check`

Expected: no output.

- [ ] **Step 4: Push branch**

```bash
git push
```

Expected: `hwstudio-v1` pushed to GitHub.
