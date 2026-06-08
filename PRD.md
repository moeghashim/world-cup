# PRD.md — WIN World Cup 2026 (features S1–S5)

> Product requirements + acceptance criteria. Pairs with `PLAN.md` (decisions/architecture) and
> `AGENTS.md` (process). Where this conflicts with the `PLAN.md` Decisions log, the Decisions log
> wins. Acceptance criteria are the bar Codex builds to and Claude reviews against.

## Personas

- **Player** — predicts scores, fills a bracket, competes; signs in with email; may be US or not.
- **Host owner** — runs a cafe or company; creates a host and shares it so patrons/colleagues
  join and compete on a public leaderboard.
- **Visitor** — browses public pages (hub, public brackets, a host page, "how it's built")
  without an account.

## Cross-cutting requirements (apply to every feature)

- **Parity:** every new surface works in all 5 languages (EN/ES/FR/PT/AR), dark + light themes,
  and RTL for Arabic — using the existing Floodlights design system. No hardcoded English.
- **Security:** all secrets server-side; auth required for any write tied to a user; rate-limit
  auth + join endpoints; never expose another user's email or address.
- **Analytics:** fire GA4/PostHog events for sign-in, lock prediction, lock bracket, join host,
  create host, prize-address submit (event names defined per milestone).
- **No regressions:** the existing Floodlights front-end (PR #26) keeps working; anonymous play
  is preserved up to the lock/join gate.

---

## S1 — Accounts + server-side persistence (v0.1)

**Goal:** real accounts via magic-link email; picks persist server-side, tied to the user.

**User stories**
- As a player, I can play anonymously, then sign in with my email (no password) to save my picks.
- As a returning player, my picks load from my account on any device after I sign in.
- As a new player, I choose a handle the first time I sign in.

**Functional requirements**
- Sign-in uses **Auth0** passwordless **email-code** (provisioned, credentials from Stripe Projects):
  the app requests a code (`/api/auth/passwordless/start`), the user enters it
  (`/api/auth/passwordless/verify`), Auth0 verifies it, and we find/create the local `users` row by
  `auth0_user_id` and set an app-issued **signed httpOnly session** (HMAC of the Auth0 `sub`). The
  hosted Authorization Code routes (`/api/auth/start` + `/api/auth/callback`) are retained as a
  fallback. Auth0 tokens are never stored client-side or returned from non-auth APIs.
- First sign-in requires choosing a **unique handle**; subsequent sign-ins reuse it.
- Sign-in is prompted at the moment of **lock prediction / lock bracket / join host** (not on load).
- localStorage bracket + group picks present at sign-in are **migrated** into the account once.
- Bracket, group picks, and score predictions persist to Neon and reload after sign-in.
- `/profile` shows email, handle, country; lets the user sign out.

**Acceptance criteria**
- [ ] Requesting a link emails a working, single-use, expiring magic link; reusing/expiring it fails cleanly.
- [ ] Verifying sets a session; refreshing the app keeps the user signed in (cookie persists).
- [ ] A handle must be unique and is required before first save; duplicates are rejected with a clear message.
- [ ] Picks made anonymously then signed-in appear server-saved and survive a reload in a fresh browser after sign-in.
- [ ] No email address or token is ever present in the client bundle or a non-auth API response.
- [ ] Sign-in/lock flow works in all 5 languages + RTL + both themes.

**Out of scope (v0.1):** real fixtures (still sample data), live scoring, hosts, prizes.

---

## S2 — Geo-aware identity + US prize eligibility (supports v0.5)

**Goal:** recognize US vs non-US; gate prize eligibility + optional shipping address to US.

**Functional requirements**
- Determine the user's country from the **Vercel edge geo** country header at session time; store
  `country_at_signup`.
- Non-US users play and compete fully but never see a prize/address prompt.
- US users are **eligible** for physical prizes; the optional shipping address is requested
  **only at win-time** (see S5) with the disclosure *"used to ship your prize."*

**Acceptance criteria**
- [ ] A request from a US edge region is treated as US; a non-US region is not (verifiable via header mock).
- [ ] Non-US users see no address/prize prompt anywhere.
- [ ] Country detection requires no user action and is not derived from a client-side IP library.
- [ ] Email is mandatory for all; the **only** optional, geo-gated field is the US shipping address.

---

## S3 — Hosts + public host page (v0.3)

**Goal:** users join a host (cafe/company); each host has a public URL with members' predictions + stats.

**User stories**
- As a host owner, I create a host, get a public link + QR + join code, and share it.
- As a player, I join a host via link, QR, or code, and appear on its leaderboard by my handle.
- As anyone, I can open a host's public URL and see its members' predictions and standings.

**Functional requirements**
- **Self-serve, instant** host creation (name → unique slug → public `/h/:slug` + join link/QR/code).
- Join via **link, QR, or short code**; a user may belong to **multiple** hosts.
- Public host page shows: **member leaderboard** (handle + champion pick + points), **member
  count**, **most-picked champion**, and **match consensus** — reusing existing brackets-page
  components scoped to the host's members.
- Joiners are shown by **handle only** — never email or any PII.

**Acceptance criteria**
- [ ] Creating a host yields a working public `/h/:slug`, a join link, a scannable QR, and a typeable code.
- [ ] All three join methods add the user to the host; the same user can join a second host without leaving the first.
- [ ] The public page renders members by handle with champion + points, plus count/consensus/most-picked, and updates as members lock picks.
- [ ] No email/address/PII appears on the public page or its API response.
- [ ] Host pages honor i18n/theme/RTL.

---

## S4 — Real tournament data + live results (v0.2 data, v0.3 live)

**Goal:** replace sample data with real WC 2026 data; score picks against real results.

**Functional requirements**
- **v0.2:** seed real **teams, the actual group draw, and the full fixture schedule** (dates,
  venues, UTC kickoffs) from **openfootball (CC0)** into Neon via a script; the app renders real
  fixtures and the real bracket structure (replacing `R32_TEMPLATE`); picks **lock per-match at
  kickoff** (server-enforced).
- **v0.3:** a **pluggable live-results provider** (API-Football primary, football-data.org
  fallback) behind one interface; **Vercel Cron** refreshes fixtures daily and polls scores only
  during active match windows; results cache in Neon and **clients read only our cache**.
- An **idempotent scoring job** applies the locked weights (R32 10 → Final 160; flat for group
  winners) after results ingest and updates `standings`.

**Acceptance criteria**
- [ ] The app shows the real 48 teams, the real group draw, and real fixtures with correct dates/venues/kickoffs.
- [ ] A pick for a match whose kickoff has passed cannot be created or changed (server-rejected).
- [ ] Swapping the live provider is a config change — no UI or scoring rewrite.
- [ ] Clients never call the data provider directly; all reads come from our cache.
- [ ] Re-running the scorer on the same results produces identical standings (idempotent); points match the weights.
- [ ] football-data.org attribution string is shown if that fallback is active.

**Open:** real-time (~$25/mo) vs delayed-free scoring — provider-agnostic; decided before prod (PLAN §15).

---

## S5 — "How it's built" page (v0.6)

**Goal:** a public, non-technical, World-Cup-themed **scrollytelling** page about how the project
was built, ending on an up-to-date cost estimate.

**Functional requirements**
- New public route (e.g. `/how-its-built`), linked from the footer.
- **Scroll-driven narrative** with reveal animations, in plain language (no jargon), on-brand with
  the Floodlights look; respects `prefers-reduced-motion`.
- Shows an **up-to-date estimate of AI tokens + $** (manually maintained, single source of truth,
  per the existing "update the estimate on every commit" rule). No infra-cost breakdown.
- Tells the story: AI planned, Codex built, Claude reviewed — accessible to a non-technical reader.

**Acceptance criteria**
- [ ] The page loads publicly, reads as a story for a non-technical visitor, and ends on the tokens + $ estimate.
- [ ] Scroll reveals animate and degrade gracefully with reduced motion; no console errors.
- [ ] The estimate is sourced from one place that's trivially updatable each commit.
- [ ] Works in all 5 languages + RTL + both themes.

---

## S6 — v0.3 fixes & accounts-UX (production bug + UI/RTL)

**Goal:** unblock production signup, gate sign-in on every commit action, and fix three UI issues.

**Acceptance criteria**
- [ ] Production signup works: requesting a code from the live site succeeds (no "Could not send the code"); the failure path surfaces a clear message and is captured in Sentry. (Root cause may be Auth0 config — fix code/config and document any required dashboard step.)
- [ ] The home **match-prediction** "Lock my prediction" prompts Auth0 sign-in and persists after signup — same gate + anonymous-pick migration as the Pick'em lock. Sign-in is prompted for both Pick'em and match prediction.
- [ ] In Arabic RTL, the header logo no longer overlaps the "2026" wordmark (verified AR dark + light).
- [ ] The homepage and inner pages (e.g. `/pickem`) share one consistent desktop max content width.
- [ ] On desktop, the knockout bracket renders two-sided (left + right halves converging on the Final); mobile stays single-column/scrollable; RTL + both themes preserved.

## Release gating

- No milestone merges to `main` or deploys before **Claude sign-off** (per `AGENTS.md`).
- **S5/v0.5 real prizes** must not go live until the **compliance surface** (official rules,
  no-purchase-necessary, eligibility/privacy) is in place and legally approved.
