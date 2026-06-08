---
id: 005-surface-standings
title: Surface standings and attribution
status: done
files:
  - "api/standings.ts"
  - "api/_lib/hosts.ts"
  - "src/floodlights/pages/ProfilePage.tsx"
  - "src/floodlights/i18n/dictionaries.ts"
---

## Acceptance Criteria

- [x] `GET /api/standings` is cached, read-only, handle-only, and no-PII.
- [x] Host leaderboards read real standings points instead of `0`.
- [x] The signed-in profile shows the user's own points.
- [x] Football-data.org attribution renders when that source is active.
- [x] New copy is localized across en, es, fr, pt, and ar, with RTL intact.
- [x] No client code calls a third-party live-results provider.
