---
id: 003-add-penalty-winner-tests-and-qa
title: Add penalty winner regression tests and run verification
status: done
files:
  - "tests/v0.4-live-results-scoring.test.ts"
  - "BUILD_BLOG.md"
  - "AGENTS.md"
---

## Acceptance Criteria

- [x] Add a penalty-decided knockout scoring test for the advancing side.
- [x] Confirm the losing side receives no advancement points.
- [x] Confirm re-running the scorer remains idempotent.
- [x] Add provider adapter tests for football-data and api-football penalty winners.
- [x] Preserve existing v0.4 exact scoring math coverage.
- [x] Run the requested verification gate and record the result.
