# HWStudio V1 Design

## Summary

HWStudio V1 is a local UX prototype for a clean, creative, editorial photography website. The prototype focuses on a public portfolio and a single client gallery flow, while shaping the data and screens so Supabase and Google Drive integration can be added later without redesigning the app.

The first implementation will not connect to live Supabase, Google Drive, Dropbox, or payment APIs. It will use backend-shaped local data and one configurable gallery record.

## Goals

- Present HWStudio as a polished photography brand, not a generic generated site.
- Showcase public portfolio work across curated categories.
- Let clients access one protected gallery through a public directory card.
- Let the photographer manage the one gallery and public portfolio from a desktop-first admin area.
- Keep the prototype ready for future multi-gallery, Supabase, and Google Drive integration.

## Non-Goals

- Full booking workflow.
- Built-in payments.
- Favorites or selection lists.
- Comments and retouching requests.
- AI culling, editing, Lightroom integration, or Drive sync.
- Production authentication, database, storage, or OAuth integration.
- Mobile-optimized admin workflows.

## Public Site

The public site uses the working brand name `HWStudio`.

Primary navigation:

- Portfolio
- Client Access
- About
- Contact

The homepage will use an image-led mosaic layout with refined typography, generous whitespace, and a clean editorial tone. The site should avoid generic SaaS styling, decorative gradient blobs, and cluttered cards.

Portfolio categories:

- Featured
- Graduation
- Events
- Headshots
- Portraits
- Groups

Portfolio photos are mostly manually curated for v1. The admin area should also allow gallery photos to be promoted into portfolio categories.

## Client Gallery Flow

The `Client Access` page shows a gallery directory with one visible gallery card. The card includes:

- Gallery name
- Event date
- Cover image
- Optional description

Selecting the card opens the access flow for that gallery. Access requires one shared passcode. If stricter access is enabled, the visitor must also enter an email address from that gallery's preapproved email list.

The gallery enforces expiration dates. If the gallery is expired, visitors cannot access it until the admin updates or clears the expiration date.

After successful access, visitors can:

- View final edited photos in a responsive grid.
- Open a larger photo detail/slideshow-style view.
- Download individual photos.
- Use a configured Google Drive folder/download link for full-gallery download.

Favorites, comments, and retouching requests are postponed.

## Admin Area

The prototype has one simulated admin user. The admin area is desktop-first and utilitarian, with clear forms and predictable controls.

Admin navigation:

- Dashboard
- Gallery
- Portfolio
- Inquiries
- Settings

The admin can manage the single gallery:

- Edit title, slug, event date, description, and cover image.
- Toggle public listing.
- Set passcode.
- Enable or disable preapproved-email gating.
- Manage approved email addresses.
- Set or clear expiration date.
- Add photo records to the gallery.
- Remove photo records from the website/gallery without deleting source Drive files.
- Reorder gallery photos.
- Set Drive folder/download link.
- Promote gallery photos into portfolio categories.

The admin can manage the portfolio:

- Add photos directly to portfolio categories.
- Remove photos from portfolio categories.
- Reorder portfolio photos.
- Reorder portfolio categories.
- Hide or show categories if needed.

The contact area captures simple inquiries and lets the admin review them locally.

## Data Model

Prototype data will use local TypeScript objects shaped like future Supabase tables.

Core entities:

- `Gallery`: title, slug, event date, description, cover photo ID, public listing flag, display order, mock passcode verifier, email gate flag, expiration date, Drive folder ID/link, full download link, status.
- `GalleryPhoto`: gallery ID, mock Drive file ID, preview URL, download URL, alt text, display order, visibility, portfolio eligibility.
- `ApprovedEmail`: gallery ID, email address, optional label.
- `PortfolioCategory`: name, slug, description, display order, visibility.
- `PortfolioPhoto`: source gallery photo ID when promoted, standalone image record when manually added, category IDs, display order, alt text, featured flag.
- `ContactInquiry`: name, email, message, photography type, preferred date, status.

Deletion behavior:

- Removing a photo in the website unlinks it from the gallery or portfolio only.
- The website does not delete source files from Google Drive.
- A later Drive sync phase can detect deleted Drive files and mark matching website records as missing or remove them.

## Architecture

Build the prototype as a Next.js app with local backend-shaped data.

Main layers:

- Public pages for homepage, portfolio, client access, gallery access, gallery viewer, about, and contact.
- Admin pages for gallery management, portfolio management, inquiry review, and settings.
- Shared access logic for passcode validation, approved-email validation, public listing checks, and expiration checks.
- Mock storage records with future Google Drive-style fields such as `driveFileId`, `driveFolderId`, `previewUrl`, and `downloadUrl`.

The UI should not depend directly on hardcoded page data. It should read through small data helpers so local data can later be replaced by Supabase queries and Google Drive API calls.

## Validation

Prototype validation should cover:

- Correct passcode grants access.
- Incorrect passcode blocks access.
- Email-gated gallery rejects unapproved emails.
- Expired gallery blocks access.
- The gallery directory shows the one listed gallery card.
- Admin changes gallery metadata.
- Admin add, remove, and reorder photo actions update gallery state.
- Portfolio promotion and removal update public portfolio views.
- Contact form captures required fields.

## Future Phases

Likely next phases:

- Supabase Auth and database integration.
- Google Drive OAuth and real Drive folder/file import.
- Multi-gallery directory and gallery management.
- Upload-through-website to Google Drive.
- Favorites and selection lists.
- Comments and retouching requests.
- Booking proposals, agreements, deposits, and reminders.
- AI-assisted culling and editing workflows.
