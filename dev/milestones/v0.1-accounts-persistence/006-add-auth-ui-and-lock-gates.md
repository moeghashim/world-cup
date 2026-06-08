---
id: 006
title: Add WorkOS sign-in UI and lock gates
milestone: v0.1-accounts-persistence
category: frontend
priority: high
files: ["src/floodlights/lib/AuthProvider.tsx", "src/floodlights/components/SignInGate.tsx", "src/floodlights/pages/PickemPage.tsx", "src/floodlights/i18n/dictionaries.ts", "src/App.tsx"]
---

## Acceptance criteria
- [ ] Sign-in is prompted only at lock prediction, lock bracket, or future join-host gates, not on page load. (PRD S1: sign-in prompted at lock/join gate)
- [ ] Lock actions redirect/start the WorkOS flow for anonymous users. (PRD S1: play anonymously then sign in to save)
- [ ] Sign-in and lock UI works in EN/ES/FR/PT/AR and RTL Arabic. (PRD S1: sign-in/lock flow works in all 5 languages + RTL)
- [ ] The UI respects existing Floodlights dark/light theme styles. (PRD S1: both themes)
- [ ] GA4/PostHog sign-in and lock events fire without exposing email values. (PRD cross-cutting: Analytics and security)

## Suggested approach
Add an auth provider around the app. Intercept `lockBracket` and `gpLock` in
`PickemPage.tsx`: anonymous users see a localized gate and start WorkOS auth;
signed-in users continue to server-backed save.
