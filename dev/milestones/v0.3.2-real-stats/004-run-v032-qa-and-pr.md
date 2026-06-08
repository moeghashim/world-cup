---
id: 004-run-v032-qa-and-pr
title: Run v0.3.2 QA and open PR
status: done
files:
  - "tests/e2e/v0.3.2-stats-qa.md"
  - "tests/e2e/screenshots/v0.3.2/*"
  - "AGENTS.md"
  - "BUILD_BLOG.md"
---

## Acceptance Criteria

- [x] `npm run lint`, `npm run test:v0.1`, `npm run test:v0.2`,
  `npm run test:v0.3`, `npm run test:v0.3.2`, and `npm run build` pass.
- [x] Manual QA evidence covers home, brackets, and sponsors stats.
- [x] Manual screenshots cover English and Arabic/RTL real or empty-state
  numbers.
- [x] `AGENTS.md` and `BUILD_BLOG.md` include one implementation log line and
  refreshed token/cost estimate.
- [x] One PR is opened for Claude review and Moe merge authority; it is not
  merged by Codex.
