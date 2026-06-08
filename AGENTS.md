# World Cup Predictor Build Log

This document is the project artifact for how the product is being built. Update it after each meaningful task, then commit the code and documentation together when the work is coherent.

## Development Process — Plan → Build → Sign-off

Governing rule for all work from 2026-06-07 onward. Three roles, strictly separated:

- **Plan & design — Claude (this agent).** The user prompts Claude. Claude runs the
  planning interview, owns the product and architecture decisions, and writes the
  canonical `PLAN.md` (decisions log) and per-feature `PRD.md` documents. Claude
  does **not** write feature code.
- **Implement — Codex.** Codex is the implementing agent. It writes all production
  code from the locked `PLAN.md` / `PRD.md`, breaks work into per-task files,
  follows Conventional Commits, and opens one PR per task.
- **Review & sign-off — Claude.** Claude reviews each PR against the locked
  decisions and acceptance criteria and gives an explicit **approve** or
  **request-changes** verdict. Claude does **not** implement during review.

Hard rules:

- **No code is merged to `main` or deployed before Claude signs off.** The user
  holds final merge authority and merges only after a Claude sign-off.
- `PLAN.md`, each `PRD.md`, this dev-process section, and any `dev/` task files are
  committed contracts — generated output and downstream code never overwrite them.
- Phase discipline: planning produces no code; review produces no code.

### Review cadence — milestone autonomy

- **Codex implements the entire milestone end-to-end and returns only for final review/sign-off.**
  It does not pause for intermediate or per-task approvals.
- When Codex hits a decision gap, it picks a sensible default, records it (with rationale) in
  `dev/open-questions.md`, and keeps going. Claude reviews those defaults at final sign-off.
- Codex pauses mid-milestone **only** for a genuinely blocking or irreversible situation:
  required data/credentials unavailable, a destructive/irreversible action, or a hard conflict
  with a locked Decisions-log value.
- Before opening the milestone PR, Codex runs a full end-to-end QA in a real browser (Chrome skill)
  and records the evidence.
- Claude's single sign-off (against the Decisions log + PRD acceptance criteria) gates the merge;
  the user holds merge authority.

## Reset Baseline - 2026-06-07

The repository has been reset to a clean product and design slate. Older sections
below remain as historical project context, not the current implementation map.

Current implementation baseline:

- Vite + React + TypeScript.
- Static GA4 snippet for `G-RFPJRPKYQR` in `index.html`.
- Runtime analytics fallback and env-gated PostHog setup in `src/analytics.ts`.
- PostHog first-party `/ingest` proxy in `vite.config.ts` and `vercel.json`.
- Stripe Projects and Vercel local state preserved in ignored `.projects/` and
  `.vercel/` directories.
- AI usage disclosure is currently tracked in documentation, not the UI:
  `~9.6M` total tokens and `~$87` estimated API-equivalent cost in
  `BUILD_BLOG.md`.
- `BUILD_BLOG.md` remains append-only for the public build article.

## Floodlights Implementation - 2026-06-07

The product surface is now the **Floodlights** design (Direction C from the
Claude Design handoff: neon night-match look — near-black pitch, lime/cyan/magenta
glow, LED scoreboard digits, floodlight bloom), rebuilt natively in
Vite + React 19 + TypeScript. This supersedes the neutral reset screen; the
old prototype's routes (`/fixtures`, `/teams`, `/draws`, etc.) and the inline
AI-usage disclosure banner are gone. The historical sections further below
describe that previous prototype, not the current implementation.

Current routes (`react-router-dom`, served by `vercel.json`'s SPA rewrite):

- `/` — site hub (interactive predict scoreboard, how-to, feature teasers,
  quick pick'em, prizes, sponsor band, CTA)
- `/pickem` — 48-team bracket builder (group ranking → wildcard thirds →
  32-team knockout → champion), share-link modal, group quick pick'em
- `/brackets` — public brackets (you-vs-crowd, most-picked champion, match
  consensus, leaderboard, head-to-head compare from the saved bracket)
- `/sponsors` — sponsorship pitch (hero, reach stats, why-it-works, four
  partnership packages, inventory mockups, backers, contact form)

Source layout under `src/floodlights/`:

- `styles/` — `site.css` is the shared design system ported near-verbatim from
  the prototype; `home.css` / `pickem.css` / `brackets.css` / `sponsors.css` are
  the per-page sheets. `.page-head` and `.stat` were renamed per page
  (`.spon-head` / `.pk-head` / `.bk-head`, `.bk-stat`) to avoid global clashes.
- `data.ts` — 48 teams (EN + AR + colour), 12 groups, R32 seeding template,
  knockout metadata, crowd/community sample data, sponsors.
- `i18n/` — `dictionaries.ts` (en/es/fr/pt/ar + localized country names),
  `context.ts` + `I18nProvider.tsx` (lang, dir, `t`, `tname`, `cname`).
- `theme/` — `context.ts` + `ThemeProvider.tsx` (dark default, light variant),
  applied via `data-theme` on `<html>` with a pre-paint script in `index.html`.
- `lib/` — `storage.ts` (`fl:` localStorage namespace), `confetti.ts`,
  `useReveal.ts`, `motion.tsx` (count-up, bar fills), `bracket.ts` (resolution +
  URL-hash share codec), `toastContext.ts` + `ToastProvider.tsx`.
- `components/` — `SiteHeader`, `SiteFooter`, `Ticker`, `LangPicker`,
  `ThemeToggle`, `BrandLogo`, `Flag`, `SponsorLogo` family, `HashLink`.
- `pages/` — `HomePage`, `PickemPage`, `BracketsPage`, `SponsorsPage`.

Design assets (favicons, t-shirt photo, logo files) live in `public/assets/`.
GA4 and PostHog plumbing are unchanged and still initialize from `App.tsx`.
Picks, theme, and language persist in `localStorage`. The Floodlights design has
no AI-usage disclosure banner, so the running token estimate is tracked in the
docs (`BUILD_BLOG.md`) rather than in the UI: currently `~9.6M` total tokens and
`~$87` estimated API-equivalent cost.

## Working Agreement

- Keep product logic deterministic for predictions, draws, eligibility, shipping, reviews, and compliance.
- Use JSON-render as a constrained presentation/spec layer, not as the source of truth for prize or fulfillment logic.
- Keep team personalization token-driven through CSS variables and typed team data.
- Maintain `PRODUCT.md` and `DESIGN.md` when product or design direction changes.
- Maintain `BUILD_BLOG.md` on every commit so it can become the public build article.
- Update the AI build disclosure total token estimate and API-equivalent estimated cost in `src/App.tsx` and `BUILD_BLOG.md` on every commit.
- Avoid official FIFA, tournament, federation, player, and sponsor marks unless the project has rights.
- After finishing a task: update this file and `BUILD_BLOG.md`, run verification, and commit.

## Current Stack

- Vite + React + TypeScript.
- Tailwind CSS v4 and shadcn/ui source primitives for new and migrated interface components.
- `@json-render/core` and `@json-render/react` for the spec-driven product surface.
- `zod` for catalog props/action schemas.
- `lucide-react` for interface icons.
- `@neondatabase/serverless` for Vercel server-side prediction entry writes to Neon.
- Google Analytics gtag for page-view tracking, with the static homepage snippet using `G-RFPJRPKYQR` and `VITE_GA_MEASUREMENT_ID` reserved for the runtime fallback path.
- `posthog-js` for env-gated product analytics through the first-party `/ingest` proxy.
- Auth0 by Okta for account identity through Projects.dev resource `auth0`.
- Auth0 Passwordless Email API routes for email-code sign-in through Auth0
  built-in email delivery. AgentMail custom SMTP for Auth0 sign-in is disabled
  while Auth0 and AgentMail investigate a `550 5.1.8 Sender address rejected`
  handoff failure.
- `jose` for Auth0 ID-token verification in Vercel serverless callbacks.
- Optimized raster stadium hero loaded from `src/assets/world-cup-hero.jpg`.

## Architecture Notes

The app uses React for the authoritative domain state:

- selected supporter team
- match predictions
- locked picks
- participant draw receipts
- match draw results
- draw audit metadata
- fulfillment queue
- review prompt status

The app also exposes an `/experiment` page from the footer. That page imports `BUILD_BLOG.md`, `AGENTS.md`, `PRODUCT.md`, `WEBSITE_FLOW.md`, and `DESIGN.md` as raw markdown so the build process is visible inside the website experience.

Public navigation now uses page-style paths instead of hash fragments:

- `/fixtures`
- `/teams`
- `/draws`
- `/prizes`
- `/prizes/:team`
- `/shirts`
- `/sponsors`
- `/rewards`
- `/operations`
- `/posthog`
- `/experiment`

Legacy hash URLs such as `/#experiment`, `/#operations`, and `/#prizes/japan` are normalized to their page paths in the browser. `vercel.json` rewrites direct route requests back to the Vite app entry so deployed page refreshes resolve correctly.

Google Analytics is present as the canonical GA4 snippet in `index.html` so it is visible in the homepage HTML source. `src/analytics.ts` remains as a runtime fallback, but it now exits when the static snippet has already defined `window.gtag` so the app does not duplicate the initial GA config call. SPA route changes should be tracked by GA4 Enhanced Measurement when "Page changes based on browser history events" is enabled on the web data stream.

The JSON-render layer lives in `src/jsonRender/predictionCatalog.tsx`. It defines a domain catalog with components like `MatchBoard`, `DrawControl`, `ShirtStudio`, `FulfillmentPipeline`, and `ProviderPlan`. The JSON spec controls section composition while registered actions call deterministic state updates.

The data layer lives in `src/data/worldCup.ts` and includes:

- supporter team themes
- demo matches
- deterministic demo results
- community entries for seeded draw simulation
- localized T-shirt concepts
- provider recommendations

Additional homepage entry helpers live in `src/data/homepageFixtures.ts`, `src/data/homepagePrizeBundles.ts`, and `src/data/predictionEntry.ts`. They select the next fixtures, generate independent culture-inspired prize bundles, and validate US-only prediction entry form payloads.

Sponsor onboarding data lives in `src/data/sponsorOnboarding.ts` and includes sponsor package IDs/prices, future Stripe price env var names, application statuses, free-product offer types, fulfillment owner options, and the shared Zod application schema used by the React form and API route.

The sponsor application API lives in `api/sponsor-applications.ts`. It validates the shared schema, returns `awaiting_payment`, persists to Neon when `PRIMARY_DB_CONNECTION_STRING` is configured, and otherwise returns an explicit `server-fallback-no-database` receipt. Stripe Checkout, webhook signature verification, sponsor email confirmation, and admin approval are not live yet.

The tournament schedule snapshot lives in `src/data/worldCupSchedule.ts` and includes:

- all 48 teams grouped from A through L
- 72 group-stage fixtures with match number, date, ET kickoff time, venue, home team, and away team
- a helper for the selected supporter team's group-stage schedule
- dated source metadata and a verification warning for real prize campaigns

Draw application happens when a visitor locks a winner prediction. The prototype creates a receipt hash, evaluates the ticket against the demo result, ranks eligible tickets with a public seed plus reveal seed, selects winners, preserves alternates, and shows audit metadata beside the reveal.

The homepage prediction arena now submits full entry data through Vercel API routes. `POST /api/prediction-entries` validates the prediction and participant data, keeps full address data server-side only, upserts a participant by email, creates a prediction entry, and returns only receipt metadata plus participant email. When `PRIMARY_DB_CONNECTION_STRING` is not configured, the endpoint returns an explicit non-persistent fallback receipt instead of pretending the entry was saved. `GET /api/match-prize-bundles` currently returns static-backed prize bundle data shaped for future database reads. Local development runs the Vite app and prediction API shim together through `npm run dev`; `vite.config.ts` proxies `/api/*` to the API server on port 5176 so the same handlers are exercised without relying on `vercel dev`. Use `npm run dev:app` only when intentionally testing the frontend without API submission support.

## Research Decisions

### JSON-render

Reference: https://json-render.dev/

JSON-render is useful for catalog-first UI, constrained generated layouts, JSON Pointer state binding, and generated secondary surfaces. For this product, it should not own the critical prediction, scoring, prize, claim, or fulfillment rules.

MVP position: use JSON-render for a controlled, spec-driven experience layer and future generated modules. Keep business rules in typed React/application code.

### Print-On-Demand And Fulfillment

Research summary from the POD sub-agent:

- Gelato is the best first choice for global localized winner T-shirts because it can produce near recipients in many regions.
- Printful is stronger for branded control, mature API support, mockups, webhooks, and light warehousing/pack-ins.
- Printify is a cost lever but has higher supplier QA and routing complexity.
- Real sponsor-product packages should use a separate 3PL/kitting workflow, not POD inserts.

Recommended MVP: Gelato for shirts, Printful as backup/controlled fulfillment option, separate 3PL for sponsor kits.

### Stripe Projects

References: https://projects.dev/ and https://docs.stripe.com/projects

Stripe Projects is for provisioning and managing app infrastructure from the CLI. It can help add hosting, database, auth, analytics, communications, observability, AI providers, credentials, and spend limits.

It does not replace payments, contest compliance, prize fulfillment, POD APIs, 3PL operations, sponsor billing, or vendor payments.

Recommended use: use Stripe Projects for the build stack and SaaS spend limits. Keep Stripe payment products separate for sponsor billing, taxes, identity checks, fraud controls, and approved payout flows.

Public build attribution: this project is being built with [Codex](https://chatgpt.com/codex) Desktop App by OpenAI and [projects.dev](https://projects.dev/) by Stripe without writing a single line of code. Keep that attribution in the footer-linked Experiment view and documentation, not in the default homepage experience.

### Google Analytics

References: https://developers.google.com/analytics/devguides/MCP and https://developers.google.com/analytics/devguides/collection/ga4

The Google Analytics MCP path is useful for read/reporting workflows, but account and property setup still happened through the Google Analytics UI for this project. The user-created GA4 web stream measurement ID is `G-RFPJRPKYQR`.

Implementation position: use GA4 only for page-view tracking in the prototype. Keep GA4 Enhanced Measurement history tracking enabled for page-style SPA routes. Add explicit product funnel events later for prediction starts, locked receipts, draw entries, winner reveals, fulfillment claims, and review prompts.

### PostHog

References: https://posthog.com/docs/product-analytics/dashboards and https://posthog.com/docs/libraries/js

The Projects.dev state includes a completed PostHog account link, the earlier `analytics` and `worldcup2026-analytics` resources, and the new `WorldCup` analytics project resource created specifically for `winworldcup2026.com`. The earlier resources are removed from the default Projects.dev environment so future site wiring should use only `WorldCup`. The in-app `/posthog` page is now the dashboard contract for the real PostHog implementation: acquisition, prediction conversion, draw reveal, prize claim, sponsor review, and fulfillment metrics.

Implementation position: keep personal API keys server-side only. PostHog capture initializes only when `VITE_POSTHOG_KEY` is present, with optional `VITE_POSTHOG_HOST` defaulting to `https://us.posthog.com`. The app uses `/ingest` as a first-party proxy to `https://us.i.posthog.com` and `https://us-assets.i.posthog.com`. Map `WORLDCUP_API_KEY` and `WORLDCUP_HOST` into the browser-safe Vite variables, and keep `WORLDCUP_PERSONAL_API_KEY` server-side only. PostHog Live has not been verified yet because the public Vite key has not been set in this workspace during verification.

## T-Shirt Design System

Localized supporter shirt concepts are independent fan designs, not official jerseys. Each concept includes:

- concept name
- motif
- base/graphic/accent colors
- safe print copy
- disclaimer that no official team, tournament, sponsor, or player branding is used

Current concepts cover Brazil, Argentina, United States, France, England, Spain, Morocco, and Japan.

Design assets are now stored under `designs/`. The folder includes concept images for the supported teams, generated shirt design mockups for Argentina, Brazil, France, Japan, Morocco, Spain, and the United States, plus a refined concept board. These are visual direction assets, not final POD print files.

Logo explorations for `winworldcup2026.com` live in `designs/logos/`. The current set includes three SVG variations: orbit/cup, motion ball, and shield/globe. The user-provided `worldcup-logo-attached.svg` is now selected and copied into `src/assets/winworldcup2026-logo.svg` as the active website header logo. The generated PNG board is a concept reference; the SVG files are the editable usable assets. The active logo still needs final legal/IP review before launch.

Runtime website images in `src/assets/` are optimized JPEG exports for page performance. The original full-size PNG design sources remain in `designs/` for future design iteration and POD artwork prep.

## Completed Work

### 2026-06-01

- Scaffolded a Vite React TypeScript app.
- Generated and copied a stadium hero asset into the workspace.
- Added team-driven theming and supporter mode.
- Built match prediction cards with score inputs, winner picks, and lock state.
- Added a JSON-render catalog and spec-driven sections.
- Added seeded match-level draw simulation with 5-10 winners per match.
- Added fulfillment queue and review prompt actions.
- Added localized T-shirt studio previews.
- Added provider plan for Gelato, Printful, 3PL/kitting, and Stripe Projects.
- Researched JSON-render, POD providers, and Stripe Projects using sub-agents and web sources.
- Scoped React Fast Refresh away from the mixed JSON-render catalog module.
- Verified build, lint, and browser interactions.
- Applied Impeccable-inspired product-design structure: added `PRODUCT.md`, `DESIGN.md`, a desktop workflow rail, cleaner product-state empty copy, and corrected section anchors.
- Added `BUILD_BLOG.md` as the narrative build article artifact and commit-by-commit project history.

### 2026-06-02

- Added participant-aware draw application receipts for locked predictions.
- Added deterministic winner and alternate ranking with public seed, commitment, reveal seed, and audit hash metadata.
- Added draw status rail, animated receipt pool, participant outcome panel, winner reveal animation, alternates, and audit panel.
- Connected fulfillment and review actions to update draw lifecycle status.
- Updated `PRODUCT.md`, `DESIGN.md`, and `BUILD_BLOG.md` with the draw mechanism and presentation decisions.
- Added generated localized shirt concept/design assets under `designs/` for the supporter personalization system.
- Added three logo variations for `winworldcup2026.com` under `designs/logos/` and documented their usage boundary.
- Selected Variation B as the active website logo and wired it into the top navigation brand.
- Added a dated tournament snapshot section with all 48 teams, 12 groups, 72 group-stage fixtures, selected supporter-team schedule highlights, source metadata, and a FIFA verification link.
- Replaced the active website logo with the user-provided attached SVG and preserved it under `designs/logos/worldcup-logo-attached.svg`.
- Added a footer-linked Experiment section that renders the project documentation files and labels the site as an experiment from `10claws.com`.
- Increased the active header logo by 20%, from 68px to 82px, and adjusted the sticky topbar height to 100px.
- Added visible build attribution for Codex Desktop App and `https://projects.dev/` in the Experiment section, footer, and project documentation.
- Moved technical build attribution and documentation off the default homepage into the footer-linked Experiment view so the homepage stays focused on matches, prizes, and winners.
- Added a homepage prize section and hash-addressable team prize detail pages using the generated localized shirt mockups.
- Added sponsor package pricing and activation details for reward-funded campaigns.
- Added `WEBSITE_FLOW.md` with Mermaid diagrams for the visitor journey, app architecture, draw mechanism, tool stack, and planned production integrations.
- Updated the homepage supporter picker heading from "Choose Your Theme" to "Choose Your Team" so the public copy focuses on team choice rather than implementation theming.
- Updated the Experiment view build attribution to link Codex and projects.dev and describe the no-code build process.
- Updated the header logo link to navigate to `/` so it clears hash routes like `#experiment` and returns to the homepage without a fragment.
- Replaced hash-fragment navigation with page-style URLs for fixtures, teams, prizes, sponsors, rewards, operations, and Experiment. Added focused route rendering for `/operations`, `/experiment`, `/prizes`, `/prizes/:team`, `/sponsors`, and the JSON-render section pages, plus a Vercel rewrite for direct route refreshes.
- Increased the active header logo by another 20%, from 82px to 98px, and adjusted the sticky topbar height from 100px to 120px.
- Redesigned `/experiment` to remove the old multi-document grid, render `BUILD_BLOG.md` as a polished HTML article, keep `AGENTS.md` as the raw agent-log markdown file, and add a technology flowchart for Codex, GitHub, Vercel, React/TypeScript, JSON-render, Stripe Projects, and planned providers.
- Added a site-wide AI build disclosure banner that says the project was built entirely by AI and shows the current estimated total tokens plus API-equivalent estimated cost.
- Activated Google Analytics page-view tracking for the user-created GA4 web stream `G-RFPJRPKYQR`, with a `VITE_GA_MEASUREMENT_ID` override for future environment-specific streams.
- Moved the AI build disclosure into a compact top status bar above the logo and primary navigation, with sticky header offsets updated for the combined status bar and logo header.
- Reduced the active header logo by 20%, from 98px to 78px, and lowered the logo/navigation header row from 120px to 100px.
- Added a `/posthog` dashboard page with metric cards, prediction funnel steps, event taxonomy, setup checklist, PostHog link, header/footer navigation, and legacy `#posthog` redirect support.
- Added a working rule to refresh the AI build disclosure token total and estimated cost on every commit, and updated the current estimate to `~2.9M` total tokens and `~$22`.
- Made the `/posthog` route easier to find by labeling the header and footer links as "PostHog Dashboard" and refreshed the AI build estimate to `~3.0M` total tokens and `~$23`.
- Provisioned a new Projects.dev PostHog analytics project resource named `worldcup2026-analytics`, updated `/posthog` to show that resource instead of the earlier generic dashboard target, and refreshed the AI build estimate to `~3.1M` total tokens and `~$24`.
- Removed the earlier `analytics` PostHog resource from the default Projects.dev environment so the website has a single active PostHog analytics resource, updated `/posthog` copy to say that explicitly, and refreshed the AI build estimate to `~3.2M` total tokens and `~$25`.
- Moved the GA4 `G-RFPJRPKYQR` tag into the static `index.html` head, kept the runtime analytics initializer as a no-duplicate fallback, and refreshed the AI build estimate to `~3.3M` total tokens and `~$26`.
- Converted the runtime hero and prize shirt assets from large PNGs to display-sized JPEGs, removed the old runtime PNG copies, and refreshed the AI build estimate to `~3.4M` total tokens and `~$27`.
- Installed `posthog-js`, added env-gated initialization, first-party `/ingest` proxying for Vite and Vercel, prediction/draw/reward event capture, `.env.example`, `POSTHOG_SETUP.md`, and refreshed the AI build estimate to `~3.5M` total tokens and `~$28`.
- Created a new Projects.dev PostHog analytics project resource named `WorldCup`, removed `worldcup2026-analytics` from the default environment so only `WorldCup` is active for site wiring, updated the `/posthog` dashboard contract and setup docs to use `WorldCup`, and refreshed the AI build estimate to `~3.6M` total tokens and `~$29`.
- Fixed the PR check failures by rebasing the branch with DCO sign-offs, removing the invalid `skipTrailingSlashRedirect` property from `vercel.json`, confirming Vercel can build/deploy the prebuilt output, and refreshing the AI build estimate to `~3.7M` total tokens and `~$30`.
- Added `HOMEPAGE_PREDICTION_BANNER_PRD.md` for the prediction-first homepage redesign, captured the product decision to collect full US address at prediction entry time, documented Neon `primary-db` as the persistence target, assigned implementation to Wegnener, and refreshed the AI build estimate to `~3.8M` total tokens and `~$31`.
- Added `HOMEPAGE_LIVE_BANNER_PRD.md` for the creative "make the banner feel alive" pass, scoped matchday atmosphere/motion/score reactions/prize-panel reveals/reduced-motion behavior, assigned implementation to a live-banner sub-agent, and refreshed the AI build estimate to `~3.9M` total tokens and `~$32`.

### 2026-06-03

- Implemented the homepage Matchday Pulse live banner with first-viewport score prediction, active fixture rail, match status strip, fixture-colored energy, score pulse reactions, prize-panel reveal, sponsor/prize placeholder placement, entry drawer handoff, reduced-motion CSS, and refreshed the AI build estimate to `~4.1M` total tokens and `~$34`.
- Implemented `HOMEPAGE_PREDICTION_BANNER_PRD.md` with a prediction-first homepage arena, upcoming match rail, live score controls, sponsor/prize bundle panel, joined and winner counts, full US entry modal, server-side Vercel endpoints, Neon schema artifact, explicit no-database fallback receipts, and refreshed the AI build estimate to `~4.4M` total tokens and `~$37`.
- Added explicit prediction persistence commands: `npm run db:prediction-schema`, `npm run verify:api:fallback`, `npm run verify:api:persisted`, `npm run verify:api:vercel`, and `npm run dev:api`; applied the committed schema to Neon; configured encrypted `PRIMARY_DB_CONNECTION_STRING` entries for Vercel Preview and Production; verified a deployed protected Vercel preview write with smoke-test cleanup; confirmed Projects.dev exposes the redacted env var name for `primary-db`; and refreshed the AI build estimate to `~4.6M` total tokens and `~$39`.
- Added an app-level language selector and i18n provider for English, Arabic, French, German, Spanish, Portuguese, Chinese, and Korean; localized the main public shell, homepage prediction arena, route copy, JSON-render section headers, prize/sponsor surfaces, receipt/modal text, footer, and score controls; added RTL handling for Arabic; and refreshed the AI build estimate to `~5.0M` total tokens and `~$43`.
- Added a `$25,000` Website Sponsor package with 4 spots, redesigned the sponsor package section as a compact marketplace-style board inspired by `https://trustmrr.com/` for desktop and mobile, localized the new sponsor tier and board labels, documented the design boundary, and refreshed the AI build estimate to `~5.1M` total tokens and `~$44`.
- Added `src/data/teamIdentity.ts` with researched known-as/support-line/known-for/sponsor-angle records for all 48 teams; replaced `/teams` with a full grouped team identity directory; added `/teams/:slug` detail pages with source links, team sponsorship invitations, three group fixtures, per-game sponsorship cards, and $45,000 team package / $15,000 game package math; and refreshed the AI build estimate to `~5.3M` total tokens and `~$46`.
- Added visible TrustMRR-inspired advertiser blocks around `/sponsors`: left and right desktop rails, sponsor-safe placeholder ad cards, an empty "Advertise" slot, tablet horizontal rails, mobile horizontal ad strips, a sponsor listing banner strip above the package board, and refreshed the AI build estimate to `~5.4M` total tokens and `~$47`.
- Added the shadcn/ui foundation with Tailwind CSS v4, path aliases, generated Button/Card/Badge/Separator primitives, migrated sponsor ad cards and sponsor package cards onto shadcn source components, promoted the sponsor ad rails into a reusable frame across homepage, prize, team, operations, PostHog, Experiment, and sponsor routes, and refreshed the AI build estimate to `~5.6M` total tokens and `~$49`.
- Reduced the desktop sponsor rail footprint to smaller static ad blocks, converted the mobile sponsor treatment into a single animated marquee banner above page content, added reduced-motion/manual-scroll behavior, and refreshed the AI build estimate to `~5.7M` total tokens and `~$50`.
- Applied a visual design polish pass to the public website: quieter app chrome, refined AI status bar, softer sponsor cards, rounded homepage prediction arena, cleaner hero panels, tighter mobile typography, improved team picker cards, slower mobile sponsor marquee, and refreshed the AI build estimate to `~5.8M` total tokens and `~$51`.
- Built `sponsorship_plan.md` into an MVP sponsor onboarding path on `/sponsors`: company/contact/billing fields, package selection, client-side logo preview, free-product offer details, AI one-pager fields, required sponsorship terms, preview cards, local API receipt handling, shared client/server Zod schema, `POST /api/sponsor-applications`, documented Stripe env placeholders, and refreshed the AI build estimate to `~6.0M` total tokens and `~$53`.

### 2026-06-04

- Repaired the homepage prediction QA path by making `npm run dev` start both Vite and the local prediction API shim, adding `npm run dev:app` for frontend-only work, adding `npm run verify:api:dev` for Vite-proxy prediction submission smoke tests, extracting the homepage prediction payload builder, mapping raw network failures to the localized retry copy, improving the State field label, fixing mobile receipt wrapping, and refreshing the AI build estimate to `~6.2M` total tokens and `~$55`.

### 2026-06-08

- Replaced WorkOS with Auth0 by Okta for the v0.1 account flow: provisioned Projects.dev resource `auth0`, detached the old WorkOS `auth` resource from the default environment, added Auth0 Authorization Code Flow handlers, verified ID tokens with `jose`, mapped local users by `auth0_user_id`, added a signed httpOnly app session, fixed Auth0 callback/logout/web-origin config through Projects.dev, added Auth0 env vars to Vercel Development/Preview/Production, removed WorkOS env vars from Vercel, and refreshed the documentation estimate to `~8.2M` total tokens and `~$73`.
- Added first-party Auth0 email-code sign-in: `/api/auth/passwordless/start`,
  `/api/auth/passwordless/verify`, inline lock-gate/profile email-code UI,
  localized copy, dev API shim routes, tests for passwordless start and the
  current missing Auth0 email connection, documented the provider blocker, and
  refreshed the documentation estimate to `~8.4M` total tokens and `~$75`.
- Removed the visible hosted Auth0 fallback from the public sign-in modal so the
  player-facing account flow keeps the Floodlights website design and no longer
  switches into the Auth0-branded screen from the normal UI. Refreshed the
  documentation estimate to `~8.5M` total tokens and `~$76`.
- Triaged Auth0 email-code delivery: confirmed the Auth0 Passwordless Email
  connection is enabled, isolated Auth0 custom SMTP with AgentMail as failing
  with `550 5.1.8 Sender address rejected`, confirmed direct AgentMail SMTP to
  `moe@babanuj.com` is delivered, switched Auth0 sign-in back to built-in email
  delivery, documented the remaining human-assisted code-entry QA step, and
  refreshed the documentation estimate to `~8.7M` total tokens and `~$78`.
- Verified the first real Auth0 OTP session with `moe@babanuj.com`: accepted a
  fresh human-supplied code, confirmed `/api/auth/passwordless/verify` sets an
  authenticated app session, confirmed `/api/auth/me`, saved first handle
  `moe2026`, verified authenticated group-pick, prediction, and bracket
  save/reload paths, and refreshed the documentation estimate to `~8.8M` total
  tokens and `~$79`.
- Completed the follow-up Auth0 QA package for review: accepted another fresh
  human-supplied code from `moe@babanuj.com` through the local passwordless
  verify endpoint, confirmed first-sign-in handle setup, verified authenticated
  group-pick, score-prediction, bracket, and profile API readbacks, verified
  extension-free browser coverage for English + Arabic RTL across dark and
  light themes, recorded Chrome as blocked by another extension UI for the
  browser-owned cookie check, and refreshed the documentation estimate to
  `~9.0M` total tokens and `~$81`.
- Started v0.2 real tournament data by verifying and vendoring the
  openfootball World Cup 2026 JSON snapshot under `db/openfootball/`, recording
  the CC0 source metadata, and confirming 104 total fixtures, 72 group fixtures,
  12 groups, and 48 group-stage teams. Refreshed the documentation estimate to
  `~9.1M` total tokens and `~$82`.
- Added `db/migrations/003_real_tournament_data.sql` with idempotent
  `tournament_groups`, `teams`, and `matches` tables, extended `db/schema.sql`
  and `db/types.ts`, added the normalized tournament API shape in
  `api/_lib/tournament-data.ts`, verified with `npm run build`, and refreshed
  the documentation estimate to `~9.2M` total tokens and `~$83`.
- Added `scripts/tournament-normalize.ts` and `scripts/seed-openfootball.ts`,
  exposed `npm run verify:tournament-data` and `npm run db:seed:tournament`,
  converted openfootball `UTC±offset` kickoffs to ISO UTC, seeded Neon, verified
  the readback counts at 12 groups / 48 teams / 104 matches / 72 group matches,
  and refreshed the documentation estimate to `~9.3M` total tokens and `~$84`.
- Added `GET /api/data/fixtures`, generated a server-only static fallback module,
  taught the tournament data helper to prefer Neon/cache and mark fallback reads,
  wired the local API shim route, verified Neon and no-env fallback handler
  responses, verified with `npm run build`, and refreshed the documentation
  estimate to `~9.4M` total tokens and `~$85`.
- Replaced Floodlights sample teams, groups, quick-pick fixtures, and
  Round-of-32 template with the real openfootball-backed structure, wired the
  homepage and Pick'em quick-pick slate to prefer `/api/data/fixtures`, switched
  quick-pick persistence to real match IDs, verified build and data integrity,
  and refreshed the documentation estimate to `~9.5M` total tokens and `~$86`.
- Added server-side kickoff locks for group picks, score predictions, and the
  full knockout bracket, returning `pick_locked` before any write after the
  relevant kickoff. Added a non-production `x-worldcup-now` QA override because
  all real fixtures are still upcoming on 2026-06-08, localized the UI lock
  toast, verified build and lock-helper behavior, and refreshed the
  documentation estimate to `~9.6M` total tokens and `~$87`.

### 2026-06-07

- Adopted the **Floodlights** design from the Claude Design handoff bundle and
  rebuilt all four pages (home hub, Pick'em, public brackets, sponsorship) in
  Vite + React 19 + TypeScript instead of dropping the static prototype in.
- Ported the prototype CSS near-verbatim into a shared design system plus
  per-page sheets; renamed two clashing classes so page sheets stay global.
- Built React contexts for theme (dark/light) and i18n (English, Español,
  Français, Português, العربية + RTL with Alexandria/Zain fonts), driving
  `data-theme`/`dir`/`lang` on `<html>` with a pre-paint script.
- Ported the 48-team bracket logic and the URL-hash share codec into a typed,
  reusable `lib/bracket.ts` and a React state model; wired the public-brackets
  page to read the saved bracket for the live "you vs the crowd" comparison.
- Implemented `floodlights/sponsors.html` as `/sponsors`: hero, count-up reach
  stats, why-it-works cards, four partnership packages with a tier picker that
  presets the contact form, inventory mockups, backers row, and contact form.
- Preserved GA4 + PostHog initialization in `App.tsx`; added `react-router-dom`
  for the four routes, covered by the existing `vercel.json` SPA rewrite.
- Replaced the neutral reset screen and removed the inline AI-usage disclosure
  banner (the Floodlights design has none); moved the running token estimate to
  the docs at `~6.9M` total tokens and `~$60` estimated API-equivalent cost.

## Verification

Latest successful commands:

```bash
npm run lint
npm run build
npm run verify:api:fallback
npm run verify:api:dev
npm run db:prediction-schema
npm run verify:api:persisted
npm run verify:api:vercel
npx vercel build
```

Browser verification covered:

- switching supporter team to Argentina
- selecting France for Argentina vs France
- locking the prediction
- running the Argentina vs France draw
- verifying winners appear
- queueing fulfillment and sending review prompts
- checking browser console errors
- checking the Impeccable-inspired workflow rail and refined empty draw states
- locking a Brazil prediction as a draw application receipt
- running the Brazil vs Spain draw with the current visitor in the winner group
- verifying public seed, commitment, and audit hash rendering
- confirming fulfillment and review actions advance the draw lifecycle copy
- checking the medium-breakpoint draw card layout after the animation pass
- verifying the teams/schedule section renders 12 group cards and 72 group-stage fixture rows
- verifying the supporter schedule updates from Brazil to Japan after switching supporter team
- checking the schedule screenshot after fixing sticky-header anchor offset and compact fixture wrapping
- verifying the attached logo renders in the header at 82px inside the 100px topbar
- verifying the footer Experiment link jumps to the documentation section and the imported markdown files render
- verifying the Codex Desktop App and `projects.dev` build attribution renders in the Experiment view
- verifying the default homepage no longer renders Codex Desktop App, `projects.dev`, or build-documentation copy
- verifying the homepage prize section renders eight team prize cards with the selected supporter shirt feature
- verifying `#prizes/japan` renders the team prize detail page and mobile layout without horizontal overflow
- verifying sponsor package additions with lint and production build
- verifying `WEBSITE_FLOW.md` is imported into the Experiment documentation list
- verifying the homepage supporter picker renders "Choose Your Team"
- verifying the Experiment view renders the updated Codex and projects.dev attribution links
- verifying the header logo link points to `/`
- verifying `/operations`, `/experiment`, `/prizes`, `/prizes/japan`, `/sponsors`, and legacy `/#operations` or `/#experiment` load without `#` fragments
- verifying header navigation changes URLs client-side while preserving app state
- verifying the attached logo renders at 98px inside the 120px topbar
- verifying `/experiment` renders the build blog article, removes the old docs grid, keeps the agent log markdown file, and shows the technology flowchart nodes
- verifying the AI build disclosure banner renders on the homepage with the estimated token total and cost
- verifying the Google Analytics gtag script is injected with `G-RFPJRPKYQR`, `/operations` navigation works, and the browser reports no console errors
- verifying the AI build disclosure renders above the logo as the sticky top status bar on desktop, with compact mobile CSS rules updated for narrow screens
- verifying the smaller 78px logo renders below the AI status bar with the updated 100px navigation row
- verifying `/posthog` renders four metric cards, six funnel steps, five event groups, five setup items, no horizontal overflow, a working PostHog external link, and legacy `/#posthog` redirect behavior
- verifying the AI build disclosure renders the refreshed `~2.9M` token total and `~$22` estimated cost with no browser console errors
- verifying the header and footer both expose "PostHog Dashboard" links to `/posthog`, and the AI build disclosure renders the refreshed `~3.0M` token total and `~$23` estimated cost
- verifying Projects.dev status shows `worldcup2026-analytics` as a completed PostHog analytics resource in the default environment
- verifying `/posthog` shows the `worldcup2026-analytics` resource card, the three Projects.dev env var names, the refreshed `~3.1M` token total and `~$24` estimated cost, no old `https://us.posthog.com/dashboard` link, no horizontal overflow, and no browser console errors
- verifying Projects.dev status shows the earlier `analytics` PostHog resource has no environments while `worldcup2026-analytics` remains active in the default environment
- verifying `/posthog` shows the single-active-resource copy, the refreshed `~3.2M` token total and `~$25` estimated cost, no horizontal overflow, and no browser console errors
- before SDK installation, verifying `npm ls posthog-js` was empty and tracked source had no PostHog init/capture calls or hardcoded project tokens
- verifying `index.html` contains the static GA4 `G-RFPJRPKYQR` snippet and the runtime initializer exits when `window.gtag` already exists
- verifying the served homepage HTML contains the pasted GA4 snippet and the browser DOM has exactly one `googletagmanager.com/gtag/js?id=G-RFPJRPKYQR` script with no console errors
- verifying the optimized homepage hero and prize shirt runtime images resolve to `.jpg`, the refreshed `~3.4M` token total and `~$27` estimated cost render in the AI build disclosure, `/prizes/japan` loads the optimized shirt image, there is no horizontal overflow, and there are no browser console errors
- verifying PostHog no-key behavior: homepage renders the refreshed `~3.5M` token total and `~$28` estimated cost, `posthog-js` is installed, no `phc_` key appears in the DOM, no `/ingest` script is present, team selection still works, and there are no browser console errors
- verifying Projects.dev status shows `WorldCup` as the only PostHog analytics resource in the default environment, while `analytics` and `worldcup2026-analytics` remain detached from the default environment
- verifying DCO passes after signed-off PR commits, `vercel build` completes, and `vercel deploy --prebuilt` rejects the old invalid config then succeeds after removing `skipTrailingSlashRedirect`
- verifying Projects.dev status shows Neon `primary-db` exists and exposes the redacted `PRIMARY_DB_CONNECTION_STRING` env var for future server-side prediction entry persistence
- verifying `npm run lint` and `npm run build` pass after the Matchday Pulse live-banner implementation
- verifying the homepage live banner renders the `~4.1M` token and `~$34` AI build disclosure, shows the active match prediction surface, updates Mexico from 0-0 to 1-0 with the predicted outcome changing to Mexico, switches the rail to Match 2 and updates the title/prize panel to South Korea vs Czechia, has no horizontal overflow, and reports no fresh browser console errors after reload
- verifying a 390px mobile viewport keeps the Lock Prediction CTA and score controls before the prize/sponsor panel, with no horizontal overflow
- verifying `npx vercel build` passes with the new API functions and Neon serverless dependency bundled into `.vercel/output`
- verifying the homepage prediction arena renders the refreshed `~4.4M` token and `~$37` AI build disclosure, keeps score cards, score steppers, predicted outcome, and the Lock Prediction CTA visible in a 1280x720 first viewport, and has no horizontal overflow
- verifying the entry modal opens from Lock Prediction, explains early US shipping-address collection, preserves full form values after a failed Vite-local submission, and does not display the full address in the receipt surface
- verifying the built `GET /api/match-prize-bundles` handler returns one static-backed bundle for `limit=1`
- verifying the built `POST /api/prediction-entries` handler returns a `202` `server-fallback-no-database` receipt when `PRIMARY_DB_CONNECTION_STRING` is absent, includes a receipt hash and joined count, and does not return address fields
- noting local `vercel dev` still returned `NO_RESPONSE_FROM_FUNCTION` for API routes even though `npx vercel build` and direct built-handler checks passed; deployed/prebuilt validation should be used for the API path until the local wrapper issue is resolved
- verifying Projects.dev status shows Neon `primary-db` complete in the default environment and `stripe projects env` exposes the redacted `PRIMARY_DB_CONNECTION_STRING` name without printing secrets
- verifying `npm run verify:api:fallback` exercises the source handlers directly and returns a `202` no-database receipt with no address fields
- verifying `npm run db:prediction-schema` applies seven schema statements to Neon using `PRIMARY_DB_CONNECTION_STRING` without printing secrets
- verifying `npm run verify:api:persisted` returns a `201` Neon receipt, confirms no address fields are returned, verifies the persisted row by receipt hash, and cleans up the smoke-test participant and entry
- verifying `npm run dev:api` serves local API handlers on `127.0.0.1:5176`; direct HTTP smoke checks return `200` for bundles and `202` fallback for prediction entries without address fields
- verifying Vercel has encrypted `PRIMARY_DB_CONNECTION_STRING` values for Preview and Production
- verifying `npx vercel deploy --prebuilt` creates a protected Vercel preview
- verifying `npm run verify:api:vercel` uses Vercel CLI protected-deployment access, receives a deployed `201` Neon receipt, returns no address fields, verifies the row, and cleans up the smoke-test data
- verifying `npm run lint` and `npm run build` pass after adding the multilingual website shell
- verifying English, Arabic RTL, and Spanish language switching on the homepage keeps the prediction controls readable, Spanish persists across reload, Arabic sets `dir="rtl"`, there is no horizontal overflow, and there are no fresh browser console errors
- verifying `/sponsors` renders four marketplace-style package listings with Website Sponsor at `$25,000`, shows the refreshed `~5.1M` token and `~$44` AI build disclosure, localizes the sponsor board in Spanish, stacks packages cleanly at 390px mobile width, has no horizontal overflow, and reports no fresh browser console errors after reload
- verifying `/teams` renders 48 team identity cards across 12 groups, shows the Saudi "Support the green / شجّع الأخضر" support line, shows $45,000 package math and 144 team-side sponsor slots, has no horizontal overflow, and reports no browser console errors
- verifying `/teams/saudi-arabia` renders the Green Falcons known-as line, three group fixture sponsorship cards, source links including Saudipedia, $15,000 per-game math, no horizontal overflow, and no browser console errors
- verifying a 390px mobile viewport keeps `/teams` and `/teams/saudi-arabia` readable with all 48 cards, Saudi sponsor CTAs, three fixture cards, no horizontal overflow, and no browser console errors
- verifying the shadcn migration with `npm run lint` and `npm run build`
- verifying `/`, `/sponsors`, and `/teams/saudi-arabia` at 1440px render two sponsor rails, eight sponsor ad cards, shadcn card primitives, no horizontal overflow, and no fresh browser console errors beyond Vite/React dev messages
- verifying `/experiment` at 390px renders horizontal sponsor strips, eight sponsor ad cards, shadcn card primitives, no horizontal overflow after the grid min-width fix, and no fresh browser console errors beyond Vite/React dev messages
- verifying the compact sponsor rails with `npm run lint` and `npm run build`
- verifying `/` and `/sponsors` at 1440px render compact desktop sponsor cards around 130px wide, two visible sponsor rails, eight visible ad cards, no animation, no horizontal overflow, and the refreshed `~5.7M` / `~$50` AI estimate
- verifying `/` and `/sponsors` at 390px render one visible moving sponsor banner above page content, hide the lower/right rail, animate with `sponsor-mobile-marquee`, keep eight visible ad cards, and avoid horizontal overflow
- verifying the visual design polish with `npm run lint` and `npm run build`
- verifying `/` and `/sponsors` at 1440px and 390px keep zero horizontal overflow, show the refreshed `~5.8M` / `~$51` AI estimate, keep desktop sponsor rails static, keep mobile sponsor marquee movement active at 48s, and report no fresh browser console errors beyond Vite/React dev messages
- verifying the sponsor onboarding flow with `npm run lint` and `npm run build`
- verifying `/sponsors` at desktop renders the sponsor application heading, logo upload section, terms section, refreshed `~6.0M` / `~$53` AI estimate, zero horizontal overflow, and no browser console errors
- verifying `/sponsors` at 390px mobile keeps zero horizontal overflow and the sponsor marquee/page layout active with no browser console errors
- verifying local `POST /api/sponsor-applications` through the Vite proxy returns a `202` `server-fallback-no-database` receipt for fake sponsor data with status `awaiting_payment`, package `Website Sponsor`, and checkout mode `stripe-checkout-not-configured`
- verifying `npm run dev` now starts both the Vite app on `127.0.0.1:5173` and the prediction API shim on `127.0.0.1:5176`
- verifying `npm run verify:api:dev` submits through the Vite `/api/*` proxy and returns a `202` `server-fallback-no-database` prediction receipt without address fields
- verifying desktop browser prediction flow: increase Mexico to 1-0, open the entry modal, submit valid US participant data, receive a prediction receipt, keep the full address out of the rendered page, avoid horizontal overflow, and report no browser console errors
- verifying 390px mobile prediction flow: score change, modal open, exact State label access, valid entry submit, full-width receipt rows for long email/hash fields, no address rendered back, no horizontal overflow, and no browser console errors
- noting `npm run verify:api:persisted` could not run in this shell because `PRIMARY_DB_CONNECTION_STRING` was not present
- verifying `npm run lint` and `npm run build` pass after the Floodlights React rebuild (`tsc -b` clean, production bundle built)
- verifying the Floodlights home hub renders the neon hero, LED predict scoreboard with working score steppers/outcome, sponsor band, and ticker
- verifying `/sponsors` renders the hero, count-up reach stats, four partnership packages, inventory mockups (predict board + group card with sponsor logos/flags), backers row, and contact form; clicking a package's "Choose package" scrolls to the form and presets the tier select; no console errors
- verifying `/pickem` renders the 12 group cards with per-group sponsor tags, and "Quick-fill favourites" lights all four stages (Groups 12/12, Wildcards 8/8, Knockout 31/31, Champion) with correct QUALIFIES/WILDCARD ranking
- verifying `/brackets` reads the saved bracket and populates "you vs the crowd" (Mexico champion, 81% agreement, 13/16 R32 winners, 3 contrarian calls), champion-distribution and match-consensus bars
- verifying the light theme flips the whole site to the high-contrast light palette and stays legible
- verifying Arabic switches to RTL with Zain/Alexandria fonts and localized team names while LED/Doto numbers stay left-to-right
- verifying Auth0 provider swap with `npm run lint`, `npm run test:v0.1`, `npm run build`, `npm run db:apply`, `npx vercel build`, local `/api/auth/start` 302 redirect, Auth0 `/authorize` -> `/u/login`, Vercel env list showing Auth0 env vars and no WorkOS env vars, and in-app browser smoke check from `/pickem` lock gate to Auth0 Universal Login
- verifying Auth0 passwordless follow-up with `npm run test:v0.1`, `npm run
  lint`, `npm run build`, a direct local
  `POST /api/auth/passwordless/start` using `moe@babanuj.com` returning
  `auth_provider_not_ready`, Auth0 Authentication API returning
  `bad.connection`, Projects.dev Auth0 catalog showing only `client` as the
  deployable resource, and the in-app browser rendering the email-code modal
  without a password field
- verifying the same-design sign-in adjustment in the in-app browser: `/profile`
  opens the Floodlights email-code modal with `Send email code`, no `Password`
  field, and no `Use hosted Auth0` button
- verifying Auth0 passwordless delivery triage: local
  `/api/auth/passwordless/start` returns `sent: true`; Auth0 custom SMTP through
  AgentMail logs `550 5.1.8 Sender address rejected`; direct AgentMail SMTP to
  `moe@babanuj.com` queues successfully and was user-confirmed received; Auth0
  built-in delivery logs `Code/Link Sent` to `moe@babanuj.com` without a new
  `Failed Sending Notification`; AgentMail QA inbox polling did not receive the
  Auth0 built-in email in the test window
- verifying the first real Auth0 OTP session: local
  `/api/auth/passwordless/verify` accepted a human-supplied code for
  `moe@babanuj.com`, returned an authenticated session and handle-setup
  redirect, `/api/auth/me` read the signed session cookie, handle `moe2026` was
  saved, and authenticated group-pick, prediction, and bracket data each
  saved/reloaded successfully
- verifying follow-up Auth0 QA: a fresh code from `moe@babanuj.com` was
  accepted by the local passwordless verify endpoint; `/api/auth/me`,
  `/api/profile/handle`, `/api/picks/group`, `/api/picks/predict`,
  `/api/picks/bracket`, and `/api/profile` returned the expected authenticated
  values and persisted readbacks; Chrome rendered the website-styled email-code
  modal but another Chrome extension UI blocked structured automation after the
  stale-code modal; the extension-free in-app browser verified `/pickem` in
  English dark, English light, Arabic RTL light, and Arabic RTL dark with no
  console errors

Latest screenshot:

`artifacts/asset-cleanup-homepage.png`
`artifacts/asset-cleanup-prize-japan.png`
`artifacts/homepage-prediction-arena.png`
`artifacts/homepage-entry-modal-retry.png`
`artifacts/team-directory-page.png`
`artifacts/shadcn-final-1440-home.png`
`artifacts/shadcn-final-1440-sponsors.png`
`artifacts/shadcn-final-390-experiment.png`
`artifacts/sponsor-compact-marquee-final-1440-home.png`
`artifacts/sponsor-compact-marquee-final-390-home.png`
`artifacts/design-polish-final-1440-home.png`
`artifacts/design-polish-final-390-home.png`
`artifacts/team-saudi-detail-page.png`
`artifacts/sponsor-onboarding-form.png`
`artifacts/sponsor-onboarding-mobile.png`

## Next Tasks

- Promote or deploy to production only after legal/privacy review and final campaign readiness.
- Add real persistence for draws, shipments, and reviews.
- Add authentication and user profiles.
- Add official rules/no-purchase/eligibility disclosures before any real prize campaign.
- Wire Stripe Checkout Session creation, webhook signature verification, sponsor confirmation email, and admin review tooling for sponsor applications.
- Add admin tooling for active sponsor campaigns, product SKUs, and fulfillment batches.
- Integrate a real POD provider API behind server-side actions.
- Design production shirt artwork files or outsource design refinements.
- Replace the prototype schedule snapshot with an official data feed or maintained admin import before launch.
- Add responsive visual verification for mobile and tablet breakpoints.

<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "World Cup".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->
