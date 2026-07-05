# Portfolio Editing Design

## Goal

Let the admin manage the public portfolio page without touching code. The first version stays within the current prototype storage model: text fields and image links are stored in browser-backed state, while actual photo files remain external.

## Public Portfolio Page

The portfolio intro copy becomes data-driven instead of hard-coded. Admin can edit the eyebrow and main heading shown above the portfolio sections. The public main heading should render slightly smaller than the current hero-scale heading so the page feels more like a portfolio index than a landing-page hero.

Portfolio sections continue to come from portfolio categories. Each visible section shows its editable name, editable description, and photos assigned to that category.

## Admin Portfolio Page

`/admin/portfolio` will include:

- An intro copy form for the portfolio eyebrow and main heading.
- A section editor for each portfolio category with name, description, visibility, and reorder controls.
- An add-photo area inside each section.

The add-photo area accepts a direct image URL or an individual Google Drive file link, plus alt text. It reuses the existing Google Drive normalization helper so Drive file links render as preview images. Google Drive folder links are rejected with a clear status message because folder sync is out of scope for this version.

Portfolio photos can be removed from the admin page. This removes them from the website only and does not touch Google Drive.

## Data Model

Add `portfolioSettings` to `PrototypeState`:

- `eyebrow`
- `heading`

Reuse existing `portfolioCategories` for section heading, description, order, and visibility. Reuse existing `portfolioPhotos` for section photos, using `categoryIds` to determine which section contains each photo.

## Testing

Add tests for saving portfolio intro copy, editing category text/visibility, adding a direct image or Drive file link to a category, rejecting folder links, and rendering updated portfolio copy on the public page.
