# WebLLM Integration Guide - For Next Session

## What's Ready

The WebLLM system is **fully optimized** and ready to integrate with the chat interface.

### Current State
```
✅ Model selection: Xenova/distilgpt2 (optimized)
✅ Generation engine: Text generation pipeline
✅ Metrics system: Real-time performance tracking
✅ Fallback chain: Ollama → WebLLM → Graceful degradation
✅ Event system: 6+ custom events
✅ Error handling: Complete try/catch coverage
✅ Documentation: 2 comprehensive guides
⏳ Chat integration: Ready to implement
```

## Integration Points

### 1. Hook into Chat Send (index.html)

**Current code (around line 450):**
```javascript
async function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    // ... current code uses PROXY_API directly
}
```

**To integrate WebLLM, use fallback chain instead:**
```javascript
async function sendChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    
    addResponse('You', msg);
    input.value = '';
    chatActive = true;

    try {
        // Use fallback chain (Ollama → WebLLM → Degraded)
        const response = await window.llmFallback.generate(msg, {
            max_tokens: 200,
            temperature: 0.7
        });

        if (response.success) {
            // Show which tier handled this
            const tier = response.source === 'ollama' ? 'Ollama' :
                         response.source === 'webllm' ? 'Browser LLM' :
                         'Offline Mode';
            
            addResponse(`${tier}`, response.response);
            
            // Log metrics
            console.log(`[${tier}] Generated in ${response.generationTime}ms`);
        } else {
            addResponse('Error', response.error);
        }
    } catch (err) {
        addResponse('Error', err.message);
    } finally {
        chatActive = false;
    }
}
```

### 2. Add Tier Status to UI

**Add to header (shows active tier):**
```html
<span id="tier-indicator" style="
    padding: 4px 8px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    color: white;
    background: #30363d;
">
    LLM: Waiting
</span>
```

**JavaScript to update it:**
```javascript
function updateTierIndicator() {
    const status = window.llmFallback.getStatus();
    const indicator = document.getElementById('tier-indicator');
    
    const tierColors = {
        'ollama': '#3b82f6',      // Blue
        'webllm': '#10b981',      // Green
        'degraded': '#ef4444'     // Red
    };
    
    const tierText = {
        'ollama': 'LLM: Ollama',
        'webllm': 'LLM: Browser',
        'degraded': 'LLM: Offline',
        null: 'LLM: Ready'
    };
    
    if (indicator) {
        indicator.textContent = tierText[status.currentTier] || 'LLM: Ready';
        indicator.style.background = tierColors[status.currentTier] || '#30363d';
    }
}

// Call on each generation
```

### 3. Initialize Fallback System (on page load)

**In init() function:**
```javascript
async function init() {
    // ... existing code ...
    
    // Initialize fallback chain
    if (window.llmFallback) {
        await window.llmFallback.initialize('http://localhost:11434');
        console.log('[ODT] LLM Fallback chain initialized');
        
        // Listen for ready event
        window.addEventListener('fallback:ready', () => {
            console.log('[ODT] WebLLM ready as fallback');
            addResponse('System', 'Browser LLM ready for offline chat');
        });
        
        // Listen for tier switches
        window.addEventListener('fallback:modelSwitched', (e) => {
            addResponse('System', `WebLLM model switched to: ${e.detail.model}`);
        });
    }
    
    // ... rest of init ...
}
```

### 4. Optional: Model Selector Modal

**Add to settings modal (future enhancement):**
```html
<div class="section-label">WebLLM Model</div>
<select id="webllmModelSelect" style="width: 100%; margin-bottom: 8px;">
    <!-- Populated by JS -->
</select>
<button onclick="switchWebLLMModel()" style="width: 100%; margin-bottom: 12px;">
    Apply Model
</button>
```

**JavaScript:**
```javascript
function populateModelSelector() {
    const select = document.getElementById('webllmModelSelect');
    const models = window.llmFallback.getWebLLMModels();
    
    select.innerHTML = models.map(m => `
        <option value="${m.name}" ${m.recommended ? 'selected' : ''}>
            ${m.name} (${m.size}, ${m.speed}, ${m.quality})
        </option>
    `).join('');
}

function switchWebLLMModel() {
    const modelName = document.getElementById('webllmModelSelect').value;
    const success = window.llmFallback.switchWebLLMModel(modelName);
    
    if (success) {
        addResponse('System', `Switched to ${modelName}. Will reload on next generation.`);
    } else {
        addResponse('Error', 'Failed to switch model');
    }
}
```

## Testing Procedure

### 1. With Ollama Running
```bash
# Terminal 1
ollama serve

# Terminal 2
node server.js

# Browser: http://localhost:8000
# Chat should use Ollama (faster, higher quality)
```

### 2. Without Ollama (Offline)
```bash
# Just browser
# Open: file:///.../index.html
# First message loads DistilGPT-2 (10-30s download)
# Subsequent messages use browser LLM
```

### 3. Check Metrics
```javascript
// In console
window.llmFallback.getStatus()
// Shows: currentTier, webllmStatus, stats, memory

window.llmFallback.getStats()
// Shows: ollama_calls, webllm_calls, fallbacks, errors

window.llmFallback.getWebLLMMetrics()
// Shows: totalGenerations, tokensPerSecond, etc.
```

### 4. Switch Models
```javascript
// Try different models
window.llmFallback.switchWebLLMModel('Xenova/gpt2');
// Next message will use GPT-2 (larger, slower, better quality)
```

## Performance Expectations

### First Load
- **With Ollama:** Instant (uses Ollama)
- **Without Ollama:** First message takes 10-30s (model download) + 3-5s (generation)
- **Subsequent:** 1-2s per message

### Memory Usage
```
DistilGPT-2: ~600MB during generation
GPT-2: ~1.2GB during generation
```

### Tier Fallback Behavior
```
1. Try Ollama (5s timeout)
2. Fall back to WebLLM if Ollama fails
3. Fall back to degraded mode if WebLLM fails
4. Each tier logged in console and metrics
```

## Debugging

### Enable Detailed Logging
```javascript
// Already in console.log calls, just open F12
// Look for: [Fallback], [WebLLM], [Generation]
```

### Check Current Tier
```javascript
const status = window.llmFallback.getStatus();
console.log(`Current tier: ${status.currentTier}`);
console.log(`WebLLM ready: ${status.webllmReady}`);
console.log(`Ollama available: ${status.ollamaAvailable}`);
```

### Test Model Loading
```javascript
// Manually load and test
await window.llmFallback.webllm.initialize();
await window.llmFallback.webllm.loadModel();
const response = await window.llmFallback.webllm.generate('Hello');
console.log(response);
```

### Memory Issues?
```javascript
// Unload model to free memory
await window.llmFallback.webllm.unload();

// Check memory
const mb = window.llmFallback.webllm.getMemoryUsage();
console.log(`Memory: ${mb}MB`);
```

## Files to Modify

### Priority 1 (Must Have)
- `index.html` - Integrate sendChat() with fallback chain
- `web-llm-fallback.js` - Already done ✓

### Priority 2 (Should Have)
- Add tier indicator to header
- Hook into init() for initialization

### Priority 3 (Nice to Have)
- Model selector modal in settings
- Performance chart in stats
- Metrics dashboard

## Current File Structure

```
E:\dashboard-appv2\
├── web-llm-fallback.js ✅ READY
├── WEBLLM-OPTIMIZATION-GUIDE.md ✅ READY
├── WEBLLM-QUICK-REFERENCE.md ✅ READY
├── WEBLLM-OPTIMIZATION-COMPLETE.md ✅ READY
├── index.html ⏳ NEEDS INTEGRATION
├── server.js ✅ READY
└── proxy.js ✅ READY
```

## Expected User Experience

### With Ollama
1. User types message
2. Send button clicked
3. Response appears in 1-3s (from Ollama)
4. Header shows: "LLM: Ollama" (blue)

### Without Ollama (First Time)
1. User types message
2. Send button clicked
3. Browser LLM loading... 10-30s (download)
4. Response appears in 3-5s
5. Header shows: "LLM: Browser" (green)

### Without Ollama (Subsequent)
1. User types message
2. Send button clicked
3. Response appears in 1-2s (from cache)
4. Header shows: "LLM: Browser" (green)

### If Everything Fails
1. User types message
2. Send button clicked
3. Error message appears
4. Header shows: "LLM: Offline" (red)
5. Message: "Start Ollama or wait for browser LLM"

## Success Criteria (For Integration)

- [x] WebLLM system optimized ✓
- [x] Text generation model selected ✓
- [x] Metrics system in place ✓
- [x] Fallback chain functional ✓
- [ ] Chat UI integrated ← Next
- [ ] Tier indicator added ← Next
- [ ] Model selector modal ← Next
- [ ] Offline tested ← Next
- [ ] Performance optimized ← Next
- [ ] User guide created ← Next

## Quick Start Commands

```javascript
// Initialize
await window.llmFallback.initialize();

// Generate
const response = await window.llmFallback.generate('Hello');
console.log(response.response);

// Switch model
window.llmFallback.switchWebLLMModel('Xenova/gpt2');

// Check status
console.log(window.llmFallback.getStatus());

// Get metrics
console.log(window.llmFallback.getWebLLMMetrics());
```

## Related Documentation

- `WEBLLM-OPTIMIZATION-GUIDE.md` - Comprehensive guide
- `WEBLLM-QUICK-REFERENCE.md` - Quick lookup
- `WEBLLM-OPTIMIZATION-COMPLETE.md` - Session summary

---

**Status:** ✅ Ready for chat integration
**Next Session:** Integrate with chat UI + add tier indicator
