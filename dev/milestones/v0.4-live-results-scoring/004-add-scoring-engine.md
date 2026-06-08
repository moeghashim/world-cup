---
id: 004-add-scoring-engine
title: Add idempotent scoring engine
status: done
files:
  - "api/_lib/scoring.ts"
---

## Acceptance Criteria

- [x] Scoring is pure and unit-testable with synthetic picks/results.
- [x] Knockout advancement awards only R32 10, R16 20, QF 40, SF 80, Final 160.
- [x] Group picks award only flat correct-winner points.
- [x] Score predictions do not award points in v0.4.
- [x] Re-running the scorer on the same inputs yields identical standings.
- [x] Database writes replace standings idempotently.
