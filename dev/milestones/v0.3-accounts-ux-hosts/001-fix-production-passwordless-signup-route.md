---
id: 001-fix-production-passwordless-signup-route
title: Fix production passwordless signup route
status: done
files:
  - "api/auth/passwordless/start.ts"
  - "api/auth/passwordless/verify.ts"
  - "api/auth/passwordless-start.ts"
  - "api/_lib/http.ts"
  - "src/floodlights/components/SignInGate.tsx"
  - "src/floodlights/i18n/dictionaries.ts"
  - "tests/v0.1-accounts-persistence.test.ts"
  - "dev/open-questions.md"
  - "BUILD_BLOG.md"
  - "AGENTS.md"
---

## Acceptance Criteria

- [x] The frontend path `POST /api/auth/passwordless/start` deploys as a Vercel
  serverless function instead of falling through to the SPA/static route.
- [x] The matching frontend path `POST /api/auth/passwordless/verify` deploys as
  a Vercel serverless function.
- [x] Legacy hyphenated Auth0 routes remain available for compatibility.
- [x] Auth0 passwordless start failures return typed, user-facing error codes
  for provider-not-ready, rate-limit, and email-delivery/provider failures.
- [x] Auth0 passwordless start failures are captured in Sentry without including
  the submitted email or raw Auth0 delivery description.
- [x] Regression tests cover the slash route, delivery failure scrubbing, and
  rate-limit response.

## Notes

Production diagnosis on 2026-06-08 showed:

- `POST https://winworldcup2026.com/api/auth/passwordless/start` returned `405`.
- `POST https://winworldcup2026.com/api/auth/passwordless-start` returned
  `200 {"sent":true}`.
- Vercel Production env vars for Auth0 and Sentry are present.
- Stripe Projects shows the Auth0 app as `regular_web` with
  `https://winworldcup2026.com/api/auth/callback` and
  `https://winworldcup2026.com` configured.
- `vercel inspect winworldcup2026.com` showed deployed functions for
  `api/auth/passwordless-start` and `api/auth/passwordless-verify`, but not the
  slash-style paths the frontend calls.

The root cause is therefore code route shape, not an Auth0 start-call failure.
Auth0 delivery could still fail independently later; that diagnostic path is
documented in `dev/open-questions.md`.
