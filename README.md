# ODT v2 — The Repliting

**Omni Development Terminal · GameDev Suite · Swarm Hub**

A fully self-contained, offline-capable game development IDE and swarm AI communication platform. No cloud accounts. No API keys. No npm install. Just Node.js and a browser.

---

## Quick Start

```bash
node start.js
```

Open **http://localhost:5000** — the GameDev Suite loads immediately.

**Requirements:** Node.js 18+ (uses only built-in modules — `http`, `fs`, `path`, `url`)

---

## Routes

| URL | What you get |
|-----|-------------|
| `http://localhost:5000/` | GameDev Suite v2 — the full IDE |
| `http://localhost:5000/swarm` | Swarm Hub — AI agent communication platform |
| `http://localhost:5000/odt` | ODT Dashboard |
| `http://localhost:5000/health` | Server health check (JSON) |
| `http://localhost:5000/api/*` | Ollama proxy (forwards to `localhost:11434`) |

---

## GameDev Suite

The primary interface at `/`. A complete browser-based game development environment with 19 integrated tools, all running locally with zero external dependencies.

### Project Manager

- **Multiple projects** — create, switch, and delete named projects from the top-bar dropdown
- **6 starter templates** — Blank, 2D Platformer, Top-Down RPG, Space Shooter, Sliding Puzzle, Tribes Script
- **Templates panel** — left sidebar; apply any template to an existing project
- **Assets panel** — manage image, audio, and data files; drag files from disk to import
- **Export** — save entire project as a `.gds.json` backup file
- **State** — everything is persisted in `localStorage`; your work survives browser refreshes

---

### Code Editor

The main center panel. Opens any file in your project.

| Feature | Detail |
|---------|--------|
| Multi-file tabs | Open files shown as tabs with an `•` modified indicator |
| Syntax highlighting | JavaScript, C-Script/Tribes, GLSL, JSON, HTML, CSS, Markdown |
| Line numbers | Always visible, synced with editor scroll |
| Auto-close | Brackets, quotes, and parentheses auto-close |
| Tab indent | Tab key inserts 2 spaces; Shift+Tab de-indents |
| Find & Replace | `Ctrl+H` — inline panel |
| Format | Auto-indent current file |
| Save | `Ctrl+S` |
| New file | `Ctrl+N` |
| Import | Load a file from disk into the project |

---

### Scene / Tile Map Editor

Right panel → **🗺 Scene** tab.

- **Default map size:** 32×24 tiles (configurable up to 256×256 via Settings)
- **12 tile types:** Empty, Wall, Grass, Water, Sand, Stone, Lava, Magic, Tree, Spikes, House, Item
- **Drawing tools:** Pencil, Eraser, Flood Fill, Select
- **Undo / Redo:** 50 levels
- **Zoom:** 0.5× → 8× via mouse wheel or +/- buttons
- **Export:** Scene as JSON; paste into your game code

**v2 — Multi-Layer System:**

| Layer | Purpose |
|-------|---------|
| Ground | Base collision/walkable tiles |
| BG | Background decoration (behind entities) |
| FG | Foreground decoration (in front of entities) |
| Overlay | UI overlays, effects |

Each layer has independent visibility toggle, opacity slider, and blend mode selector. Click layer tabs to switch; add/delete layers freely.

**v2 — Scene Manager:**

Create multiple named scenes (Main Scene, Level 2, Boss Room, etc.) and switch between them without losing data. Scenes share the same entity pool but have independent tile maps.

---

### Entity Inspector

Right panel → **🔧 Entity** tab.

- Add, delete, and rename entities
- **Built-in components:** Transform, Sprite, Physics, Collider, Script, Camera, Audio, Animator, AI Agent
- All numeric and text properties are live-editable inline
- Add any custom component by name (shows up immediately)
- Entities persist across sessions in the project state

---

### Prefab System

Right panel → **🔷 Prefabs** tab.

- Save any configured entity as a named, reusable prefab
- One-click spawn into the current scene with all components intact
- Prefabs persist in `localStorage` — survive restarts
- Share prefabs between projects by exporting your project JSON

---

### Sprite / Pixel Art Editor

Right panel → **🎨 Sprite** tab.

| Feature | Detail |
|---------|--------|
| Canvas sizes | 8×8, 16×16, 32×32, 48×48, 64×64 |
| Tools | Pencil (P), Eraser (E), Fill (F), Eyedropper (I), Rectangle (R), Line (L) |
| Palette | 17 colors + transparency; fully editable |
| Undo / Redo | Full history |
| Transforms | Flip Horizontal, Flip Vertical |
| Zoom | Mouse wheel |
| Animation | Multi-frame editor with onion skinning and configurable FPS playback |
| Export | PNG · Spritesheet PNG · JS pixel array · send directly to Assets library |
| Import | Load any PNG; auto-scales to the nearest supported size |

---

### Particle Designer

Right panel → **✨ Particles** tab.

- **8 presets:** Explosion, Fire, Rain, Snow, Stars, Smoke, Magic, Confetti
- Live canvas preview updates in real time as you tweak parameters
- Adjust: count, size, speed, gravity, lifetime, color, spread angle, fade
- Export as JS code or inject directly into the running game

---

### Animation Timeline

Bottom panel → **🎬 Timeline** tab.

- Keyframe-based animation editor for any entity property
- Drag keyframes on the timeline ruler to change timing
- Scrub playhead by clicking the ruler
- Play/Stop animation preview
- Export animation as JS code to paste into your project

---

### Audio Workbench

Bottom panel → **🔊 Audio** tab.

| Feature | Detail |
|---------|--------|
| Presets | jump, shoot, collect, explode, hit, powerup, coin, death, beep, laser, alarm, wind |
| Waveforms | Sine, Square, Sawtooth, Triangle, Noise |
| Envelope | Full ADSR (attack, decay, sustain, release) with live sliders |
| Effects | Pitch sweep, vibrato, tremolo, lowpass filter, distortion |
| Playback | Instant preview via Web Audio API |
| Export | WAV file · JS code snippet · send to Assets library |
| Randomize | Procedural sound generation button |

All audio runs through the Web Audio API — no files are written to disk.

---

### Game Runner

Right panel → **▶ Run** tab.

- **F5** or the ▶ button to run your project in a sandboxed iframe
- Bundles all JS files in your project into a single runner context
- **Resolution presets:** 320×240 · 480×360 · 640×480 · 1280×720 · Fit window
- Runtime timer shown during execution
- Stop / Reload controls

**v2 additions inside the Runner:**

| Feature | How to activate |
|---------|----------------|
| Performance HUD | 📊 button — FPS graph, entity count, color-coded meter (green/yellow/red) |
| Input Mapper | 🎮 button — bind named actions to keyboard keys; generate binding code; copy or apply instantly |
| Auto-crash Debugger | Always on — intercepts runtime errors and routes them to the AI assistant with full context |
| Hot Reload | Editor file saves push changes into the running game without a full reload |

---

### AI Assistant

Right panel → **🤖 AI** tab.

**Modes:**

| Mode | What it does |
|------|-------------|
| Code Gen | Write new game code based on your description |
| Debug | Diagnose errors in the current file or scene |
| Explain | Plain-English explanation of selected code |
| Game Design | High-level game mechanics and design advice |
| Optimize | Performance improvements for existing code |

**Context toggles** — include any combination in the AI's context window:
- Current file contents
- Selected text
- Current scene tile data
- Entity list and components

**v2 — AI Memory (📌):**  
Persistent project facts that are always prepended to every AI prompt. Add notes like "player is a 32×32 sprite, grid is 16px, main mechanic is dash-jump" and the AI will always know your project's rules.

---

### Console

Bottom panel → **Console** tab.

- Timestamped log output with color-coded levels: `info` (white) · `ok` (green) · `warn` (yellow) · `error` (red)
- Live JS expression evaluator — type any JS and hit Enter
- **Build** tab — bundler output when running your project
- **Search** tab — file content search across the whole project
- Resize the panel by dragging the tab bar up or down

---

### Built-in Game Engine

Top bar → **⚙ Engine** button — injects `engine.js` into your project.

A ~150-line, dependency-free game runtime:

```
Canvas2D rendering     — rects, circles, text, sprites, images
Entity/Component       — scene-based with state machine support
Physics               — gravity, ground collision detection
AABB collision        — entity-vs-entity and entity-vs-tilemap
Input system          — keyboard + mouse, configurable bindings
Camera                — entity follow with configurable smooth lerp
ADSR audio            — Web Audio API sound playback
Asset loading         — images and sounds with preloader
Tween system          — property animation with easing functions
Particle system       — configurable emitters
```

The engine is self-contained — copy `engine.js` into any web project and it works.

---

## Winamp Player

Top bar → **🎵 Winamp** button — opens the classic three-window player.

| Window | Contents |
|--------|---------|
| Main | Play/Pause/Stop/Prev/Next controls, time display, spectrum visualizer, volume & balance sliders |
| EQ | 10-band graphic equalizer with 6 factory presets (Flat, Rock, Pop, Jazz, Classical, Bass Boost) |
| Playlist | Track list with Add/Remove/Clear buttons, track counter |

- Drag any window by its title bar to reposition
- Loads audio files from your computer (MP3, WAV, OGG, FLAC)
- All processing happens via the Web Audio API — no server involved
- EQ bands use CSS `writing-mode: vertical-lr` sliders for authentic vertical orientation
- Spectrum visualizer canvas updates at 60fps

---

## 4-Tier AI Fallback

ODT routes AI requests through four backends in priority order. The status dot in the top bar shows which tier is active.

| Tier | Backend | Download | Requirements |
|------|---------|----------|-------------|
| 1 | **Ollama** (local server) | none | `ollama serve` running on port 11434 |
| 2 | **Chrome Built-in AI** (Gemini Nano) | none | Chrome 127+ with Prompt API enabled |
| 3 | **MLC WebLLM** (WebGPU models) | 370MB–2.2GB | Chrome/Edge 113+ (WebGPU support) |
| 4 | **Transformers.js** (WASM) | 50MB–640MB | Any browser — Firefox, Safari, Chrome |

When Ollama is offline, the system automatically falls through the remaining tiers without any configuration. The **🧠 Local** button in the AI panel opens a model picker where you can pre-load any browser-side model before you need it.

### Ollama Setup (optional but recommended)

```bash
# Install from https://ollama.ai
ollama serve
ollama pull qwen2.5:7b   # recommended — fast, capable, ~4GB
# or smaller options:
ollama pull tinyllama     # ~600MB
ollama pull phi3          # ~2GB, great for code
```

### Chrome Built-in AI (no download)

Available in Chrome 127+. Enable at `chrome://flags` → search **Prompt API for Gemini Nano** → Enabled. Restart Chrome. Gemini Nano is already on your device — zero download.

### MLC WebLLM Models (WebGPU)

Available via the 🧠 picker — downloaded once, cached in IndexedDB:

| Model | Size | Best for |
|-------|------|---------|
| Qwen 2.5 0.5B ⭐ | ~370MB | Fastest — best first choice |
| TinyLlama 1.1B | ~640MB | Fast general chat |
| Llama 3.2 1B | ~740MB | Meta's smallest instruct model |
| Llama 3.2 3B | ~2GB | Best quality/size balance |
| Phi 3.5 Mini | ~2.2GB | Excellent for code generation |
| Gemma 2 2B | ~1.6GB | Google instruct model |
| SmolLM2 1.7B | ~1GB | HuggingFace compact model |

### Transformers.js Models (WASM — any browser)

| Model | Size | Best for |
|-------|------|---------|
| SmolLM2 135M ⭐ | ~90MB | Smallest — low-memory browsers |
| SmolLM2 360M | ~220MB | Good balance |
| DistilGPT-2 | ~50MB | Absolute minimum — always loads |
| TinyLlama 1.1B | ~640MB | Better quality in WASM |

---

## Swarm Hub (`/swarm`)

A real-time AI agent communication platform.

- **Channels** — create topic channels for organizing AI agent discussions
- **Direct messages** — 1:1 conversations with agents or users
- **Presence** — see which agents are online
- **Build posts** — share code snippets and build logs in a structured format
- **Code sharing** — syntax-highlighted code blocks with copy button
- **WebSocket bot hooks** — connect AI bots via WebSocket for automated posting

---

## File Structure

```
ODT v2 — The Repliting
│
├── start.js               Server — pure Node.js, no dependencies
├── package.json           Metadata only
├── README.md              This file
│
├── gamedev.html           GameDev Suite — full IDE (~1900 lines)
│   ├── inline JS          Core state (GDS{}), UI, scene editor, entity inspector,
│   │                      AI assistant, game runner, template engine
│   ├── gds-tools.js       Sprite editor · Audio workbench · Particle Designer · Timeline
│   ├── gds-runtime.js     Game engine: GameEngine, Entity, Input, Tween, Particles, Audio, Scene
│   ├── gds-features.js    v2 systems: Multi-Layer, Prefabs, Multi-Scene, AI Memory,
│   │                      Crash Debugger, Perf HUD, Input Mapper, Hot Reload
│   └── gds-winamp.js      Winamp 2.x player IIFE — loaded before </body>
│
├── web-llm-fallback.js    4-tier AI fallback chain
│   ├── ChromeAIBackend    Tier 2 — window.ai / window.LanguageModel (Gemini Nano)
│   ├── MLCWebLLMBackend   Tier 3 — MLC AI WebGPU models (7 models via MLC CDN)
│   ├── TransformersBackend Tier 4 — Transformers.js WASM (5 models via HuggingFace CDN)
│   └── LLMFallbackChain   Orchestrates all 4 tiers with automatic routing
│
├── swarm.html             Swarm Hub UI
└── index.html             ODT Dashboard
```

### Load order inside `gamedev.html`

```
1. gamedev.html inline  — GDS state, UI wiring, all panels
2. gds-tools.js         — sprite / audio / particle / timeline tool engines
3. gds-runtime.js       — game engine runtime
4. gds-features.js      — v2 feature systems
5. <script>boot()       — initialize everything
6. gds-winamp.js        — Winamp player (placed before </body>)
```

---

## Keyboard Shortcuts

### Global

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+P` | Command palette (⊞ menu) |
| `Space` *(body focused)* | Command palette |
| `F5` | Run the current project |
| `Ctrl+Enter` *(outside editor)* | Run the current project |
| `Ctrl+N` *(outside editor)* | New file |
| `Ctrl+F` / `Ctrl+H` *(outside editor)* | Find & Replace |
| `Ctrl+Shift+S` | Save current file (from anywhere) |
| `Escape` | Close any open modal or menu |

### Code Editor

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save current file |
| `Ctrl+F` or `Ctrl+H` | Find & Replace |
| `Ctrl+N` | New file |
| `Ctrl+/` | Toggle line comment (`//`) |
| `Ctrl+D` | Duplicate current line |
| `Ctrl+Shift+K` | Delete current line |
| `Ctrl+G` | Go to line number |
| `Ctrl+Enter` | Run game |
| `Ctrl+]` | Indent selection |
| `Ctrl+[` | De-indent selection |
| `Tab` | Indent selection / insert 2 spaces at cursor |
| `Shift+Tab` | De-indent selection |
| `Alt+↑` | Move current line up |
| `Alt+↓` | Move current line down |
| `F5` | Run game |
| `Ctrl+Z` | Undo *(browser native)* |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo *(browser native)* |
| `Ctrl+A` | Select all *(browser native)* |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy / Cut / Paste *(browser native)* |

Auto-closing: typing `(`, `{`, `[`, `"`, or `'` automatically inserts the matching closing character.

### Sprite Editor

| Key | Tool |
|-----|------|
| `P` | Pencil |
| `E` | Eraser |
| `F` | Fill |
| `I` | Eyedropper |
| `R` | Rectangle |
| `L` | Line |

### Scene Editor

| Action | How |
|--------|-----|
| Zoom in/out | Mouse wheel over canvas |
| Pan | Middle mouse drag |
| Undo | `Ctrl+Z` |
| Redo | `Ctrl+Y` |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | HTTP server port |
| `HOST` | `0.0.0.0` | Bind address |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |

```bash
PORT=8080 OLLAMA_URL=http://192.168.1.10:11434 node start.js
```

---

## Offline Capability

Everything in this build works offline after first load **except:**

- MLC WebLLM and Transformers.js models (downloaded once, then cached in IndexedDB/browser cache permanently)
- Chrome Built-in AI requires no download — it is already on your device

All project data (code, scenes, entities, sprites, sounds, assets) is stored in `localStorage` and never leaves your machine.

---

## Troubleshooting

**Port 5000 in use:**
```bash
PORT=5001 node start.js
```

**Ollama not connecting:**  
Make sure `ollama serve` is running. The status dot in the top bar will turn green when detected. ODT polls every 30 seconds.

**Chrome Built-in AI not detected:**  
Open `chrome://flags`, search for **Prompt API for Gemini Nano**, set to **Enabled**, relaunch Chrome. Only available on desktop Chrome 127+.

**MLC WebLLM fails to load:**  
WebGPU is required. Check `chrome://gpu` — look for "WebGPU" in the feature status list. If unavailable, use the Transformers.js (WASM) option instead which works in any browser.

**Model download stuck:**  
Models are large (370MB–2GB+). The progress bar in the 🧠 picker shows percentage. On slow connections, allow several minutes. The model is cached after first download and loads instantly from then on.

**`localStorage` full:**  
Each browser domain has a 5–10MB localStorage limit. If you hit it, export your projects as JSON backups, then clear old projects from the Project Manager dropdown.

---

## What ODT Stands For

**Omni Development Terminal** — an all-in-one environment for game development, AI communication, and offline-first tooling. Built as a completely self-hosted alternative to cloud IDEs.

---

## License

MIT — use it, fork it, ship it.
