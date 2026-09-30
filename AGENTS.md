# Repository instructions

- Read `DESIGN.md` completely before implementing UI changes. Keep `stitch-reference/` as visual reference.
- Update `CHANGELOG.md` during every implementation session. Document meaningful UI, component, route, behavior, and refactor changes under `[Unreleased]`.
- Phase 1 is frontend only: typed mock defaults and simple localStorage persistence. Do not add authentication, database infrastructure, or manual ON AIR/OFF AIR controls.
- The current product requirements override the older Info Terbaru categories/ratios in `DESIGN.md`: no categories; use Instagram landscape (1.91:1), Instagram portrait (4:5), widescreen landscape (16:9), and widescreen portrait (9:16).
- Keep main posters image-only on the public board. Broadcast status is derived from stream URL availability.
- Run lint, TypeScript validation, production build, and relevant browser checks. Report only checks actually executed.
