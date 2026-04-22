# ODT - Omni Development Terminal

A local AI-powered game development environment with integrated multi-model chat, swarm orchestration, and hardware optimization. Built for game devs who want full offline control.

![ODT](https://img.shields.io/badge/ODT-v3.0-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

### 🎮 Integrated Game Dev
- Tile editor with customizable palettes
- Sprite editor with layers
- Scene management (Ground, Objects, Props)
- Live game preview in iframe
- Code editor with syntax highlighting

### 🤖 AI Agents
- Queue-based code generation (no interrupted responses)
- Multi-agent task queue (up to 4 concurrent)
- Debug, explain, and refactor agents
- AI memory (persistent facts per project)

### ⚡ Swarm Hub
- Real-time WebSocket chat
- Multi-model endless chatter mode
- AI bots chat with each other automatically
- Models show in DMs and member list

### 🧠 Multi-Model Support
| Model | Port | Notes |
|-------|------|------|
| Ollama | 11434 | Local LLM inference |
| Llama.cpp | 8888 | Direct GGUF loading |
| Chrome AI | Built-in | Gemini Nano (no download) |
| MLC WebLLM | WebGPU | Real chat models |
| Transformers.js | WASM | Any browser fallback |

### 🔧 Hardware Tools
- Hardware scanner (CPU, RAM, GPU detection)
- GGUF scanner (scan Ollama models folder)
- Auto-optimization based on specs

## Quick Start

```bash
# Install dependencies
npm install

# Start the proxy server
node proxy.js

# Open in browser
http://localhost:8080
```

## Architecture

```
ODT/
├── index.html      # Main app (all-in-one frontend)
├── proxy.js      # Node.js server (static files + Ollama proxy + WebSocket)
├── .env         # Configuration
│
├── gds-*.js    # GameDev Suite modules
│   ├── gds-tools.js      # Utility functions
│   ├── gds-runtime.js   # Runtime helpers
│   ├── gds-features.js  # Scene, prefabs, AI memory
│   └── gds-winamp.js  # Winamp player
│
├── web-llm-fallback.js  # 4-tier AI fallback system
└── pitchdeck.html     # Quick demo deck
```

## Configuration (.env)

```env
OLLAMA_HOST=http://localhost:11434
MODEL=qwen2.5-1.5b
MODELS_PATH=E:\ollama-models
```

## Key Bindings

| Key | Action |
|-----|--------|
| Space | Open command menu |
| Ctrl+S | Save file |
| Ctrl+F | Find/Replace |
| Ctrl+Enter | Run game |
| Escape | Close modals |

## API Endpoints

| Endpoint | Method | Description |
|---------|--------|------------|
| `/api/generate`| POST | Ollama chat |
| `/api/tags` | GET | List models |
| `/api/scan-gguf` | POST | Scan GGUF files |
| `/api/llama-cpp` | POST | Launch llama.cpp |
| `/api/llama-cpp` | DELETE | Stop server |
| `/ws/swarm` | WS | Swarm Hub |

## Tech Stack

- **Frontend**: Vanilla JS, CSS (no frameworks)
- **Backend**: Node.js, WebSocket (ws)
- **AI**: Ollama API + 4-tier fallback (Chrome AI → MLC WebLLM → Transformers.js)

## License

MIT — Do what you want with it.

---

Built for game devs who want AI-powered tooling without cloud dependencies.