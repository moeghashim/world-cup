# PostHog Setup

## Project

- Product: `winworldcup2026.com`
- PostHog region: US
- Projects.dev resource name: `WorldCup`
- Runtime host: `https://us.posthog.com`

## Environment

Use browser-safe Vite variables only:

```bash
VITE_POSTHOG_KEY=your_project_api_key
VITE_POSTHOG_HOST=https://us.posthog.com
```

The personal API key must stay server-side and must not be committed.

When `VITE_POSTHOG_KEY` is empty, the app is inert for PostHog: no init, no
capture calls, and no console errors.

## Implementation

- `posthog-js` is installed.
- `src/analytics.ts` initializes PostHog once when `VITE_POSTHOG_KEY` exists.
- PostHog uses `api_host: '/ingest'`.
- Pageviews use `capture_pageview: 'history_change'`.
- Page leaves use `capture_pageleave: true`.
- Person profiles are `identified_only`.
- Session replay is not enabled.

## First-Party Proxy

Vite dev proxy:

- `/ingest/static/*` -> `https://us-assets.i.posthog.com/static/*`
- `/ingest/*` -> `https://us.i.posthog.com/*`

Vercel production rewrites mirror the same paths in `vercel.json`.

## Verification

Without `VITE_POSTHOG_KEY`, verify inert behavior:

```bash
npm run lint
npm run build
```

With `VITE_POSTHOG_KEY` set, restart the dev server and verify:

1. Load `http://127.0.0.1:5173/`.
2. Confirm `/ingest/array/<key>/config.js` returns `200`.
3. Confirm event POSTs to `/ingest/.../e/` return `200`.
4. Confirm events appear in PostHog Activity Live for `WorldCup`.
