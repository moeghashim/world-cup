---
id: 004
title: Add session, profile, and handle APIs
milestone: v0.1-accounts-persistence
category: backend
priority: high
files: ["api/auth/me.ts", "api/profile.ts", "api/profile/handle.ts", "api/_lib/session.ts", "api/_lib/users.ts"]
---

## Acceptance criteria
- [x] Authenticated account responses include only current-user email, handle, and country. (PRD S1: `/profile` shows email, handle, country)
- [x] First sign-in requires a handle before account-bound pick saves. (PRD S1: handle required before first save)
- [x] Duplicate handles are rejected with a clear response. (PRD S1: duplicates rejected with clear message)
- [x] Non-auth API responses do not include email or token/session data. (PRD S1: no email/token in non-auth API response)

## Suggested approach
Return a compact `me` payload with `needsHandle`. Normalize handles for unique
lookup while preserving display casing if practical. Keep handle mutation
separate from email and country.
