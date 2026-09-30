# Repository instructions

- Read `DESIGN.md` completely before implementing UI changes. Keep `stitch-reference/` as visual reference.
- Update `CHANGELOG.md` during every implementation session. You MUST follow an APPEND-ONLY policy for the changelog: never delete, merge, or overwrite old entries. Every new changelog update MUST include the exact date, time, and timezone in WIB (e.g., `### Fixed — YYYY-MM-DD HH:mm WIB`) appended under `[Unreleased]`.
- Phase 1 is frontend only: typed mock defaults and simple localStorage persistence. Do not add authentication, database infrastructure, or manual ON AIR/OFF AIR controls.
- The current product requirements override the older Info Terbaru categories/ratios in `DESIGN.md`: no categories; use Instagram landscape (1.91:1), Instagram portrait (4:5), widescreen landscape (16:9), and widescreen portrait (9:16).
- Keep main posters image-only on the public board. Broadcast status is derived from stream URL availability.
- Run lint, TypeScript validation, production build, and relevant browser checks. Report only checks actually executed.
