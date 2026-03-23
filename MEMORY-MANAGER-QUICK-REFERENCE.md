# Memory Manager - Quick Reference

## Check Memory Status (Header)
Look at header stats: `Memory: 245.3MB ●`
- **Green dot (●)** = Normal (<75%)
- **Yellow dot (●)** = Warning (75-85%)
- **Red dot (●)** = Critical (85-95%)

## Open Memory Settings
**Settings** → **Memory Management** button

## Key Controls

| Setting | Default | Range | Effect |
|---------|---------|-------|--------|
| Max RAM | 75% | 50-95% | When to warn |
| Auto-Optimize | ON | ON/OFF | Auto-cleanup at critical |
| Check Interval | 5s | 2-10s | How often to monitor |

## Memory Status Levels

```
0-75%   → ✓ Normal        (green)
75-85%  → ⚠️  Warning      (yellow)
85-95%  → 🔴 Critical     (red) - Auto-cleanup triggers
95-100% → ⛔ Emergency    (red) - Force cleanup
```

## Quick Commands (Browser Console)

```javascript
// Check status
window.memoryManager.getStatus()

// Summary
window.memoryManager.getSummary()

// Manual cleanup
window.memoryManager.runCleanupStrategies(0)

// Change limit
window.memoryManager.setMaxRAMPercent(80)

// Export metrics
window.memoryManager.exportMetrics()
```

## Auto-Cleanup Strategies

When critical level reached (auto-optimization enabled):

1. **Unload WebLLM** (50-300MB) - Reload on next chat
2. **Clear Cache** (5-20MB) - Non-essential data
3. **Optimize Scene** (2-10MB) - Temp 3D objects
4. **Trim History** (1-5MB) - Keep last 100 messages
5. **Clear File Cache** (2-5MB) - Reload on file select
6. **Force GC** (0-50MB) - Garbage collection

## Profiles

### Conservative (Low-end)
```
Limit: 50% | Auto-optimize: ON | Check: 2s
→ Aggressive cleanup, frequent checks
```

### Balanced (Default)
```
Limit: 75% | Auto-optimize: ON | Check: 5s
→ Good balance for most devices
```

### Performance (High-end)
```
Limit: 85% | Auto-optimize: OFF | Check: 10s
→ Relaxed limits, manual cleanup only
```

## Events

```javascript
// Memory updated (every 5s)
window.addEventListener('memory:update', (e) => {
    console.log(e.detail.percent + '%');
});

// Status changed
window.addEventListener('memory:statusChange', (e) => {
    console.log(e.detail.status);
});

// Critical level
window.addEventListener('memory:critical', (e) => {
    // Auto-cleanup triggered
});

// Emergency level
window.addEventListener('memory:emergency', (e) => {
    // Force cleanup executed
});
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Memory keeps rising | Lower max % → Settings → Memory Mgmt → Slider down |
| Auto-optimize not working | Check toggle is ON in Settings |
| Slow after cleanup | WebLLM unloaded, will reload on next chat |
| Memory spike on model load | Normal, cleanup before loading large models |

## Stats Displayed

- **Used**: Current heap (MB)
- **Available**: Unused memory (MB)
- **Peak**: Highest usage so far
- **Status**: Current level (normal/warning/critical/emergency)
- **Objects**: DOM + 3D objects count
- **Optimizations**: Total cleanups run

## Files

- `memory-manager.js` - Core system (18.8 KB)
- `memory-settings-ui.js` - UI controls (6.3 KB)
- `MEMORY-MANAGER-GUIDE.md` - Full docs (11 KB)
- `MEMORY-MANAGER-QUICK-REFERENCE.md` - This file

---

**TL;DR:** Memory auto-optimizes at 85%. Adjust limit in Settings → Memory Management.
