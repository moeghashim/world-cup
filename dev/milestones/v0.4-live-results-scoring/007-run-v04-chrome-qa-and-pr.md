---
id: 007-run-v04-chrome-qa-and-pr
title: Run v0.4 QA and open PR
status: done
files:
  - "tests/e2e/v0.4-chrome-qa.md"
  - "BUILD_BLOG.md"
  - "AGENTS.md"
---

## Acceptance Criteria

- [x] Chrome QA records host points, profile points, attribution, language/RTL,
      theme spot-checks, and console status.
- [x] Screenshots are saved under `tests/e2e/screenshots/v0.4/`.
- [x] Full verification gate passes, including `npx vercel build` and
      `npm run db:apply`.
- [x] `BUILD_BLOG.md` and non-governance `AGENTS.md` build log sections are
      updated with the latest estimate and implementation log.
- [x] One PR is opened for the milestone and is not merged.
