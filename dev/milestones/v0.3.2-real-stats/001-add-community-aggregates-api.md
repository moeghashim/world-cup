---
id: 001-add-community-aggregates-api
title: Add community aggregates API
status: done
files:
  - "api/data/community.ts"
  - "api/_lib/community-stats.ts"
  - "db/types.ts"
---

## Acceptance Criteria

- [x] `GET /api/data/community` returns a cached read-only response using the
  same cache-then-serve posture as `/api/data/fixtures`.
- [x] Aggregates are computed from existing tables only; no migration is added.
- [x] `players` counts users with at least one locked bracket, group pick, or
  score prediction.
- [x] `bracketsLocked` counts locked brackets.
- [x] `hostsJoined` counts distinct host member user IDs.
- [x] `championDistribution` is the top eight locked-bracket champion picks plus
  `Other`.
- [x] `r32Consensus` returns per-R32 favourite percentages from locked brackets.
- [x] `communityBrackets` returns handle-only public samples with champion and
  a few picks.
- [x] Response serialization contains no email, Auth0 ID, or raw user ID.
