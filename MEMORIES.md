# Bug hunt memory

- `backend/src/services/auth.service.ts` `readGoogleClaims`: unsigned Google JWT payload accepted when tokeninfo was not HTTP 200. PR: https://github.com/piyushmodi170/buddysearch/pull/41 Status: open. Recorded: 2026-09-19.
