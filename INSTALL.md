# FLUX 2.0 - BRKN AI Prompt Generator

# Requirements & Quick Install

This project is a React + Vite + Tailwind + TypeScript app. Follow these steps for a smooth setup.

## Requirements
- Node.js ≥ 18 (recommended 20+)
- npm ≥ 9 or Bun ≥ 1.0 (either is fine)
- Git
- Modern browser (Chromium, Firefox, Safari)

Optional (for AI providers):
- Google Gemini API key
- DashScope (Qwen) API key
- Ollama local server (default http://localhost:11434)

## Quick Install
1) Clone the repository
   - git clone <your-repo-url>
   - cd <repo-folder>

2) Install dependencies
   - With npm:  npm install
   - Or with Bun:  bun install

3) Run the app in development
   - npm run dev   (or: bun run dev)
   - App runs at: http://localhost:8080

4) Build for production
   - npm run build   (or: bun run build)
   - Preview: npm run preview

## Configure AI Providers (in-app)
1) Open the app and click the Settings (gear) icon.
2) Choose your provider:
   - Gemini: paste your Google Gemini API key.
   - Qwen (DashScope): paste your DashScope API key.
   - Ollama: ensure the local server is running (default base URL is http://localhost:11434) and enter the base URL/model if needed.
3) Save settings and test by generating prompts.

## Notes
- No .env needed; keys are stored securely in your browser (local settings).
- Dev server port is 8080 (configured in vite.config.ts).
- If you run into issues, please share the console error message to help troubleshoot quickly.
