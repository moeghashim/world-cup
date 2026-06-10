# Building A World Cup Prediction And Sponsor Rewards Website

Last updated: 2026-06-08

This is the working blog post for the project. Update this file on every commit so the article stays aligned with the real build history.

## The Idea

The product started as a World Cup prediction website where fans choose the team they support, predict match outcomes, and become eligible for sponsor-funded rewards when they are right. The rewards concept has three parts:

- match-level draws with around 5-10 winners per match
- sponsor product packages shipped to winners
- free localized supporter T-shirts themed around the user's chosen team

Winners should also be prompted to review sponsor products after delivery. That means the product is not just a prediction game. It is a full loop: predict, draw, fulfill, review.

## Early Product Shape

The project began in an empty folder, so the first step was to scaffold a Vite, React, and TypeScript app. The first usable screen was intentionally not a marketing landing page. It became the prediction experience itself:

- supporter team selection
- team-themed UI
- match prediction cards
- score inputs
- winner picks
- locked predictions
- sponsor reward panels

The project also generated a cinematic stadium hero image and saved an optimized runtime export at `src/assets/world-cup-hero.jpg`. The asset gives the site tournament energy without using official FIFA, tournament, sponsor, player, or federation marks.

## Why Team Theming Is Data-Driven

The supporter team choice controls the visual theme. Each team has a typed theme object in `src/data/worldCup.ts`:

- team name and code
- supporter chant
- mood description
- primary, secondary, accent, ink, and soft colors
- supporter stats

React maps the selected team into CSS variables:

```css
--team-primary
--team-secondary
--team-accent
--team-ink
--team-soft
```

This keeps personalization flexible without letting team color take over the app. It also makes future team additions straightforward: add a data record, and the UI inherits the theme.

## Tournament Teams And Schedule Snapshot

The app now has a real tournament snapshot section instead of hiding team and fixture context behind the prediction cards.

The schedule data lives in `src/data/worldCupSchedule.ts` and is intentionally typed:

- 48 teams grouped from A through L
- 72 group-stage fixtures
- match number, date, ET kickoff time, venue, home team, and away team
- source metadata dated 2026-06-02
- a helper that returns the selected supporter team's group fixtures

The UI renders this inside the JSON-render product surface as `TournamentSchedule`. It shows three things:

- a source snapshot panel with a FIFA schedule verification link
- a highlighted schedule for the selected supporter team
- all groups and the full group-stage fixture list

This is still a prototype data boundary. The product should replace the snapshot with an official data feed or maintained admin import before any real prize campaign, because schedule changes and source corrections would directly affect prediction eligibility.

## Why JSON-render Is Used Carefully

The project uses `@json-render/core` and `@json-render/react`, but only as a constrained presentation layer.

The important boundary is this:

- JSON-render controls section composition and registered UI actions.
- React and typed domain code own prediction, draw, fulfillment, and review state.

That split came from the design study. JSON-render is useful for catalog-first UI, generated modules, and controlled layout variation. It is not the right source of truth for anything involving prizes, eligibility, audit trails, fulfillment, or compliance.

The JSON-render catalog lives in `src/jsonRender/predictionCatalog.tsx`. It defines product-specific components:

- `MatchBoard`
- `TournamentSchedule`
- `DrawControl`
- `ShirtStudio`
- `FulfillmentPipeline`
- `RewardSummary`
- `ProviderPlan`

The JSON spec decides which sections appear, but action handlers still call deterministic state updates.

## The Prediction System

The prediction flow is intentionally simple in the prototype:

1. Pick a match winner or draw.
2. Set the scoreline.
3. Lock the prediction, which creates a draw application receipt.
4. Evaluate eligibility against the demo match result.
5. Run a seeded demo draw after the result closes.
6. Present the participant outcome.

Demo match data includes a `winnerSlots` number and a deterministic `demoResult`. Community entries are seeded in local data so draw behavior is repeatable during testing.

The draw result includes:

- final result label
- total entry count
- eligible entry count
- winners
- alternates
- exact-score flag
- prize description
- participant outcome
- public seed, commitment, reveal seed, and audit hash
- fulfillment status

This is enough to demonstrate the flow without pretending to have production scoring, fraud checks, official results, or legal eligibility rules.

## Draw Mechanism And Reveal

The latest build makes the draw participant-aware. The important product decision is that applying for a draw is not a separate form in the MVP. A visitor applies by locking a prediction before the result closes.

That lock produces a receipt hash tied to:

- match id
- supporter team
- predicted winner
- predicted score
- rules version

When the draw runs, the system combines seeded community tickets with the current visitor's locked ticket, checks eligibility against the result, ranks eligible receipts with a public seed plus reveal seed, and then selects the configured winner slots. The next ranked receipts become alternates.

The UI now shows this as a participant journey:

1. Apply
2. Check
3. Seed
4. Reveal
5. Claim

The reveal animation uses ticket movement, a stadium light sweep, and sequential winner rows. It deliberately avoids casino-style reels or betting visuals. The participant sees one of the key outcomes: lock a pick, ticket not eligible, winner, alternate, qualified but not selected.

The implementation lives in `src/jsonRender/predictionCatalog.tsx`, with styling in `src/App.css`. The JSON-render layer still controls the section and component surface, while typed React state owns the actual draw state and audit data.

## Sponsor Rewards And Fulfillment

The rewards model separates the fan-facing prize from the operational flow.

Fan-facing rewards include:

- sponsor gift collections
- exact-score bonus credit draws
- supporter streak boosts
- free localized T-shirts

Operationally, the prototype shows:

- shipment queue count
- review prompt count
- match-level queue actions
- match-level review actions

This is deliberately visible because sponsor rewards need auditability. A future production system should store immutable records for prediction, result, eligibility, draw, claim, shipment, delivery, and review prompt events.

## Localized T-Shirts

The T-shirt system uses independent fan designs rather than official jerseys. That matters because official tournament marks, federation crests, player names, mascot imagery, trophy imagery, and sponsor marks generally require licensing.

Current T-shirt concepts cover:

- Brazil: Canary Street Rhythm
- Argentina: Skyline Albiceleste
- United States: Stateside Rally
- France: Bleu Moderne
- England: Terrace Rose Abstract
- Spain: La Roja Rhythm
- Morocco: Atlas Pulse
- Japan: Rising Motion

Each concept includes motif, print copy, alternate copy, colors, and a no-official-branding disclaimer.

The repository now also includes a `designs/` asset library. It contains team concept images, generated shirt design mockups for Argentina, Brazil, France, Japan, Morocco, Spain, and the United States, and a refined concept board. These assets are useful for visual direction and future POD handoff, but they are not final print files yet.

## Logo Exploration

The first logo pass for `winworldcup2026.com` explores three independent brand directions:

- Orbit/cup: a circular football orbit with a generic winner cup.
- Motion ball: a fast matchday prediction mark with a football and winner spark.
- Shield/globe: a more structured contest identity with a globe grid and generic cup.

The generated PNG board is saved as `designs/logos/logo-concept-board.png`. The usable source assets are SVG files in `designs/logos/` so the wordmark text stays exact and editable.

This pass avoids official tournament symbols, federation marks, sponsor marks, mascot art, player likenesses, and official trophy silhouettes.

The selected direction later changed from Variation B to a user-provided attached SVG. That file is preserved as `designs/logos/worldcup-logo-attached.svg`, copied to `src/assets/winworldcup2026-logo.svg`, and now appears in the top navigation as the active website logo.

The active logo still needs final legal/IP review before launch, especially because contest and tournament-adjacent branding can create avoidable trademark risk.

## Experiment Page And Public Build Notes

The site now includes a footer-linked `Experiment` view. It imports the project documentation files as raw markdown and renders them as readable panels inside the website:

- `BUILD_BLOG.md`
- `AGENTS.md`
- `PRODUCT.md`
- `WEBSITE_FLOW.md`
- `DESIGN.md`

This makes the process artifact part of the product experience, not just a repository file. The Experiment view notes that the project is being built with [Codex](https://chatgpt.com/codex) Desktop App by OpenAI and [projects.dev](https://projects.dev/) by Stripe without writing a single line of code, while the default homepage stays focused on matches, prizes, and winners. The `WEBSITE_FLOW.md` artifact adds Mermaid diagrams for the visitor journey, app architecture, draw mechanism, and tools used.

`BUILD_BLOG.md` remains the file that is updated on every commit. It is the running public article for how the project is being built.

## From Hash Anchors To Page Routes

The navigation moved from hash fragments such as `/#operations` and `/#prizes/japan` to page-style URLs:

- `/fixtures`
- `/teams`
- `/draws`
- `/prizes`
- `/prizes/japan`
- `/shirts`
- `/sponsors`
- `/rewards`
- `/operations`
- `/posthog`
- `/experiment`

The React app still owns the interactive prediction state, but internal links now push real paths into browser history instead of changing `window.location.hash`. That keeps predictions and draw state alive while visitors move between pages. Direct page refreshes are supported by a Vercel rewrite in `vercel.json`, and legacy hash URLs are normalized to the new paths for backward compatibility.

This gives the site cleaner public URLs and lets pages like `/operations`, `/posthog`, `/experiment`, `/prizes`, `/prizes/:team`, and `/sponsors` render as focused views instead of appended homepage sections.

## Experiment Page Redesign

The Experiment page was simplified after the site moved to page routes. Instead of showing every project document as a card, it now has one primary artifact: the build blog itself.

The page renders `BUILD_BLOG.md` as a structured HTML article with headings, paragraphs, lists, links, inline code, and code blocks. The agent log stays available as `AGENTS.md`, but it is kept as a raw markdown file in a collapsible panel rather than competing with the article.

The old page/document flow diagram was replaced with a technology flowchart. That flow focuses on how the app is built and operated:

- Codex Desktop App
- GitHub
- Vercel
- React + TypeScript
- JSON-render
- Stripe Projects
- planned and active providers such as PostHog, WorkOS, Neon, POD, and 3PL

The point is to explain the build stack and production path, not to repeat the public page navigation.

## AI Build Disclosure Banner

The site now includes a compact notification status bar at the very top of the page, above the logo and main navigation. It says the project was built entirely by AI and shows a public usage estimate:

- estimated total tokens: `~6.0M`
- estimated API-equivalent cost: `~$53`

The banner labels the cost as an estimate because the repository does not contain a complete token-by-token billing export for every Codex, sub-agent, tool, and image generation step. The number is a transparent project estimate, not a billing receipt.

## Print-On-Demand And Sponsor Package Research

The print-on-demand research led to a practical split:

- Use Gelato first for global-local winner T-shirts.
- Use Printful when branded control, mockups, webhooks, and light warehousing matter more.
- Treat Printify as a cost lever, not the main operational backbone.
- Use a separate 3PL or kitting partner for real sponsor product packages.

The key learning: POD pack-ins are not a substitute for real sponsor-product fulfillment. Sponsor boxes need inventory receiving, SKU controls, customs handling, tracking, and delivery events.

## Stripe Projects And Infrastructure

Projects.dev, also known as Stripe Projects, was researched for project operations. It is useful for provisioning and managing development infrastructure, credentials, providers, and spend limits.

Current external project status from the sub-agent:

- `World Cup` Projects.dev project exists.
- Stripe Projects auth works.
- Neon free plan is provisioned.
- Neon Postgres service exists as `primary-db`.
- WorkOS AuthKit sandbox service exists as `auth`.
- AgentMail API service exists as `agent-email`.
- Cloudflare free Workers plan is provisioned, but hosting is not wired through it.
- Sentry monitoring service exists as `monitoring`, but the frontend SDK is not wired yet.
- PostHog account is linked through Projects.dev, with `WorldCup` provisioned as the dedicated analytics project resource for this website. The earlier `analytics` and `worldcup2026-analytics` resources remain provisioned but are removed from the default environment so the site has one active PostHog analytics target. The SDK is installed and event call sites are wired, but capture stays inert until `VITE_POSTHOG_KEY` is set and the app is restarted or rebuilt.
- Vercel is blocked by Vercel-side signup verification.
- Spend limits are not configured yet.

Projects.dev should support the build stack. It should not be treated as the contest, payment, compliance, fulfillment, or vendor-payment system.

## Impeccable-Inspired Design Pass

The site was later refined using `https://impeccable.style/designing/` as a design workflow reference.

The useful lesson was not to clone the visual style. The useful lesson was to document product/design context and then use that context to tighten the layout.

That pass added:

- `PRODUCT.md`
- `DESIGN.md`
- desktop workflow rail
- cleaner product-state empty copy
- corrected section anchors
- stronger matchday operations framing

The workspace now has a clearer flow:

1. Predict
2. Draw
3. Personalize
4. Fulfill
5. Review

## Verification So Far

The project has been verified with:

```bash
npm run lint
npm run build
```

Browser checks have covered:

- team switching
- prediction selection
- score inputs
- lock state
- draw application receipt creation
- seeded match draw
- winner rendering
- participant outcome rendering
- public seed, commitment, and audit hash display
- winner reveal layout at the medium breakpoint
- fulfillment queue actions
- review prompt actions
- workflow rail copy
- console error checks
- teams/schedule section with 12 group cards and 72 fixture rows
- supporter schedule switching from Brazil to Japan
- sticky-header anchor offset and compact fixture-card wrapping
- attached logo rendering in the header after resizing the topbar logo slot, including the later 20% logo increase
- footer Experiment link, imported markdown panels, 10claws.com attribution, and homepage checks that keep Codex Desktop App plus projects.dev attribution out of the default match experience
- Experiment documentation panel import for `WEBSITE_FLOW.md`
- page-path routes for `/operations`, `/experiment`, `/prizes`, `/prizes/japan`, and `/sponsors`
- legacy hash URL normalization from `/#experiment` and `/#operations` to page paths
- header navigation between page paths while preserving app state
- attached logo rendering at 98px inside the 120px topbar
- Experiment page redesign with the Build Blog HTML article, AGENTS.md raw log, and technology flowchart
- AI build disclosure banner with refreshed estimated total tokens and API-equivalent cost
- Google Analytics script injection with `G-RFPJRPKYQR` and GA4 Enhanced Measurement guidance for page routes
- AI build disclosure moved above the logo as a top status bar
- header logo reduced from 98px to 78px below the AI status bar
- `/posthog` dashboard page with metric cards, funnel steps, event taxonomy, setup checklist, and legacy `#posthog` redirect
- AI build disclosure estimate refreshed to `~2.9M` total tokens and `~$22` estimated API-equivalent cost
- PostHog dashboard navigation made explicit in the header and footer
- dedicated `worldcup2026-analytics` PostHog resource card on `/posthog`, including env var names, refreshed `~3.1M` token and `~$24` cost estimate, no old dashboard URL, no horizontal overflow, and no console errors
- Projects.dev cleanup that removed the earlier `analytics` PostHog resource from the default environment, leaving `worldcup2026-analytics` as the only active PostHog analytics resource for future site wiring
- pre-install confirmation that `posthog-js` was not installed and tracked source had no PostHog init/capture calls or hardcoded project tokens
- static GA4 `G-RFPJRPKYQR` snippet present in `index.html`, with the runtime analytics initializer kept only as a duplicate-safe fallback
- env-gated `posthog-js` setup with `/ingest` proxying, prediction/draw/reward event call sites, `.env.example`, `POSTHOG_SETUP.md`, and no-key browser verification
- Projects.dev status showing `WorldCup` as the only active PostHog analytics resource in the default environment, with the older PostHog resources detached from site wiring
- PR check recovery: DCO sign-offs were added to the branch commits, and the Vercel deployment failure was traced to an invalid `skipTrailingSlashRedirect` property in `vercel.json`
- homepage prediction banner PRD with full-address entry capture, sponsor/prize bundle placement, upcoming match rail, Neon-backed persistence requirements, and Wegnener implementation handoff
- live-banner PRD for matchday atmosphere, score-change reactions, active fixture rail states, prize-panel reveals, sponsor context, and reduced-motion behavior

Current visual artifact:

`artifacts/posthog-dashboard.png`

## Commit Timeline

### `1d190e6` - Initial World Cup predictor prototype

Built the first working React prototype with supporter team theming, predictions, seeded draws, reward previews, T-shirt concepts, provider recommendations, and the initial build log in `AGENTS.md`.

### `d2592fe` - Enhance product layout with design workflow

Added the Impeccable-inspired design workflow, `PRODUCT.md`, `DESIGN.md`, persistent workflow rail, cleaner empty states, and updated verification artifacts.

### `fe5d615` - Add build blog artifact

Added this file so the build can be turned into a public article over time. Also updated the project workflow so future commits update both `AGENTS.md` and this blog artifact.

### `90949f6` - Build participant draw mechanism

Added receipt-based draw application, participant outcomes, deterministic seeded winner and alternate ranking, audit metadata, animated draw presentation, and lifecycle status updates for fulfillment and review prompts.

### `f8e58c1` - Add localized shirt design assets

Committed the generated shirt concept and design image library under `designs/`, and documented that these files are visual direction assets rather than production POD artwork.

### `d9a1b1e` - Add logo variations

Added three SVG logo variations and a generated concept board for `winworldcup2026.com`, with documentation clarifying that the assets are independent brand explorations.

### `174695a` - Select motion-ball logo

Selected Variation B as the active website logo, copied it into `src/assets/`, and replaced the original temporary trophy icon in the header brand.

### `3613fde` - Add tournament schedule snapshot

Added a typed tournament schedule snapshot, a JSON-render schedule section, all teams grouped from A through L, 72 group-stage fixture rows, and selected-team schedule highlights tied to supporter mode.

### `198b22f` - Use attached logo

Replaced the active website logo with the user-provided attached SVG, preserved the source under `designs/logos/`, and verified the SVG and app build.

### `5c56fa7` - Add experiment documentation page

Added a footer-linked Experiment section that renders the project documentation files in the app and labels the site as an experiment from `10claws.com`.

### `01248ac` - Increase attached logo size

Increased the active header logo from 68px to 82px, kept the square SVG metadata aligned, and raised the sticky topbar to 100px so the larger logo keeps appropriate spacing.

### `4900917` - Add Codex Desktop and projects.dev attribution

Added visible attribution in the Experiment section and footer that this project is being built with Codex Desktop App and `https://projects.dev/`, then updated the product, design, and build documentation to keep the public build article aligned.

### `84868a9` - Add sponsor packages section

Moved the technical build attribution and documentation out of the default homepage flow. The footer still links to the Experiment view for build notes, but the homepage now stays centered on fixtures, predictions, prizes, and winner flows.

Added a dedicated prize section to the homepage and per-team prize detail pages at hashes such as `#prizes/japan`. The prize UI uses the generated localized shirt mockups from `src/assets/prizes/`, shows print direction and package details for each team, and keeps the independent-fan-design safety boundary visible.

Verification for this pass included `npm run lint`, `npm run build`, desktop browser checks for `#prizes` and `#prizes/japan`, and a mobile-width check confirming the prize grids/detail page have no horizontal overflow.

Added sponsor package pricing for Global Cup Partner, Matchday Featured Sponsor, and Fan Drop Sponsor campaigns, including winner review-video deliverables, product gift flow, add-ons, and compliance reminders.

### `f46f865` - Add website flow diagrams

Added `WEBSITE_FLOW.md` as a diagram-first explanation of how the website works, including visitor journey, app architecture, draw flow, tools used, and planned production integrations. The file is imported into the footer-linked Experiment view so the build documentation can be read inside the app without adding technical copy to the homepage.

### `eece039` - Rename supporter picker heading

Changed the homepage supporter picker heading from "Choose Your Theme" to "Choose Your Team" so visitors read the action as a team choice while the theme behavior stays behind the scenes.

### `99bc312` - Update Experiment build attribution

Changed the Experiment view attribution to say the project is being built with [Codex](https://chatgpt.com/codex) Desktop App by OpenAI and [projects.dev](https://projects.dev/) by Stripe without writing a single line of code.

### `0973091` - Point logo to homepage root

Changed the header logo link from an in-page section hash to `/` so clicking the logo always returns visitors to the homepage without leaving a `#` fragment in the URL.

### `9384db7` - Use page routes instead of hash navigation

Replaced public hash navigation with page-style paths for fixtures, teams, draws, prizes, sponsors, rewards, operations, and Experiment. Added focused route rendering for JSON-render sections, `/prizes`, `/prizes/:team`, `/sponsors`, and `/experiment`; preserved legacy hash URLs as redirects to clean paths; and added `vercel.json` so deployed direct page refreshes resolve correctly.

### `e6ebe78` - Increase attached logo again

Increased the active header logo by another 20%, from 82px to 98px, and raised the sticky topbar from 100px to 120px so the larger mark has matching spacing.

### `f1aef46` - Redesign Experiment build blog page

Removed the old multi-document Experiment grid. The page now renders `BUILD_BLOG.md` as the primary HTML article, keeps `AGENTS.md` as the agent-log markdown file, and adds a technology flowchart covering Codex, GitHub, Vercel, React/TypeScript, JSON-render, Stripe Projects, and planned production providers.

### `9e2160a` - Add AI build disclosure banner

Added a site-wide notification banner that says the project was built entirely by AI and displays estimated usage of `~2.4M` total tokens with an API-equivalent estimated cost of `~$18`.

### `9b4355a` - Activate Google Analytics page views

Added a small Google Analytics integration around the user-created GA4 web stream `G-RFPJRPKYQR`.

The app now loads `gtag.js` and runs the standard GA4 `config` command once when the React app starts. The website uses client-side page routes such as `/fixtures`, `/prizes/japan`, `/operations`, and `/experiment`, so the GA4 web stream should keep Enhanced Measurement enabled for "Page changes based on browser history events" to count virtual page views from the History API.

The measurement ID is committed as the prototype default, while `VITE_GA_MEASUREMENT_ID` can override it later for staging, production, or a replacement property. The Google Analytics MCP documentation was useful for understanding the tooling boundary, but account/property setup was handled manually in the Google Analytics UI before the measurement ID was wired into the site.

### `0bb356e` - Move AI banner to top status bar

Moved the "Built entirely by AI" disclosure above the logo and primary navigation so it reads like a site status bar instead of a content banner. The sticky header now treats the AI status bar and logo/nav header as one chrome block, and the mobile layout keeps the disclosure compact by hiding the longer estimate note while preserving the token and cost values.

### `972cd94` - Reduce oversized header logo

Reduced the active header logo by 20%, from 98px to 78px, after the larger size made the header feel too heavy. The logo/navigation row now uses a 100px height again, while the AI build disclosure remains above it as the separate top status bar.

### `be43398` - Add PostHog dashboard page

Added `/posthog` as the first PostHog dashboard surface for the product. The page defines the metrics the real PostHog dashboard should track: acquisition, prediction conversion, prize claims, fulfillment health, visitor-to-reward funnel steps, event taxonomy, ownership, and setup state.

The dashboard links to the PostHog app, but it does not send events yet. That boundary is deliberate: the Projects.dev PostHog analytics resource exists, while SDK capture, privacy copy, session replay policy, and final event names still need approval before production tracking begins.

### `141afb0` - Add token estimate maintenance rule

Added a maintenance rule that every commit must refresh the public AI build disclosure token total and API-equivalent estimated cost. The current estimate was updated to `~2.9M` total tokens and `~$22` so this commit follows the rule immediately.

### `d92867e` - Make PostHog dashboard visible

Changed the header and footer navigation labels from generic analytics/PostHog wording to `PostHog Dashboard` so the dashboard route is visible at a glance. The current AI build disclosure estimate was refreshed to `~3.0M` total tokens and `~$23` for this commit.

### `3879d96` - Create dedicated PostHog project

Created a new Projects.dev PostHog analytics project resource named `worldcup2026-analytics` for this website after the earlier dashboard reference turned out to be the wrong project.

The `/posthog` page now names the exact resource, shows the Projects.dev-provisioned env var names without exposing secret values, and links to the PostHog account entry point instead of a misleading old dashboard URL. The current AI build disclosure estimate was refreshed to `~3.1M` total tokens and `~$24` for this commit.

### `9b965f3` - Keep one active PostHog target

Removed the earlier `analytics` PostHog resource from the default Projects.dev environment so future website tracking has one active PostHog analytics target: `worldcup2026-analytics`.

No PostHog SDK or snippet is installed in the website yet, and no events are being sent from the app. This commit updates `/posthog` and the project documentation to make the single-target rule explicit. The current AI build disclosure estimate was refreshed to `~3.2M` total tokens and `~$25`.

### `c8bdacd` - Put GA tag in homepage source

Moved the GA4 tag for `G-RFPJRPKYQR` into the static `index.html` head so it is visible in the homepage HTML source instead of only being injected after React boots.

The runtime analytics initializer remains in place as a fallback for environments that do not include the static snippet, but it now exits when `window.gtag` already exists. That keeps the homepage source explicit without creating duplicate GA scripts or duplicate initial config calls. The current AI build disclosure estimate was refreshed to `~3.3M` total tokens and `~$26`.

### `ce8ed85` - Optimize runtime image assets

Converted the shipped hero and prize-shirt runtime assets from large PNG files to display-sized JPEG files. The original design PNGs stay in `designs/` as source/reference material, while `src/assets/` now carries lighter files for the Vite app.

The cleanup reduces the production image payload substantially without changing the product model, draw behavior, sponsor copy, or design direction. The production build now emits each runtime image between roughly 180 KB and 295 KB, and the runtime image set is about 2.1 MB total instead of the roughly 22 MB full-size design source set.

Verification ran `npm run lint`, `npm run build`, and browser checks for the homepage and `/prizes/japan`. The browser confirmed the `.jpg` hero and prize assets load, the AI build disclosure shows `~3.4M` total tokens and `~$27`, there is no horizontal overflow, and there are no console errors.

### `aaa43cd` - Add env-gated PostHog analytics

Adapted the PostHog setup prompt to this Vite React app. The store-specific funnel became a World Cup prediction funnel: page view, prediction start, locked receipt, draw entry, draw reveal, and fulfillment queue.

The app now installs `posthog-js`, initializes it only when `VITE_POSTHOG_KEY` is set, sends through a first-party `/ingest` proxy, and keeps person profiles to `identified_only`. Custom events are wired at real call sites for supporter selection, prize views, score changes, prediction locks, draw reveals, fulfillment queueing, review prompts, and homepage CTAs.

Added `.env.example` and `POSTHOG_SETUP.md` with the dashboard plan, event taxonomy, proxy behavior, and verification steps. Live PostHog Activity is intentionally not claimed yet because no public PostHog key was set during verification. The no-key path was verified as inert, and the current AI build disclosure estimate was refreshed to `~3.5M` total tokens and `~$28`.

### `118eb9b` - Create WorldCup PostHog project

Created a new Projects.dev PostHog analytics project resource named `WorldCup`, following the naming requirement for any real dashboard work. The old `worldcup2026-analytics` resource is now detached from the default Projects.dev environment so the active website analytics target is only `WorldCup`.

The `/posthog` page, setup checklist, `POSTHOG_SETUP.md`, `PRODUCT.md`, `WEBSITE_FLOW.md`, and `AGENTS.md` now point to `WorldCup`. The documentation also calls out the new Projects.dev env names: `WORLDCUP_API_KEY`, `WORLDCUP_HOST`, and `WORLDCUP_PERSONAL_API_KEY`. The browser-facing app still remains inert until the safe public key is mapped into `VITE_POSTHOG_KEY` and the app is restarted or rebuilt. The current AI build disclosure estimate was refreshed to `~3.6M` total tokens and `~$29`.

### `8e68742` - Fix PR checks

The PR check panel showed DCO failing and Vercel failing. DCO failed because the PR commits did not include `Signed-off-by` trailers, so the branch was rebased with sign-offs added to the three commits.

The Vercel failure was not a TypeScript, Vite, or asset-build failure. `npm run build` and `vercel build` both passed. A prebuilt Vercel deploy exposed the actual issue: `vercel.json` used `skipTrailingSlashRedirect`, which is not accepted as a Vercel project configuration property here. Removing that property kept the SPA and `/ingest` rewrite behavior intact and allowed the prebuilt Vercel deployment path to proceed. The current AI build disclosure estimate was refreshed to `~3.7M` total tokens and `~$30`.

### `7137658` - Create homepage prediction banner PRD

Created `HOMEPAGE_PREDICTION_BANNER_PRD.md` for the prediction-first homepage redesign. The PRD replaces the static hero with a first-viewport match prediction arena, defines an upcoming match rail, adds sponsor and prize-bundle placement inside the hero, and makes full US address capture part of locking a prediction.

The key product decision is explicit: collect full address early because sponsors may choose to send gifts to all entrants, not only winners. The PRD documents the privacy implications, US-only scope, server-side storage requirement, and the Neon `primary-db` persistence path through `PRIMARY_DB_CONNECTION_STRING`. It also assigns implementation to Wegnener so the redesign can proceed in parallel while the broader product planning continues. The current AI build disclosure estimate was refreshed to `~3.8M` total tokens and `~$31`.

### Current commit - Implement prediction-first entry banner

Implemented `HOMEPAGE_PREDICTION_BANNER_PRD.md`. The homepage first viewport is now a prediction arena instead of a static hero and lower duplicate scoreboard. Visitors can browse upcoming fixtures from the hero rail, edit scores, see the predicted outcome, review the sponsor-funded prize bundle, joined count, winner slots, and lock a prediction from the first screen.

Locking opens a draw-entry modal that collects first name, last name, email, phone, full US shipping address, rules acceptance, and optional marketing consent. The address reason is visible in the form because sponsors may choose to send gifts to more eligible entrants, but the full address is not sent to analytics and is not shown in the receipt UI.

Added Vercel API routes for the entry path. `GET /api/match-prize-bundles` returns static-backed bundle data in the future database shape. `POST /api/prediction-entries` validates the submitted participant and prediction payload, recomputes the outcome server-side, upserts the participant by email, inserts the prediction entry, and returns receipt metadata when `PRIMARY_DB_CONNECTION_STRING` is configured. If that env var is absent, the endpoint returns an explicit `server-fallback-no-database` receipt with `persisted: false` instead of pretending the entry was saved. The schema contract lives in `db/schema.sql`. The current AI build disclosure estimate was refreshed to `~4.4M` total tokens and `~$37`.

Verification ran `npm run lint`, `npm run build`, `npx vercel build`, browser checks at 1280x720 confirming score cards, steppers, predicted outcome, and the lock CTA fit in the first viewport with no horizontal overflow, and a modal retry-state check confirming form values are preserved when a local Vite submission cannot reach the Vercel API. Built-handler checks confirmed `GET /api/match-prize-bundles` returns a bundle and `POST /api/prediction-entries` returns a non-persistent fallback receipt without address fields when the database env var is not present. Local `vercel dev` still returned `NO_RESPONSE_FROM_FUNCTION` for API routes, so the deployable API path was validated through `npx vercel build` and direct built-handler invocation.

### Add prediction persistence verification scripts

Added explicit database and API verification commands for the homepage prediction entry path. `npm run db:prediction-schema` applies `db/schema.sql` to Neon when `PRIMARY_DB_CONNECTION_STRING` is present, `npm run verify:api:fallback` proves the no-database receipt path still returns no address fields, and `npm run verify:api:persisted` exercises the real Neon write path, verifies a safe receipt row, and removes the smoke-test participant afterward without printing connection strings or address data. The schema command and persisted smoke test both passed using the CLI-managed local environment.

Added `npm run dev:api` and a Vite `/api` proxy so local Vite development can submit the hero entry form through the same API handlers without depending on the currently flaky `vercel dev` wrapper. HTTP verification against the local shim confirmed `GET /api/match-prize-bundles` returns 200 and `POST /api/prediction-entries` returns a fallback receipt without address fields when no database env is inherited. Projects.dev status confirms `primary-db` is complete in the default environment and exposes the redacted `PRIMARY_DB_CONNECTION_STRING` name.

Configured encrypted `PRIMARY_DB_CONNECTION_STRING` entries for Vercel Preview and Production, deployed a prebuilt preview, and added `npm run verify:api:vercel` for protected preview validation through `vercel curl`. The preview API returned a `201` Neon receipt, verified the persisted row by receipt hash, returned no address fields, and cleaned up the smoke-test row. The current AI build disclosure estimate was refreshed to `~4.6M` total tokens and `~$39`.

### Add multilingual website shell

Added an app-level i18n provider with English, Arabic, French, German, Spanish, Portuguese, Chinese, and Korean language options. The top navigation now includes a compact language selector, the app shell sets `lang` and `dir` from the selected language, and RTL layout handling keeps scores, team codes, badges, and form controls readable.

Localized the primary homepage, route hero copy, JSON-render section headers, prize pages, sponsor package copy, prediction receipt, entry modal, footer, score-control labels, and AI build disclosure. Language changes are captured as analytics events without exposing prediction entry address data. The current AI build disclosure estimate was refreshed to `~5.0M` total tokens and `~$43`.

Verification ran `npm run lint`, `npm run build`, and browser smoke checks for English, Arabic RTL, and Spanish language switching on the homepage. Spanish persisted across reload, Arabic set `dir="rtl"`, there was no horizontal overflow, and there were no fresh browser console errors.

### Add website sponsor package

Added a Website Sponsor package at `$25,000` with 4 available spots. This tier sits between the Global Cup Partner and Matchday Featured Sponsor offers. It is meant for brands that want always-on website visibility before choosing specific match campaigns: homepage placement, prediction banner presence, prize discovery placement, sponsor story content, winner review prompts, and a website performance recap.

The sponsorship section was redesigned as a compact sponsor marketplace board inspired by the layout rhythm of `https://trustmrr.com/`: a top metric strip, ranked package listings, dense package details, and a responsive mobile stack. The implementation borrows the information architecture pattern, not the TrustMRR branding, assets, or exact visual identity. The new package and board labels were added to the multilingual catalog. The current AI build disclosure estimate was refreshed to `~5.1M` total tokens and `~$44`.

Verification ran `npm run lint`, `npm run build`, and browser checks on `/sponsors`. The desktop check confirmed four package columns with Website Sponsor at `$25,000`, the Spanish smoke check confirmed localized sponsor-board labels, the mobile 390px check confirmed stacked sponsor listings with no horizontal overflow, and a fresh browser reload reported no console errors.

### Add team identity sponsor pages

Added `src/data/teamIdentity.ts` as the typed identity catalog for all 48 teams in the tournament snapshot. Each record now has a route slug, group, code, known-as line, sponsor-safe support line, known-for statement, sponsor angle, and research source URLs. The source basis includes FIFA's qualified-team page, a World Cup 2026 nickname table, and stronger individual references for examples such as Saudi Arabia's Green Falcons, Curaçao's Blue Wave, Japan's Samurai Blue, the Socceroos, and Uzbekistan's White Wolves.

The `/teams` route is now a full team directory instead of only the JSON-render schedule section. It renders 48 cards grouped from A through L, shows the support line and known-for statement for every team, links to `/teams/:slug`, and exposes the MVP sponsorship math: $10,000 match spotlight plus $5,000 reward drop per game. A three-game team group-stage package is therefore $45,000 before product, shipping, tax, legal, creative, platform, or payment costs.

Each team detail page, including `/teams/saudi-arabia`, now invites sponsors to support the team or individual games, lists the team's three group-stage fixtures, shows per-game math at $15,000, and keeps source links plus the no-official-marks boundary visible. The current AI build disclosure estimate was refreshed to `~5.3M` total tokens and `~$46`.

Verification ran `npm run lint`, `npm run build`, browser checks for `/teams` and `/teams/saudi-arabia`, and a 390px mobile check for both pages. The browser confirmed 48 team cards, 12 groups, Saudi's "Support the green / شجّع الأخضر" line, 3 Saudi fixture sponsor cards, source links, sponsor math, no horizontal overflow, and no console errors.

### Apply visible sponsor banners

The sponsor design pass originally applied the TrustMRR-inspired structure to the package board, but the page did not have the visible advertiser blocks shown around the TrustMRR page. This pass adds a dedicated `/sponsors` page frame with left and right advertiser rails on desktop, sponsor-safe placeholder ad cards, an empty "Advertise" slot, tablet horizontal rails, and mobile horizontal ad strips.

The sponsor banner strip above the package board remains in place and highlights Website Sponsor, Matchday Featured Sponsor, and Fan Drop Sponsor as compact listing rows with rank, icon, package price, availability, and summary. The implementation uses the advertiser-block layout pattern, not TrustMRR's branding, assets, advertiser names, or exact visual identity. The current AI build disclosure estimate was refreshed to `~5.4M` total tokens and `~$47`.

### Add shadcn foundation and all-page sponsor panels

The website is now set up for an incremental shadcn/ui migration. The pass added Tailwind CSS v4, shadcn's Vite configuration, the `@/` import alias, generated source primitives for Button, Card, Badge, and Separator, and kept the generated components inside the repository so they can be adapted to the product instead of treated as a black-box UI dependency.

The first migrated surface is the sponsor system. Sponsor ad blocks, the sponsor listing banners, and sponsor package cards now render through shadcn source primitives while preserving the existing World Cup reward visual direction. The sponsor rails were also promoted from a `/sponsors`-only frame into a reusable sponsored page frame. Homepage, prize pages, team pages, route pages, PostHog, Experiment, and the sponsors page now all show the advertiser panels: left/right rails on desktop and horizontal sponsor strips on mobile.

Verification ran `npm run lint`, `npm run build`, and browser checks for `/`, `/sponsors`, `/teams/saudi-arabia`, and `/experiment`. The browser confirmed two sponsor rails, eight sponsor ad blocks, shadcn card primitives, no horizontal overflow at desktop, no horizontal overflow at 390px mobile after the grid min-width fix, and no fresh console errors beyond normal Vite/React development messages. The current AI build disclosure estimate was refreshed to `~5.6M` total tokens and `~$49`.

### Compact sponsor rails and mobile marquee

The sponsor frame was doing its job, but the desktop advertiser blocks were too large relative to the prediction surface. This pass reduces the sponsor columns and card dimensions so they behave more like peripheral ad inventory: desktop sponsor cards now sit around 130px wide at a 1440px viewport, with smaller icons, tighter copy, and less horizontal pressure on the match prediction content.

The mobile treatment is now a moving sponsor banner instead of stacked rails. The left sponsor rail becomes a single auto-moving marquee above page content, the right/lower rail is hidden on small screens, and the sponsor cards are duplicated inside an aria-hidden track so the loop can move continuously without JavaScript. Reduced-motion users get animation disabled with the rail kept scrollable.

Verification ran `npm run lint`, `npm run build`, and browser checks for `/` and `/sponsors` at 1440px and 390px. The browser confirmed compact static desktop rails, one visible moving mobile banner using `sponsor-mobile-marquee`, eight visible ad cards, hidden mobile right rail, no horizontal overflow, and the refreshed `~5.7M` total token / `~$50` estimated cost disclosure.

### Polish the public website design

The website needed a visual design pass because the first screen was too boxy and heavy. This pass keeps the existing product model but improves the presentation layer: the app chrome is quieter, the top status bar is thinner, the nav links are rounded and less harsh, and the page background uses softer layered tones instead of flat beige.

The homepage prediction arena is now framed as a premium match card with a rounded stadium image surface, softer glass panels, tighter hierarchy, and less aggressive black overlays. The hero headline is slightly smaller and better weighted, the prize stats no longer break words awkwardly, and the mobile headline/score controls are sized to fit the narrow viewport more naturally.

The sponsor system also got visual polish. Desktop sponsor cards now use softer gradients and shadows, while the mobile marquee runs slower so the cards read as a moving banner instead of a clipped strip. The team picker cards were softened with rounded corners, subtle active-state lift, and a cleaner selected state.

Verification ran `npm run lint`, `npm run build`, and browser checks for `/` and `/sponsors` at 1440px and 390px. The browser confirmed zero horizontal overflow, static desktop sponsor rails, active mobile marquee motion, visible `~5.8M` total token / `~$51` estimated cost disclosure, and no fresh console errors beyond normal Vite/React development messages.

### Build sponsor onboarding flow

Built `sponsorship_plan.md` into the first working sponsor intake path. The `/sponsors` page now keeps the package marketplace and adds an operational application section with company/contact fields, logo upload preview, selected package, optional free-product offer, optional AI one-pager, legal consent checklist, preview cards, and a receipt panel.

The shared sponsor schema lives in `src/data/sponsorOnboarding.ts`, and `POST /api/sponsor-applications` validates the same payload server-side. The endpoint persists to Neon when `PRIMARY_DB_CONNECTION_STRING` is configured and otherwise returns an explicit `202` `server-fallback-no-database` receipt. Stripe stays intentionally gated: the endpoint returns `awaiting_payment` and `stripe-checkout-not-configured` unless future Stripe package price IDs, Checkout creation, webhook signature verification, and admin review are wired.

The plan, product notes, design notes, env example, AGENTS log, and build blog were updated together. The current AI build disclosure estimate was refreshed to `~6.0M` total tokens and `~$53`.

Verification ran `npm run lint`, `npm run build`, browser checks for `/sponsors` desktop and 390px mobile overflow, console-error checks, and a local API smoke test through the Vite proxy. The API returned a fake sponsor application receipt with status `awaiting_payment`, package `Website Sponsor`, persistence mode `server-fallback-no-database`, and checkout mode `stripe-checkout-not-configured`.

### Current commit - Repair prediction QA path

The homepage prediction flow itself worked when both the Vite app and the local API shim were running, but the project structure made that easy to miss: `npm run dev` only started Vite while prediction submission depended on a separate `npm run dev:api` process. That meant the first-screen prediction UI could look healthy while `/api/prediction-entries` failed at the local proxy boundary.

This pass makes the core path harder to break. `npm run dev` now starts both Vite and the local prediction API shim through `scripts/dev.mjs`, while `npm run dev:app` remains available for frontend-only work. `npm run verify:api:dev` now submits through the Vite `/api/*` proxy so local QA covers the same browser-facing API path. The React prediction submission also now builds its payload through a small helper, maps raw `Failed to fetch` errors to the localized retry copy, gives the State select an exact accessible label, and keeps the mobile receipt panel from wrapping long email and hash values into unusable one-character columns.

The current AI build disclosure estimate was refreshed to `~6.2M` total tokens and `~$55`.

Verification ran `npm run lint`, `npm run build`, `npm run verify:api:fallback`, `npm run verify:api:dev`, and `npx vercel build`. Browser QA covered desktop and 390px mobile prediction submission from score change through entry modal, receipt creation, no rendered address data, no horizontal overflow, and no console errors. `npm run verify:api:persisted` could not run in this shell because `PRIMARY_DB_CONNECTION_STRING` was not present.

## Next Build Steps

The prototype needs several production layers before it can become a real campaign:

- promote or deploy to production only after legal/privacy review and final campaign readiness
- database persistence for draws, shipments, and reviews
- authentication through WorkOS or another provider
- official rules, no-purchase route, age/location eligibility, and compliance review
- Stripe Checkout Session creation, webhook signature verification, sponsor confirmation email, and admin review tooling for sponsor applications
- admin tooling for matches, product SKUs, fulfillment batches, and sponsor campaign activation
- real POD integration for T-shirt orders
- real 3PL/kitting integration for sponsor boxes
- enable PostHog SDK capture for the `/posthog` dashboard events after the tracking and privacy policy is approved
- deeper analytics events for prediction starts, locked receipts, draw entries, winner reveals, claims, deliveries, and review prompts
- mobile and tablet visual verification

## Maintenance Rule

Every commit should update this file with:

- what changed
- why the change was made
- which files or systems were affected
- what verification was run
- latest total token estimate and API-equivalent estimated cost shown in the AI build disclosure
- what the next relevant build step is

## 2026-06-07 Reset - Clean slate while keeping live integrations

The project is restarting from a clean product and design slate. The old
prototype UI, generated design assets, prediction data modules, sponsor
onboarding prototype, JSON-render catalog, local API shims, and old operational
planning docs were removed so the next version can be designed fresh with
Stripe Projects in mind.

The reset intentionally keeps the live integration baseline:

- Vercel project state remains local and ignored in `.vercel/`.
- Stripe Projects state remains local and ignored in `.projects/`.
- Local environment files such as `.env` and `.env.local` remain ignored and
  were not removed.
- Google Analytics measurement `G-RFPJRPKYQR` remains in the static
  `index.html` head.
- `src/analytics.ts` still provides the runtime GA fallback and env-gated
  PostHog initialization.
- PostHog stays wired through `posthog-js`, `VITE_POSTHOG_KEY`,
  `VITE_POSTHOG_HOST`, and the first-party `/ingest` proxy in Vite and Vercel.
- Stripe and database environment placeholders remain documented in
  `.env.example`.

The new visible app is a neutral reset screen that shows the preserved AI build
usage disclosure: `~6.3M` total tokens and `~$56` estimated API-equivalent cost.
It also fires a simple `clean_slate_viewed` analytics event when PostHog is
configured.

The next build step is to design the new homepage and prediction flow from this
clean baseline instead of carrying forward the previous prototype structure.

## 2026-06-07 — Floodlights design, rebuilt in React

The team landed on a new visual direction: **Floodlights** — a neon night-match
look (near-black pitch, electric lime/cyan/magenta glow, dot-matrix LED
scoreboard digits, floodlight bloom). It arrived as a Claude Design handoff
bundle: a complete four-page static HTML/CSS/JS prototype (`index`, `pickem`,
`brackets`, `sponsors`) with a shared design system, five-language support
(English, Español, Français, Português, العربية + RTL), light/dark themes,
generated sponsor logos, a 48-team bracket builder with shareable links, and a
public crowd-comparison page.

We rebuilt the whole thing in the repo's own stack — **Vite + React 19 +
TypeScript** — rather than dropping the static files in, so it lives natively in
the codebase:

- The prototype's CSS is reused near-verbatim as the design system
  (`src/floodlights/styles/site.css`) plus one stylesheet per page. Only two
  cross-page class clashes (`.page-head`, `.stat`) were renamed so every page
  sheet can stay global and faithful.
- Theme and language are React contexts that drive `data-theme`/`dir`/`lang` on
  `<html>`, with a pre-paint script in `index.html` to avoid a flash. Picks,
  theme, and language persist in `localStorage` under the `fl:` namespace.
- `react-router-dom` serves the four pages at `/`, `/pickem`, `/brackets`, and
  `/sponsors`; `vercel.json`'s existing SPA rewrite already covers deep links.
- The 48-team bracket logic (group ranking → wildcard thirds → 32-team knockout,
  plus the URL-hash share codec) is ported into a typed, reusable module and a
  React state model; the public-brackets page reads the saved bracket to compute
  the live "you vs the crowd" comparison.
- Animation touches from the design are preserved: floodlight sweep, count-up
  stats, animated bar fills, champion crowning, confetti, and toasts — all
  honouring `prefers-reduced-motion`.

The sponsorship page (`/sponsors`) was the headline deliverable: hero, a captive
audience reach panel with count-up stats, "why it works" cards, four partnership
packages, a "where your brand shows up" inventory with live mini-mockups, a
backers logo row, and a contact form whose package selector is preset when you
choose a tier.

Verified in the browser across all four pages, both themes, English + Arabic
RTL, with the bracket builder and public-brackets comparison working end to end
and no console errors. `npm run lint` and `npm run build` both pass.

The previous neutral reset screen and its inline AI-usage disclosure banner were
replaced by this product surface, so the cumulative AI build estimate now lives
in the documentation: roughly `~6.9M` total tokens and `~$60` estimated
API-equivalent cost.

## v0.1 Accounts And Persistence Milestone

The reconciled v0.1 plan moves account identity to WorkOS AuthKit and keeps
credentials managed through Stripe Projects. The implementation deliberately
drops the earlier custom magic-link token/session design: there are no
`magic_link_tokens` or custom `sessions` tables. Local account rows map to
WorkOS with `users.workos_user_id`.

Task 003 added the server-side WorkOS auth flow:

- `/api/auth/start` redirects to WorkOS AuthKit with an encoded return path.
- `/api/auth/callback` exchanges the WorkOS code, seals the WorkOS session into
  an httpOnly cookie, and maps the WorkOS user into the local `users` table.
- `/api/auth/logout` clears the local sealed-session cookie and redirects through
  the WorkOS logout URL when a valid session is available.
- shared API helpers now cover environment validation, Neon access, cookies,
  request-origin handling, WorkOS initialization, session resolution, and local
  user mapping.

The cumulative build estimate is now roughly `~7.0M` total tokens and `~$61`
estimated API-equivalent cost.

Task 004 added the account profile API surface:

- `/api/auth/me` reports whether a sealed WorkOS session is authenticated and
  whether the user still needs to choose a handle.
- `/api/profile` returns only the current user's email, handle, and signup
  country, never session or token material.
- `/api/profile/handle` validates and stores the first public handle, rejecting
  duplicates with a clear `handle_taken` response.

The cumulative build estimate is now roughly `~7.1M` total tokens and `~$62`
estimated API-equivalent cost.

Task 005 added authenticated pick persistence:

- `/api/picks/bracket` loads and saves the bracket JSON payload in Neon.
- `/api/picks/group` loads and saves the group-stage pick'em card.
- `/api/picks/predict` loads score predictions and upserts match-level score
  picks.
- writes use the WorkOS session plus local handle requirement, while read
  responses stay scoped to pick data and do not include email or token/session
  fields.

The cumulative build estimate is now roughly `~7.2M` total tokens and `~$63`
estimated API-equivalent cost.

Task 006 connected the account flow to the Floodlights UI:

- an `AuthProvider` loads the WorkOS-backed session from `/api/auth/me` without
  prompting on page load;
- anonymous users only see the sign-in gate when they try to lock a bracket or
  group pick'em card;
- the gate starts `/api/auth/start` with the current return path, so WorkOS can
  bring the fan back to the same play surface;
- signed-in users with handles save locked picks through the Neon-backed API;
- signed-in users without handles are sent to the profile setup path before
  saving; and
- sign-in/lock analytics events avoid email or token values.

The cumulative build estimate is now roughly `~7.3M` total tokens and `~$64`
estimated API-equivalent cost.

Task 007 added anonymous-pick migration:

- the existing `fl:bracket` and `fl:grouppicks` localStorage payloads are
  preserved while the fan plays anonymously;
- after WorkOS sign-in and handle completion, the pick'em page uploads those
  local picks into the signed-in account once when the server does not already
  have picks;
- the page then reloads account-backed bracket and group pick'em data from Neon
  so reloads and fresh sessions use the durable copy; and
- the migration marker stores only the local account id namespace, never email,
  auth tokens, or session cookie material.

The cumulative build estimate is now roughly `~7.4M` total tokens and `~$65`
estimated API-equivalent cost.

Task 008 added the localized profile surface:

- `/profile` shows the signed-in account email, public handle, and signup
  country;
- first sign-in can land on `/profile?setup=handle` so the fan chooses a handle
  before account-bound pick saves;
- duplicate/invalid handle responses are translated into clear UI toasts;
- signed-out fans can start sign-in without losing the anonymous bracket already
  stored on the device; and
- sign-out clears the sealed WorkOS session through the server logout route.

The cumulative build estimate is now roughly `~7.5M` total tokens and `~$66`
estimated API-equivalent cost.

Task 009 wired monitoring:

- Vite now reads browser-safe runtime constants from the exact Stripe Projects
  env names: `SENTRY_DSN`, `WORLDCUP_API_KEY`, and `WORLDCUP_HOST`.
- client Sentry initializes only when `SENTRY_DSN` exists and scrubs email,
  IP, cookies, auth headers, and request bodies before events are sent;
- serverless handlers capture unexpected errors through `@sentry/node`, also
  stripping cookies, auth headers, request bodies, and user email/IP; and
- PostHog now uses the `WORLDCUP_*` env contract instead of requiring legacy
  `VITE_POSTHOG_*` names.

The cumulative build estimate is now roughly `~7.6M` total tokens and `~$67`
estimated API-equivalent cost.

Task 010 added the v0.1 test and local QA harness:

- `npm run test:v0.1` now covers WorkOS callback redirect safety, handle
  validation, persisted pick payload validation, anonymous migration helpers,
  non-auth pick API response hygiene, and generic server-error scrubbing.
- `npm run dev` now starts both the Vite app and a local API shim so browser QA
  exercises the same serverless handlers through `/api/*` instead of silently
  missing the account routes.
- README documents the v0.1 test command alongside lint/build.
- Chrome QA reached the anonymous play-to-lock gate and the WorkOS hosted
  AuthKit sign-in page after registering the local callback URI.

The remaining milestone QA blocker is external to the app code: completing
WorkOS AuthKit sign-in requires an accessible one-time email code or approval
for a deliberately local-only session seeding helper, and the current Chrome
session also has another extension UI blocking automation on the AuthKit page.

The cumulative build estimate is now roughly `~7.8M` total tokens and `~$69`
estimated API-equivalent cost.

## Provider Swap: Auth0 By Okta Replaces WorkOS

WorkOS was removed from the active implementation after its Magic Auth setting
blocked the required passwordless QA path. The replacement provider is Auth0 by
Okta, provisioned through Stripe Projects as a new resource named `auth0`.

What changed:

- Projects.dev now has `auth0` active in the default environment and the old
  WorkOS `auth` resource detached from that environment.
- Vercel now has `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`, `AUTH0_DOMAIN`, and
  `AUTH0_COOKIE_SECRET` in Development, Preview, and Production. The old
  WorkOS env vars were removed from Vercel.
- The app now uses Auth0 Universal Login with the Authorization Code Flow.
- `/api/auth/start` creates an auth-state nonce, stores it in an httpOnly cookie,
  and redirects to Auth0.
- `/api/auth/callback` validates the nonce, exchanges the code server-side,
  verifies the Auth0 ID token, maps the user into Neon by `users.auth0_user_id`,
  and sets a signed httpOnly `wwc_session` cookie.
- `/api/auth/logout` clears the app cookie and redirects through Auth0 logout.
- The local session stores only a signed Auth0 subject. Auth0 tokens are not
  stored in client-readable state and are not returned from non-auth APIs.
- A new migration adds `auth0_user_id` while keeping the old `workos_user_id`
  column nullable for databases that already ran the prior WorkOS migration.

The Auth0 client initially rejected localhost with `Callback URL mismatch`.
Projects.dev accepted an `auth0` update for callback, logout, and web-origin
URLs covering local development and `https://winworldcup2026.com`. After that,
Auth0 `/authorize` redirected to `/u/login`, confirming the callback mismatch
was fixed.

Verification:

- `npm run lint`
- `npm run test:v0.1`
- `npm run build`
- `npm run db:apply` after updating it to load local `.env`
- `npx vercel build`
- local HTTP check for `/api/auth/start`
- external Auth0 authorize check to `/u/login`
- `vercel env ls` confirming Auth0 env vars are present and WorkOS env vars are
  absent
- in-app browser smoke check from `/pickem` quick-fill → `Lock my bracket` →
  Auth0 lock gate → Auth0 Universal Login

The database migration was applied to Neon with
`db/migrations/002_auth0_provider.sql`, adding `auth0_user_id`, making the old
WorkOS column nullable, and creating the Auth0 user-id uniqueness index.

Full human-assisted account E2E is still pending a completed Auth0 login session,
so handle setup, anonymous-pick migration after callback, reload persistence, and
profile verification remain the next QA step.

The cumulative build estimate is now roughly `~8.2M` total tokens and `~$73`
estimated API-equivalent cost.

## Auth0 Email-Code Sign-In Follow-Up

The hosted Auth0 page still asked for a password when tested with
`moe@babanuj.com`, so the app now has a first-party email-code sign-in path on
top of Auth0 Passwordless Email.

What changed:

- `/api/auth/passwordless/start` validates the email server-side and asks Auth0
  to send a one-time code with `connection: "email"` and `send: "code"`.
- `/api/auth/passwordless/verify` exchanges the code through Auth0, verifies the
  ID token, maps the Auth0 subject to `users.auth0_user_id`, and sets the same
  signed httpOnly `wwc_session` cookie used by the hosted callback flow.
- The lock gate and signed-out profile page now show an inline email-code form
  instead of sending the player directly to a password form.
- Hosted Auth0 Universal Login remains available as a server route fallback, but
  it is no longer exposed as a public button in the normal sign-in modal.
- The dev API shim routes the new passwordless endpoints locally, and the v0.1
  test suite covers both a successful Auth0 request shape and the current
  missing-provider-connection failure.

The provider blocker is now precise: Auth0 returned `bad.connection` /
`Connection does not exist` from `POST /passwordless/start`, and adding
`connection=email` to Universal Login still rendered the username/password
database form. Projects.dev exposes the Auth0 `client` deployable but not Auth0
connection management, and the web app client cannot get a Management API token
without an Auth0 client grant. The remaining provider step is to create/enable
the Passwordless Email connection named `email` in Auth0 and enable it for the
World Cup application.

Verification:

- `npm run test:v0.1`
- `npm run lint`
- `npm run build`
- local `POST /api/auth/passwordless/start` with `moe@babanuj.com`, returning
  `auth_provider_not_ready` while the Auth0 email connection is missing
- Auth0 Dashboard fallback opened through `stripe projects open auth0`, which
  reached an Auth0 Dashboard login screen for `moe@10claws.com`
- in-app browser check that `/profile` opens the email-code modal with no
  password field

The cumulative build estimate is now roughly `~8.4M` total tokens and `~$75`
estimated API-equivalent cost.

## Same-Design Sign-In Adjustment

After testing the hosted Auth0 path, the product direction is clearer: players
should not leave the Floodlights visual system just to sign in. The public
sign-in modal now keeps the same website design and only shows the email-code
form plus the cancel/change-email controls. The hosted Auth0 route still exists
for fallback/debug use, but the normal player UI no longer offers a button that
switches into the Auth0-branded screen.

Verification confirmed that `/profile` opens the Floodlights email-code modal
with `Send email code`, no password field, and no hosted Auth0 button.

The cumulative build estimate is now roughly `~8.5M` total tokens and `~$76`
estimated API-equivalent cost.

## Auth0 Email Delivery Provider Triage

Passwordless email-code sign-in is now past the missing-connection blocker. The
Auth0 Passwordless Email connection named `email` is enabled, and the local
passwordless start endpoint returns `sent: true`.

The next blocker was delivery. Auth0 custom SMTP was configured with AgentMail:

- SMTP host `smtp.agentmail.to`
- port `587`
- username `world-cup-agent@agentmail.to`
- provider From `world-cup-agent@agentmail.to`
- `Verification Email (Code)` template From `world-cup-agent@agentmail.to`

Auth0 accepted the passwordless request but then logged `Failed Sending
Notification` with `550 5.1.8 Sender address rejected`. The same happened when
the recipient was the AgentMail QA inbox and when it was `moe@babanuj.com`.

To isolate the problem, a direct SMTP test used AgentMail from this machine with
the same inbox identity, API key, sender, and recipient. That direct message was
accepted and queued, and the user confirmed receiving it. The issue is therefore
specific to the Auth0 custom SMTP handoff, not general AgentMail deliverability.

For v0.1, Auth0 custom SMTP is disabled and Auth0 built-in email delivery is the
active sign-in path. Auth0 now logs a clean `Code/Link Sent` row for
`moe@babanuj.com` without a matching failure row. The remaining account E2E step
is to enter a fresh six-digit code from that inbox and verify the signed app
session, handle creation, anonymous-pick migration, persistence, profile page,
Arabic RTL, and both themes.

The cumulative build estimate is now roughly `~8.7M` total tokens and `~$78`
estimated API-equivalent cost.

## First Real Auth0 OTP Session

The first human-assisted Auth0 email-code session passed. The user supplied a
fresh six-digit code from `moe@babanuj.com`; the local passwordless verify route
accepted it, returned an authenticated session, set the signed app cookie, and
redirected to first-sign-in handle setup.

The follow-on authenticated API check confirmed the account was mapped in Neon
by Auth0 user id. Because the account had no existing picks, the QA run safely
used it to verify the v0.1 persistence path:

- handle setup saved `moe2026`
- group picks saved and reloaded
- one score prediction saved and reloaded
- one locked bracket saved and reloaded

This validates the server-side account and persistence contract. The remaining
browser-specific QA still needs a fresh human-assisted code if we want the
browser itself to own the session cookie from the email-code modal and complete
authenticated visual checks in English, Arabic RTL, dark theme, and light theme.

The cumulative build estimate is now roughly `~8.8M` total tokens and `~$79`
estimated API-equivalent cost.

## Auth0 QA Completion And Browser Limitation

The follow-up Auth0 QA run moved the milestone from API-session smoke to a
reviewable sign-off package.

The app sent another Auth0 email-code request to `moe@babanuj.com` from the
website-styled modal. A stale code was rejected in the modal with the expected
`That code did not work.` copy. The next fresh code from the same inbox was
accepted by the local passwordless verify endpoint. That route returned the
signed app session and the expected first-sign-in redirect:
`/profile?setup=handle&returnTo=%2Fpickem%23group`.

The authenticated API pass then verified the account contract end to end:

- `/api/auth/me` saw the new session and reported first-sign-in handle setup.
- handle `moe2026` saved successfully.
- group picks saved and reloaded with `locked: true` and 3 picks.
- score prediction `match-qa-1` saved and reloaded as a locked `2-1` pick.
- the bracket saved and reloaded with two groups and final pick `BRA`.
- `/api/profile` returned `moe@babanuj.com`, `moe2026`, and
  `needsHandle: false`.

For visual coverage, Chrome itself stayed blocked by extension UI after the
stale-code modal run. Escape dismissed the visible overlay, but the Chrome
automation bridge still reported another extension UI blocking the page. The
extension-free in-app browser covered the visual matrix instead:

- English, dark theme: `dir="ltr"`, `data-theme="dark"`,
  `Build your bracket`, no console errors.
- English, light theme: `dir="ltr"`, `data-theme="light"`,
  `Build your bracket`, no console errors.
- Arabic, light theme: `lang="ar"`, `dir="rtl"`, `data-theme="light"`,
  `كوّن جدولك`, no console errors.
- Arabic, dark theme: `lang="ar"`, `dir="rtl"`, `data-theme="dark"`,
  `كوّن جدولك`, no console errors.

The honest review boundary is therefore narrow: the production Auth0 and
persistence endpoints passed with a real human-supplied code, while a
Chrome-owned session cookie from the modal could not be completed because the
user's Chrome profile still had an extension UI blocking automation.

The cumulative build estimate is now roughly `~9.0M` total tokens and `~$81`
estimated API-equivalent cost.

## v0.2: Real Tournament Data

### Task 001 - Verify And Vendor Openfootball Data

The v0.2 milestone starts by replacing Floodlights sample tournament data with
the real World Cup 2026 structure. I fetched the upstream openfootball snapshot
from `https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json`
and vendored it at `db/openfootball/worldcup-2026.json` with source notes in
`db/openfootball/README.md`.

The saved file verifies as:

- 104 total fixtures
- 72 group-stage fixtures
- 12 groups
- 48 actual group-stage teams

The source is CC0 1.0 Universal and manually maintained by openfootball, so this
is treated as a static seed, not a live result feed. The browser will read the
normalized tournament data through our own `/api/data/fixtures` endpoint after
the remaining v0.2 tasks wire the Neon/cache layer.

The cumulative build estimate is now roughly `~9.1M` total tokens and `~$82`
estimated API-equivalent cost.

### Task 002 - Add Tournament Data Schema

The database now has a dedicated v0.2 tournament-data migration:
`db/migrations/003_real_tournament_data.sql`.

It adds:

- `tournament_groups` for the 12 group labels and ordering
- `teams` for stable team codes, names, slugs, group assignment, seed order,
  colors, and localized display metadata
- `matches` for stable match IDs, match numbers, stages, groups, team codes or
  knockout placeholders, UTC kickoff timestamps, local kickoff fields, venues,
  status, and raw source metadata

The schema is idempotent and indexed for group schedules, stage/kickoff reads,
and team lookups. `db/schema.sql` now includes the new migration, and
`db/types.ts` plus `api/_lib/tournament-data.ts` define the normalized row and
API shapes that the seed script and fixtures endpoint will share.

Verification for this task ran `npm run build`.

The cumulative build estimate is now roughly `~9.2M` total tokens and `~$83`
estimated API-equivalent cost.

### Task 003 - Add Openfootball Seed And Refresh Script

The repository now has a repeatable tournament seed path:

- `scripts/tournament-normalize.ts` parses the vendored openfootball snapshot,
  maps actual team names to stable codes, derives the 12-group draw, builds all
  104 matches, and converts local `UTC±offset` kickoff strings into ISO UTC.
- `scripts/seed-openfootball.ts` runs the verifier or upserts the normalized
  groups, teams, and matches into Neon through `PRIMARY_DB_CONNECTION_STRING`.
- `package.json` exposes `npm run verify:tournament-data` and
  `npm run db:seed:tournament`.

The normalizer is strict on team identity. If the upstream file changes to a
team name without a stable code mapping, the script fails rather than inventing
new product data.

Verification for this task ran:

```bash
npm run verify:tournament-data
npm run db:apply
npm run db:seed:tournament
npm run build
```

The seeded Neon readback confirmed 12 groups, 48 teams, 104 matches, 72 group
matches, and opening kickoff `2026-06-11T19:00:00.000Z` for Mexico vs South
Africa.

The cumulative build estimate is now roughly `~9.3M` total tokens and `~$84`
estimated API-equivalent cost.

### Task 004 - Add Fixtures API Cache

The app now has a first-party tournament fixture endpoint:
`GET /api/data/fixtures`.

The endpoint returns:

- groups
- teams
- all 104 matches
- lock metadata, including the bracket lock timestamp
- source metadata with an explicit `fallback` marker

The API prefers the seeded Neon tables and caches the normalized response for
short reads. If Neon is unavailable or not configured, it falls back to a
generated server-only static module at `api/_lib/tournament-static.ts` and marks
`source.fallback: true`. The browser still reads our API route; it does not fetch
openfootball directly.

Verification for this task covered:

- `GET /api/data/fixtures` with local Neon env: 12 groups, 48 teams, 104 matches,
  `bracketLocksAt: 2026-06-11T19:00:00.000Z`, `fallback: false`
- no-env fallback path: 12 groups, 48 teams, 104 matches, `fallback: true`
- `npm run build`

The cumulative build estimate is now roughly `~9.4M` total tokens and `~$85`
estimated API-equivalent cost.

### Task 005 - Replace Floodlights Sample Data

Floodlights now uses the real tournament structure in the product-facing data
surface:

- `src/floodlights/data.ts` contains the actual 48 teams from the openfootball
  group draw, with stable team codes, safe color tokens, and Arabic display
  names.
- `GROUPS` now reflects the real Groups A through L.
- `R32_TEMPLATE` now follows the openfootball Round-of-32 match order, including
  the third-place placeholder labels while preserving the app's eight selected
  wildcard teams.
- The homepage prediction board and Pick'em group quick-pick cards read the
  first three group fixtures through `/api/data/fixtures` when available, then
  fall back to the local real fixture constants.
- Quick-pick persistence now uses real match IDs such as `match-1` instead of
  array indexes.

Verification for this task ran `npm run build` and a data integrity check that
confirmed 48 teams, 12 groups, 48 grouped teams, zero missing team codes, 16
Round-of-32 pairs, and wildcard indexes 0 through 7.

The cumulative build estimate is now roughly `~9.5M` total tokens and `~$86`
estimated API-equivalent cost.

### Task 006 - Enforce Kickoff Locks

Kickoff locks are now server-enforced before writes:

- group picks call `assertMatchesOpen(..., { groupOnly: true })`, so each selected
  group match closes exactly at that match's kickoff.
- score predictions call the same match lock helper for their `matchId`.
- bracket writes call `assertBracketOpen`, which closes the entire knockout
  bracket at the first tournament match kickoff: `2026-06-11T19:00:00.000Z`.

Closed writes return HTTP `409` with API code `pick_locked` and a non-PII message.
The Pick'em UI now shows a localized lock toast when the server rejects a closed
bracket or group-pick lock.

Because today is 2026-06-08 and every real fixture is still upcoming, tests need
a controlled clock to prove the closed state. The server accepts
`x-worldcup-now` only outside production, and that default is recorded in
`dev/open-questions.md` for final review.

Verification for this task ran `npm run build` plus direct lock-helper checks:
before `2026-06-11T19:00:00.000Z` passes for `match-1` and the bracket; exactly
at kickoff rejects both with `pick_locked`.

The cumulative build estimate is now roughly `~9.6M` total tokens and `~$87`
estimated API-equivalent cost.

### Task 007 - Add v0.2 Tests

The milestone now has focused test coverage in
`tests/v0.2-real-tournament-data.test.ts`.

It verifies:

- openfootball normalization counts: 104 total fixtures, 72 group fixtures, 12
  groups, and 48 teams
- UTC conversion for the first kickoff
- Floodlights client constants: 48 teams, 12 groups, 16 Round-of-32 pairs, and
  eight wildcard slots
- `/api/data/fixtures` static fallback shape when Neon is unavailable
- per-match lock behavior: match 1 closes at kickoff while match 2 remains open
  until its own kickoff
- bracket lock behavior at the tournament opener
- group-pick rejection for unknown or knockout match IDs

Verification for this task ran:

```bash
npm run test:v0.2
npm run test:v0.1
npm run build
npm run lint
```

The cumulative build estimate is now roughly `~9.7M` total tokens and `~$88`
estimated API-equivalent cost.

### Task 008 - Run v0.2 Chrome E2E QA

Chrome QA evidence is recorded in `tests/e2e/v0.2-chrome-qa.md`, with screenshots
under `tests/e2e/screenshots/`.

The browser matrix covered:

- homepage in English/dark
- Pick'em in English/light
- Pick'em in Arabic RTL/light
- Pick'em in Arabic RTL/dark

The visible UI showed the real opener, Mexico vs South Africa, Match 1, Mexico
City, `Jun 11 · 19:00 UTC`, plus the first three real quick-pick fixtures:
Match 1, Match 2, and Match 7. Chrome showed no app console errors. Installed
Chrome extensions emitted extension-origin warnings, which are documented as not
app-origin errors.

The upcoming browser flow selected three quick picks and reached the expected
sign-in gate. Past-kickoff rejection is proven through the v0.2 server/API test
clock because the current date is 2026-06-08 and every real World Cup 2026 match
is still upcoming.

Final verification ran:

```bash
npm run verify:tournament-data
npm run test:v0.2
npm run test:v0.1
npm run lint
npm run build
```

The cumulative build estimate is now roughly `~9.8M` total tokens and `~$89`
estimated API-equivalent cost.

## v0.3 P0: Production Passwordless Signup Route

Before starting the rest of v0.3, I investigated the production signup failure
as an expedited unblocker. The diagnostic split was useful:

- `POST https://winworldcup2026.com/api/auth/passwordless/start` returned `405`.
- `POST https://winworldcup2026.com/api/auth/passwordless-start` returned
  `200 {"sent":true}`.
- `/api/health` and `/api/data/fixtures` both returned live JSON, so production
  API functions were working in general.
- `vercel inspect winworldcup2026.com` showed deployed functions for
  `api/auth/passwordless-start` and `api/auth/passwordless-verify`, but not the
  slash-style paths the frontend actually calls.

The P0 fix adds Vercel functions at `/api/auth/passwordless/start` and
`/api/auth/passwordless/verify` while leaving the hyphenated routes in place for
compatibility. The API now also maps Auth0 start failures into clearer codes:
provider not ready, rate-limited, email delivery failing, or generic provider
failure. Start-call failures are captured in Sentry through a sanitized
diagnostic error that does not include the submitted email or raw Auth0 delivery
description.

Verification ran:

```bash
npm run test:v0.1
npm run lint
npm run build
npx vercel build
```

The Vercel build output includes
`.vercel/output/functions/api/auth/passwordless/start.func` and
`.vercel/output/functions/api/auth/passwordless/verify.func`, which is the
deploy-shape proof for the production route mismatch.

The cumulative build estimate is now roughly `~9.9M` total tokens and `~$90`
estimated API-equivalent cost.

### Task 002 - Add Hosts Schema And API

The rest of v0.3 starts with the host backbone. I added `hosts` and
`host_members` in `db/migrations/004_hosts.sql`, then exposed:

- `POST /api/hosts` for authenticated, handle-complete host creation
- `POST /api/hosts/join` for joining by slug or six-character code
- `GET /api/hosts/:slug` for the public host page data

Host creation returns a canonical public path, a join path, and a typeable code.
The public API response is handle-only: no email, Auth0 ID, address, or user ID
is returned. Leaderboard points are `0` until v0.4 scoring lands; that default is
recorded in `dev/open-questions.md` so review can judge it against the v0.4
scoring plan.

Verification ran:

```bash
npm run test:v0.3
npm run build
```

The cumulative build estimate is now roughly `~10.0M` total tokens and `~$91`
estimated API-equivalent cost.

### Task 003 - Gate Home Match Prediction Lock

The homepage match board now follows the same account threshold as Pick'em:
visitors can set a score anonymously, but clicking `Lock my prediction` stores
that pending prediction locally and opens the Auth0 email-code gate. Once the
user is authenticated and has a handle, the app runs the existing anonymous
bracket/group-pick migration, persists the home match score through
`/api/picks/predict`, and reloads saved account predictions on return visits.

The account migration helpers now include a small typed home-prediction storage
path and a validator for locked prediction payloads. The storage helper also has
a `remove` utility so successfully persisted pending predictions do not keep
replaying for later sessions.

Verification ran:

```bash
npm run test:v0.3
npm run build
```

The cumulative build estimate is now roughly `~10.1M` total tokens and `~$92`
estimated API-equivalent cost.

### Task 004 - Add Hosts UI And Public Page

The host feature is now reachable from the main navigation. `/hosts` lets a
signed-in user create a room, or lets an anonymous user start the flow and finish
after Auth0 sign-in plus handle setup. Created hosts show their public page,
join link, short join code, and a QR code. The same page also lets fans join a
host by code without losing the account gate.

The public `/h/:slug` page loads from the hosts API and keeps the privacy
boundary tight: member rows show handles, champion picks, and placeholder
points only. It also shows member count, most-picked champion, match consensus,
the typeable join code, and a QR-backed join link. English and Arabic copy were
added for the required v0.3 QA languages; other languages fall back to English
for the new host strings until a later localization pass.

Verification ran:

```bash
npm run test:v0.3
npm run build
```

The cumulative build estimate is now roughly `~10.2M` total tokens and `~$93`
estimated API-equivalent cost.

### Task 005 - Fix Layout, RTL Logo, And Desktop Bracket

The shared layout now uses one `--content-max` width for both `.wrap` and
`.wrap-wide`, so the homepage and inner pages land on the same desktop rhythm.
The header logo is also isolated from page direction with an explicit LTR SVG
wordmark and a fixed flex footprint; that prevents Arabic RTL pages from
squeezing or reordering the `WIN·2026` lockup.

The Pick'em knockout section now renders a desktop two-sided bracket: the left
and right halves converge on a central Final and Champion column while reusing
the same pick handler and state model as the existing bracket. The original
horizontal bracket remains as the mobile/tablet fallback, so small screens stay
scrollable instead of forcing a dense two-sided view.

Verification ran:

```bash
npm run test:v0.3
npm run build
```

The cumulative build estimate is now roughly `~10.3M` total tokens and `~$94`
estimated API-equivalent cost.

### Task 006 - Add v0.3 Tests And Verification

The v0.3 unit test file now covers the remaining host default that can be tested
without calling production services: the same public handle can appear in
multiple host rooms, and points stay at the v0.4 placeholder value of `0` on
each public host shape. While running lint, React flagged effect-triggered host
resume calls because the helper functions set loading state before awaiting the
API. Those effect calls now defer into microtasks, keeping the resume behavior
while satisfying the hook lint rule.

The production P0 route was also rechecked with the slash path
`/api/auth/passwordless/start`; it returned `200` with `{"sent":true}`. The
database schema runner applied all migrations through `004_hosts.sql`, so the
Neon-backed hosts tables are present for host create/join QA.

Verification ran:

```bash
npm run test:v0.1
npm run test:v0.2
npm run test:v0.3
npm run lint
npm run build
npx vercel build
npm run db:apply
```

The cumulative build estimate is now roughly `~10.4M` total tokens and `~$95`
estimated API-equivalent cost.

### Follow-up - Align Pick'em Sections

Chrome QA caught a layout regression after the shared-width change: the Pick'em
hero and header were centered at the new 1280px content width, but the `Group
stage` section started at the far left. The cause was `.pk-sec{margin:30px 0}`,
which overrode `.wrap-wide`'s horizontal `auto` margins whenever both classes
were on the same element. The fix changes it to `margin:30px auto`, so group,
wildcard, knockout, and quick-pick sections all stay centered with the same
desktop width as the header and hero.

Verification ran:

```bash
npm run test:v0.3
npm run lint
npm run build
```

Chrome measured the Pick'em nav, hero, and every `.wrap-wide.pk-sec` section at
the same `left=320`, `right=1600`, and `width=1280` desktop alignment.

The cumulative build estimate is now roughly `~10.5M` total tokens and `~$96`
estimated API-equivalent cost.

### Task 007 - Chrome QA Progress

The v0.3 QA pass moved to a clean extension-free Chrome profile after the
user's main Chrome window kept exposing extension UI over the page. The clean
profile reached the website-styled Auth0 email-code modal, submitted
`moe@babanuj.com`, and displayed the one-time-code entry step. Relayed codes
were rejected by Auth0 as `invalid_code`, so the user requested that Claude
review that single real email-code confirmation against the deployed/preview
link instead of continuing the local OTP path.

The protected app flows were still exercised in clean Chrome with a disposable
signed QA account and then cleaned up from Neon. The homepage prediction stayed
locked after reload, `/hosts` created a host with a join link, QR code, and
short code, a second host was joined by typed code, and the public host pages
showed handle-only leaderboards with no email or private identifiers. Arabic
light and dark host pages rendered with `dir="rtl"`, Arabic navigation, the
fixed 148px logo footprint, and no horizontal overflow.

Evidence now lives in:

```text
tests/e2e/v0.3-chrome-qa.md
tests/e2e/screenshots/v0.3/home-authenticated-lock-en-dark.png
tests/e2e/screenshots/v0.3/hosts-create-en-dark.png
tests/e2e/screenshots/v0.3/hosts-join-code-en-dark.png
tests/e2e/screenshots/v0.3/host-public-joined-en-dark.png
tests/e2e/screenshots/v0.3/host-public-owner-en-dark.png
tests/e2e/screenshots/v0.3/host-public-ar-light.png
tests/e2e/screenshots/v0.3/host-public-ar-dark.png
```

The cumulative build estimate is now roughly `~10.7M` total tokens and `~$98`
estimated API-equivalent cost.

### Follow-up - Hosts i18n And Short Slugs

The Hosts surface now has full Spanish, French, and Portuguese parity for all 43
host-related keys, including the `Hosts` nav label, `/hosts`, and public
`/h/:slug` pages. The translations use each locale's existing Floodlights voice
instead of falling back to English.

The host slug validator now accepts the same one- and two-character slugs that
`slugifyHostName` can generate from valid short host names, so a host named
`EY` produces a reachable `/h/ey` public page and slug-based join path. The
validator still rejects empty values, spaces, punctuation, and leading or
trailing hyphens.

The cumulative build estimate is now roughly `~10.8M` total tokens and `~$99`
estimated API-equivalent cost.

### Follow-up - Drop WorkOS User Id

The Auth0 provider swap left one compatibility field behind: the nullable
`users.workos_user_id` column from the earlier WorkOS pass. Nothing in the app
reads or writes that field now that account identity is keyed by
`auth0_user_id`, so the cleanup is intentionally schema-only and type-only.

A forward migration now drops `workos_user_id` with `if exists`, `db/schema.sql`
includes that migration after the hosts migration, and `db/types.ts` no longer
exposes the stale `UserRow.workos_user_id` field. Historical applied migrations
stay untouched so existing database history remains auditable.

The cumulative build estimate is now roughly `~10.9M` total tokens and `~$100`
estimated API-equivalent cost.

### v0.3.1 - Mobile Header And Viewport QA

The v0.3.1 pre-v0.4 cleanup starts by making the mobile bug executable. A new
Playwright mobile harness runs the primary pages at 360px and 390px, checks that
the document has no horizontal scroll, verifies the burger stays inside the
viewport, opens the menu, checks all seven navigation links plus the mobile CTA,
and confirms navigation closes the menu. The first run failed red across the
shared header pages, with the homepage reporting a 534px document width on a
360px viewport.

The fix keeps desktop unchanged while making the mobile header fit for real: the
standalone CTA leaves the compact tool row and appears inside the dropdown, the
language picker becomes globe-only on mobile, the mobile logo footprint and gaps
are tightened, and the burger is fully reachable. The homepage prize image and
the `/brackets` champion/consensus panels also received mobile min-width rules
so they do not create page-level overflow.

Evidence now lives in `tests/e2e/v0.3.1-mobile-qa.md`, with before/after
screenshots under `tests/e2e/screenshots/v0.3.1/` covering English and Arabic,
dark and light themes, and closed/open menu states.

The cumulative build estimate is now roughly `~11.1M` total tokens and `~$102`
estimated API-equivalent cost.

### v0.3.2 - Real Community Stats

The v0.3.2 pre-v0.4 milestone removes the remaining fabricated community
figures from the active app. A new cached, read-only
`GET /api/data/community` endpoint reads existing Neon tables and serves only
aggregate or handle-only data:

- active players with at least one locked bracket, group pick, or score
  prediction;
- locked bracket count, now used where the old sponsor-facing "bracket views"
  placeholder appeared;
- distinct host members;
- top champion distribution and Round-of-32 consensus from locked brackets;
- public comparison samples only when a locked bracket has both a public handle
  and a champion.

The homepage, public brackets page, and sponsorship page now consume that
response through a small client hook. Prize winners stay as a named prize
configuration constant rather than pretending to be a live stat. The old
The old crowd-distribution, community-sample, joined-count, and audience/view
sample values are gone from active app source.

The current Neon data is intentionally low volume: 2 active players, 1 locked
bracket, 0 host members, no champion distribution yet, and one real R32
consensus pick. The UI uses that honestly: live counts render where data exists,
and polished empty states appear where the data set is not mature enough yet.
No points, ranks, standings, scores, or host leaderboard scoring were added.

Evidence now lives in `tests/e2e/v0.3.2-stats-qa.md`, with screenshots under
`tests/e2e/screenshots/v0.3.2/` for home, brackets, and sponsors in English and
Arabic RTL.

The cumulative build estimate is now roughly `~11.3M` total tokens and `~$104`
estimated API-equivalent cost.

### v0.4 - Live Results And Scoring

The v0.4 milestone adds the first real scoring layer. A new additive migration
creates two cache tables: `results` for provider-ingested match scores and
`standings` for computed user points. The live-results provider is pluggable:
`football-data` is the default, and `api-football` can take over with
`LIVE_RESULTS_PROVIDER=api-football` without changing the UI or scoring engine.

All provider access stays server-side. Vercel Cron now has three protected
routes: a daily fixture-cache refresh, result polling during active match
windows, and an idempotent score job. Result polling also runs the scorer after
new results are cached, while the standalone score route remains safe to rerun.

The scorer applies only the locked v0.4 rules:

- group-stage outcome picks get the flat 10-point value used by the Pick'em UI;
- knockout advancement pays 10, 20, 40, 80, and 160 points from Round of 32 to
  Final;
- score predictions do not award points yet.

The public host leaderboard now reads real standings points instead of the old
`0` placeholder. The profile page shows the signed-in user's points and current
public rank. When `football-data` is active, the app renders the required
Football-Data.org attribution.

Verification ran:

- `npm run lint`
- `npm run test:v0.1`
- `npm run test:v0.2`
- `npm run test:v0.3`
- `npm run test:v0.3.2`
- `npm run test:v0.4`
- `npm run build`
- `npm run db:apply`
- `npx vercel build`

Browser evidence lives in `tests/e2e/v0.4-chrome-qa.md`, with screenshots under
`tests/e2e/screenshots/v0.4/` for host and profile points in English and Arabic.
The QA pass spot-checked all five active languages and both themes with no
console errors.

The cumulative build estimate is now roughly `~11.8M` total tokens and `~$109`
estimated API-equivalent cost.

### v0.4.1 - Knockout Penalty Winners

Claude's v0.4 review found a scoring bug that only appears once knockout
matches can be decided on penalties. The scorer previously derived a knockout
winner only by comparing the stored home and away scores. If regulation or
extra time ended level, the scorer treated the result as no winner and awarded
no advancement points, even when the provider payload already identified the
team that advanced.

This follow-up adds an additive `results.winner` column with values limited to
`home`, `away`, or null. The football-data adapter now maps `score.winner` into
that field, and the api-football adapter trusts `teams.home.winner` /
`teams.away.winner` first, then falls back to penalty and final score fields
when those booleans are missing. The cache persists the normalized winner on
insert and update.

Scoring now checks `result.winner` before falling back to the existing score
comparison. That preserves group-stage draw behavior and ordinary knockout
score wins, while correctly awarding Final, semifinal, quarterfinal, Round of
16, and Round of 32 points when a drawn knockout score is settled by penalties.

The regression test covers a 1-1 Final where Argentina advances as the away
side: the Argentina picker receives the Final weight and the Mexico picker gets
zero, with idempotent recomputation. The adapter tests also prove equivalent
football-data and api-football penalty payloads normalize to the same advancing
side.

The cumulative build estimate is now roughly `~11.9M` total tokens and `~$110`
estimated API-equivalent cost.

### v0.4.2 - Pick'em Group Selection Fix

Users reported that Group C could get into a state where the visible fourth
team, such as Brazil, could not be clicked. The bug came from two related
edges: saved bracket data was accepted without sanitizing each group ranking,
and the group selector ignored clicks on the auto-rendered fourth-place team
once the first three positions were filled.

The bracket helper now normalizes group rankings by group: it drops invalid
codes, removes duplicates, keeps only teams that belong to that group, and
keeps the top three user-controlled positions. Third-place wildcard selections
are also filtered against completed, valid groups so old local state cannot
leave a group visually stuck.

The Pick'em UI now uses the same helper for rendering and clicks. Tapping a
fourth-place row replaces the third-place wildcard slot, which lets users bring
Brazil or any other fourth team back into contention without clearing the
whole bracket.

Verification ran:

- `npm run test:v0.4.2`
- `npm run lint`
- `npm run build`
- Playwright check against `http://127.0.0.1:5173/pickem` proving a malformed
  Group C state heals and fourth-place Brazil is clickable and becomes third.

The cumulative build estimate is now roughly `~12.0M` total tokens and `~$111`
estimated API-equivalent cost.
