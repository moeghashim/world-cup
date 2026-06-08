---
id: 006-add-v04-tests
title: Add v0.4 tests
status: done
files:
  - "tests/v0.4-live-results-scoring.test.ts"
  - "package.json"
---

## Acceptance Criteria

- [x] `npm run test:v0.4` exists.
- [x] Tests cover scorer idempotency.
- [x] Tests cover exact knockout and group-winner math.
- [x] Tests prove score predictions do not award points.
- [x] Tests cover both provider adapter normalizations and env provider swap.
- [x] Tests cover cache-only client reads.
- [x] Tests assert no PII in `/api/standings`.
