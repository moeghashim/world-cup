---
id: 002-wire-provider-winner-cache-scoring
title: Wire provider winner data through cache and scorer
status: done
files:
  - "api/_lib/live-results.ts"
  - "api/_lib/results-cache.ts"
  - "api/_lib/scoring.ts"
---

## Acceptance Criteria

- [x] Normalize football-data `score.winner` to `home`/`away`/null.
- [x] Normalize api-football team winner booleans to `home`/`away`/null.
- [x] Fall back to penalty and score comparison when api-football booleans are absent.
- [x] Persist cached winners in result inserts and conflict updates.
- [x] Score knockout advancement from `result.winner` before falling back to score comparison.
- [x] Leave group-stage draw handling and non-penalty knockout scoring unchanged.
