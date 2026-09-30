# RRI Padang Info Board

Phase 1 frontend prototype built on Next.js App Router, React, TypeScript, and Tailwind 4. `DESIGN.md` defines the visual system; the original exports remain in `stitch-reference/`.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:3000 for the public board, or http://localhost:3000/admin for the admin console. No credentials are required.

## Checks

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

Browser tests start the production build on port 3100 and use installed Microsoft Edge in headless mode. Build first. Screenshots and failure traces are written to `test-results/`. To use another browser, change the Playwright `channel` option. `node scripts/create-demo.mjs` recreates the local studio demonstration using the bundled reference image and Edge.

## Routes

| Route                     | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `/`                       | Public TV board                                     |
| `/admin`                  | Overview and channel cards                          |
| `/admin/streaming`        | Station names, frequencies, stream URLs, previews   |
| `/admin/schedules`        | Channel filter and schedule CRUD                    |
| `/admin/info`             | Info/poster CRUD, format preview, display placement |
| `/admin/broadcast-status` | Read-only URL-derived status                        |
| `/admin/running-text`     | Ticker CRUD, order, and visibility                  |
| `/admin/settings`         | Identity, timezone, and fallback image              |

## Data and components

- `data/types.ts` defines station, schedule, information, ticker, and settings types.
- `lib/supabase-provider.tsx` exposes `useBoardData()` using a real-time Postgres connection via Supabase. Updates synchronize instantly across clients.
- `lib/broadcast.ts` contains stream-availability, date, and current-schedule helpers. Schedules recur daily or on a selected weekday. Overnight shows remain current into the following day.
- `components/board/` contains the header, live/fallback panel, info carousel, poster, schedule, and ticker.
- `components/admin/` contains the shared console shell, dashboard, monitoring cards, and editing forms.
- Server route files remain small; browser state and interaction live in client components.

## First Admin Setup

With Supabase Database and Auth integrated, you must manually create the first administrator account to bypass the Row Level Security policies.

1. Go to your **Supabase Dashboard**.
2. Navigate to **Authentication → Users**.
3. Create a new user (Add user).
4. Copy the new user's **UUID**.
5. Navigate to the **SQL Editor** and run the following script to assign the admin role:

```sql
INSERT INTO public.profiles (
    id,
    display_name,
    role
)
VALUES (
    '<AUTH-USER-UUID>',
    'Administrator RRI',
    'admin'
);
```

> [!NOTE]
> Ensure you have already executed `supabase/schema.sql` and `supabase/policies.sql` before inserting into the `profiles` table.

## Behavior

PRO 1 defaults to a local studio demo clip; PRO 2 and PRO 4 have empty stream URLs. ON AIR/OFF AIR is derived solely from the presence of a trimmed URL. It is not a real availability check. Clearing a URL switches to the static office fallback. Direct MP4/WebM URLs are supported; failed video loading retains the studio preview instead of displaying a broken player.

Info Terbaru supports `instagram-landscape` (1.91:1), `instagram-portrait` (4:5), `16:9`, and `9:16`. Portrait containers are narrower/taller; landscape containers are wider. Poster artwork uses containment to preserve the full image; information photos use cover without stretching. Main posters are independent image-only presentations, selected by the `main_poster` or `latest_info` display type. Multiple posters rotate every 12 seconds; information rotates every 10 seconds. Both have manual controls, and reduced-motion mode stops automatic rotation and the ticker animation.

## Assets

The logo, office, studio, cultural image, festival image, and poster were copied from the URLs embedded in the supplied Stitch exports into `public/images/`. They remain prototype reference assets, including the export's illustrative images and sample event copy; their authenticity and publication rights have not been verified. Replace them with approved high-resolution RRI assets for production. No runtime content depends on `stitch-reference/`. Geist is bundled locally through its package.

## Limitations

- External media needs connectivity and may be restricted by its host.
- YouTube embeds, HLS adapters, audio-only streaming, and stream health probes are deferred.
- Schedules do not yet validate overlapping slots; avoid overlapping shows on the same channel.
- Public layout targets landscape TV/desktop displays. Narrow public screens scroll horizontally; admin adapts to smaller screens.

Every implementation session must update `CHANGELOG.md`, as recorded in `AGENTS.md`.
