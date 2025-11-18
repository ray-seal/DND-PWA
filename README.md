# dnd-pwa (starter)

Minimal starter for a DnD PWA with an AI DM worker skeleton (Option B).

Quick start:
1. Install:
   npm install

2. Run dev:
   npm run dev

3. Build:
   npm run build
   npm run preview

Where to put your in-browser model:
- Edit src/workers/llmWorker.js and integrate the WASM/JS runtime (gpt4all-native-web, llama wasm, etc).
- Load weights once (consider storing in IndexedDB) and run inference inside the worker to avoid blocking the UI.

Pushing to GitHub (example)
- Initialize locally, add files, create repo on GitHub, and push (see commands below).

License: MIT
