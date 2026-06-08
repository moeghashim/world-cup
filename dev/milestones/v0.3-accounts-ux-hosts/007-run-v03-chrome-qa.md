---
id: 007-run-v03-chrome-qa
title: Run v0.3 Chrome QA
status: review
files:
  - "tests/e2e/v0.3-chrome-qa.md"
  - "tests/e2e/screenshots/*"
  - "BUILD_BLOG.md"
  - "AGENTS.md"
---

## Acceptance Criteria

- [x] Chrome QA covers the three UI fixes in English and Arabic RTL, dark and
  light.
- [ ] Chrome QA covers signup-on-home-match-prediction.
  - To be reviewed by Claude on the deployed/preview link. The clean Chrome gate
    reached code-entry locally, but relayed OTPs were rejected by Auth0 as
    `invalid_code`.
- [x] Chrome QA covers host create, join by link/QR/code, multi-host membership,
  and public `/h/:slug`.
- [x] Evidence is recorded in `tests/e2e/v0.3-chrome-qa.md`.
