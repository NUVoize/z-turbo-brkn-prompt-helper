# Z-Image-Turbo - BRKN AI Prompt Generator

# Requirements & Quick Install

This project is a React + Vite + Tailwind + TypeScript app optimized for generating long, detailed Z-Image-Turbo prompts. Follow these steps for a smooth setup.

## Requirements
- Node.js ≥ 18 (recommended 20+)
- npm ≥ 9 or Bun ≥ 1.0 (either is fine)
- Git
- Modern browser (Chromium, Firefox, Safari)

Optional (for AI providers):
- Google Gemini API key
- DashScope (Qwen) API key
- Ollama local server (default http://localhost:11434)
- LM Studio local server (default http://localhost:1234)

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
   - LM Studio: ensure the local server is running (default base URL is http://localhost:1234) and configure as needed.
3) Save settings and test by generating prompts.

## Z-Image-Turbo Settings
When using the generated prompts in Z-Image-Turbo, use these settings:
- **Steps**: 8-9 (Z-Turbo is optimized for 8 NFE steps)
- **CFG Scale**: 0.0 (Z-Turbo is CFG-free, no negative prompts)
- **Resolution**: 1024×1024 or 1280×720
- **Max Tokens**: 1024 (Z-Turbo supports up to 1024 tokens for very long prompts)

## Notes
- No .env needed; keys are stored securely in your browser (local settings).
- Dev server port is 8080 (configured in vite.config.ts).
- Z-Image-Turbo works best with LONG, DETAILED, STRUCTURED prompts (150-300 words).
- If you run into issues, please share the console error message to help troubleshoot quickly.
