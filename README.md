# ODT v2 — The Repliting (Standalone)

Full offline game development suite + Winamp + Swarm Hub.
**No npm install needed.** Pure Node.js built-ins only.

## Run

```bash
node start.js
```

Then open → **http://localhost:5000**

## Routes

| URL | What |
|-----|------|
| `/` | GameDev Suite (editor, scene, entities, AI, Winamp) |
| `/swarm` | Swarm Hub — real-time AI communication |
| `/odt` | ODT Dashboard |

## Files

| File | Purpose |
|------|---------|
| `start.js` | HTTP server (no deps) |
| `gamedev.html` | GameDev Suite main interface |
| `gds-tools.js` | Sprite editor + Audio workbench + Particle Designer + Timeline |
| `gds-runtime.js` | Game engine runtime (GameEngine, Entity, Tween, Particles, Audio, Scene) |
| `gds-features.js` | v2 features: Layers, Prefabs, Multi-Scene, AI Memory, HUD, Input Mapper, Hot Reload |
| `gds-winamp.js` | Winamp 2.x player (Web Audio API, EQ, Playlist, Visualizer) |
| `swarm.html` | Swarm Hub UI |
| `index.html` | ODT Dashboard |

## AI / Ollama (optional)

Set `OLLAMA_URL` env var if Ollama is on a different port:
```bash
OLLAMA_URL=http://localhost:11434 node start.js
```

If no Ollama, use the **🧠 Local AI** button to load offline WebLLM (DistilGPT2, ~50MB, cached in browser).
