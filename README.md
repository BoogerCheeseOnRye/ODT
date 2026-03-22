# ODT Lite - Browser LLM Only

Minimal ODT installation for offline browser-based LLM operation.

## What's Included

- Browser-based LLM (DistilGPT-2)
- Web interface (HTML)
- File editor
- 3D preview renderer
- Memory management

## What's NOT Included

- Node.js backend
- Ollama integration
- Proxy server
- Automation engine
- Model management

## Usage

1. Open `index-lite.html` in any modern browser
2. Wait for WebLLM to load (50MB download on first use)
3. Chat with browser LLM
4. Edit files locally

## Files

- `index-lite.html` - Main application
- `web-llm-fallback.js` - Browser LLM system
- `memory-manager.js` - RAM management
- `memory-settings-ui.js` - Memory UI
- `preview-renderer.js` - 3D preview
- `README.md` - This file

## Browser Requirements

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Modern mobile browsers

## First Launch

1. Open index-lite.html
2. Setup wizard appears (choose drive)
3. Config saved to %USERPROFILE%\.odt\config.json
4. WebLLM loads on first chat (10-30s)
5. Ready to use

## No Backend Required

- No Node.js needed
- No Ollama needed
- No proxy server needed
- Works offline completely
- All processing in browser

## Performance

- First load: 10-30s (model download)
- Chat: 1-2s per response
- Memory: 50MB model + 200MB overhead = ~250MB

## Limitations

- No Ollama integration (browser LLM only)
- No project management (basic file list)
- No automation engine
- No model pulling/management
- Single browser session only

## Advanced

See `WEBLLM-QUICK-REFERENCE.md` for:
- Model switching
- Parameter tuning
- API usage
- Troubleshooting

---

**Size:** ~50MB (model downloads on first use)
**Memory:** ~250MB typical usage
**Offline:** Yes, 100% browser-based
