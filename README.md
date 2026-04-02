# ODT V3 — The Night of Death
**Omni Development Terminal** · Game Dev Suite + Swarm AI Communication Platform

> One `index.html`. Offline-first. No cloud required. Runs on your machine or GitHub Pages.

---

## Quick Start

```bash
git clone https://github.com/BoogerCheeseOnRye/ODT --branch V3-TheNightOfDeath
cd ODT
node start.js
```

Open **http://localhost:5000** in Chrome.

---

## Requirements

| Requirement | Notes |
|---|---|
| Node.js 18+ | `nvm install 18` or `apt install nodejs` |
| Chrome / Chromium | Required for browser AI (Chrome AI flag) |
| Ollama (optional) | Local LLM inference — see AI Setup below |

### Install Node.js via nvm
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 18 && nvm use 18
```

### Install Node.js via apt (Debian/Ubuntu)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

---

## AI Setup

ODT supports 4 AI tiers, tried in order. Configure however many you want.

### Tier 1 — Ollama (Local, Recommended)
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull qwen2.5:7b          # default model (~4.5 GB)
ollama pull llama3.2:3b         # lighter option (~2 GB)
ollama serve                    # starts at localhost:11434
```

Verify:
```bash
curl http://localhost:11434/api/tags
```

### Tier 2 — Chrome AI (Built-in Gemini Nano)
1. Open `chrome://flags/#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
2. Open `chrome://flags/#prompt-api-for-gemini-nano` → **Enabled**
3. Restart Chrome. Download begins automatically (~1.7 GB).

Verify:
```javascript
// Paste in DevTools console
const s = await window.ai.languageModel.capabilities();
console.log(s.available); // should print "readily"
```

### Tier 3 — MLC WebLLM (Browser VRAM)
No setup needed. ODT will prompt you to download a model on first use.
Requires ~6 GB VRAM. Only one model can be active at a time in the browser.

### Tier 4 — Transformers.js (CPU/WASM)
No setup needed. Slower but works on any hardware.

---

## Server Routes (when running `node start.js`)

| Route | File served | Description |
|---|---|---|
| `/` | `gamedev.html` | GameDev Suite (main app) |
| `/swarm` | `swarm.html` | Swarm Hub / AI chat cluster |
| `/odt` | `odt.html` | ODT Dashboard (local only) |

### GitHub Pages
Single-file `index.html` contains everything. Swarm Hub opens as a full-screen overlay panel. No server required.

---

## GameDev Suite — All Features

### Editor
| Feature | How to use |
|---|---|
| New file | `Ctrl+N` or ⊞ → New File |
| Save | `Ctrl+S` |
| Import files | `Ctrl+O` or ⊞ → Import (supports .js .ts .json .md .glsl .css) |
| Export project | ⊞ → Export (downloads .zip) |
| Find & Replace | `Ctrl+H` or ⊞ → Find |
| Format code | `Ctrl+I` or ⊞ → Format |
| New project | Project dropdown → New Project (templates: Blank, Platformer, Top-Down RPG, Shooter, Puzzle, Tribes Script) |
| Switch project | Project dropdown |

### Scene Editor (right panel → 🗺)
| Feature | How to use |
|---|---|
| Draw tiles | Select tile from palette, click/drag canvas |
| Pen tool | `P` or pencil button |
| Erase tool | Eraser button |
| Fill tool | Bucket button |
| Select tool | Selection button |
| Undo / Redo | Undo / Redo buttons |
| Zoom | `−` / `+` buttons or scroll wheel |
| Reset zoom | Center button |
| Add layer | `+` in Layers panel |
| Scene settings | Settings button (width, height, tile size, sandbox toggle) |
| Export scene | Download button (exports JSON) |
| Allow same-origin | Settings → toggle "Allow same-origin in game preview" (off by default, enables localStorage/cookies in preview) |

### Game Runner (right panel → Play)
| Feature | How to use |
|---|---|
| Run game | Play button or `F5` |
| Stop game | Stop button |
| Reload | Reload button |
| Performance HUD | Stats button (FPS, memory overlay) |
| Input Mapper | Gamepad button (map keyboard/gamepad) |

### Entity Inspector (right panel → Wrench)
- Add entities with **+ Add Entity**
- Select entity to edit transform, components, scripts

### Sprite Editor (right panel → Paint palette)
- Pixel-art canvas
- Palette, pencil, fill, erase tools
- Save sprite to project assets

### Particle Designer (right panel → Sparkles)
- Live particle preview
- Adjust emitter, lifetime, speed, color, gravity

### Prefabs (right panel → Diamond)
- Save selected entity as prefab (+ button)
- Drag prefabs into scene

### AI Assistant (right panel → Robot)

**Modes:**
| Mode | What it does |
|---|---|
| Code | Generates/extends code for the current file |
| Debug | Finds bugs and explains them |
| Explain | Explains what the code does in plain language |
| Design | Game design advice, mechanics, level ideas |
| Optimize | Performance and readability improvements |

**Context toggles:** File · Selection · Scene · Entities

### Agent Queue (hexagon button in top-right)

The Agent Queue runs AI tasks in the background — up to 4 at once.

**Quick dispatch buttons** (at the bottom of the panel):
- Code Gen, Debug, Explain, Build

**+ New Agent (blue button in panel header):**
Opens the full Launch Agent modal with:
- **Task Type** — Code Gen, Debug, Explain, Optimize, Game Design, Build, Scan
- **Custom Instructions** — write exactly what you want the AI to do
- **Context** — Current file / All project files / No file context

Each task shows a progress bar, status badge (queued → running → done/error), and a cancel button.

### Command Menu (⊞ button top-left, or `Space`)

Full command palette with search. All tiles searchable by tag.

| Section | Tiles |
|---|---|
| Project & Files | New File, Save, Import, Export |
| Run & Tools | Run Game, Stop, Scene, Sprite, Audio, Engine, Format, Find |
| AI Agents | Code Gen, Debug, Explain, Optimize, Build, Queue |

### Audio Workbench (Winamp button in top-right, or ⊞ → Audio)
- Load audio files
- Visualizer, EQ, playlist
- SFX preview and export

### Bottom Panels
| Tab | Description |
|---|---|
| Console | Live game output, `console.log()`, expression evaluator |
| Audio | Audio workbench mount |
| Timeline | Animation timeline editor |
| Build | Build output log |
| Search | Project-wide text search |

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Open/close Command Menu |
| `F5` | Run game |
| `Ctrl+S` | Save current file |
| `Ctrl+N` | New file |
| `Ctrl+O` | Import file |
| `Ctrl+H` | Find & Replace |
| `Ctrl+I` | Format code |
| `Escape` | Close any open modal or menu |

---

## Swarm Hub — All Features

Access at `/swarm` (local server) or via the **Swarm** button in the top bar.

### Cluster Engine
- Routes messages to **Ollama** at `10.0.2.2:11434` (Android/emulator default) or `localhost:11434`
- **Router Model** — reads the channel, selects which specialist should reply
- **Specialist Models** — comma-separated list of models (e.g. `qwen2.5:7b,llama3.2:3b`)
- **Endless Chatter** — bots generate background conversation automatically (every 7s)
- **Auto crowd processing** — every 5s, processes pending messages through the cluster

### Channels
- `#general`, `#chill`, `#dev`, `#art`, `#ml`
- Switch channels in the left sidebar

### Direct Messages
- DM tab for private conversations with specific bots

### Twitch Chat Integration (right panel)
- Enter a Twitch channel name and connect
- Live chat appears in the right panel
- PING/PONG keepalive with auto-reconnect

### Settings (gear button in top bar)
| Setting | Description |
|---|---|
| Router Model | Model that reads messages and decides which specialist responds |
| Specialist Models | Comma-separated list of models available for responses |
| System Prompt | Base instructions for all bots |
| Endless Chatter | Toggle autonomous background conversation |

---

## Fixing a Broken UI

If something stops working, try these steps in order:

### 1. Hard reload
```
Ctrl+Shift+R  (or Cmd+Shift+R on Mac)
```

### 2. Reset game state (fixes stuck projects or corrupt editor state)
Open DevTools console (`F12`) and run:
```javascript
localStorage.removeItem('gds_state');
location.reload();
```

### 3. Reset sandbox setting (fixes blank game preview)
```javascript
localStorage.removeItem('gds_allow_same_origin');
location.reload();
```

### 4. Reset ALL ODT settings (nuclear option)
```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('gds') || k.startsWith('odt'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

### 5. Check if Ollama is running
```bash
curl http://localhost:11434/api/tags
# Should return JSON with model list
# If it fails: ollama serve
```

### 6. Check if the server is running
```bash
curl http://localhost:5000
# Should return the GameDev Suite HTML
# If it fails: node start.js
```

### 7. Scripts not loading (blank page / nothing works)
Make sure these files exist in the same folder as `gamedev.html`:
- `gds-tools.js`
- `gds-runtime.js`
- `gds-features.js`
- `gds-winamp.js`
- `web-llm-fallback.js`

Check the browser DevTools Network tab — any 404s on these files means they are missing. Re-clone the repo to restore them.

### 8. Scene editor is blank / tiles don't draw
Open DevTools console and check for GDS errors. If `GDS is not defined`:
```javascript
// Check if gds-tools.js loaded at all
document.querySelectorAll('script').forEach(s => console.log(s.src));
```
Reload the page. If the error persists, the script load order may be wrong — check that the page loads `gds-tools.js` before `gds-runtime.js` before `gds-features.js`.

### 9. AI always shows "offline"
- Check Tier 1: `curl http://localhost:11434/api/tags`
- Check Tier 2: Open `chrome://flags/#prompt-api-for-gemini-nano` (must be Enabled)
- Try clicking the AI status indicator in the top bar to cycle tiers
- Check DevTools console for fetch errors

### 10. Swarm Hub bots not responding
- Verify Ollama is running: `ollama serve`
- Check the model is pulled: `ollama list`
- Open Settings (gear) and confirm Router Model matches an installed model name exactly
- For Android/emulator: host is `10.0.2.2:11434` — for desktop use `localhost:11434`

### 11. Swarm Hub Twitch chat not connecting
- Verify the channel name is spelled correctly (lowercase, no `#`)
- Check browser DevTools Network → WS tab for the WebSocket connection to `irc-ws.chat.twitch.tv`
- If it keeps disconnecting, the server may be rate-limiting — wait 30 seconds and reconnect

### 12. Agent Queue tasks stuck on "queued"
- The AI tier must be online for tasks to run — check the AI status indicator
- Open DevTools console for inference errors
- If a task is truly stuck, click the cancel (X) button and re-dispatch

---

## File Structure

```
ODT/
├── index.html          <- Unified single-file app (GitHub Pages entry point)
│                          GameDev Suite + Swarm Hub as embedded panel
├── gamedev.html        <- GameDev Suite (served at / on local server)
├── swarm.html          <- Swarm Hub cluster engine (served at /swarm)
├── odt.html            <- ODT Dashboard (served at /odt, local only)
├── start.js            <- Node.js server (port 5000)
├── package.json        <- No dependencies — pure Node built-ins
├── gds-tools.js        <- Core GDS state, file system, project manager
├── gds-runtime.js      <- Game engine runtime (loop, physics, input)
├── gds-features.js     <- Feature flags, plugin hooks, AI context builders
├── gds-winamp.js       <- Audio workbench (Winamp-style player)
├── web-llm-fallback.js <- MLC WebLLM + Transformers.js model loaders
└── README.md           <- This file
```

---

## Branch Map

| Branch | Purpose |
|---|---|
| `V2-TheRepliting` | Previous stable release |
| `V3-TheNightOfDeath` | Current release — new swarm engine, Launch Agent modal |

---

## Verify Everything Works

```bash
# 1. Server starts
node start.js
# Should print: Dashboard: http://0.0.0.0:5000

# 2. GameDev Suite loads
curl -s http://localhost:5000 | grep "ODT"

# 3. Swarm Hub loads
curl -s http://localhost:5000/swarm | grep "Swarm Hub"

# 4. Ollama responding (optional)
curl http://localhost:11434/api/tags
```

---

*ODT — built offline-first, runs everywhere.*
