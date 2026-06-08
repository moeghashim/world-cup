---
id: 004-add-fixtures-api-cache
title: Add tournament fixtures API cache
status: planned
files: ["api/data/fixtures.ts", "api/_lib/tournament-data.ts", "scripts/dev-api.ts", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Add `GET /api/data/fixtures`.
- [x] Return teams, groups, matches, lock metadata, and source metadata from
  Neon/cache.
- [x] Provide a static-backed fallback only when Neon is unavailable, with an
  explicit fallback marker.
- [x] Do not expose provider URLs as a runtime dependency for clients.
- [x] Wire the local dev API shim for `/api/data/fixtures`.

## Notes

Clients read our API/cache. They must not fetch openfootball directly at
runtime.
