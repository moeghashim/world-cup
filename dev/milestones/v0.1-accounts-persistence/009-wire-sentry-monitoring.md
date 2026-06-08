---
id: 009
title: Wire Sentry client and serverless monitoring
milestone: v0.1-accounts-persistence
category: scaffolding
priority: medium
files: ["src/monitoring.ts", "api/_lib/monitoring.ts", "src/main.tsx", "api/**/*.ts", ".env.example"]
---

## Acceptance criteria
- [ ] Client Sentry initializes only when `SENTRY_DSN` is present and does not break GA4/PostHog. (PLAN §12: Monitoring, Analytics)
- [ ] Serverless handlers capture unexpected errors through server-side Sentry setup. (PLAN §3 Monitoring)
- [ ] Sentry does not capture raw auth tokens, session cookie values, or shipping-address-shaped data. (PRD cross-cutting: Security)
- [ ] Build remains clean without a DSN. (PLAN §7: secrets server-side only)

## Suggested approach
Use the provisioned `SENTRY_DSN`. In Vite, expose only the browser-safe DSN if
needed through the exact Stripe Projects name or a documented Vite-safe mapping.
Keep server error capture in `api/_lib/monitoring.ts` and sanitize request
metadata before capture.
