---
id: 001-add-mobile-playwright-harness
title: Add mobile Playwright harness
status: done
files:
  - "package.json"
  - "package-lock.json"
  - "playwright.config.ts"
  - "tests/e2e/mobile.spec.ts"
---

## Acceptance Criteria

- [x] `@playwright/test` is installed as a dev dependency.
- [x] `playwright.config.ts` defines a mobile Chromium project using a mobile
  device descriptor and starts `npm run dev` at `http://localhost:5173`.
- [x] `package.json` exposes `npm run test:e2e` without adding it to the default
  unit-test gate.
- [x] The setup documents that CI must run
  `npx playwright install --with-deps chromium` before `npm run test:e2e`.
- [x] `tests/e2e/mobile.spec.ts` covers `/`, `/pickem`, `/brackets`, `/hosts`,
  `/profile`, and `/h/does-not-exist` at 360px and 390px widths.
- [x] The mobile tests assert no horizontal scroll, in-viewport burger,
  menu-open visibility for all seven primary nav links, and menu close after
  nav-link navigation.
- [x] The suite is confirmed red against the current mobile header bug before
  applying the layout fix.
