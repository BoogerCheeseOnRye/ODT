# ODT v2.0 - Omni Development Terminal (Offline Edition)

**Complete offline AI development dashboard with local LLM integration.**

## Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ ([Download](https://nodejs.org/))
- Ollama ([Download](https://ollama.ai/)) - For local LLM models

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Ollama
```bash
# In a separate terminal
ollama serve
```

### Step 3: Pull a Model (First time only)
```bash
# In the same Ollama terminal
ollama pull qwen2.5:7b
```

Or pull a smaller model:
```bash
ollama pull phi:2.7b
```

### Step 4: Start ODT
```bash
npm start
# or
node proxy.js
```

This starts the proxy server on `localhost:9001`

### Step 5: Open Dashboard
```
Open in browser: file:///E:/ODTV2/index.html
```

Or use the launcher:
```bash
dev-env-standalone.bat
```

---

## Features

✅ **Multi-Project Workspace** - Create and manage multiple projects  
✅ **Code Editor** - Edit files with tabs and full syntax support  
✅ **3D Preview** - Real-time 3D visualization with Three.js  
✅ **AI Chat** - Talk to local LLM with planning and execution modes  
✅ **Hardware Detection** - Auto-detect GPU/CPU and optimize  
✅ **Diagnostics** - System health checks and performance monitoring  
✅ **File Manager** - Browse and organize project files  
✅ **Model Manager** - Download and switch between local models  
✅ **Settings** - Customize FPS, layout, theme  
✅ **Persistence** - All data saved to IndexedDB + localStorage  

---

## Architecture

```
ODTV2/
├── index.html              (Main dashboard app)
├── proxy.js                (Node.js proxy server)
├── package.json            (Dependencies)
├── CONFIG.env              (Environment config)
├── dev-env-standalone.bat  (Windows launcher)
└── README.md               (This file)

External Services (must be running):
├── Ollama (localhost:11434)  - Local LLM models
└── Proxy (localhost:9001)    - API gateway
```

---

## How It Works

1. **Browser App** (index.html)
   - Runs entirely in browser (100% offline after load)
   - Stores data in IndexedDB + localStorage
   - Communicates with proxy server for LLM calls

2. **Proxy Server** (proxy.js)
   - Node.js Express server
   - Forwards requests to local Ollama
   - Handles CORS for browser security

3. **Ollama** (local)
   - Runs LLM models locally
   - Models stored in `~/.ollama/models/`
   - No internet needed after model download

---

## Available Models

**Recommended for ODT:**

| Model | Size | Speed | Quality | Command |
|-------|------|-------|---------|---------|
| phi:2.7b | 1.6GB | ⚡⚡⚡ Fast | ⭐⭐⭐ Good | `ollama pull phi:2.7b` |
| qwen2.5:7b | 4.7GB | ⚡⚡ Medium | ⭐⭐⭐⭐ Excellent | `ollama pull qwen2.5:7b` |
| mistral:7b | 4.1GB | ⚡⚡ Medium | ⭐⭐⭐⭐ Excellent | `ollama pull mistral:7b` |
| llama2:7b | 3.8GB | ⚡⚡ Medium | ⭐⭐⭐ Good | `ollama pull llama2:7b` |

**For low-end systems:**
```bash
ollama pull neural-chat:7b      # 4.1GB, optimized
ollama pull openchat:7b         # 3.9GB, fast
```

---

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure Ollama is running: `ollama serve`
- Check it's accessible: `curl http://localhost:11434`

### "Proxy connection failed"
- Make sure proxy is running: `npm start`
- Check port 9001 is not in use: `netstat -ano | findstr :9001`

### "No models found"
- Pull a model: `ollama pull qwen2.5:7b`
- Wait for download to complete
- Refresh dashboard

### Model is slow
- Check system resources (RAM, CPU)
- Try smaller model (phi:2.7b)
- Close other applications

### Browser won't load dashboard
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser (Chrome, Firefox, Edge)
- Check developer console (F12) for errors

---

## Commands

### Ollama Commands
```bash
ollama list              # List installed models
ollama pull <model>      # Download a model
ollama rm <model>        # Remove a model
ollama serve             # Start Ollama service
```

### Node Commands
```bash
npm install              # Install dependencies
npm start                # Start proxy server
node proxy.js            # Direct start
npm list                 # Check installed packages
```

---

## File Structure Explanation

- **index.html** - Complete dashboard application (all-in-one)
- **proxy.js** - Simple Express server that forwards requests to Ollama
- **package.json** - Lists Node.js dependencies needed
- **CONFIG.env** - Configuration for paths and settings
- **dev-env-standalone.bat** - Windows batch file to start everything

---

## System Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **RAM** | 4GB | 8GB+ |
| **CPU** | 2 cores | 4+ cores |
| **Disk** | 5GB | 20GB+ |
| **GPU** | None | NVIDIA/AMD |
| **OS** | Windows 7+ | Windows 10+ |
| **Browser** | Chrome 90+ | Latest Chrome/Edge |

---

## Performance Tips

1. **Use smaller models on low-end systems**
   - phi:2.7b is fastest
   - qwen2.5:7b is best quality

2. **Close other applications**
   - Frees up RAM for LLM
   - Better response times

3. **Use wired internet for model downloads**
   - First model download is large (1-5GB)
   - WiFi can be slow

4. **Hardware acceleration**
   - GPU models run much faster
   - NVIDIA/AMD GPUs recommended
   - Ollama auto-detects GPU support

---

## What's Offline

✅ **Dashboard UI** - 100% offline after load  
✅ **Projects & Files** - Stored locally in browser  
✅ **Chat History** - Saved to IndexedDB  
✅ **Settings** - Stored in localStorage  
✅ **LLM Models** - Run locally via Ollama  

❌ **NOT offline** - Initial model downloads (must have internet)

---

## Getting Help

### Check Status Indicators
- **Header icons** show Ollama and Proxy status
- Red dot = connection issue
- Green dot = connected and ready

### Run Diagnostics
1. Click **Settings** ⚙️
2. Click **Run Diagnostics** 🔍
3. Review test results

### View Logs
- Browser console (F12)
- Check for error messages
- Look for connection errors

---

## Next Steps

1. **Set up your first project**
   - Click 📋 (Projects button)
   - Create new project
   - Start coding

2. **Experiment with chat modes**
   - Direct Mode - Quick responses
   - Planning Mode - Think first, then execute

3. **Try hardware optimization**
   - Settings → Hardware Profile
   - Auto-detects your GPU
   - Applies optimal settings

4. **Download additional models**
   - Models 📦 → Scan Models
   - Or manually: `ollama pull <model>`

---

## Version Info

- **ODT v2.0** - Current (Offline Edition)
- **Release Date** - 2024
- **License** - MIT
- **Status** - Production Ready ✅

---

## Quick Reference

| Task | Steps |
|------|-------|
| **Start ODT** | 1. `ollama serve` 2. `npm start` 3. Open index.html |
| **Add model** | `ollama pull <model>` |
| **New project** | Click 📋 → "+ New Project" |
| **Open file** | Right-click file in sidebar → Edit |
| **Chat** | Type in chat box → Ctrl+Enter |
| **Save project** | Auto-saves to IndexedDB |
| **Export project** | Projects → Export (coming soon) |

---

**Ready to build? Open index.html and start creating!** 🚀
