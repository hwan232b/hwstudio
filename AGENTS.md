# Repository Guidelines

## Project Structure & Module Organization

This repository contains a local Next.js prototype for the HWStudio photography site. The original inspiration PDF remains design reference material; keep implementation files organized under the app structure already in place:

- `src/app/` for App Router pages, including public, gallery, and admin routes.
- `src/components/` for reusable UI such as `SiteHeader`, `AdminShell`, and forms.
- `src/lib/` for domain types, seed data, access rules, and prototype store logic.
- `src/test/` and colocated `*.test.tsx` files for Vitest coverage.
- `docs/` for design specs and implementation plans.

Avoid placing generated build output, dependency folders, or temporary files in version control.

## Build, Test, and Development Commands

- `npm install` - install project dependencies.
- `npm run dev` - start the local Next.js development server.
- `npm run build` - create a production build and run TypeScript checks.
- `npm test` - run Vitest unit and component tests.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Prefer 2-space indentation, `camelCase` for variables and functions, `PascalCase` for components, and descriptive page/component names such as `GalleryViewer.tsx` or `prototype-store.test.tsx`. Keep shared business logic in `src/lib/` and UI behavior in components/pages.

## Testing Guidelines

Use Vitest with React Testing Library. Add or update tests for interactive behavior, gallery access, admin actions, forms, and domain helpers. Test names should describe user-visible behavior, such as `opens the gallery with the seeded passcode and approved email`. Run `npm test` before committing.

## Commit & Pull Request Guidelines

Use short, imperative commit messages with a conventional prefix when helpful, for example `feat: add portfolio admin management` or `fix: label portfolio admin actions`. Pull requests should include a concise summary, screenshots for visual changes, test results, and links to any related issue or design reference.

## Agent-Specific Instructions

Before editing, check whether project conventions have been added since this guide was written. Do not overwrite user-provided assets such as `Photography Site Inspo.pdf`. Keep changes scoped, verify commands when available, and update this guide when the stack or workflow becomes concrete.
