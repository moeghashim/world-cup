---
id: 002-add-provider-interface
title: Add pluggable live-results provider interface
status: done
files:
  - "api/_lib/live-results.ts"
  - "dev/open-questions.md"
---

## Acceptance Criteria

- [x] `fetchResults()` returns normalized results behind one interface.
- [x] `LIVE_RESULTS_PROVIDER=football-data` is the default.
- [x] `LIVE_RESULTS_PROVIDER=api-football` swaps to the alternate adapter
      without UI or scoring changes.
- [x] Provider keys are read server-side only.
- [x] Build and tests pass without live provider keys by using mocks/fallbacks.
- [x] Football-data.org free-tier WC coverage is checked and documented.
