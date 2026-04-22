# ODT v2.0 - Getting Started Guide

## 5-Minute Quick Start

### What You Need
- Node.js (https://nodejs.org/)
- Ollama (https://ollama.ai/)
- This ODT folder

### Installation

**Option A: Automatic Setup (Windows)**
```
1. Double-click: SETUP.bat
2. Follow the prompts
3. Done!
```

**Option B: Manual Setup**
```
1. Install Node.js from https://nodejs.org/
2. Install Ollama from https://ollama.ai/
3. Open command prompt here
4. Run: npm install
```

### Running ODT

**Windows:**
```
Double-click: START-ODT.bat
```

**Manual:**
```
Terminal 1 - Start Ollama:
  ollama serve

Terminal 2 - Start Proxy:
  npm start

Browser:
  Open: file:///E:/ODTV2/index.html
```

### First Time Setup

**1. Download a Model**
```
In Ollama terminal, pick ONE:

Fast (for weak computers):
  ollama pull phi:2.7b

Balanced (recommended):
  ollama pull qwen2.5:7b

Best Quality:
  ollama pull mistral:7b
```

**2. Open Dashboard**
In your browser, open: `file:///E:/ODTV2/index.html`

**3. Create First Project**
- Click 📋 (Projects button, top-left)
- Click "+ New Project"
- Enter project name
- Done!

**4. Start Chatting**
- Type in the chat box
- Press Ctrl+Enter
- Get LLM responses!

---

## Features Overview

### Projects 📋
- Create multiple projects
- Switch between them instantly
- Each has separate chat history
- Auto-saves to browser

### Code Editor 📝
- Click files to open in editor
- Full-featured text editor
- Multiple tabs
- Auto-save to project
- Syntax highlighting ready

### Chat 💬
- Two modes:
  - **Direct**: Quick responses
  - **Planning**: Think then execute
- Local LLM (no internet needed)
- Full conversation history
- Per-project history

### 3D Preview 🎮
- Real-time 3D visualization
- Rotating cube demo
- FPS monitoring
- Performance optimization
- Hardware detection

### File Manager 📂
- Browse project structure
- Expandable folders
- File previews
- Size indicators
- Quick file operations

### Settings ⚙️
- Hardware profile detection
- FPS optimization
- Custom paths
- UI customization
- Performance tuning

---

## Common Tasks

### Add a New Model
```
In Ollama terminal:
ollama pull <model-name>

Examples:
  ollama pull llama2:7b
  ollama pull neural-chat:7b
  ollama pull openchat:7b
```

### Switch Models
In ODT:
1. Click 📦 Models
2. Choose model
3. Click "Use"

### Create New Project
1. Click 📋 Projects
2. Click "+ New Project"
3. Enter name
4. Start working

### Edit a File
1. Find file in right sidebar
2. Click on file name
3. File opens in editor panel
4. Edit and save (Ctrl+S)

### Check System Health
1. Click ⚙️ Settings
2. Click 🔍 "Run Diagnostics"
3. View test results

---

## Troubleshooting

### "Cannot connect to Ollama"
**Solution:**
```
1. Make sure Ollama is running
2. In Ollama terminal, type: ollama serve
3. Wait for "listening on..."
4. Refresh dashboard
```

### "Proxy connection failed"
**Solution:**
```
1. Make sure proxy is running
2. In Terminal 2, run: npm start
3. Should show "Server listening on 9001"
4. Refresh dashboard
```

### "No models found"
**Solution:**
```
1. In Ollama terminal: ollama pull phi:2.7b
2. Wait for download (this is large, 1-2 GB)
3. Refresh dashboard
4. Models should appear
```

### Dashboard loads but looks broken
**Solution:**
```
1. Hard refresh: Ctrl+Shift+R
2. Clear cache: Ctrl+Shift+Delete
3. Try different browser
4. Check F12 console for errors
```

### Very slow responses
**Solution:**
```
1. Try smaller model: ollama pull phi:2.7b
2. Close other applications
3. Check System → Hardware Profile
4. Consider GPU acceleration
```

### "ollama: command not found"
**Solution:**
```
1. Ollama not installed
2. Download from: https://ollama.ai/
3. Install and restart computer
4. Run SETUP.bat again
```

---

## System Requirements Check

**Minimum:**
- Windows 7+
- 4GB RAM
- 2-core CPU
- 5GB disk space
- Modern browser (Chrome, Firefox, Edge)

**Recommended:**
- Windows 10+
- 8GB RAM
- 4+ cores
- 20GB disk space
- Chrome or Edge
- GPU (NVIDIA/AMD)

**Check your system:**
1. RAM: Settings → System → About
2. CPU: Run "msinfo32"
3. Disk: Right-click drive → Properties

---

## Performance Tuning

### For Slow Computers
```
1. Use smaller model: phi:2.7b
2. Settings → Set FPS to 30
3. Close other applications
4. Disable 3D preview if needed
```

### For Good Computers
```
1. Use better model: mistral:7b or qwen2.5:7b
2. Settings → Set FPS to 60+
3. Enable hardware acceleration
4. Enjoy faster responses!
```

### Model Speed Comparison
| Model | Speed | Size | Quality |
|-------|-------|------|---------|
| phi:2.7b | ⚡⚡⚡ | 1.6GB | ⭐⭐ |
| qwen2.5:7b | ⚡⚡ | 4.7GB | ⭐⭐⭐⭐ |
| mistral:7b | ⚡⚡ | 4.1GB | ⭐⭐⭐⭐ |

---

## File Structure

```
ODTV2/
├── index.html              Main dashboard (open this!)
├── proxy.js                Proxy server (Node.js)
├── package.json            Dependencies
├── CONFIG.env              Settings
├── START-ODT.bat           Quick launcher
├── SETUP.bat               First-time setup
├── README.md               Full documentation
└── GETTING-STARTED.md      This file
```

---

## Next Steps

1. ✅ Run SETUP.bat
2. ✅ Start Ollama
3. ✅ Download a model
4. ✅ Start ODT
5. ✅ Create first project
6. ✅ Try chatting with AI
7. 📖 Read README.md for advanced features
8. 🚀 Start building!

---

## Need Help?

1. Check README.md for full documentation
2. Review this Getting Started guide
3. Check Troubleshooting section above
4. Try different model
5. Check system requirements
6. Restart Ollama and proxy
7. Clear browser cache

---

**You're all set! Enjoy ODT v2.0!** 🚀
