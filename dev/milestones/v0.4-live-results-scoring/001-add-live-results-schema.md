---
id: 001-add-live-results-schema
title: Add live results and standings schema
status: done
files:
  - "db/migrations/006_live_results_scoring.sql"
  - "db/schema.sql"
  - "db/types.ts"
---

## Acceptance Criteria

- [x] Migration `006_live_results_scoring.sql` is additive and idempotent.
- [x] `results` stores one cached result per match, keyed to `matches.id`.
- [x] `standings` stores one computed standing per user, keyed to `users.id`.
- [x] `db/schema.sql` includes migration 006 after migration 005.
- [x] `db/types.ts` includes typed rows for results and standings.
- [x] No prior migration is rewritten.
