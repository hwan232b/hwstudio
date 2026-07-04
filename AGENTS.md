# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a new photography website workspace. The only existing project asset is `Photography Site Inspo.pdf`, which should be treated as design reference material. When implementation begins, keep source files in a clear top-level app structure, for example:

- `src/` for application code and reusable UI modules.
- `public/` or `assets/` for static images, fonts, and exported media.
- `tests/` or colocated `*.test.*` files for automated tests.
- `docs/` for planning notes, specifications, and content drafts.

Avoid placing generated build output, dependency folders, or temporary files in version control.

## Build, Test, and Development Commands

No build system is configured yet. After selecting a stack, document the exact commands here and keep them current. Expected examples for a JavaScript frontend are:

- `npm install` - install project dependencies.
- `npm run dev` - start the local development server.
- `npm run build` - create a production build.
- `npm test` - run the test suite.
- `npm run lint` - run static analysis and style checks.

If a different toolchain is chosen, replace these examples with the actual commands.

## Coding Style & Naming Conventions

Use consistent formatting across the project. For JavaScript or TypeScript, prefer 2-space indentation, `camelCase` for variables and functions, `PascalCase` for components, and descriptive file names such as `PhotoGallery.tsx` or `contact-form.test.ts`. Keep components focused, with assets and styles organized near the feature they support when practical.

## Testing Guidelines

Add tests for interactive behavior, image/gallery flows, routing, forms, and any data transformation logic. Use clear test names that describe user-visible behavior, such as `renders featured gallery images` or `submits contact form fields`. Run the full test suite before opening a pull request.

## Commit & Pull Request Guidelines

This folder is not currently a git repository, so no local commit convention exists yet. Use short, imperative commit messages such as `Add homepage gallery layout` or `Configure image optimization`. Pull requests should include a concise summary, screenshots for visual changes, test results, and links to any related issue or design reference.

## Agent-Specific Instructions

Before editing, check whether project conventions have been added since this guide was written. Do not overwrite user-provided assets such as `Photography Site Inspo.pdf`. Keep changes scoped, verify commands when available, and update this guide when the stack or workflow becomes concrete.
