---
id: 003-gate-home-match-prediction-lock
title: Gate home match prediction lock
status: planned
files:
  - "src/floodlights/pages/HomePage.tsx"
  - "src/floodlights/lib/accountMigration.ts"
  - "src/floodlights/lib/accountTypes.ts"
  - "src/floodlights/i18n/dictionaries.ts"
  - "tests/v0.3-accounts-ux-hosts.test.ts"
---

## Acceptance Criteria

- [ ] Home `Lock my prediction` opens the same Auth0 email-code gate when signed
  out.
- [ ] After sign-in and handle setup, the anonymous home match prediction is
  persisted to `/api/picks/predict`.
- [ ] Existing Pick'em anonymous migration still runs for bracket and group
  picks.
- [ ] Locked home prediction state survives reload from the account API.
