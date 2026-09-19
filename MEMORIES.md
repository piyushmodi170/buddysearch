# Bug hunt memory

- Google sign-in accepted unsigned JWT payloads when tokeninfo was not HTTP 200 (`backend/src/services/auth.service.ts` `readGoogleClaims`). PR: pending. Status: open. Recorded: 2026-09-19.
