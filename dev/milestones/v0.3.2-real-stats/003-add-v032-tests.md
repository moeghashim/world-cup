---
id: 003-add-v032-tests
title: Add v0.3.2 real stats tests
status: done
files:
  - "tests/v0.3.2-real-stats.test.ts"
  - "package.json"
---

## Acceptance Criteria

- [x] `package.json` exposes `npm run test:v0.3.2`.
- [x] Synthetic rows assert exact players, hostsJoined, champion percentages,
  R32 favourite percentages, and sample bracket shapes.
- [x] Zero/low-data fixtures assert empty states and no NaN/divide-by-zero.
- [x] Serialized API-shape output contains no email, Auth0 ID, or raw user ID.
