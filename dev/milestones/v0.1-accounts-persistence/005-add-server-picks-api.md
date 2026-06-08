---
id: 005
title: Add authenticated server-side picks APIs
milestone: v0.1-accounts-persistence
category: backend
priority: high
files: ["api/picks/bracket.ts", "api/picks/group.ts", "api/picks/predict.ts", "api/_lib/picks.ts", "src/floodlights/lib/accountTypes.ts"]
---

## Acceptance criteria
- [x] Authenticated users can save and load bracket state from Neon. (PRD S1: bracket persists to Neon and reloads after sign-in)
- [x] Authenticated users can save and load group picks from Neon. (PRD S1: group picks persist to Neon and reload after sign-in)
- [x] Authenticated users can save and load score predictions from Neon. (PRD S1: score predictions persist to Neon and reload after sign-in)
- [x] Writes fail until the user has a handle. (PRD S1: handle is required before first save)

## Suggested approach
Keep v0.1 compatible with the existing sample data and `BracketState` shape.
Use server auth for every write. Return only the current user's pick data; no
email or token/session fields belong in these responses.
