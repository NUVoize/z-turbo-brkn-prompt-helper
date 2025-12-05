# Z-TURBO - BRKN AI Prompt Generator

## Quick Install Guide

This is a React + Vite + Tailwind + TypeScript app for generating Z-Image-Turbo prompts.

## Requirements

| Requirement | Version |
|------------|---------|
| Node.js | ≥ 18 (recommended 20+) |
| npm | ≥ 9 |
| Git | Latest |
| Browser | Chrome, Firefox, Safari, Edge |

**Alternative**: [Bun](https://bun.sh) ≥ 1.0 instead of npm

### Optional API Keys
- [Google Gemini](https://makersuite.google.com/app/apikey) (Recommended)
- [DashScope/Qwen](https://dashscope.console.aliyun.com/)
- Ollama (local, http://localhost:11434)
- LM Studio (local, http://localhost:1234)

---

## Installation

### Windows

```
install-windows.bat
```

Then launch with:
```
start-ui.bat
```

### Linux / macOS

```bash
chmod +x install.sh
./install.sh
```

Then launch with:
```bash
./start.sh
```

### Manual (All Platforms)

```bash
# Install dependencies
npm install
# or: bun install

# Start dev server
npm run dev
# or: bun run dev
```

App runs at: **http://localhost:8080**

---

## Configure AI Providers

1. Open the app and click the **Settings** (⚙️) icon
2. Choose your provider and enter API key:
   - **Gemini**: Paste Google Gemini API key
   - **Qwen**: Paste DashScope API key
   - **Ollama**: Ensure local server is running
   - **LM Studio**: Ensure local server is running
3. Save and test

---

## Z-Image-Turbo Settings

When using generated prompts:

| Setting | Value |
|---------|-------|
| Steps | 8-9 |
| CFG Scale | 0.0 |
| Resolution | 1024×1024 or 1280×720 |
| Max Tokens | 1024 |

---

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

---

## Notes

- No `.env` file needed - keys stored in browser localStorage
- Dev server port: 8080
- Z-Turbo works best with LONG, DETAILED prompts (150-300 words)

---

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.
