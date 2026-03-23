# ODTLite GitHub Branch - Final Checklist

## Files to Push to ODTLite Branch

You need exactly **4 files** in your ODTLite GitHub branch:

### 1. ✅ index.html (MODIFIED - uses ./web-llm-fallback.js)
**Source:** E:\dashboard-appv2\ODTLite-index-for-github.html
**Destination:** GitHub ODTLite branch root as `index.html`

Key change from parent version:
```html
<!-- BEFORE (references parent) -->
<script src="../web-llm-fallback.js"></script>

<!-- AFTER (standalone) -->
<script src="./web-llm-fallback.js"></script>
```

### 2. ✅ warning-lite.html (NO CHANGES)
**Source:** E:\dashboard-appv2\lite\warning-lite.html
**Destination:** GitHub ODTLite branch root as `warning-lite.html`

Use exactly as-is. No modifications needed.

### 3. ✅ web-llm-fallback.js (NO CHANGES)
**Source:** E:\dashboard-appv2\web-llm-fallback.js
**Destination:** GitHub ODTLite branch root as `web-llm-fallback.js`

Use exactly as-is. No modifications needed.

### 4. ✅ README.md (NEW - CREATE THIS)
**Destination:** GitHub ODTLite branch root as `README.md`

**Content:**
```markdown
# ODT Lite - Browser-Based LLM

Minimal, standalone offline LLM chat interface. Zero backend required.

## Quick Start

1. Open `index.html` in any modern browser
2. Accept the warning (test environment only)
3. First message downloads DistilGPT-2 (50MB)
4. Chat with browser-based AI

## Features

- 100% browser-based (no server needed)
- Works completely offline after first load
- DistilGPT-2 for fast, quality responses
- Real-time memory monitoring
- Responsive chat interface

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

## How It Works

1. Open `index.html` - warning modal appears
2. Check "I acknowledge..." checkbox
3. Click "Proceed to ODT Lite"
4. First message triggers model download (~30 seconds)
5. Subsequent messages: ~1-2 seconds each
6. Model cached locally in browser

## Files

- `index.html` - Main application interface
- `warning-lite.html` - Critical warning & disclaimer
- `web-llm-fallback.js` - Browser-based LLM engine

## Model

Uses Xenova/distilgpt2 (50MB quantized)
- First load: ~10-30 seconds (downloads & caches)
- All processing: 100% in your browser
- No server connection needed
- No API keys required

## Warning

**FOR TEST ENVIRONMENTS ONLY - Not for production use**

This is a highly automated system. Users must acknowledge all risks before use.
See `warning-lite.html` for full legal disclaimer.

## Performance

- App size: ~35 KB
- Model size: ~50 MB (downloaded once, cached)
- Memory: ~250 MB typical usage
- Generation: 1-2 seconds per message (after initial load)

## Browser Cache

The model is cached in your browser's IndexedDB. To clear:
1. Open DevTools (F12)
2. Application → IndexedDB
3. Look for `odt_webllm_cache`
4. Delete database
5. Reload to re-download

## License

Same as main ODT project

## Support

For issues or questions, refer to main ODT repository.
```

## GitHub Git Commands

```bash
# Navigate to your ODT repo
cd your-local-odt-repo

# Switch to ODTLite branch
git checkout ODTLite

# Remove all existing files (if branch has content)
git rm -r .
git commit -m "Clear branch for ODT Lite setup"

# Copy the 4 files into this directory:
# - index.html (from E:\dashboard-appv2\ODTLite-index-for-github.html, rename to index.html)
# - warning-lite.html (from E:\dashboard-appv2\lite\warning-lite.html)
# - web-llm-fallback.js (from E:\dashboard-appv2\web-llm-fallback.js)
# - README.md (create from template above)

# Add all files
git add .

# Commit
git commit -m "ODT Lite: Standalone browser-based LLM

- Zero backend required
- 100% offline capable
- Uses DistilGPT-2 (50MB model)
- Critical warning system for test environments only
- Ready for immediate distribution"

# Push to ODTLite branch
git push origin ODTLite
```

## Verification Checklist

Before pushing, verify:

- [ ] `index.html` uses `<script src="./web-llm-fallback.js"></script>` (NOT `../`)
- [ ] `index.html` checks for `odtLiteWarningAcknowledged` in sessionStorage
- [ ] `warning-lite.html` sets `odtLiteWarningAcknowledged` when proceeding
- [ ] `web-llm-fallback.js` is unmodified (same as main project)
- [ ] `README.md` is created with template content
- [ ] No other files in branch (only these 4)
- [ ] No .git, node_modules, or build artifacts

## Final Result

Your ODTLite branch will contain:
```
github.com/BoogerCheeseOnRye/ODT/tree/ODTLite
├── index.html (main app, ~11 KB)
├── warning-lite.html (warning modal, ~12 KB)
├── web-llm-fallback.js (LLM engine, ~20 KB)
└── README.md (documentation, ~2 KB)

Total: ~45 KB (+ 50MB model on first run)
```

## How Users Will Use ODTLite

1. Clone ODTLite branch:
   ```bash
   git clone --branch ODTLite https://github.com/BoogerCheeseOnRye/ODT.git ODTLite
   cd ODTLite
   ```

2. Open in browser:
   ```bash
   open index.html
   # OR
   start index.html
   ```

3. Accept warning and chat with offline LLM

**Zero installation, zero dependencies, zero backend needed.**

---

## Quick Reference

| File | Source | Destination | Changes |
|------|--------|-------------|---------|
| index.html | ODTLite-index-for-github.html | index.html | Change script src to `./` |
| warning-lite.html | lite/warning-lite.html | warning-lite.html | None |
| web-llm-fallback.js | web-llm-fallback.js | web-llm-fallback.js | None |
| README.md | Create new | README.md | New file |

**Status: READY TO PUSH**

All files prepared. Just copy and commit to GitHub ODTLite branch.
