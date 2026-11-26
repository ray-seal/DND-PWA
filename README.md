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
