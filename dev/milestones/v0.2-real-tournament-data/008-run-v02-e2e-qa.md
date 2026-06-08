---
id: 008-run-v02-e2e-qa
title: Run v0.2 browser E2E QA
status: planned
files: ["tests/e2e/v0.2-chrome-qa.md", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Browser QA confirms real teams/draw/fixtures with dates, venues, and UTC
  kickoffs render.
- [x] Browser/API QA confirms a past-kickoff pick is rejected.
- [x] Browser/API QA confirms an upcoming pick still works.
- [x] QA covers English + Arabic RTL and dark + light themes.
- [x] PR body includes pass/fail evidence and known caveats.

## Notes

Use Chrome skill when available. If local Chrome extensions block automation,
record that caveat and use the safest available browser-backed verification
surface.
