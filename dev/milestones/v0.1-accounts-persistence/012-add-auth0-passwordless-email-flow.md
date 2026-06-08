---
id: 012-add-auth0-passwordless-email-flow
title: Add Auth0 email-code sign-in flow
status: waiting-on-human-code-qa
files: ["api/auth/passwordless-start.ts", "api/auth/passwordless-verify.ts", "api/_lib/auth0.ts", "src/floodlights/components/SignInGate.tsx", "src/floodlights/lib/AuthProvider.tsx", "tests/v0.1-accounts-persistence.test.ts"]
---

## Acceptance Criteria

- [x] Lock-gate and profile sign-in can ask for an email address without asking for a password.
- [x] Server route starts Auth0 Passwordless Email with `send: "code"` and no client-readable Auth0 token material.
- [x] Server route verifies the OTP through Auth0, maps the Auth0 subject to `users.auth0_user_id`, and sets the same signed httpOnly app session.
- [x] Hosted Auth0 Universal Login remains available as a fallback.
- [x] Tests cover successful passwordless start request shaping and the provider-not-ready failure branch.
- [ ] Human-assisted QA verifies the live Auth0 code from `moe@babanuj.com` and completes an app session.

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

Remaining QA step: enter a fresh six-digit Auth0 code from `moe@babanuj.com`
and verify that `/api/auth/passwordless/verify` sets the signed app session.
