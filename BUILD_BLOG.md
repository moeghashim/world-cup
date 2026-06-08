# Building A World Cup Prediction And Sponsor Rewards Website

Last updated: 2026-06-07

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
