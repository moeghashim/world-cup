---
id: 002-fix-mobile-header-and-prize-overflow
title: Fix mobile header and prize overflow
status: done
files:
  - "src/floodlights/components/SiteHeader.tsx"
  - "src/floodlights/styles/site.css"
  - "src/floodlights/styles/home.css"
---

## Acceptance Criteria

- [x] The standalone header CTA is hidden from the compact mobile tool row.
- [x] The same CTA remains reachable inside the open mobile dropdown menu.
- [x] At 360px and 390px widths, the logo, language picker, theme toggle, and
  burger fit without horizontal overflow.
- [x] The burger is fully in the viewport and remains tappable.
- [x] The dropdown opens full width below the header and all primary nav links
  remain visible within the viewport.
- [x] Homepage prize photo/image stays within the mobile viewport.
- [x] Desktop header behavior, RTL logo isolation, both themes, and existing
  dropdown behavior are preserved.
