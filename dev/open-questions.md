# Open Questions

## 2026-06-08 v0.3.2 Bracket Views Metric

- Default chosen: replace the old hardcoded bracket-views sponsor tile
  with `bracketsLocked`, because views are not tracked in Neon and v0.3.2 is
  scoped to existing-table aggregates only.
- Rationale: this avoids inventing analytics numbers while preserving a real
  sponsor-facing engagement signal. Claude/Moe can later decide whether to
  source actual view counts from PostHog.

## 2026-06-08 v0.3.2 Public Bracket Scope

- Context: the current `brackets` table has `locked` but no explicit
  `public`/`private` flag.
- Default chosen: community aggregates use locked brackets only, and the sample
  comparison board exposes only brackets that have a public handle. The API
  response never includes email, Auth0 IDs, addresses, or raw user IDs.
- Rationale: this preserves the v0.3 handle-only privacy discipline without
  introducing a schema migration before v0.4.

## 2026-06-08 v0.3 P0 Production Signup Diagnosis

- Resolved in code: the public sign-in modal posts to
  `/api/auth/passwordless/start`, but the production deployment only had the
  hyphenated Vercel function `api/auth/passwordless-start`. Production returned
  `405` for the slash route while `POST /api/auth/passwordless-start` returned
  `200 {"sent":true}`.
- Vercel Production env vars for `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`,
  `AUTH0_CLIENT_SECRET`, `AUTH0_COOKIE_SECRET`, and `SENTRY_DSN` are present.
- Stripe Projects shows Auth0 app type `regular_web`, production callback
  `https://winworldcup2026.com/api/auth/callback`, production logout URL
  `https://winworldcup2026.com/`, and production web origin
  `https://winworldcup2026.com`.
- Added slash-style compatibility functions for
  `/api/auth/passwordless/start` and `/api/auth/passwordless/verify`, while
  keeping the old hyphenated functions available.
- If a post-merge production attempt returns `sent: true` but the email does not
  arrive, inspect Auth0 Dashboard -> Monitoring -> Logs for that timestamp. Look
  specifically for `Failed Sending Notification` / `550 5.1.8 Sender address
  rejected`. If present, keep Auth0 custom SMTP disabled for sign-in and use
  Auth0 built-in delivery until AgentMail/Auth0 sender acceptance is resolved.

## 2026-06-08 v0.3 Host Points Placeholder

- Default chosen: host leaderboard points return `0` until v0.4 scoring writes
  real standings.
- Rationale: PRD S3 requires the host leaderboard shape in v0.3, while PLAN
  locks scoring/results ingestion for v0.4. Returning a stable numeric
  placeholder lets the public host page and API contract ship without
  fabricating scores.

## 2026-06-08 v0.2 QA Time Override

- Default chosen: server pick-lock helpers accept `x-worldcup-now` only outside
  production so tests can verify rejected past-kickoff picks before the real
  tournament starts. Production ignores this override and uses server time.
  Rationale: on 2026-06-08 every real World Cup 2026 fixture is still upcoming,
  so a real past-kickoff browser state cannot exist yet without a controlled QA
  clock.

## 2026-06-08 v0.2 Knockout Bracket Lock Timing

- Resolved in PLAN.md on `main`: group picks and score predictions lock at each
  match's own kickoff. The whole knockout bracket locks at the first tournament
  match's kickoff because v0.2 has no live results/standings yet to resolve
  staged bracket updates.

## 2026-06-08 Auth0 Passwordless Delivery Resolution

- Resolved: Auth0 Passwordless Email connection `email` is enabled for the
  World Cup app, and local `/api/auth/passwordless/start` now returns
  `sent: true` instead of `bad.connection`.
- Resolved for v0.1: use Auth0 built-in email delivery for sign-in codes.
  Auth0 custom SMTP through AgentMail is not active for sign-in because Auth0
  records `550 5.1.8 Sender address rejected` immediately after `Code/Link Sent`.
- Evidence: direct AgentMail SMTP using `world-cup-agent@agentmail.to` as the
  authenticated user and sender queued successfully to `moe@babanuj.com`, and
  the user confirmed receiving that direct SMTP test.
- Resolved: a fresh code from `moe@babanuj.com` completed
  `/api/auth/passwordless/verify`, set the signed app session, and allowed
  authenticated API persistence checks for handle, group picks, predictions,
  and bracket data.
- Remaining QA limitation: the AgentMail QA inbox did not receive Auth0 built-in
  delivery during polling, so a browser-owned session from the email-code modal
  still needs a human-assisted code if full visual E2E is required.

## 2026-06-08 Auth0 QA Browser Limitation

- Resolved: a second fresh code from `moe@babanuj.com` was accepted by the local
  Auth0 passwordless verify route and reconfirmed the app session, first-handle
  setup, authenticated profile, group picks, score prediction, and bracket
  persistence readbacks.
- Resolved: extension-free browser visual QA covered `/pickem` in English dark,
  English light, Arabic RTL light, and Arabic RTL dark with no console errors.
- Remaining limitation for Claude review: Chrome rendered the website-styled
  code modal, but another Chrome extension UI continued to block structured
  automation after a stale-code attempt. The app endpoint passed; the missing
  piece is only a Chrome-owned session cookie from the modal in this local Chrome
  profile.

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
- Auth0 handles auth-endpoint abuse; no custom v0.1 rate limiting.
- Resend is replaced by AgentMail for later prize/product emails. Auth0 sends
  v0.1 sign-in emails through its built-in delivery path.

Superseded note: the old WorkOS cookie-secret question no longer applies after
the Auth0 provider swap. The active app session uses `AUTH0_COOKIE_SECRET`.

## 2026-06-07 Chrome QA Blocker

- WorkOS hosted AuthKit now loads from the local app after adding the localhost
  callback URI, but full E2E cannot be completed without either an accessible QA
  inbox/one-time code or explicit approval for a local-only session seeding
  helper used only in development QA.
- Chrome automation was also blocked by another extension UI on the AuthKit
  page. Dismiss that UI before resuming browser QA.
