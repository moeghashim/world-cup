---
id: 005-replace-floodlights-real-data
title: Replace Floodlights sample data with real tournament structure
status: planned
files: ["src/floodlights/data.ts", "src/floodlights/lib/*.ts", "src/floodlights/pages/*.tsx", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Replace sample teams/groups with the real 48 teams and actual 12-group
  draw.
- [x] Replace the illustrative `R32_TEMPLATE` with the real Round of 32 fixture
  structure from openfootball placeholders.
- [x] Render real fixture dates, venues, and UTC kickoffs where the UI shows
  match cards or fixture context.
- [x] Preserve anonymous play, i18n, RTL, and dark/light behavior.

## Notes

Use typed data returned by our API/cache. Avoid importing server-only dataset
files into the browser bundle.
