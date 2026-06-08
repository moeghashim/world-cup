# v0.4 Live Results + Scoring

v0.4 adds cached live-result ingestion and real standings. Clients continue to
read only our APIs; provider keys stay server-side. The milestone does not alter
auth, host membership, bracket structure, prizes, compliance, or the v0.3.2
community-stats endpoint.

Tasks:

- `001-add-live-results-schema`
- `002-add-provider-interface`
- `003-add-cron-cache-routes`
- `004-add-scoring-engine`
- `005-surface-standings`
- `006-add-v04-tests`
- `007-run-v04-chrome-qa-and-pr`
