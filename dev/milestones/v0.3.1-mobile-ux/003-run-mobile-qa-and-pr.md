---
id: 003-run-mobile-qa-and-pr
title: Run mobile QA and open PR
status: done
files:
  - "tests/e2e/v0.3.1-mobile-qa.md"
  - "tests/e2e/screenshots/v0.3.1/*"
  - "AGENTS.md"
  - "BUILD_BLOG.md"
---

## Acceptance Criteria

- [x] `npm run test:e2e` passes at 360px and 390px across all listed pages.
- [x] `npm run lint`, `npm run build`, `npm run test:v0.1`,
  `npm run test:v0.2`, and `npm run test:v0.3` pass.
- [x] Manual evidence is recorded in `tests/e2e/v0.3.1-mobile-qa.md`.
- [x] Before/after screenshots cover home header closed and menu open on mobile.
- [x] QA evidence covers English and Arabic/RTL, dark and light themes.
- [x] `AGENTS.md` and `BUILD_BLOG.md` include one implementation log line and
  refreshed token/cost estimate.
- [x] One PR is opened for Claude review and Moe merge authority; it is not
  merged by Codex.
