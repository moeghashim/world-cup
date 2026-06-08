---
id: 007-add-v02-tests
title: Add v0.2 data and lock tests
status: planned
files: ["tests/v0.2-real-tournament-data.test.ts", "package.json", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Integration test validates the seed parser counts: 48 teams, 12 groups,
  72 group fixtures, and 104 total fixtures.
- [x] Unit/API tests verify past-kickoff group and score-prediction writes are
  rejected.
- [x] Unit/API tests verify upcoming fixture writes still pass.
- [x] Unit/API tests verify bracket writes reject after the first tournament
  kickoff.
- [x] Existing v0.1 tests, lint, and build keep passing.

## Notes

Use deterministic test clocks. Do not depend on current wall-clock date in tests.
