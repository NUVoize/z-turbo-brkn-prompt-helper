# FLUX 2.0 - BRKN AI Prompt Generator

A powerful AI-powered prompt generator designed for **FLUX 2.0** image generation. Built with React, TypeScript, and multiple LLM provider support to help you craft detailed, creative prompts for stunning images.

![FLUX 2.0 Prompt Generator](https://via.placeholder.com/1200x400.png?text=FLUX+2.0+Prompt+Generator)

## ✨ Features

- **🎨 Multi-Format Prompt Generation**: Generate prompts optimized for FLUX 2.0 image generation
- **🧠 Multiple LLM Providers**: Supports Google Gemini, Qwen (DashScope), Ollama, and LM Studio
- **📝 Enhanced AI Captioning**: Upload images for AI-powered scene descriptions and prompt inspiration
- **🎬 Multi-Select Dropdowns**: Choose multiple genres, moods, and styles for richer prompts
- **🔄 Three-Stage Generation**: Character → Action → Final Prompt workflow for refined results
- **🎯 NSFW Toggle**: Safe content generation with optional filtering
- **📊 Word Count Display**: Real-time character and word count tracking
- **🎨 Responsive Design**: Beautiful, modern UI with dark theme and smooth animations
- **💾 Local Settings**: All API keys and preferences stored securely in your browser

## 🛠️ Tech Stack

- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Powerful data fetching
- **Google Gemini AI** - Advanced language model
- **Qwen (DashScope)** - Alibaba's LLM service
- **Ollama** - Local LLM support
- **LM Studio** - Local model management

## 📋 Prerequisites

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

### Windows Users (Easiest)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Run the installer**
   ```bash
   install-windows.bat
   ```
   - The installer will check dependencies and guide you through setup
   - Choose between npm or Bun (npm recommended for beginners)
   - Optionally start the dev server automatically

3. **Launch the app** (if you didn't auto-start)
   ```bash
   start-ui.bat
   ```
   Opens automatically at http://localhost:8080

### Manual Installation (All Platforms)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Open your browser**
   Navigate to http://localhost:8080

## ⚙️ Configuration

### Setting Up AI Providers

1. Click the **Settings** (⚙️) icon in the top right
2. Choose your preferred LLM provider:

#### Option 1: Google Gemini (Recommended)
- Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- Paste it in the Gemini API Key field
- Save and test

#### Option 2: Qwen (DashScope)
- Get your API key from [DashScope Console](https://dashscope.console.aliyun.com/)
- Paste it in the DashScope API Key field
- Save and test

#### Option 3: Ollama (Local)
- Install and run [Ollama](https://ollama.ai)
- Default base URL: http://localhost:11434
- Ensure Ollama is running before generating prompts

#### Option 4: LM Studio (Local)
- Install and run [LM Studio](https://lmstudio.ai)
- Load a model and start the local server
- Default base URL: http://localhost:1234

### Storage Location
- All settings, API keys, and preferences are stored in your browser's localStorage
- No data is sent to external servers except for API calls to your chosen LLM provider

## 📁 Project Structure

```
flux2-prompt-generator/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (buttons, dialogs, etc.)
│   │   └── SettingsDialog.tsx
│   ├── pages/              # Page components
│   │   └── Index.tsx       # Main prompt generator page
│   ├── services/           # API services
│   │   ├── geminiService.ts
│   │   ├── llm/
│   │   │   └── router.ts   # LLM provider router
│   │   └── providers/      # Individual provider services
│   ├── lib/                # Utilities
│   └── main.tsx            # App entry point
├── components/             # Standalone components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── icons/
├── public/                 # Static assets
├── install-windows.bat     # Windows installer script
├── start-ui.bat           # Windows dev server launcher
└── package.json
```

## 📦 Build Commands

```bash
# Development server (with hot reload)
npm run dev
# or
bun run dev

# Build for production
npm run build
# or
bun run build

# Preview production build
npm run preview
# or
bun run preview

# Type checking
npm run type-check
# or
bun run type-check
```

## 🌐 Deployment

### Building for Production

```bash
npm run build
# or
bun run build
```

The optimized production build will be in the `dist/` directory.

### Deployment Platforms

Deploy easily to:
- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Configure in repository settings
- **Any static host**: Upload the contents of `dist/`

**Build Settings:**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

## 🎯 Usage

1. **Enter a subject**: Describe what you want to generate
2. **Add details**: Select genres, moods, themes, and styles
3. **Generate prompts**: Click "Generate Prompts" to create:
   - Character description
   - Action/scene description  
   - Final FLUX-optimized prompt
4. **Copy and use**: Click any generated prompt to copy it to your clipboard
5. **Generate images**: Use the prompt in FLUX 2.0 or your preferred image generator

### Tips for Best Results
- Be specific with your subject description
- Combine multiple genres/moods for unique results
- Use the image upload feature for inspiration from existing images
- Enable NSFW filtering if needed for safe content
- Try different LLM providers to find your favorite style

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License & Usage Policy

This project is licensed under the **PolyForm Noncommercial License 1.0.0**.

### ✅ You CAN:
- Use for personal, educational, or research purposes
- Modify and adapt the code for non-commercial use
- Share and distribute for non-commercial purposes

### ❌ You CANNOT:
- Use for commercial purposes without explicit permission
- Sell or monetize the software or derivatives
- Use in commercial products or services

For commercial licensing inquiries, please contact the project maintainer.

## 📧 Support

- **Issues**: [GitHub Issues](<your-repo-url>/issues)
- **Discussions**: [GitHub Discussions](<your-repo-url>/discussions)
- **Email**: Contact via GitHub profile

## 🙏 Acknowledgments

- **BRKN** - Original concept and design
- **Google Gemini** - AI capabilities
- **Alibaba Cloud** - Qwen/DashScope support
- **Ollama** - Local LLM infrastructure
- **LM Studio** - Local model management
- **Vercel** - Excellent deployment platform
- All open-source contributors and maintainers

---

Made with ❤️ by the BRKN team | Powered by FLUX 2.0
