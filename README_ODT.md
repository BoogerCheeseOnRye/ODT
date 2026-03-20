```
 ███████╗██████╗ ████████╗    ██████╗ ███████╗██╗   ██╗███████╗██╗      ██████╗ ██████╗ ███╗   ███╗███████╗██████╗ 
██╔╔════╝██╔══██╗╚══██╔══╝    ██╔══██╗██╔════╝██║   ██║██╔════╝██║     ██╔═══██╗██╔══██╗████╗ ████║██╔════╝██╔══██╗
╚█████╗ ██║  ██║   ██║       ██║  ██║█████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝██╔████╔██║█████╗  ██║  ██║
 ╚═══██╗██║  ██║   ██║       ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝ ██║╚██╔╝██║██╔══╝  ██║  ██║
███████║██████╔╝   ██║       ██████╔╝███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║     ██║ ╚═╝ ██║███████╗██████╔╝
╚══════╝╚═════╝    ╚═╝       ╚═════╝ ╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝     ╚═╝     ╚═╝╚══════╝╚═════╝ 
```

```
̴̲̯̈ ̵̦̖̾C̶̭̈́H̵̗̾A̶͎̾O̵̜̎S̴̰̈ ̴̘̏`̵̞̽`̵̧̛ ̴̰͘`̴̪̀`̵̯́`̵̯́`̴̰͘`̵̞̽`̵̧̛ ̴̰͘`̴̪̀`̵̯́`̵̯́`̴̰͘`̵̞̽`̵̧̛ ̴̰͘
```

---

## What is ODT?

**ODT (Offline Dev Tools)** is a minimal, self-contained development environment for building games and AI applications entirely locally. No cloud, no servers, no internet required.

### Key Features

- **Completely Offline** - Everything runs locally on your machine
- **AI-Powered** - Chat with Qwen LLM powered by Ollama
- **Lightweight** - Dashboard only 5.6KB (models not included)
- **Self-Contained** - All tools on one drive (E:\ by default)
- **No Docker Required** - Uses native Ollama + Node.js
- **Three.js Compatible** - Build web games with WebGL
- **C++ Support** - Compile Starsiege:Tribes engine locally
- **File Management** - Browse and edit code directly in dashboard

---

## What You Get

**Dashboard** - Dark, GitHub-styled IDE with:
- Left panel: AI chat interface (Qwen model)
- Center panel: Status and output display
- Right panel: File tree browser

**Proxy** - Node.js CORS wrapper that bridges browser to Ollama API

**Build System** - Unified `build.bat` for both web and C++ projects

**Project Templates**:
- Game: `E:\TEoAAAG\` (Three.js + rover.io)
- Engine: `E:\Tribes\` (Starsiege:Tribes C++)
- Archives: `E:\old-builds\` (reference projects)

---

## Quick Start

### Prerequisites

1. **Node.js** - Download from [nodejs.org](https://nodejs.org)
   - Add to PATH during installation

2. **Ollama** - Download from [ollama.ai](https://ollama.ai)
   - Run: `ollama serve`
   - Ensure port 11434 is open

3. **Models** - Pull at least one:
   ```bash
   ollama pull qwen2.5:7b
   ```

### Launch Dashboard

**Option A: Quick Launch (Windows)**
```batch
cd E:\
dashboard.bat
```

**Option B: From Dashboard Folder**
```batch
cd E:\dashboard-app\
launch.bat
```

**Option C: Manual Launch**
```bash
cd E:\dashboard-app
node proxy.js
# Then open: file:///E:/dashboard-app/index.html
```

---

## Using the Dashboard

### Chat with AI

1. Type in the **left panel** chat box
2. Press **Ctrl+Enter** or **Shift+Enter** to send
3. Wait for response (2-10 seconds depending on model)
4. Continue chatting

### File Browser

- **Right panel** shows E:\ drive structure
- Click any file for details
- Edit code in center panel or external editor

### Status Panel

- **Center panel** displays:
  - System messages
  - Connection status
  - Error reports
  - Build output

---

## File Structure

```
E:\
├── dashboard-app/              # Complete dashboard app
│   ├── index.html              # Main dashboard UI
│   ├── proxy.js                # Node.js CORS proxy
│   ├── launch.bat              # Launcher
│   ├── CONFIG.env              # Configuration
│   └── README.md               # App documentation
│
├── dashboard.bat               # Quick launcher from E:\ root
├── HOW_TO_USE_DASHBOARD.txt    # Plain English guide
├── TEoAAAG-Dashboard-Standalone.zip  # Portable package (5.6KB)
│
├── TEoAAAG/                    # Game project
│   ├── index.html
│   ├── TEoAAAG.exe
│   └── src/
│
├── Tribes/                     # C++ engine
│   ├── base/
│   ├── RPG/
│   └── bin/
│
├── models/                     # AI models (GGUF format)
│   └── Qwen_Qwen3.5-9B-Q4_K_M.gguf
│
├── hermes/                     # Hermes AI agent
│   └── hermes-agent/
│
└── build.bat                   # Unified build system
```

---

## Architecture

### Dashboard Flow

```
Browser (file:///)
    ↓
Dashboard HTML (index.html)
    ↓
Proxy API (localhost:9001)
    ↓
Ollama API (localhost:11434)
    ↓
Qwen Model (local inference)
    ↓
Response → Browser
```

### No External Calls

- ✓ All computation local
- ✓ No cloud dependencies
- ✓ Works offline
- ✓ T-Mobile 5G compatible
- ✓ Privacy-first

---

## Building Projects

### Web Build (Three.js)

```batch
E:\build.bat web
```

Output: `E:\TEoAAAG\build\index.html`

Test locally:
```bash
cd E:\TEoAAAG\build
python -m http.server 8000
# Open: http://localhost:8000
```

### C++ Build (Tribes Engine)

```batch
E:\build.bat tribes
```

Output: `E:\Tribes\bin\tribes.exe`

Requires MinGW compiler (included in `E:\BuildTools\`)

### Build Both

```batch
E:\build.bat
```

---

## Configuration

Edit `E:\dashboard-app\CONFIG.env`:

```env
OLLAMA_HOST=localhost:11434
PROXY_PORT=9001
MODEL=qwen2.5:7b
```

Change model:

```bash
ollama pull qwen3.5-9b
# Then update CONFIG.env: MODEL=qwen3.5-9b
```

---

## Troubleshooting

### "Ollama offline" error

```bash
ollama serve
curl http://localhost:11434/api/tags
```

### "Proxy not responding" error

- Install Node.js from nodejs.org
- Add to PATH
- Restart dashboard

### Chat doesn't send

- Make sure Ollama is running
- Press Ctrl+Enter (not just Enter)
- Check browser console (F12)

### First chat is slow

- Normal - model is loading (10-30 seconds)
- Subsequent chats are faster (cached)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+Enter | Send chat message |
| Shift+Enter | Send chat message |
| F5 | Refresh dashboard |
| F12 | Open developer console |

---

## System Requirements

- **OS**: Windows 10+, macOS, Linux
- **RAM**: 8GB minimum (16GB recommended for large models)
- **GPU**: Optional but recommended (NVIDIA, AMD, Intel Arc)
- **Storage**: 10GB for models + development
- **Internet**: Only needed for initial setup (downloading Ollama, models)

---

## Advanced Usage

### Run Without Batch Files

```bash
cd E:\dashboard-app
node proxy.js
# Then open: file:///E:/dashboard-app/index.html
```

### Use Different LLM Model

```bash
# Pull model
ollama pull mistral:latest

# Update dashboard
# Edit index.html: const MODEL = 'mistral:latest'

# Refresh browser
```

### Integrate Hermes Agent

```bash
cd E:\hermes\hermes-agent
# Follow hermes-agent setup
```

---

## Offline-First Philosophy

ODT is built for developers who:
- Work offline or on unreliable connections
- Value privacy and data security
- Want minimal dependencies
- Need full control over their tools
- Can't rely on cloud services

All computation stays local. All data stays on your machine. Period.

---

## What's NOT Included

- Models (download via `ollama pull`)
- Large training datasets
- Docker (optional, not required)
- External dependencies
- Cloud services

---

## Getting Help

1. **Read**: `E:\HOW_TO_USE_DASHBOARD.txt` (plain English guide)
2. **Check**: `E:\dashboard-app\README.md` (app-specific docs)
3. **Verify**: Ollama is running (`ollama serve`)
4. **Debug**: Browser console (F12) for errors

---

## License

Open source. MIT License.

---

## Built By

**CHAOS**

```
 ̴̴̵̧̛̲̯̰̈͘ ̴̰͘ ̵̶̵̶̵̴̦̖̭̗͎̜̰̾̈́̾̾̎̈ ̴̘̏ ̵̞̽ ̴̪̀ ̵̯́ ̵̯́ ̴̰͘ ̵̞̽ ̴̧̛ ̴̰͘ ̴̪̀ ̵̯́ ̵̯́ ̴̰͘ ̵̞̽ ̴̧̛ ̴̰͘
```

---

## Repository

- **Source**: https://github.com/BoogerCheeseOnRye/ODT
- **Dashboard Package**: `TEoAAAG-Dashboard-Standalone.zip`
- **Quick Guide**: `HOW_TO_USE_DASHBOARD.txt`

---

**Last Updated**: March 20, 2026  
**Version**: 1.0 (Standalone Release)

Offline. Local. Full Control. No Compromise.
