# Live Integration Baseline

This repo has been reset to a clean product slate, but the live integration
plumbing remains in place for the next build.

## Kept

- Vercel project state in the ignored `.vercel/` directory.
- Stripe Projects state in the ignored `.projects/` directory.
- Local environment files such as `.env` and `.env.local`; these are ignored and
  were not removed by the reset.
- Google Analytics GA4 tag `G-RFPJRPKYQR` in `index.html`.
- Runtime analytics fallback in `src/analytics.ts`.
- PostHog `posthog-js` dependency with env-gated initialization.
- First-party PostHog proxy rewrites in `vercel.json` and `vite.config.ts`.
- Browser-safe env placeholders in `.env.example`.
- Minimal Vercel health endpoint at `/api/health`.

## Current Env Surface

```bash
VITE_GA_MEASUREMENT_ID=G-RFPJRPKYQR
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://us.posthog.com
PRIMARY_DB_CONNECTION_STRING=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_SPONSOR_PRICE_GLOBAL=
STRIPE_SPONSOR_PRICE_WEBSITE=
STRIPE_SPONSOR_PRICE_MATCHDAY=
STRIPE_SPONSOR_PRICE_FAN=
```

Keep personal API keys and server-side secrets out of git. PostHog capture stays
fully inert until `VITE_POSTHOG_KEY` is present.
