---
id: 001
title: Align provider env contracts and dependencies
milestone: v0.1-accounts-persistence
category: scaffolding
priority: high
files: ["package.json", ".env.example", "api/_lib/http.ts", "api/_lib/types.ts", "src/floodlights/lib/apiClient.ts", "src/floodlights/lib/accountTypes.ts"]
---

## Acceptance criteria
- [ ] Pull env from Stripe Projects and use exact exposed names. (PLAN §12: Credentials / env)
- [ ] Add only provisioned v0.1 runtime dependencies: WorkOS, Neon, and Sentry. (PLAN §3 Tech stack)
- [ ] Define shared account/session/pick API shapes without provider SDK imports in client code. (PRD S1: picks persist to Neon and reload after sign-in)
- [ ] Keep GA4 and PostHog initialization unchanged. (PRD cross-cutting: Analytics)

## Suggested approach
Run `stripe projects env --pull` before implementation. Use
`PRIMARY_DB_CONNECTION_STRING`, `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`,
`SENTRY_DSN`, and `WORLDCUP_*` as exposed. Add `WORKOS_COOKIE_PASSWORD` only if
the WorkOS SDK requires it and the provisioned env does not already include it.
