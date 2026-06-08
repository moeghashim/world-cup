---
id: 002
title: Add WorkOS user and picks schema
milestone: v0.1-accounts-persistence
category: db
priority: high
files: ["db/schema.sql", "db/migrations/001_accounts_persistence.sql", "db/types.ts", "scripts/apply-schema.ts"]
---

## Acceptance criteria
- [ ] Add `users` with unique `workos_user_id`, unique email, unique handle, and `country_at_signup`. (PLAN §8 users)
- [ ] Add bracket, group pick, and score prediction persistence tables. (PRD S1: picks persist to Neon)
- [ ] Do not add custom `magic_link_tokens` or `sessions` tables. (PLAN §12: Auth and Session)
- [ ] Enforce handle uniqueness at the database layer. (PRD S1: duplicates are rejected)

## Suggested approach
Use `jsonb` for bracket data as PLAN §15 allows. Keep group picks and score
predictions normalized enough for v0.2 kickoff locks. Use `ON CONFLICT` upserts
for user-owned pick rows.
