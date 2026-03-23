# ODTLite GitHub Branch - Setup Instructions

## What to Push to ODTLite Branch

Your ODTLite branch should contain **ONLY these files:**

1. **index.html** - Main application (with warning check at top)
2. **warning-lite.html** - Critical warning modal
3. **web-llm-fallback.js** - Browser LLM system
4. **README.md** - Documentation
5. **.gitignore** - (optional, for node modules if any)

## GitHub Branch: https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite

### Step 1: Clear the Branch

Delete all existing files from the ODTLite branch on GitHub:
- Go to branch settings
- OR delete and recreate the branch fresh

### Step 2: Copy These Files from E:\dashboard-appv2\lite\

To your local git directory for the ODTLite branch:

```
E:\dashboard-appv2\lite\index.html
  → Copy to: ODT/lite/index.html (or root if branch is separate)

E:\dashboard-appv2\lite\warning-lite.html
  → Copy to: ODT/lite/warning-lite.html

E:\dashboard-appv2\web-llm-fallback.js
  → Copy to: ODT/lite/web-llm-fallback.js
```

### Step 3: Create Root README.md

For the ODTLite branch root, create a README.md with:

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

## Files

- `index.html` - Main application
- `warning-lite.html` - Legal warning modal
- `web-llm-fallback.js` - Browser LLM system

## Model

Uses Xenova/distilgpt2 (50MB quantized)
- First load: ~10-30 seconds (downloads model)
- Cached locally: ~1-2 seconds per response
- Runs 100% in browser, no server needed

## Warning

**For TEST ENVIRONMENTS ONLY - Not for production use**

This is a highly automated system. Users must acknowledge risks before use.

## License

Same as main ODT project
```

### Step 4: Update index.html Script References

The `index.html` currently references parent: `../web-llm-fallback.js`

For standalone branch, change it to: `./web-llm-fallback.js`

**Current (dashboard-appv2\lite\index.html):**
```html
<script src="../web-llm-fallback.js"></script>
```

**For standalone ODTLite branch, change to:**
```html
<script src="./web-llm-fallback.js"></script>
```

### Step 5: Git Commands

```bash
# Switch to ODTLite branch
git checkout ODTLite

# Clear branch (or delete and recreate)
git rm -r .

# Copy files from E:\dashboard-appv2\lite\
# - index.html (WITH script src="./web-llm-fallback.js")
# - warning-lite.html
# - web-llm-fallback.js (from E:\dashboard-appv2\)
# - README.md (create new)

# Add all files
git add .

# Commit
git commit -m "ODT Lite: Standalone browser LLM

- index.html: Minimal chat interface with warning
- warning-lite.html: Critical warning modal
- web-llm-fallback.js: Browser-based LLM system
- Zero backend required, 100% offline capable
- Uses Xenova/distilgpt2 (50MB model)"

# Push
git push origin ODTLite
```

## File Modifications Needed

### 1. index.html
Change script reference from parent:
```diff
- <script src="../web-llm-fallback.js"></script>
+ <script src="./web-llm-fallback.js"></script>
```

Also update sessionStorage key to match warning:
```diff
- if (sessionStorage.getItem('odtLiteWarningAcknowledged') !== 'true') {
-     window.location.href = 'warning-lite.html';
+ // This is fine as-is, warning checks for same key
```

### 2. web-llm-fallback.js
**NO CHANGES NEEDED** - Works as-is for standalone

### 3. warning-lite.html
**NO CHANGES NEEDED** - Works as-is

### 4. README.md
**NEW FILE** - Create from template above

## Final Structure for ODTLite Branch

```
github.com/BoogerCheeseOnRye/ODT/tree/ODTLite
├── index.html (main app, script refs ./web-llm-fallback.js)
├── warning-lite.html (warning modal)
├── web-llm-fallback.js (LLM system)
└── README.md (documentation)
```

## How Users Will Use It

1. Clone or download ODTLite branch
2. Open `index.html` in browser
3. Accept warning
4. First message downloads model (~30s)
5. Chat with offline browser LLM

**Zero setup required - just open HTML file.**

## Size Summary

- HTML/CSS/JS: ~35 KB total
- Model downloads on demand: 50 MB
- Cached locally: ~50 MB
- Total: ~85 MB after first use

## To Complete

1. Update index.html script reference to `./web-llm-fallback.js`
2. Copy files to ODTLite branch
3. Create README.md
4. Commit and push
5. ODTLite branch ready for distribution

---

**ODTLite is now a standalone, distributable package.**
Users can clone just the ODTLite branch and run immediately - no backend needed.
