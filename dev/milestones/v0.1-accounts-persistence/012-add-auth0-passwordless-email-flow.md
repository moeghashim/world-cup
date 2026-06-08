---
id: 012-add-auth0-passwordless-email-flow
title: Add Auth0 email-code sign-in flow
status: blocked-on-auth0-connection
files: ["api/auth/passwordless-start.ts", "api/auth/passwordless-verify.ts", "api/_lib/auth0.ts", "src/floodlights/components/SignInGate.tsx", "src/floodlights/lib/AuthProvider.tsx", "tests/v0.1-accounts-persistence.test.ts"]
---

## Acceptance Criteria

- [x] Lock-gate and profile sign-in can ask for an email address without asking for a password.
- [x] Server route starts Auth0 Passwordless Email with `send: "code"` and no client-readable Auth0 token material.
- [x] Server route verifies the OTP through Auth0, maps the Auth0 subject to `users.auth0_user_id`, and sets the same signed httpOnly app session.
- [x] Hosted Auth0 Universal Login remains available as a fallback.
- [x] Tests cover successful passwordless start request shaping and the current missing-provider-connection failure.
- [ ] Live Auth0 sends an email code to `moe@babanuj.com`.

## Notes

Projects.dev exposes the Auth0 `client` resource but not an Auth0 passwordless
`connection` resource. Direct Auth0 Authentication API testing returned
`bad.connection` / `Connection does not exist`, and the web client does not have
a Management API client grant to create that connection programmatically.

Remaining provider step: in Auth0, create/enable the Passwordless Email
connection named `email`, enable it for the World Cup Auth0 application, and
keep OTP/code delivery active. After that, rerun the email-code QA.
