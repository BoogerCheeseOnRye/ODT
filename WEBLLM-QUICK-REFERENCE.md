# ODT WebLLM - Quick Model Reference

## Current Configuration

**Default Model:** `Xenova/distilgpt2`
**Pipeline Type:** Text Generation
**Size:** 50MB (quantized)
**Speed:** Fast (~1-2s per response)
**Quality:** Good
**Status:** ✅ Optimized for offline chat

---

## Model Selection Flowchart

```
┌─ Do you have Ollama running?
│  ├─ YES → Use Ollama (better, faster)
│  └─ NO → Continue
│
├─ How much free RAM?
│  ├─ < 1GB  → DistilGPT-2 (50MB) ✓ RECOMMENDED
│  ├─ 1-4GB  → DistilGPT-2 or GPT-2
│  ├─ 4-8GB  → GPT-2 (124MB)
│  └─ > 8GB  → Phi-2 or Mistral
│
└─ Generated response quality needed?
   ├─ Good enough  → DistilGPT-2 ✓ FAST
   ├─ High quality → GPT-2 (slower)
   └─ Premium      → Phi-2 or Mistral (slowest)
```

---

## Models at a Glance

| Model | Size | Speed | RAM | Quality | Use Case |
|-------|------|-------|-----|---------|----------|
| **DistilGPT-2** | 50MB | ⚡⚡⚡ | 600MB | Good | Everyday chat ✓ |
| **GPT-2** | 124MB | ⚡⚡ | 1.2GB | Excellent | Detailed responses |
| **Phi-2** | 280MB | ⚡ | 2GB | Excellent | Complex reasoning |
| **Mistral-7B** | 320MB | 🐢 | 2.5GB | Premium | Instruction following |

---

## Generation Parameters

```javascript
// Adjust these per-request or globally
{
    max_tokens: 200,      // 50-300 (longer = slower)
    temperature: 0.7,     // 0.1 (focused) to 1.0 (creative)
    top_p: 0.9           // 0.1 (predictable) to 1.0 (diverse)
}
```

**Presets:**

| Preset | Temperature | Use |
|--------|-------------|-----|
| Focused | 0.3 | Facts, Q&A |
| Balanced | 0.7 | General chat |
| Creative | 0.9 | Brainstorming, stories |

---

## Switching Models

### Command Line (Dev Console)
```javascript
// See available models
console.table(window.llmFallback.getWebLLMModels());

// Switch to a model
window.llmFallback.switchWebLLMModel('Xenova/gpt2');

// Check status
console.log(window.llmFallback.webllm.getStatus());

// View metrics
console.table(window.llmFallback.getWebLLMMetrics());
```

### Performance Monitoring
```javascript
// Track generation quality
const metrics = window.llmFallback.getWebLLMMetrics();
console.log(`Throughput: ${metrics.tokensPerSecond} tok/s`);
console.log(`Avg time: ${metrics.averageTime}ms per token`);
```

---

## Troubleshooting

### "Loading browser LLM... never completes"
- Check internet (downloading model)
- Clear cache: `indexedDB.deleteDatabase('odt_webllm_cache')`
- Try: `window.llmFallback.webllm.unload()` then retry

### "Response quality is poor"
- Upgrade to GPT-2: `switchWebLLMModel('Xenova/gpt2')`
- Increase temperature: `0.8` (more creative)
- Rephrase question more clearly

### "Everything is slow"
- Close other tabs/apps
- Reduce `max_tokens` from 200 to 100
- Use DistilGPT-2 (already default)
- Consider running Ollama instead

### "Browser tab crashed"
- Model too large for available RAM
- Switch to DistilGPT-2
- Close other applications
- Use 64-bit browser version

---

## API Reference

### Fallback Chain Methods
```javascript
// Get tier status
llmFallback.getStatus();  // {currentTier: 'ollama'|'webllm'|'degraded', ...}

// Generate response (auto-fallback)
llmFallback.generate(prompt, options);  // Returns {success, response, source, ...}

// Get statistics
llmFallback.getStats();  // {ollama_calls, webllm_calls, fallbacks, errors}

// Switch WebLLM model
llmFallback.switchWebLLMModel('Xenova/gpt2');  // Returns true|false

// Get available models
llmFallback.getWebLLMModels();  // Array of model objects

// Get WebLLM metrics
llmFallback.getWebLLMMetrics();  // {totalGenerations, tokensPerSecond, ...}
```

### WebLLMFallback Methods
```javascript
// Direct WebLLM access
llmFallback.webllm.generate(prompt, options);
llmFallback.webllm.getStatus();
llmFallback.webllm.getMetrics();
llmFallback.webllm.getMemoryUsage();  // MB
llmFallback.webllm.summarize(text);
llmFallback.webllm.unload();  // Free memory
```

---

## Events

```javascript
// Listen for model switches
window.addEventListener('fallback:modelSwitched', (e) => {
    console.log(`Switched to: ${e.detail.model}`);
});

// Listen for fallback ready
window.addEventListener('fallback:ready', () => {
    console.log('WebLLM available');
});

// Listen for WebLLM status changes
window.addEventListener('webllm:statusChange', (e) => {
    console.log(`Status: ${e.detail.status}`);
});
```

---

## Production Checklist

- [x] Default model optimized (DistilGPT-2)
- [x] Multiple models available
- [x] Configurable parameters
- [x] Performance metrics
- [x] Error handling
- [x] Memory management
- [x] Event system
- [ ] UI model selector (coming next)
- [ ] Integration with chat (coming next)

---

## Next Steps

1. **Chat Integration** - Hook generate() into chat UI
2. **Model Selector Modal** - UI for switching models
3. **Performance Tuning** - Auto-adjust params based on hardware
4. **Caching Strategy** - Optimize model downloads
5. **Documentation** - User guide for offline mode

---

## Constants

```
MODELS_CDN: https://cdn.jsdelivr.net/npm/@xenova/transformers
CACHE_DB: odt_webllm_cache
TIMEOUT: 30000ms (model generation)
OLLAMA_TIMEOUT: 5000ms (fallback check)
```
