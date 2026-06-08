# PLAN.md — WIN World Cup 2026 (features S1–S5)

> Source of truth for the next build phase. The **Decisions log (§12)** is authoritative:
> if anything downstream conflicts with this file, the Decisions-log row wins. Do not
> overwrite this file from generated output — edit in place and call out the diff.
> Process is governed by `AGENTS.md` → **Development Process — Plan → Build → Sign-off**
> (Claude plans/reviews, Codex implements, nothing merges/deploys before Claude sign-off).

## Plan update — provider reconciliation (2026-06-07 · Auth0 swap 2026-06-08)

Stripe Projects is the credential/infra source (`stripe projects env --pull`). The provisioned
stack overrides earlier rows — **these supersede any conflicting prose below; the Decisions log
(§12) reflects them**:

- **Auth → Auth0 by Okta** (provisioned, swapped 2026-06-08): passwordless **email-code** sign-in +
  an app-issued **signed httpOnly session**; the hosted Authorization Code / Universal Login routes
  are retained as a fallback. Replaces WorkOS. No custom token/session tables.
- **Email → AgentMail** (provisioned) for prize/transactional email. **Auth0 built-in delivery** sends
  the v0.1 sign-in codes (Auth0 custom SMTP via AgentMail is disabled pending a `550 5.1.8` fix).
- **Monitoring → Sentry** (provisioned): client + serverless error tracking (new).
- **Hosting stays Vercel** (Cloudflare is provisioned but unused for now).
- **Credentials:** never invent env var names — pull from Stripe Projects. Key names:
  `PRIMARY_DB_CONNECTION_STRING` (Neon), `AUTH0_DOMAIN` / `AUTH0_CLIENT_ID` / `AUTH0_CLIENT_SECRET` /
  `AUTH0_COOKIE_SECRET` (auth), `AGENTMAIL_AGENTMAIL_API_KEY` (email), `SENTRY_DSN` (monitoring), `WORLDCUP_*` (PostHog).

## 1. Brief

WIN World Cup 2026 is a **free-to-play World Cup 2026 prediction game** in the **Floodlights**
design (neon night-match aesthetic), built as a **Vite + React 19 + TypeScript SPA on Vercel**.
Players predict scores and fill a 48-team bracket; picks are **scored against real match
results**. Identity is a **mandatory magic-link email**; **US** players may **optionally** add a
**shipping address** to receive physical prizes. Players can **join a host** (a cafe or company),
and each host gets a **public URL** showing its members' predictions and a leaderboard. A public,
non-technical **"how it's built"** page tells the build story and shows an up-to-date AI-cost
estimate.

This plan covers features **S1–S5** layered on top of the existing Floodlights front-end
(PR #26 — `floodlights-react-rebuild`). The front-end exists; this phase adds the backend,
accounts, real data, live scoring, hosts, prizes, and the build-story page.

## 2. References

| From source | Treatment |
|---|---|
| Floodlights design handoff (`OkL_zXvtwdctI54IKIzfGA`) | Already implemented as the React front-end (PR #26). **Extend, don't replace.** |
| `openfootball/worldcup.json` (CC0) | Seed real teams, the group draw, and fixtures. Public domain — no attribution, no ToS risk. |
| API-Football (`api-sports.io`) | **Primary** live-results provider. ToS: cache server-side, serve clients from our cache. Free tier for dev → ~$25/mo Pro for real-time. |
| football-data.org | **Fallback** live-results provider (free, delayed). Requires attribution string *"Football data provided by the Football-Data.org API."* if used. |
| Pre-reset prototype | Historical reference only for US-entry + Neon patterns. Not the current code. |

**License-interop:** openfootball CC0 = unrestricted. API-Football / football-data.org = **server-side cache only, no client-side redistribution**; football-data.org also requires the attribution string. A prize-bearing public game must respect these.

## 3. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Front-end | Vite + React 19 + TypeScript (existing) | The built Floodlights UI. |
| Routing | react-router-dom (existing) | SPA routes; `vercel.json` rewrite covers deep links. |
| Design system / i18n / theme | Existing Floodlights system (EN/ES/FR/PT/AR + RTL, dark/light) | Reuse; **all new surfaces must honor it.** |
| Backend | Vercel serverless functions (`/api/*`) | Existing `api/` dir; holds all secrets/keys. |
| Database | Neon Postgres via `@neondatabase/serverless` | Existing project stack; serverless-friendly. |
| Auth | **Auth0 by Okta** (provisioned) — passwordless email-code sign-in + signed httpOnly app session (Authorization Code/Universal Login fallback) | Provisioned in Stripe Projects; ID tokens verified with `jose`. |
| Email | **AgentMail** (provisioned) | Prize/transactional email; v0.1 sign-in codes sent via Auth0 built-in delivery. |
| Geo | Vercel edge request geo (country header) | US detection, zero user action. |
| Static data | openfootball (CC0) seeded into Neon via a script | Free, reliable, license-clean. |
| Live data | **Pluggable provider interface**; API-Football primary, football-data.org fallback | Build on free; defer the real-time spend to near kickoff. |
| Scheduling | Vercel Cron | Daily fixtures refresh; match-window score polling. |
| Analytics | GA4 (`G-RFPJRPKYQR`) + PostHog (env-gated `/ingest` proxy) (existing) | Page views + product analytics. |
| Monitoring | **Sentry** (provisioned) — `SENTRY_DSN` | Client + serverless error tracking. |
| Provisioning / secrets | Stripe Projects | Manage third-party services + spend limits; **all env pulled via `stripe projects env --pull`**. |

## 4. Repo layout (extend the existing app)

```
worldcup/
├─ api/                         # Vercel serverless functions
│  ├─ health.ts                 # (existing)
│  ├─ auth/                     # magic-link request + verify, session, logout
│  ├─ picks/                    # save/get bracket, group picks, predictions
│  ├─ hosts/                    # create, join (link/code), member list, public host data
│  ├─ data/                     # fixtures/results read (from our cache)
│  ├─ prizes/                   # win detection read, address submit, claim
│  └─ cron/                     # refresh-fixtures, poll-results, score
├─ db/                          # schema.sql + migrations + typed query helpers
├─ scripts/                     # seed-openfootball.ts, refresh scripts, verify scripts
├─ src/floodlights/             # (existing front-end)
│  ├─ pages/                    # + Account/SignIn, Profile, Host, HowItsBuilt
│  ├─ lib/                      # + apiClient, auth context, server-backed bracket store
│  └─ data/                     # real data types; live structure now comes from API
├─ dev/                         # Phase-2 milestone task files (one .md per task)
│  └─ milestones/v0.x-*/        # created by Codex at handoff
├─ PLAN.md  PRD.md  AGENTS.md   # contracts — never overwritten by generated code
└─ vercel.json  vite.config.ts  # (existing)
```

## 5. Surfaces

**Public routes (no login):** `/` hub, `/brackets` public, `/pickem` (play, gated on lock),
`/sponsors`, `/h/:slug` host page, `/how-its-built`.
**Authed routes:** `/profile` (handle, country, address-at-win), implicit session everywhere.
**Auth UX:** `/signin` or an in-place modal (magic-link request → email → verify link → session).

**API endpoints (server-side):**
`POST /api/auth/request` · `GET /api/auth/verify` · `POST /api/auth/logout` ·
`GET/POST /api/picks/bracket` · `GET/POST /api/picks/group` · `POST /api/picks/predict` ·
`POST /api/hosts` · `POST /api/hosts/join` · `GET /api/hosts/:slug` ·
`GET /api/data/fixtures` · `GET /api/data/results` ·
`POST /api/prizes/address` · `GET /api/prizes/me` ·
`POST /api/cron/refresh-fixtures` · `POST /api/cron/poll-results` · `POST /api/cron/score`.

## 6. Core flow (onboarding)

1. Visitor plays anonymously — picks held in localStorage (existing behavior).
2. On **lock prediction / lock bracket / join host**, prompt **magic-link sign-in** (email).
3. On first sign-in: choose a **handle**; localStorage picks are **claimed into the account**.
4. Country is read from **edge geo** at session time. Non-US users play and compete normally.
5. When a **US** user **wins** a prize draw, prompt for an **optional shipping address** with the
   disclosure *"used to ship your prize."* AgentMail sends the prize email.

## 7. Runtime / API conventions

- **Secrets server-side only** (Neon URL, Auth0 + AgentMail keys, data-provider keys) — never in the bundle.
- **Cache-then-serve:** clients read fixtures/results from **our** Neon/cache, never the provider.
- **Idempotent scoring:** re-running the scorer on the same results yields the same standings.
- **Pick locks are server-enforced** at each match's kickoff for group picks + score predictions; the
  **whole knockout bracket locks at the first tournament match's kickoff** (client UI mirrors it).
- **Geo from edge**, not client IP libraries. **i18n/theme/RTL parity** on every new surface.
- Conventional Commits; one PR per task; no secrets or generated artifacts committed.

## 8. Data model (Neon — Codex finalizes columns/types/migrations)

- `users` (id, **auth0_user_id unique**, email **unique**, handle **unique**, country_at_signup, created_at)
- Auth via **Auth0**; the app issues its own **signed httpOnly session** (HMAC holding only the Auth0
  `sub`) — no custom `magic_link_tokens`/`sessions` tables; map the Auth0 user by `auth0_user_id`
- `brackets` (user_id, data **jsonb** {groups, thirds, ko}, locked, updated_at) — mirrors the
  client model; scorer derives picks from it (Codex may normalize if cleaner)
- `group_picks` (user_id, match_id, pick, locked_at)
- `predictions` (user_id, match_id, home_score, away_score, locked_at)
- `teams` (code **pk**, name, …) — seeded from openfootball
- `matches` (id **pk**, stage, group, home_code, away_code, kickoff_utc, venue, status) — seeded
- `results` (match_id **pk**, home_score, away_score, status, finished_at) — from live provider
- `standings` (user_id, points, breakdown **jsonb**) — computed by the scorer
- `hosts` (id, slug **unique**, name, owner_user_id, created_at)
- `host_members` (host_id, user_id, joined_at) — many-to-many (**multiple** hosts)
- `prize_addresses` (user_id, draw_id, name, address fields, created_at) — **restricted access**,
  collected only at win-time; consider encryption-at-rest

## 9. Scoring

- Knockout advancement weights (already in the app): **R32 10 / R16 20 / QF 40 / SF 80 / Final 160**.
- **Flat points** for a correct group-stage winner pick. **No** exact-score bonus.
- Computed by an **idempotent** Vercel Cron job after results are ingested; writes `standings`.

## 10. Phased roadmap (one PR per task within each milestone)

| Version | Scope |
|---|---|
| **v0.1 — Accounts + persistence** | Auth0 email-code auth, Neon schema, picks server-side (bracket/group/predict), pre-login migration, handle at sign-in, `/profile`. |
| **v0.2 — Real tournament data** | Seed teams/draw/fixtures from openfootball; replace sample data + `R32_TEMPLATE` with real structure; per-match kickoff locks. |
| **v0.3 — Accounts UX + Hosts + fixes** | Fix the production signup bug (P0); gate sign-in on all lock actions (Pick'em + home match prediction); Hosts (self-serve create, link/QR/code join, multi-host, become/join at signup or later, public `/h/:slug` page); plus the Arabic-RTL logo overlap, consistent desktop content width, and a two-sided desktop knockout bracket. |
| **v0.4 — Live results + scoring** | Pluggable live provider (API-Football), match-window polling + cache, idempotent scoring engine, standings/points. |
| **v0.5 — US prizes & address** | Geo gating, win detection, address-at-win + disclosure, prize emails, claim flow, compliance surface. |
| **v0.6 — "How it's built" page** | Public scrollytelling build-story page with up-to-date AI tokens + $ estimate. No deps — may move earlier. |

## 11. Confirmed defaults (LOCKED)

1. **Auth:** **Auth0** passwordless email-code sign-in (provisioned); hosted Authorization Code flow retained as fallback. No password.
2. **Session:** app-issued **signed httpOnly cookie** (`wwc_session`, HMAC of the Auth0 `sub`, ~30-day exp). Stateless; server-side revocation is a later hardening task.
3. **Pre-login picks:** localStorage bracket/group picks are claimed into the account on first sign-in.
4. **DB:** Neon Postgres via `@neondatabase/serverless`, accessed only from Vercel functions.
5. **Static data:** seed teams/draw/fixtures from openfootball (CC0) into Neon via a refresh script.
6. **Live data:** pluggable provider; API-Football primary (free→~$25/mo), football-data.org fallback; spend decided near kickoff.
7. **Refresh:** daily Vercel Cron for fixtures; poll live scores only during match windows; cache server-side.
8. **Scoring engine:** idempotent job runs on result ingestion, applies the locked weights, updates standings.
9. **Real draw:** replace the app's illustrative `R32_TEMPLATE` with the real bracket structure from the actual draw.
10. **Host page:** member leaderboard (handle + champion + points), member count, most-picked champion, consensus.
11. **Host URL:** short public slug `/h/:slug`; link/QR/code all resolve to it.
12. **US address:** collected only at win-time (name + US address), access-restricted, with "used to ship your prize" disclosure.
13. **Geo:** Vercel edge country header; non-US users play & compete but get no prize/address prompt.
14. **Parity:** all new surfaces honor the existing 5-language + dark/light + RTL system.
15. **Compliance gate (flag):** official rules + no-purchase-necessary + eligibility/privacy disclosures must be live before any real prize draw — Codex builds the surface; legal must approve.
16. **Build-story page:** scrollytelling, non-technical, World-Cup-themed; shows an up-to-date **AI tokens + $** estimate (manually maintained per the commit rule). No infra-cost breakdown.

## 12. Decisions log (authoritative)

| Decision | Value | Source |
|---|---|---|
| Identity model | Mandatory email sign-in via **Auth0** passwordless email-code (email = login for everyone) | Locked by user (updated 2026-06-08: WorkOS → Auth0) |
| Optional item | **US physical shipping address** (not email), "used to ship prizes" | Locked by user |
| Geo method | Vercel **edge IP** country header | Recommended, accepted |
| Match data scope | **Live incl. results** (picks scored vs reality) | Locked by user |
| Data budget | Free / low-cost tier; real-time spend deferred | Locked by user |
| Static data source | **openfootball/worldcup.json (CC0)** | Recommended, accepted |
| Live data provider | **API-Football** primary, **football-data.org** fallback, pluggable | Recommended, accepted |
| Hosts creation | **Self-serve, instant** | Recommended, accepted |
| Host join | **Link + QR + code** | Recommended, accepted |
| Host membership | **Multiple hosts** per user | Recommended, accepted |
| Host page joiners | **Display name / handle** (no email/PII) | Recommended, accepted |
| Login threshold | **Play first, sign in to lock** | Recommended, accepted |
| Prize eligibility | **US-only**; everyone plays/competes | Recommended, accepted |
| Address timing | **At win-time** only | Recommended, accepted |
| Pick lock | Per-match at kickoff for group picks + score predictions; the **whole knockout bracket locks at the first tournament match's kickoff** | Recommended, accepted (bracket-lock clarified 2026-06-08) |
| Handle | **Chosen at sign-in** | Recommended, accepted |
| Scoring | Round weighting (10/20/40/80/160) + flat group winner | Recommended, accepted |
| Email delivery | **AgentMail** (provisioned) | Updated 2026-06-07 (Resend not provisioned) |
| Build order | **v0.1 = auth + persistence** | Recommended, accepted |
| Build-story page (S5) | **Scrollytelling**, tokens + $ estimate only | Locked by user |
| DB | Neon Postgres (`@neondatabase/serverless`) | Locked |
| Hosting/runtime | Vercel (functions, edge geo, Cron); Cloudflare provisioned but unused | Locked by user (2026-06-07) |
| Monitoring | **Sentry** (provisioned) — client + serverless error tracking | Added 2026-06-07 |
| Credentials / env | Pulled from **Stripe Projects** (`stripe projects env --pull`); use exact exposed names | Added 2026-06-07 |

## 13. Service providers

- **Build & process:** Codex (implements), Claude/Claude Code (plans + reviews), Stripe Projects (provisioning + spend limits).
- **Hosting/runtime:** Vercel (hosting, serverless functions, edge geolocation, Cron).
- **Database:** Neon (Postgres).
- **Identity:** **Auth0 by Okta** (provisioned) — passwordless email-code auth; app-issued signed httpOnly session.
- **Email:** **AgentMail** (provisioned) — transactional email.
- **Monitoring:** **Sentry** (provisioned) — client + serverless error tracking.
- **Tournament data:** openfootball/worldcup.json (CC0, static); API-Football (primary live); football-data.org (fallback live).
- **Analytics:** Google Analytics 4 (`G-RFPJRPKYQR`); PostHog.
- **TBD (flagged):** domain registrar for `winworldcup2026.com`; prize fulfillment / shipping partner (prior research: Gelato/Printful POD, separate 3PL) — out of current scope.

## 14. Compliance & privacy

- Real US prize draws require **official rules + "no purchase necessary" + eligibility/privacy
  disclosures** live before launch (Decisions log gate). Codex builds the surface; legal approves.
- **PII minimization:** email (identity) + handle (public) only by default; shipping address
  collected **only at win**, access-restricted, never shown publicly.
- **Data ToS:** cache provider data server-side; serve clients from our cache; show
  football-data.org attribution if that fallback is active.

## 15. Open questions / deferred (with proposed resolution)

| Item | Proposed resolution | Resolve by |
|---|---|---|
| Real-time vs delayed live scoring (the ~$25/mo) | Build provider-agnostic; default delayed-free, upgrade to API-Football Pro near kickoff if real-time is wanted | Before v0.4 ships to prod |
| Domain registrar | Keep current registrar for `winworldcup2026.com` | Anytime |
| Prize fulfillment partner | Choose during v0.5 (Gelato/Printful/3PL per prior research) | v0.5 |
| Bracket storage: jsonb vs normalized | Codex picks; jsonb default, normalize if it simplifies scoring | v0.1/v0.3 |
