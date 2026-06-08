---
id: 008
title: Add localized profile page and navigation
milestone: v0.1-accounts-persistence
category: frontend
priority: medium
files: ["src/floodlights/pages/ProfilePage.tsx", "src/floodlights/components/SiteHeader.tsx", "src/floodlights/components/SiteFooter.tsx", "src/floodlights/i18n/dictionaries.ts", "src/App.tsx"]
---

## Acceptance criteria
- [x] `/profile` shows the signed-in user's email, handle, and country. (PRD S1: `/profile` shows email, handle, country)
- [x] `/profile` lets the user sign out through WorkOS logout. (PRD S1: `/profile` lets the user sign out)
- [x] Signed-out users are guided to sign in without losing anonymous picks. (PRD cross-cutting: anonymous play preserved)
- [x] The page works in all 5 languages, RTL Arabic, and both themes. (PRD S1: all languages + RTL + themes)

## Suggested approach
Reuse existing Floodlights layout, `SiteHeader`, `SiteFooter`, theme, and i18n
patterns. Do not add prize address fields in v0.1 because PLAN §12 says address
is collected only at win-time.
