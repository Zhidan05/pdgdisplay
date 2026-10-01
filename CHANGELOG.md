# Changelog

## [Unreleased]

### Changed — 2026-10-01 09:34 WIB
- Refined the `Jadwal Hari Ini` card by improving visual separation between PRO 1, PRO 2, and PRO 4 schedule groups for better readability.
- Preserved the rule that each PRO section displays a maximum of two nearest schedule items.

### Fixed — 2026-10-01 09:29 WIB
- Fixed the public top-bar display-only PRO 3 card so its `88.4 FM` frequency label is rendered consistently beneath the logo like the other PRO channels.

### Changed — 2026-10-01 09:24 WIB
- Refined the public top-bar PRO channel cards so their interior area is fully white, removing the visible blue inner gaps and normalizing logo proportions across PRO 1, PRO 2, PRO 3, and PRO 4.
- Adjusted the display-only PRO 3 top-bar presentation so it no longer appears visually oversized while remaining non-interactive.

### Added — 2026-10-01 09:19 WIB
- Added RRI PRO 3 branding to the public header using `/images/rri/pro3.png` as a non-interactive display-only channel identity.

### Changed — 2026-10-01 09:19 WIB
- Increased the next-prayer countdown typography beneath Info Terbaru so it remains only slightly smaller than the section heading for improved TV readability.

### Added — 2026-10-01 09:11 WIB

- Added a realtime next-prayer countdown beneath Info Terbaru using local Adhan.js calculations with fixed Kota Padang coordinates.
- Added automatic WIB-aware prayer transitions through Subuh, Dzuhur, Ashar, Maghrib, Isya, and the following day's Subuh without geolocation or external prayer APIs.

### Fixed — 2026-09-30 20:51 WIB

- Fixed missing mobile Admin navigation trigger when the persistent desktop sidebar is hidden.
- Added a visible hamburger button that opens the existing off-canvas Admin navigation drawer on phone and tablet layouts.
- Aligned mobile drawer and desktop sidebar breakpoints to prevent navigation from becoming inaccessible.

### Changed — 2026-09-30 20:40 WIB

- Moved the public header timezone label "WIB" to the right side of the clock for a cleaner single-line time display.

### Changed — 2026-09-30 20:37 WIB

- Increased public header date and clock typography for improved readability on the fullscreen TV display without changing the established layout.

### Fixed — 2026-09-30 20:07 WIB

- Fixed Gambar Utama container geometry so the rendered poster remains true 4:5 instead of inheriting an arbitrary center-column ratio.
- Prioritized the 1920×1080 fullscreen digital-signage layout and made surrounding columns adapt around the poster.
- Fixed fullscreen/windowed reflow differences while preserving the fixed 4:5 Main Poster ratio.

### Changed — 2026-09-30 20:03 WIB

- Removed the boxed/card treatment from the public header date and clock, keeping them as balanced side-by-side information blocks.
- Simplified PRO identity headers inside Jadwal Hari Ini by displaying channel logos and frequencies directly without white containers.

### Added — 2026-09-30 19:50 WIB
- Added `addressLine1` and `addressLine2` to Settings, allowing the public header to display the RRI address in 2 lines instead of "RRI PADANG / INFO BOARD".
- Implemented `react-easy-crop` in the Admin Gambar Utama panel to strictly enforce a 4:5 (Instagram Portrait) aspect ratio, ensuring no blank spaces or letterboxes on the public board.
- Updated Today Schedule to display all 3 PRO channels (PRO 1, PRO 2, PRO 4) simultaneously on the public board, each showing a maximum of 2 upcoming/current programs.

### Changed — 2026-09-30 19:50 WIB
- Changed the public board header Date and Time layout to two vertically aligned sibling blocks of equal visual weight.
- Enforced `aspect-ratio: 4/5` and `object-fit: cover` on the Main Poster display, removing the blurred backdrop and duplicate image strategy.

### Fixed — 2026-09-30 19:37 WIB
- Fixed functional broadcast motion being disabled on systems reporting `prefers-reduced-motion: reduce`.
- Running Text now continues moving on dedicated display systems while respecting reduced decorative transitions.
- Gambar Utama and Info Terbaru auto-rotation now remain active regardless of OS reduced-motion preference.
- Fixed auto-rotation interval using `setTimeout` with reset on manual selection.
### Fixed — 2026-09-30 16:20 WIB
- Fixed Supabase-managed images failing to render on Vercel by adding the Supabase Storage hostname to Next.js `remotePatterns` configuration.
- Prevented potential memory leaks by ensuring temporary browser `blob:` URLs are properly revoked when image preview forms unmount or new files are selected.
- Replaced the missing static `/images/fallback/office.jpg` image with a robust UI placeholder to prevent broken-image icons when remote media fails to load.

### Fixed — 2026-09-30 16:07 WIB
- Fixed Dashboard station previews incorrectly showing the obsolete `sensors` placeholder despite valid Supabase stream URLs.
- Unified Dashboard stream source parsing with the Streaming and Public Board data flow using `getStreamSource`.
- Added lightweight YouTube thumbnail previews for configured station streams while keeping Dashboard previews muted/non-autoplay.
- Handled YouTube shorts URL parsing by adding support for `shorts/` in `lib/media-utils.ts`.
- Preserved fallback images exclusively for stations without configured stream URLs.

### Fixed — 2026-09-30 16:01 WIB
- Fixed `/admin/streaming` crashing with `Missing AudioProvider` when rendering stream previews.
- Decoupled Admin stream previews from the public broadcast AudioProvider by introducing `mode="broadcast" | "preview"` logic for players.
- Introduced `useOptionalAudio` to ensure local stream components degrade gracefully without requiring the global context.
- Preserved global broadcast audio control exclusively for the public Info Board.
- Ensured multiple Admin stream preview cards initialize muted automatically without modifying public audio preferences.
- Allowed Admin stream previews to seamlessly preview stream URL drafts dynamically before persisting to the database.

### Fixed — 2026-09-30 15:52 WIB
- Refactored Jadwal Program to support selecting multiple days per schedule using a `smallint[]` representation instead of a single string.
- Replaced the single "Hari siaran" dropdown with a checkbox group and useful presets (Senin-Jumat, Akhir Pekan, Setiap Hari).
- Implemented robust conflict prevention at both the client-side (React) and database-side (PostgreSQL Trigger) levels.
- Fixed conflict overlap logic to safely and accurately handle overnight schedules (e.g., 23:00 - 02:00 spilling over to the next day).
- Handled PostgreSQL schema migration ensuring seamless data mapping to array types while retaining existing properties safely.

### Fixed — 2026-09-30 15:38 WIB
- Fixed stream player sizing so live content perfectly fills the available media container without unintended application-level gaps.
- Removed stale references to the deprecated `studio` fallback and standardized fallback resolution through the current Supabase setting.
- Fixed global broadcast audio synchronization so mute/unmute UI state reflects the active player's actual state.
- Prevented autoplay retry logic from overriding an explicit user mute.
- Secured stale player references and cleanup routines during channel and Realtime source changes.

### Fixed — 2026-09-30 15:29 WIB
- Fixed a runtime `NotFoundError` caused by conflicting YouTube player teardown and React DOM reconciliation during PRO channel switching.
- Stabilized player lifecycle when switching between YouTube streams, OFF AIR states, and Realtime stream updates.
- Prevented duplicate/stale player cleanup from attempting to remove already-detached DOM nodes.
- Preserved broadcast audio preference during channel transitions.
- Reused YouTube player instances when both the old and new sources are YouTube videos by utilizing `player.loadVideoById`, eliminating unnecessary mounting and unmounting.

### Changed
- Simplified the live stream overlay by removing the large program title, presenter name, and ON AIR badge.
- Moved the live broadcast indicator into the channel identity block beneath the PRO logo.
- Replaced the “SIARAN LANGSUNG” label with a compact “LIVE” indicator.
- Changed broadcast audio startup strategy to prefer audible autoplay and only fall back to muted playback when required by browser policy.
- Audio preference now defaults to enabled for the dedicated RRI Info Board environment.
- Preserved preferred audio state across channel switching, player recreation, and Realtime stream updates.

### Added
- Added graceful autoplay-block detection and automatic muted fallback for both HTML and YouTube players.
- Added automatic sound retry after a valid user interaction when audible autoplay was blocked.
- Added optional dedicated-display browser autoplay deployment guidance.
- Functional Supabase Storage upload flow for dynamic board images (Infos, Posters, Fallback).
- Reusable image upload utility `lib/media-utils.ts` and `URL.createObjectURL()` previews.
- YouTube URL parsing and embed preview for streaming channels.
- End-to-end dashboard CRUD operations fully connected to Supabase Database.
- Consistent save/loading/error feedback across all admin forms.


- Removed the white background container from the PRO channel logo exclusively within the stream overlay (`.live-top`), replacing it with a drop-shadow so the logo remains visible without obscuring the video.
- Synchronized the streaming overlay title strictly with the currently active schedule. The title (and presenter) will now only appear if a matching schedule exists for the selected channel and current time, removing the hardcoded fallback "Bersama RRI Padang" to ensure absolute data accuracy.
- Drastically simplified the stream overlay for both ON AIR and OFF AIR states by stripping away heavy translucent background panels and dim layers, relying instead on clean typography with crisp text-shadows and ultra-light bottom gradients. This maximizes the visibility of the stream/poster content.
- Replaced the generic radio icon on the OFF AIR overlay with the official RRI logo, treated with a white monochrome filter (`brightness(0) invert(1)`) to maintain contrast and elegance.
- Refined the PRO channel cards (in the header and schedule panel) by using a pure white background for the logo and frequency container, ensuring maximum contrast and readability for black frequency text.
- Implemented dynamic accent colors across the public Info Board based on the currently active PRO channel, applied smoothly using CSS variables and root context injection.
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
