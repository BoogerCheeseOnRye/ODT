# ODT Lite - Browser LLM Only

Minimal ODT installation for offline browser-based LLM operation.

## What's Included

- Browser-based LLM (DistilGPT-2)
- Web interface (HTML)
- Critical warning acknowledgment screen
- Memory stats display

## What's NOT Included

- Node.js backend
- Ollama integration
- Proxy server
- Automation engine
- File editing
- 3D preview

## Usage

1. Open `index.html` in any modern browser
2. Accept the critical warning (automated download confirmation)
3. First message downloads DistilGPT-2 (50MB, cached locally)
4. Chat with browser LLM

## Files

- `index.html` - Main application with warning screen
- `web-llm-fallback.js` - Browser LLM system (DistilGPT-2)
- `README.md` - This file

## Browser Requirements

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Modern mobile browsers

## First Launch

1. Open `index.html`
2. Read critical warning about automated downloads
3. Check acknowledgment and click "Accept & Continue"
4. WebLLM initializes (loading transformers.js from CDN)
5. Send first message to trigger model download (10-30 seconds)
6. Model cached in browser IndexedDB for instant access

## No Backend Required

- No Node.js needed
- No Ollama needed
- No proxy server needed
- Works offline completely (after first model download)
- All processing in browser

## Performance

- First load: 1-2s (UI render)
- First model download: 10-30s (50MB DistilGPT-2)
- Chat response: 1-2s per message
- Memory: 50MB model + 200MB overhead = ~250MB

## Limitations

- No Ollama integration (browser LLM only)
- No file editing
- No project management
- No automation engine
- No model management UI
- Single browser session only
- First message requires CDN download

## Security & Responsibility

- Test environment only, NOT for production
- User is responsible for resource usage
- Model downloads from CDN on first use
- All data processed locally in browser
- No data sent to external servers after model load

---

**Size:** ~12 KB on disk (50MB model downloads on first use)
**Memory:** ~250MB typical usage during chat
**Offline:** Yes, 100% browser-based after first load
**Warning:** Automated system with autonomous LLM processing