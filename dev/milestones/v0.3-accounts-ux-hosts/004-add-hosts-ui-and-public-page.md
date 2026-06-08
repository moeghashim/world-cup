---
id: 004-add-hosts-ui-and-public-page
title: Add hosts UI and public page
status: done
files:
  - "src/App.tsx"
  - "src/floodlights/pages/HostsPage.tsx"
  - "src/floodlights/pages/HostPage.tsx"
  - "src/floodlights/components/SiteHeader.tsx"
  - "src/floodlights/components/SiteFooter.tsx"
  - "src/floodlights/styles/hosts.css"
  - "src/floodlights/i18n/dictionaries.ts"
---

## Acceptance Criteria

- [x] A user can create a host instantly and see a public `/h/:slug`, join link,
  scannable QR, and typeable code.
- [x] A user can join by link, QR route, or code and remain in multiple hosts.
- [x] `/h/:slug` shows member count, most-picked champion, consensus, and a
  handle-only leaderboard.
- [x] Host pages honor the existing language, RTL, and theme system.
