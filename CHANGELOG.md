# Changelog

## [Unreleased]

### Added
- Functional Supabase Storage upload flow for dynamic board images (Infos, Posters, Fallback).
- Reusable image upload utility `lib/media-utils.ts` and `URL.createObjectURL()` previews.
- YouTube URL parsing and embed preview for streaming channels.
- End-to-end dashboard CRUD operations fully connected to Supabase Database.
- Consistent save/loading/error feedback across all admin forms.

### Changed
- Replaced the generic radio icon on the OFF AIR overlay with the official RRI logo, treated with a white monochrome filter (`brightness(0) invert(1)`) to maintain contrast and elegance.
- Refined the PRO channel cards (in the header and schedule panel) by using a pure white background for the logo and frequency container, ensuring maximum contrast and readability for black frequency text.
- Implemented dynamic accent colors across the public Info Board based on the currently active PRO channel, applied smoothly using CSS variables and root context injection.
- Redesigned the ON AIR streaming overlay to be more minimalist, with a refined bottom gradient and cleaner layout to avoid obscuring visual content.
- Redesigned the OFF AIR fallback screen into a centered translucent card with subtle background dimming, removing the massive dark panel blocking the fallback image.
- Standardized broadcast status badges to be more rounded, compact, and perfectly integrated with dynamic channel accents.
- Refactored Info Terbaru to exclude Main Poster into a dedicated Gambar Utama management page.
- Removed the strict 4:5 aspect ratio constraint for Gambar Utama. It now automatically preserves the natural aspect ratio without cropping (`object-fit: contain`) while adding a subtle blurred backdrop of the same image to prevent empty gaps on wide/tall screens.
- Adjusted admin preview for Gambar Utama to reflect the new unconstrained display mode.
- Added settings for configurable intervals for Info Terbaru and Gambar Utama carousels.
- Enforced file upload ONLY for all image inputs across the dashboard; completely removed manual URL/path text fields for Info Terbaru, Main Poster, and Settings.
- Integrated `browser-image-compression` to automatically convert all uploaded images to WebP (max 10MB, ~82% quality, max 1920x1920) locally on the client before saving to Supabase Storage.
- Cleaned up orphan images from Storage during content replacement and deletion.
- Replaced manual fallback image path input with file upload.
- Replaced remaining mock/localStorage behavior with Supabase persistence.
- Public board and Admin preview now seamlessly consume uploaded fallback image.
- Streaming preview now consumes persisted station stream URLs and supports YouTube iframes.

### Fixed
- Fixed dashboard controls that were previously visual-only or incomplete.
- Fixed synchronization between Admin mutations and public Realtime display.
- Fixed public board crash caused by invalid or mismatched Info aspect-ratio keys.
- Added centralized aspect-ratio normalization for Supabase and Realtime data.
- Prevented Main Poster records from being rendered as Latest Info cards (fixed undefined references).
- Ensured malformed content records cannot crash the public display by adding safe fallbacks.
- Fixed Next.js Server/Client Component boundary violation by moving `mapBoardData` into a shared server-safe data mapper (`lib/board/mapper.ts`).
- Preserved server-side initial Supabase loading while allowing the client Realtime provider to reuse the same mapping logic.
- Fixed Supabase RLS policies that incorrectly attempted to create helper functions inside the protected `auth` schema.
- Added secure staff role validation through a private SECURITY DEFINER helper.
- Restricted database and Storage write operations to `admin` and `operator` roles.
- Fixed Info/Main Poster data separation using `display_type`.

### Added
- Added `profiles` table for Supabase Auth user roles.
- Added `display_type` support to distinguish Main Poster from Info Terbaru.
- Added safer repeatable/idempotent Supabase policy scripts.
- Added first-admin setup documentation.
- Supabase Database schema, row level security (RLS) policies, and seed data in `supabase/` for `stations`, `schedules`, `infos`, `running_texts`, and `settings`.
- Supabase Authentication logic, including a Login page (`/login`) for the admin dashboard and middleware to protect `/admin` routes.
- Realtime synchronization via `BoardProvider` listening to `postgres_changes`, updating the public board and all admin tabs instantly when changes are made.
- Supabase Storage support in the Info Terbaru admin panel, allowing image file uploads straight to the `rri-content` bucket.
- Stitch-inspired RRI Padang public broadcast board at `/`, optimized for 1920×1080 and 1366×768 televisions.
- Shared branding, channel badges, automatic broadcast status, channel selection, timezone-aware clock, and fullscreen control.
- Live video panel with a local studio demo clip, current-program overlay, and office-image fallback for unconfigured channels.
- Image-only main-poster carousel and a separate Info Terbaru carousel with image, title, description, and date.
- Four configurable media formats: Instagram landscape (1.91:1), Instagram portrait (4:5), widescreen landscape (16:9), and widescreen portrait (9:16).
- Compact daily schedules, timezone-aware current-program highlighting, and overnight schedule handling.
- Animated running ticker with ordered active messages and reduced-motion support.
- Admin dashboard and routes for streaming, schedule CRUD, Info Terbaru CRUD, read-only broadcast monitoring, running-text CRUD, and settings.
- Typed mock defaults in `data/` and a small validated localStorage store with same-tab and cross-tab updates, safe defaults, and session-only fallback when storage fails.
- Organized reference assets in `public/images/`, a generated local demo video, and reusable board/admin components.
- Playwright coverage for display sizes, image ratios, stream states, admin routes, CRUD persistence, cross-tab synchronization, storage failure, and overnight schedules.
- Repository instructions requiring changelog updates in every implementation session.

### Changed

- Replaced the Next.js starter screen with the broadcast UI while retaining App Router, TypeScript, and Tailwind 4.
- Applied DESIGN.md navy, RRI blue, orange, and channel design tokens throughout the application.
- Bundled Geist fonts locally to remove build-time dependence on Google Fonts.
- Updated site metadata and document language for RRI Padang.
- Replaced starter documentation with prototype setup, data flow, asset provenance, and limitations.

### Fixed

- Removed the starter layout's dependency on generated `LayoutProps` during standalone TypeScript checks.
- Kept poster artwork and all image formats within their containers without stretching.
- Preserved streaming save feedback while refreshing saved form defaults.

### Scope

- Transitioned from frontend-only Phase 01 to Phase 02 Supabase Integration.
- LocalStorage store has been entirely replaced by a Supabase-powered backend setup.

### Validation
- Passed `npm run lint`, `npm run typecheck`, and `npm run build`.
- Passed six Playwright tests covering 1920×1080, 1366×768, all four media ratios, both stream states, all admin routes, CRUD persistence, cross-tab updates, read-only monitoring, storage failure, and schedule boundaries.
- Reviewed public, offline, portrait, dashboard, streaming, and form screenshots; no page overflow or browser console errors in the tested routes.
- Corrected explicit form-label associations and preserved configured aspect ratios in admin thumbnails and previews.
