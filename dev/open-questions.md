# Open Questions

No open questions after the 2026-06-07 provider reconciliation.

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
