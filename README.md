# Z-TURBO - BRKN AI Prompt Generator

A powerful AI-powered prompt generator designed for **Z-Image-Turbo** image generation. Built with React, TypeScript, and multiple LLM provider support to help you craft detailed, creative prompts optimized for Z-Turbo's long-form, structured prompt requirements.

## ✨ Features

- **🎨 Z-Turbo Optimized Prompts**: Generate LONG, DETAILED, STRUCTURED prompts (150-300 words) optimized for Z-Image-Turbo
- **🧠 Multiple LLM Providers**: Supports Google Gemini, Qwen (DashScope), Ollama, and LM Studio
- **📝 Enhanced AI Captioning**: Upload images for AI-powered scene descriptions and prompt inspiration
- **🎬 Multi-Select Dropdowns**: Choose multiple genres, moods, and styles for richer prompts
- **🔄 Three-Stage Generation**: Character → Action → Final Prompt workflow for refined, verbose results
- **🎯 NSFW Toggle**: Safe content generation with optional filtering
- **📊 Word Count Display**: Real-time character and word count tracking
- **🎨 Responsive Design**: Beautiful, modern UI with dark theme and smooth animations
- **💾 Local Settings**: All API keys and preferences stored securely in your browser

## 🌟 Z-Image-Turbo Specifications

Z-Image-Turbo is Alibaba's 6B-parameter distilled model optimized for:
- **Long, detailed prompts** (up to 1024 tokens)
- **8-9 inference steps** for sub-second generation
- **1024×1024 or 1280×720** resolutions
- **CFG-free** (guidance scale 0.0, no negative prompts)
- **Bilingual text rendering** (English/Chinese)
- **Photorealistic quality** with strong prompt adherence
- **Consumer GPU friendly** (runs on 16GB VRAM)

## 📋 Requirements

- **Node.js** ≥ 18 (recommended 20+)
- **npm** ≥ 9 or **Bun** ≥ 1.0
- **Git**
- Modern browser (Chrome, Firefox, Safari, Edge)

### API Keys (Optional - Choose at least one)
- [Google Gemini API Key](https://makersuite.google.com/app/apikey) (Recommended)
- [DashScope API Key](https://dashscope.console.aliyun.com/) (Qwen models)
- Ollama running locally (default: http://localhost:11434)
- LM Studio running locally (default: http://localhost:1234)

## 🚀 Quick Start

### Windows Users

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/z-turbo-prompt-generator.git
   cd z-turbo-prompt-generator
   ```

2. **Run the installer**
   ```
   install-windows.bat
   ```
   - The installer will check dependencies and guide you through setup
   - Choose between npm or Bun (npm recommended for beginners)

3. **Launch the app**
   ```
   start-ui.bat
   ```
   Opens automatically at http://localhost:8080

### Linux / macOS Users

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/z-turbo-prompt-generator.git
   cd z-turbo-prompt-generator
   ```

2. **Run the installer**
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. **Launch the app**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   Opens automatically at http://localhost:8080

### Manual Installation (All Platforms)

```bash
# Clone
git clone https://github.com/YOUR-USERNAME/z-turbo-prompt-generator.git
cd z-turbo-prompt-generator

# Install dependencies
npm install
# or: bun install

# Start dev server
npm run dev
# or: bun run dev
```

Open http://localhost:8080 in your browser.

## ⚙️ Configuration

### Setting Up AI Providers

Click the **Settings** (⚙️) icon in the app and configure your preferred provider:

| Provider | Setup |
|----------|-------|
| **Google Gemini** (Recommended) | Get key from [Google AI Studio](https://makersuite.google.com/app/apikey) |
| **Qwen (DashScope)** | Get key from [DashScope Console](https://dashscope.console.aliyun.com/) |
| **Ollama** (Local) | Install [Ollama](https://ollama.ai), run locally on port 11434 |
| **LM Studio** (Local) | Install [LM Studio](https://lmstudio.ai), start local server on port 1234 |

### Storage
- All settings and API keys are stored in your browser's localStorage
- No data is sent to external servers except API calls to your chosen LLM provider

## 🎯 Usage

1. **Enter a subject**: Describe what you want to generate
2. **Add details**: Select genres, moods, themes, and styles
3. **Generate prompts**: Click "Generate Prompts" to create optimized prompts
4. **Copy and use**: Click any generated prompt to copy it

### Z-Image-Turbo Settings
When using generated prompts in Z-Image-Turbo:
- **Steps**: 8-9
- **CFG Scale**: 0.0 (no negative prompts needed)
- **Resolution**: 1024×1024 or 1280×720
- **Max tokens**: 1024

### Tips for Best Results
- **Be verbose**: Z-Turbo loves long, detailed prompts (150-300 words)
- **Use structured descriptions**: Lead with physicality, then environment, then mood
- **No negative prompts needed**: Z-Turbo is CFG-free
- **Use the image upload feature** for inspiration from existing images

## 🔧 Troubleshooting

Having issues? Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common problems and solutions.

## 📦 Build Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist/` folder to any static host:
- **Vercel**: Connect GitHub repo for automatic deploys
- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Configure in repository settings

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

- ✅ Personal, educational, research use allowed
- ✅ Modify and share for non-commercial purposes
- ❌ Commercial use requires explicit permission

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/YOUR-USERNAME/z-turbo-prompt-generator/issues)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

Made with ❤️ by the BRKN team | Powered by Z-Image-Turbo
