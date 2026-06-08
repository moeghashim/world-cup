---
id: 005-fix-layout-rtl-and-bracket
title: Fix layout, RTL logo, and desktop bracket
status: done
files:
  - "src/floodlights/components/BrandLogo.tsx"
  - "src/floodlights/styles/site.css"
  - "src/floodlights/styles/home.css"
  - "src/floodlights/styles/pickem.css"
  - "src/floodlights/pages/PickemPage.tsx"
---

## Acceptance Criteria

- [x] Arabic RTL header logo no longer overlaps the `2026` wordmark in dark or
  light theme.
- [x] Homepage and inner pages use one desktop content width system.
- [x] Desktop knockout bracket renders as left and right halves converging on
  the Final.
- [x] Mobile bracket remains single-column or horizontally scrollable.
- [x] RTL and both themes are preserved.
