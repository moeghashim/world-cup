---
id: 003
title: Add WorkOS auth server flow
milestone: v0.1-accounts-persistence
category: backend
priority: high
files: ["api/auth/start.ts", "api/auth/callback.ts", "api/auth/logout.ts", "api/_lib/workos.ts", "api/_lib/session.ts", "api/_lib/users.ts"]
---

## Acceptance criteria
- [ ] Starting sign-in redirects to WorkOS AuthKit/passwordless flow. (PRD S1: WorkOS emails a working magic link)
- [ ] Callback exchanges the WorkOS code, seals the session cookie, and maps the WorkOS user to local `users`. (PRD S1: verifying sets a session)
- [ ] Refreshing the app can authenticate from the WorkOS sealed session cookie. (PRD S1: cookie persists)
- [ ] Logout ends/clears the WorkOS-managed session. (PRD S1: `/profile` lets the user sign out)

## Suggested approach
Use the WorkOS Node SDK server-side only. Implement Vercel function handlers for
start/callback/logout. Store the sealed session in an httpOnly, secure,
SameSite=Lax cookie. Capture `country_at_signup` from Vercel headers when the
local user row is first created.
