---
id: 011-replace-workos-with-auth0
title: Replace WorkOS with Auth0 by Okta
status: completed
files: ["api/auth/start.ts", "api/auth/callback.ts", "api/auth/logout.ts", "api/_lib/auth0.ts", "api/_lib/session.ts", "api/_lib/users.ts", "db/migrations/002_auth0_provider.sql"]
---

## Acceptance Criteria

- [x] Stripe Projects provisions an Auth0 client resource named `auth0`.
- [x] The active Projects.dev environment includes `auth0` and no longer includes the old WorkOS `auth` resource.
- [x] `/api/auth/start` redirects to Auth0 Universal Login using the Authorization Code Flow.
- [x] Auth callback state is bound to an httpOnly nonce cookie and rejects mismatches.
- [x] `/api/auth/callback` exchanges the Auth0 code server-side, verifies the ID token, maps the Auth0 user to local `users`, and sets an httpOnly app session.
- [x] `/api/auth/logout` clears the app session and redirects through Auth0 logout.
- [x] Local users map by `auth0_user_id`; the old `workos_user_id` column is retained only as nullable migration compatibility.
- [x] Tests, lint, Vite build, Vercel build, and browser smoke verification pass.

## Notes

The app uses Auth0 Universal Login rather than a custom in-app email-code UI.
The local app session stores only a signed Auth0 subject in `wwc_session`; Auth0
tokens are never stored in client-readable state or returned from non-auth APIs.
