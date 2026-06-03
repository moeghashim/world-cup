# PostHog Product Analytics Setup

## Project Fit

- Target: `winworldcup2026.com` World Cup Predictor app.
- Framework: Vite + React + TypeScript.
- Region: US.
- Active Projects.dev/PostHog project resource: `WorldCup`.
- Dashboard to build in PostHog: `WorldCup - Prediction Performance`.

The store prompt maps to this product as a prediction and reward funnel, not an e-commerce cart funnel.

## Environment

Use only browser-safe public values in Vite:

```bash
VITE_POSTHOG_KEY=your_project_api_key
VITE_POSTHOG_HOST=https://us.posthog.com
```

`VITE_POSTHOG_KEY` is required for capture. Without it, the app is fully inert for PostHog: no initialization, no capture calls, and no console errors. The personal API key must stay server-side and must not be committed.

Projects.dev created the PostHog resource as `WorldCup`, with redacted credentials exposed through the resource env names `WORLDCUP_API_KEY`, `WORLDCUP_HOST`, and `WORLDCUP_PERSONAL_API_KEY`. Map only the browser-safe project API key and host into the Vite public variables above. Keep the personal API key server-side.

After changing `VITE_*` values, restart the dev server or trigger a fresh production build because Vite reads public env at build time.

## Implementation

- `posthog-js` is installed.
- `src/analytics.ts` initializes PostHog once when `VITE_POSTHOG_KEY` exists.
- PostHog uses `api_host: '/ingest'` and `ui_host: VITE_POSTHOG_HOST || 'https://us.posthog.com'`.
- Pageviews are automatic with `capture_pageview: 'history_change'`.
- Page leaves are automatic with `capture_pageleave: true`.
- Person profiles are `identified_only`.
- Session replay is not enabled here; enable it only after privacy and consent copy are approved.

## First-Party Proxy

Vite dev proxy:

- `/ingest/static/*` -> `https://us-assets.i.posthog.com/static/*`
- `/ingest/*` -> `https://us.i.posthog.com/*`

Vercel production rewrites mirror the same proxy paths, with `skipTrailingSlashRedirect: true`.

## Events

Automatic:

- `$pageview`
- `$pageleave`

Custom events wired to real interaction points:

- `prediction_cta_clicked`
- `prize_cta_clicked`
- `sponsor_cta_clicked`
- `team_selected`
- `prize_detail_viewed`
- `prediction_started`
- `score_changed`
- `prediction_locked`
- `draw_entry_created`
- `draw_revealed`
- `winner_selected`
- `fulfillment_queued`
- `review_prompt_sent`

Core funnel:

1. `$pageview`
2. `prediction_started`
3. `prediction_locked`
4. `draw_entry_created`
5. `draw_revealed`
6. `fulfillment_queued`

## Dashboard Tiles

If the PostHog MCP is connected, create the dashboard programmatically. Otherwise create it manually in PostHog:

1. Open PostHog: `https://us.posthog.com/`
2. Select the `WorldCup` project.
3. Create dashboard: `WorldCup - Prediction Performance`.
4. Use a 30-day window.
5. Add an internal/test-user filter when test identities are available.

Tiles:

- Conversion funnel: `$pageview`, `prediction_started`, `prediction_locked`, `draw_entry_created`, `draw_revealed`, `fulfillment_queued`.
- Top supporter teams selected: breakdown `team_selected` by `team_name`.
- Prediction locks by match: breakdown `prediction_locked` by `match_id`.
- Draw reveals over time: trend `draw_revealed`.
- Fulfillment queue over time: trend `fulfillment_queued`.
- Traffic: page views and unique visitors.
- Sponsor CTA clicks: trend and breakdown of `sponsor_cta_clicked` by `cta`.

Custom-event tiles will read "no events" until real users trigger those actions. Do not fabricate analytics numbers.

## Verification

Without `VITE_POSTHOG_KEY`, verify inert behavior:

```bash
npm run lint
npm run build
npm ls posthog-js
```

With `VITE_POSTHOG_KEY` set, restart the dev server and verify:

1. Load `http://127.0.0.1:5173/`.
2. Confirm `/ingest/array/<key>/config.js` returns `200`.
3. Confirm event POSTs to `/ingest/.../e/` return `200`.
4. Trigger:
   - choose a team
   - change a score
   - lock a prediction
   - run a draw
   - queue fulfillment
5. Confirm events appear in PostHog Activity Live for `WorldCup`.

For production, add `VITE_POSTHOG_KEY` to the host production environment, trigger a fresh deploy, and repeat the `/ingest` and Activity Live verification on the live domain.
