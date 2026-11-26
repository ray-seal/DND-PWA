# StoryFoundry
An AI-driven interactive experience platform. Players choose a genre, complete a tailored application, and an AI director creates and runs the world around their decisions.

## Current foundation
- Experience launcher: Dungeons & Dragons, crime investigation, horror and original fantasy.
- Tailored application forms for each experience.
- Gemini-powered scenario creation and interactive turns.
- Genre-specific director instructions.
- Private session state encrypted server-side and returned as an opaque save token.
- Character, clue, timeline, world-fact and inventory continuity fields.
- Free-text player actions and optional graduated hints.
- Local browser save/resume and installable PWA foundation.

## Stack
React + Vite; Vercel serverless API at /api/adventure; Google Gemini API called server-side.

## Local development
Node.js 20+. Run npm install, copy .env.example to .env.local, add the Gemini key, then run npm run dev. Use Vercel CLI (vercel dev) to test the /api function locally.

## Environment variables
- GEMINI_API_KEY required, from Google AI Studio. Never expose it in frontend code or commit it.
- GEMINI_MODEL optional; defaults to the model configured for Companion OS (gemini-3.8-flash).
- GEMINI_BACKUP_MODEL optional; defaults to gemini-3.5-flash-lite.
- ADVENTURE_STATE_SECRET optional but recommended stable secret for encrypting private scenario state. If omitted, the API key is used to derive the encryption key; changing the API key then invalidates existing browser saves.

Add the same GEMINI_API_KEY value used by Companion OS to this Vercel project's Environment Variables. One credential can serve two separate server-side integrations; quotas and billing are shared at Google AI project level. Do not copy Clive's chat endpoint or personality prompt. StoryFoundry has its own adventure endpoint and genre-specific director.

## Current boundaries
- Solo text-first prototype. Multiplayer invitations and shared sessions are not implemented.
- Scenario state is encrypted before it reaches the browser. This is a foundation, not a guarantee of perfect continuity; stronger validation and automated consistency tests are next.
- Actual generated crime-scene images, maps, audio and downloadable evidence are not implemented yet; these need a separate media-generation integration.
- Saves are local to the current browser; no account-based cloud sync yet.
- Confirm configured model availability and quota in Google AI Studio before launch.

## Roadmap
1. Harden scenario schemas and continuity validation.
2. Add image generation and an evidence/map asset library.
3. Add cloud saves, player accounts and multiplayer sessions.
4. Add dedicated character interviews, evidence examination and investigation tools.
5. Expand experience packs and custom scenario creation.


## Persistent tabletop RPG foundation

The D&D roadmap is implemented as a separate, reviewable feature branch rather than being turned on in the live narrative modes.

- Deterministic D20 rules primitives live in `src/game/rules.js`, with unit tests run by `npm test`.
- Character sheet creation and derived statistics live in `src/game/character.js`.
- Neon Managed Better Auth is isolated in `src/auth/`.
- Authenticated server endpoints are `/api/characters` and `/api/campaigns`. They verify the Neon-issued EdDSA JWT against the branch JWKS before running parameterised owner-scoped queries.
- Tables cover reusable characters, campaigns, membership, campaign-specific character snapshots, append-only game events and invitations. Every public game table has RLS enabled with authenticated ownership/membership policies; anonymous role has no character-table read access.

### Neon environments

StoryFoundry uses its own Neon project in AWS Europe Central (Frankfurt). It does not use or share CLIVE's database, Auth configuration, API credentials or user records.

- Neon project: `StoryFoundry`.
- Default branch: `main` (reserved for future production persistence).
- Preview branch: `preview-tabletop-rpg` (used by the tabletop feature branch).
- Managed Better Auth: enabled separately on each branch.
- Vercel Preview environment variables are branch-scoped to `feature/tabletop-rpg-foundation`; production variables are not changed by this feature branch.

Required server variables: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_JWKS_URL`. Browser Auth uses `VITE_NEON_AUTH_URL`. Never put the database URL or Gemini key in client-side variables.

### Current limits

This is the account and persistence foundation, not the finished multiplayer tabletop experience. The character/campaign endpoints are initial CRUD foundations; the full character-sheet UI, campaign scene editor, combat encounter view, turn event pipeline, invitation acceptance flow, AI player seat orchestration and reward validation are still roadmap items. Keep the current local saves for crime, horror and fantasy until their account migration is designed separately.
