---
id: 002-add-tournament-data-schema
title: Add tournament data schema
status: planned
files: ["db/migrations/*.sql", "db/types.ts", "api/_lib/tournament-data.ts", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Add or extend Neon schema for seeded `teams` and `matches`.
- [x] Team rows support stable codes, names, group, seed order, colors, and
  localized display metadata when available.
- [x] Match rows support stable IDs, match number, stage, group, teams/placeholders,
  kickoff UTC, venue, status, and raw source metadata.
- [x] Schema is idempotent and safe to reapply.

## Notes

Keep server-side DB helpers under `api/`, `db/`, or `scripts/`. Do not import
Neon or the vendored JSON into client code.
