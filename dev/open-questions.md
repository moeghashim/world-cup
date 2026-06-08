# Open Questions

## 2026-06-08 Provider Swap

- Resolved: Auth0 by Okta replaces WorkOS for v0.1 identity.
- Projects.dev now has an active Auth0 resource named `auth0` in the default
  environment; the old WorkOS `auth` resource is detached from that environment.
- Auth0 callback/logout/web-origin configuration was accepted through
  `stripe projects update auth0 ...`; local `/api/auth/start` now reaches Auth0
  Universal Login instead of the callback mismatch page.
- Vercel Development, Preview, and Production now have the four Auth0 env vars;
  old WorkOS env vars were removed from Vercel.
- Full human-assisted E2E still needs a completed Auth0 login session. The app
  code and provider callback are ready; the remaining step is user credential or
  passwordless-login completion in Auth0 Universal Login.

No open questions after the 2026-06-07 provider reconciliation.

## 2026-06-08 Auth0 Passwordless Email Connection

- Open provider step: Auth0 Passwordless Email connection `email` must be
  created/enabled in the Auth0 tenant and enabled for the World Cup application.
- Evidence: Auth0 Universal Login still renders the username/password database
  form, adding `connection=email` does not change that screen, and direct
  `POST /passwordless/start` returned `bad.connection` with
  `Connection does not exist`.
- Projects.dev limitation: `stripe projects catalog auth0 --json` exposes only
  Auth0 plans and the `client` deployable, not connection management. The web
  app's Auth0 client also cannot request the Management API token because Auth0
  requires a client grant for `https://worldcup2026.us.auth0.com/api/v2/`.

Resolved decisions for v0.1:

- Env names come from Stripe Projects via `stripe projects env --pull`.
- WorkOS handles auth-endpoint abuse; no custom v0.1 rate limiting.
- Resend is replaced by AgentMail, but AgentMail is not used in v0.1 because
  WorkOS sends sign-in emails.

Implementation note: WorkOS AuthKit requires a `WORKOS_COOKIE_PASSWORD` style
cookie/session secret. If Stripe Projects does not expose one, Codex should add
the exact WorkOS-required secret through Stripe Projects/Vercel env and append a
new open question entry only if that cannot be done without a human decision.

## 2026-06-07 Chrome QA Blocker

- WorkOS hosted AuthKit now loads from the local app after adding the localhost
  callback URI, but full E2E cannot be completed without either an accessible QA
  inbox/one-time code or explicit approval for a local-only session seeding
  helper used only in development QA.
- Chrome automation was also blocked by another extension UI on the AuthKit
  page. Dismiss that UI before resuming browser QA.
