# Design Context

Reference: https://impeccable.style/designing/

## Direction

The interface should behave like a matchday operations surface with fan energy, not a decorative sports landing page. It should be dense enough for repeated use, but still celebratory through team colors, stadium imagery, and reward motion.

## Layout Rules

- Lead with the usable prediction experience.
- Keep the hero cinematic, but let workflow and match cards dominate the product.
- Use a persistent workflow rail on desktop: Predict, Draw, Personalize, Fulfill, Review.
- Use full-width bands and unframed workspace sections; reserve cards for repeated items, panels, and operational modules.
- Keep repeated match, draw, reward, and provider modules visually consistent.

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

## Component Quality Checklist

- Match cards expose stage, teams, score inputs, winner pick, lock action, and sponsor drops.
- Draw cards expose match, winner slots, participant receipt state, final result, eligible count, winners, alternates, and audit seed data.
- Fulfillment panels expose queue count, review count, and match-level actions.
- Shirt studio exposes concept name, print copy, motif, and no-official-branding disclaimer.
- Provider cards distinguish role, reason, and operational risk.

## Polish Checklist

- Text must fit buttons and cards at desktop and mobile widths.
- Button labels must remain visible in every team theme.
- Empty states should be product states, not implementation notes.
- The top navigation and workflow rail should link to real sections.
- Run lint, build, and browser verification after visual changes.
