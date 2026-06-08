# v0.1 Accounts + Persistence

## 2026-06-08 Provider Update

Auth0 by Okta replaces WorkOS for v0.1 account identity. The historical WorkOS
task files remain in this folder as the original task contract, and task
`011-replace-workos-with-auth0` records the approved provider swap. The current
implementation uses Auth0 Universal Login, server-side code exchange, verified
ID tokens, a signed httpOnly app session cookie, and `users.auth0_user_id` as the
local account mapping.

## Definition of Done

v0.1 is done when Floodlights preserves anonymous play until a lock gate, then
uses Auth0 Universal Login and an app httpOnly session to persist
the player's bracket, group picks, and score predictions server-side.

Derived from PLAN §10 and PRD S1 after the 2026-06-07 provider reconciliation:

- Auth0 starts the hosted Universal Login flow.
- The callback maps the Auth0 user to a local `users` row by `auth0_user_id`.
- No custom `magic_link_tokens` or `sessions` tables/endpoints are created.
- Refreshing the app keeps the user authenticated through the signed httpOnly
  app session cookie.
- First sign-in requires a unique handle before the first account-bound save.
- Anonymous localStorage bracket and group picks are claimed into the account
  once after sign-in.
- Server-side APIs persist and reload bracket, group picks, and score
  predictions from Neon.
- `/profile` shows email, handle, and country, and supports sign out.
- Sentry is wired for client and Vercel serverless error tracking.
- GA4 and PostHog initialization remain intact.
- No token, session secret, email address, or shipping-address-shaped data is
  exposed through the client bundle or non-auth API responses.
- The sign-in and lock flow honors the existing Floodlights i18n system
  (EN/ES/FR/PT/AR), RTL for Arabic, and dark/light themes.
- Full E2E QA runs in Chrome before PR handoff: Auth0 sign-in, play-to-lock,
  handle-at-first-sign-in, anonymous-pick migration, persistence across reload
  and fresh session, and `/profile`, in English and Arabic across both themes.

## Out of Scope

- Custom magic-link token/session code.
- AgentMail usage; AgentMail is for v0.5 prize emails.
- Real fixtures and real bracket structure.
- Live results, scoring jobs, and standings.
- Hosts and public host pages.
- Prize eligibility, shipping address collection, and prize emails.
- The public "how it's built" page.

## Review Rule

This milestone is implemented in one pass with one Conventional Commit per task
and one PR for the full milestone. The user holds merge authority after Claude
sign-off.
