---
id: 002-wire-real-stats-ui-and-i18n
title: Wire real stats UI and i18n
status: done
files:
  - "src/floodlights/pages/HomePage.tsx"
  - "src/floodlights/pages/BracketsPage.tsx"
  - "src/floodlights/pages/SponsorsPage.tsx"
  - "src/floodlights/i18n/dictionaries.ts"
  - "src/floodlights/lib/communityStats.ts"
---

## Acceptance Criteria

- [x] Home page player, joined, and champion-distribution figures come from the
  community stats API or explicit low-data fallback state.
- [x] Home prize winners remains a named prize-config constant, not a fake stat.
- [x] Brackets ticker, hero stat, champion distribution, R32 consensus, and
  community samples use the API response or tiny fallback state.
- [x] Sponsors stat tiles replace fabricated `players` and `views` with real
  `players` and `bracketsLocked`.
- [x] Legacy sample audience, view, joined, and distribution constants are removed
  from active UI copy.
- [x] Embedded-number dictionary strings use interpolation across English,
  Spanish, French, Portuguese, and Arabic.
- [x] Zero/low-data states render tasteful copy without NaN or divide-by-zero.
