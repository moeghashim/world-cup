---
id: 001-verify-vendor-openfootball-data
title: Verify and vendor openfootball 2026 data
status: planned
files: ["db/openfootball/worldcup-2026.json", "dev/open-questions.md", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Verify openfootball contains World Cup 2026 data with 104 fixtures.
- [x] Verify the group stage contains 12 groups, 72 group fixtures, and 48
  actual teams.
- [x] Vendor the source JSON under a server-side path that the client cannot
  import at runtime.
- [x] Record the source URL, license, and verification counts in docs.

## Notes

Do not fabricate missing teams or fixtures. If the dataset becomes incomplete,
record the blocker and use the milestone autonomy rule only if a sensible
non-destructive default exists.
