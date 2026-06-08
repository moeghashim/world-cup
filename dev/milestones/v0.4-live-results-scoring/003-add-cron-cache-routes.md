---
id: 003-add-cron-cache-routes
title: Add cron ingestion routes
status: done
files:
  - "api/cron/refresh-fixtures.ts"
  - "api/cron/poll-results.ts"
  - "api/cron/score.ts"
  - "scripts/dev-api.ts"
  - "vercel.json"
---

## Acceptance Criteria

- [x] Vercel Cron registers daily fixture refresh.
- [x] Vercel Cron registers frequent result polling.
- [x] Vercel Cron registers scoring after ingest.
- [x] Cron routes reject unauthenticated calls unless `CRON_SECRET` matches.
- [x] Polling acts only during active match windows.
- [x] Routes are safe to re-run and are available in the local dev API shim.
