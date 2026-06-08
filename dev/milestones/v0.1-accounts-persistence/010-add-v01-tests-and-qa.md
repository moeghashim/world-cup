---
id: 010
title: Add v0.1 tests and Chrome QA evidence
milestone: v0.1-accounts-persistence
category: tests
priority: medium
files: ["package.json", "src/floodlights/**/*.test.ts", "api/**/*.test.ts", "tests/e2e/*.md", "README.md"]
---

## Acceptance criteria
- [ ] WorkOS callback/session handling, handle validation, pick payload validation, and migration behavior have unit or smoke coverage. (PRD S1 acceptance criteria)
- [ ] Tests assert that non-auth pick APIs do not return email or token/session fields. (PRD S1: no email/token in non-auth API response)
- [ ] `npm run lint`, `npm run build`, and the v0.1 test command pass locally. (Workflow test floor)
- [ ] Chrome E2E QA covers WorkOS sign-in, play-to-lock gate, handle-at-first-sign-in, anonymous-pick migration, persistence across reload/fresh session, and `/profile` in English + Arabic and both themes. (User workflow update)

## Suggested approach
Use mocked WorkOS/Neon where needed for automated tests. Run real-browser QA
against the local or preview app after env pull. Record pass/fail and evidence
in the milestone PR body.
