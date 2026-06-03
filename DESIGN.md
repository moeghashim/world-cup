# Design Context

Reference: https://impeccable.style/designing/

## Direction

The interface should behave like a matchday operations surface with fan energy, not a decorative sports landing page. It should be dense enough for repeated use, but still celebratory through team colors, stadium imagery, and reward motion.

## Layout Rules

- Lead with the usable prediction experience.
- For the next homepage pass, replace the static hero with a prediction-first banner that keeps score controls, match selection, prize bundle, sponsor context, and entry capture inside the first viewport.
- `HOMEPAGE_LIVE_BANNER_PRD.md` defines the motion and atmosphere layer for that first viewport: matchday pulse, score-change reactions, active fixture rail states, prize-panel reveals, and reduced-motion fallbacks.
- Keep the hero cinematic, but let workflow and match cards dominate the product.
- Use a persistent workflow rail on desktop: Predict, Teams, Draw, Personalize, Fulfill, Review.
- Use clean page paths for primary sections instead of hash fragments, so visitors can open `/operations`, `/posthog`, `/prizes/japan`, and `/experiment` as standalone URLs.
- Use full-width bands and unframed workspace sections; reserve cards for repeated items, panels, and operational modules.
- Keep repeated match, draw, reward, and provider modules visually consistent.
- Keep footer attribution restrained and operational: show the Experiment link and `10claws.com` association on the homepage, but keep Codex Desktop App and `https://projects.dev/` inside the Experiment view and build documentation.

## Team Theming

- Team themes are CSS variables from typed data.
- Team color can accent state, borders, and highlights.
- Avoid whole-page color floods that reduce readability.
- Sponsor visuals must remain distinct from team visuals.
- Never communicate state through color alone.

## Draw Presentation

- The draw should feel like matchday operations, not gambling.
- Use receipt movement, stadium light sweeps, and sequential winner reveals instead of reels, odds wheels, or slot-machine motion.
- Always show participant state in plain language: apply, eligibility, seed, reveal, claim.
- Show audit metadata compactly so transparency does not overwhelm the primary winner reveal.
- Respect reduced-motion preferences.

## Shirt Design Assets

- Keep generated shirt design files in `designs/` until a POD integration defines final artwork specs.
- Treat current shirt files as visual direction and personalization assets, not approved manufacturing files.
- Avoid official tournament, federation, player, sponsor, crest, trophy, and mascot marks in committed artwork.
- Preserve separate country folders so future design revisions can be localized without changing app data structure.

## Logo Exploration

- Store logo explorations in `designs/logos/`.
- Keep generated raster boards as concept references only.
- Prefer SVG source files for usable logo variations so text remains exact and editable.
- Current directions: orbit/cup, motion ball, and shield/globe for `winworldcup2026.com`.
- Active direction: the user-provided `worldcup-logo-attached.svg` is copied into `src/assets/winworldcup2026-logo.svg` as the website header logo.
- Header presentation: keep the active logo at 78px in the main navigation, below the AI status bar.
- Keep earlier logo variations as exploration history, not the active brand mark.

## Component Quality Checklist

- Match cards expose stage, teams, score inputs, winner pick, lock action, and sponsor drops.
- Schedule panels expose source date, verification warning, all groups, all teams, full group-stage fixtures, and selected supporter-team fixtures.
- Experiment documentation exposes `BUILD_BLOG.md` as the primary HTML article, keeps `AGENTS.md` as the raw agent-log markdown file, and shows a technology flowchart for Codex, GitHub, Vercel, React/TypeScript, JSON-render, Stripe Projects, and planned providers. The default homepage should not expose technical build copy.
- Draw cards expose match, winner slots, participant receipt state, final result, eligible count, winners, alternates, and audit seed data.
- Fulfillment panels expose queue count, review count, and match-level actions.
- Shirt studio exposes concept name, print copy, motif, and no-official-branding disclaimer.
- Provider cards distinguish role, reason, and operational risk.
- PostHog dashboard cards expose acquisition, prediction funnel, prize claim, fulfillment health, event taxonomy, and setup state without implying live tracking before SDK capture is enabled.

## Polish Checklist

- Text must fit buttons and cards at desktop and mobile widths.
- Button labels must remain visible in every team theme.
- Empty states should be product states, not implementation notes.
- The top navigation and workflow rail should link to real page paths.
- Run lint, build, and browser verification after visual changes.
- Full address capture should be visually framed as draw/shipping eligibility, not checkout, and should avoid sending address data to analytics.
