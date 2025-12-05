# Z-TURBO Troubleshooting Guide

Common issues and solutions for the Z-TURBO Prompt Generator.

---

## Installation Issues

### ❌ "Node.js not found" or wrong version

**Problem**: Script says Node.js is not installed or version is too old.

**Solution**:
1. Download Node.js 18+ from https://nodejs.org
2. Install and restart your terminal
3. Verify: `node -v` should show v18.x or higher

### ❌ "npm install" fails

**Problem**: Dependencies fail to install.

**Solutions**:
1. Delete `node_modules` and `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Clear npm cache:
   ```bash
   npm cache clean --force
   npm install
   ```
3. Try using Bun instead:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   bun install
   ```

### ❌ Permission denied (Linux/macOS)

**Problem**: Can't run install.sh or start.sh

**Solution**:
```bash
chmod +x install.sh start.sh
./install.sh
```

---

## Runtime Issues

### ❌ Port 8080 already in use

**Problem**: Another app is using port 8080.

**Solutions**:
1. Kill the process using port 8080:
   ```bash
   # Linux/macOS
   lsof -ti:8080 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   ```
2. Or change the port in `vite.config.ts`:
   ```ts
   server: {
     port: 3000, // Change to any available port
   }
   ```

### ❌ Blank page / App won't load

**Problem**: Browser shows blank page or loading forever.

**Solutions**:
1. Clear browser cache and localStorage
2. Open browser console (F12) and check for errors
3. Try a different browser
4. Rebuild:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

---

## LLM Provider Issues

### ❌ Google Gemini: "API key invalid"

**Problem**: Gemini API key not working.

**Solutions**:
1. Get a new key from https://makersuite.google.com/app/apikey
2. Make sure the key has no extra spaces
3. Check if the key has usage limits/quotas

### ❌ Qwen/DashScope: "Authentication failed"

**Problem**: DashScope API key not working.

**Solutions**:
1. Get key from https://dashscope.console.aliyun.com/
2. Ensure your account has API access enabled
3. Check if you're in a supported region

### ❌ Ollama: "Connection refused"

**Problem**: Can't connect to Ollama.

**Solutions**:
1. Make sure Ollama is running:
   ```bash
   ollama serve
   ```
2. Check the base URL (default: http://localhost:11434)
3. Verify you have a model installed:
   ```bash
   ollama list
   ollama pull llama2  # or another model
   ```

### ❌ LM Studio: "Model not found" or JSON errors

**Problem**: LM Studio returns errors or garbled output.

**Solutions**:
1. Make sure LM Studio's local server is running (green indicator)
2. Load a model in LM Studio before generating
3. Use a model that supports chat/instruct format
4. Check the model name in settings matches exactly what LM Studio shows
5. Try a different model - some models don't output clean JSON

**Finding the correct model name**:
1. Open LM Studio
2. Go to the "Local Server" tab
3. The loaded model name appears at the top
4. Copy that exact name into Z-TURBO settings

---

## Generation Issues

### ❌ Prompts are too short

**Problem**: Generated prompts aren't detailed enough.

**Solutions**:
1. Add more context in your subject description
2. Select multiple genres, moods, and styles
3. Try a different LLM provider (Gemini often gives longer outputs)

### ❌ Generation takes too long

**Problem**: Prompt generation is slow.

**Solutions**:
1. Local models (Ollama/LM Studio) depend on your hardware
2. Try a smaller/faster model
3. Cloud providers (Gemini/Qwen) are generally faster

### ❌ Weird characters in output

**Problem**: Output has strange symbols or formatting.

**Solutions**:
1. This usually means the LLM didn't return valid JSON
2. Try regenerating
3. Switch to a different provider
4. For LM Studio, use a model that follows instructions well

---

## Browser Issues

### ❌ Settings not saving

**Problem**: API keys or settings reset after refresh.

**Solutions**:
1. Make sure localStorage is enabled in your browser
2. Check if you're in private/incognito mode (localStorage is limited)
3. Try a different browser

### ❌ Copy to clipboard not working

**Problem**: Clicking prompts doesn't copy them.

**Solutions**:
1. Make sure you're using HTTPS or localhost
2. Allow clipboard permissions when prompted
3. Try right-click → Copy instead

---

## Still Having Issues?

1. **Check the browser console** (F12 → Console tab) for error messages
2. **Try a different LLM provider** to isolate the issue
3. **Restart everything**: Close browser, stop server, restart
4. **Fresh install**:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

If none of these help, please open an issue with:
- Your operating system
- Node.js version (`node -v`)
- Browser and version
- The exact error message from the console
