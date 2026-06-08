---
id: 012-add-auth0-passwordless-email-flow
title: Add Auth0 email-code sign-in flow
status: api-session-verified
files: ["api/auth/passwordless-start.ts", "api/auth/passwordless-verify.ts", "api/_lib/auth0.ts", "src/floodlights/components/SignInGate.tsx", "src/floodlights/lib/AuthProvider.tsx", "tests/v0.1-accounts-persistence.test.ts"]
---

## Acceptance Criteria

- [x] Lock-gate and profile sign-in can ask for an email address without asking for a password.
- [x] Server route starts Auth0 Passwordless Email with `send: "code"` and no client-readable Auth0 token material.
- [x] Server route verifies the OTP through Auth0, maps the Auth0 subject to `users.auth0_user_id`, and sets the same signed httpOnly app session.
- [x] Hosted Auth0 Universal Login remains available as a fallback.
- [x] Tests cover successful passwordless start request shaping and the provider-not-ready failure branch.
- [x] Human-assisted QA verifies the live Auth0 code from `moe@babanuj.com` and completes an app session.

## Notes

Projects.dev exposes the Auth0 `client` resource but not Auth0 connection or
email-provider management. Direct Auth0 Authentication API testing initially
returned `bad.connection` / `Connection does not exist`, and the web client does
not have a Management API client grant to create that connection
programmatically.

The Auth0 Passwordless Email connection is now enabled, and Auth0 built-in email
delivery logs a clean `Code/Link Sent` row for `moe@babanuj.com`. Auth0 custom
SMTP through AgentMail is intentionally disabled for sign-in because Auth0 logs
`550 5.1.8 Sender address rejected` even when provider-level and
verification-code-template From values are set to the AgentMail inbox. Direct
AgentMail SMTP with the same inbox and API key sends successfully, and the user
confirmed receiving the direct SMTP test.

Human-assisted OTP QA passed with a fresh code from `moe@babanuj.com`:
`/api/auth/passwordless/verify` returned an authenticated session,
`/api/auth/me` read the signed app session cookie, and the account entered the
expected first-sign-in handle setup state. The follow-on authenticated API check
set handle `moe2026` and verified group picks, one score prediction, and one
bracket save/reload cycle for the mapped Auth0 user.

Follow-up QA accepted another fresh code from `moe@babanuj.com` through the same
local passwordless verify route, reconfirmed first-sign-in setup, and verified
the authenticated readback contract for `/api/profile`, group picks, score
prediction, and bracket state. Chrome still could not complete a browser-owned
session from the modal because another extension UI blocked automation; the
extension-free browser completed English/Arabic and dark/light visual coverage.
