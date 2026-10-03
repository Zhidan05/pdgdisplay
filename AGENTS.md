# Repository instructions

- Read `DESIGN.md` completely before implementing UI changes. Keep `stitch-reference/` as visual reference.
- Update `CHANGELOG.md` during every implementation session. You MUST follow an APPEND-ONLY policy for the changelog: never delete, merge, or overwrite old entries. Every new changelog update MUST include the exact date, time, and timezone in WIB (e.g., `### Fixed — YYYY-MM-DD HH:mm WIB`) appended under `[Unreleased]`.
- Phase 1 is frontend only: typed mock defaults and simple localStorage persistence. Do not add authentication, database infrastructure, or manual ON AIR/OFF AIR controls.
- The current product requirements override the older Info Terbaru categories/ratios in `DESIGN.md`: no categories; use Instagram landscape (1.91:1), Instagram portrait (4:5), widescreen landscape (16:9), and widescreen portrait (9:16).
- Keep main posters image-only on the public board. Broadcast status is derived from stream URL availability.
- Run lint, TypeScript validation, production build, and relevant browser checks. Report only checks actually executed.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
