---
id: 001-add-result-winner-schema
title: Add result winner schema
status: done
files:
  - "db/migrations/007_result_winner.sql"
  - "db/schema.sql"
  - "db/types.ts"
---

## Acceptance Criteria

- [x] Add an additive idempotent migration for `results.winner`.
- [x] Restrict stored winner values to `home`, `away`, or null.
- [x] Include migration 007 in schema replay order after migration 006.
- [x] Add the winner field to the typed result row.
