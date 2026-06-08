---
id: 006-enforce-kickoff-locks
title: Enforce kickoff locks server-side
status: planned
files: ["api/picks/group.ts", "api/picks/predict.ts", "api/picks/bracket.ts", "api/_lib/picks.ts", "api/_lib/tournament-data.ts", "BUILD_BLOG.md", "AGENTS.md"]
---

## Acceptance Criteria

- [x] Group picks reject writes for any selected match after that match's kickoff.
- [x] Score predictions reject writes after that match's kickoff.
- [x] Whole bracket writes reject after the first tournament match kickoff.
- [x] Lock errors return a clear API code/message and do not leak PII.
- [x] Client UI mirrors the lock state where feasible.

## Notes

This milestone does not add live results or scoring. Locks use scheduled
kickoff UTC only.
