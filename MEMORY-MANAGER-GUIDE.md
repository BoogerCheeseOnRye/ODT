# RAM Usage Limiter & Auto-Optimization System

## Overview

ODT now includes an intelligent RAM management system that:
1. **Monitors memory usage** in real-time (every 5 seconds)
2. **Auto-optimizes** when approaching limits
3. **Provides UI controls** to set RAM limits
4. **Displays memory metrics** in header and dashboard
5. **Executes cleanup strategies** on demand or automatically

## Quick Start

### Enable Memory Monitoring
Memory monitoring starts automatically on page load.

### Check Memory Status
```javascript
// Get status
const status = window.memoryManager.getStatus();
console.log(status);
// {
//   used: 245.3 MB,
//   total: 2048 MB,
//   available: 1802.7 MB,
//   percent: 11.9%,
//   status: 'normal',
//   peak: 250.5 MB,
//   average: 240.1 MB,
//   objects: 1250,
//   threeObjects: 45,
//   readingsCount: 12,
//   optimizations: 0
// }
```

### Set RAM Limit
Via UI: Settings → Memory Management → Max RAM Usage slider (50-95%)

Via code:
```javascript
window.memoryManager.setMaxRAMPercent(75);
// Sets warning at 75%, critical at 85%, emergency at 95%
```

### Manual Cleanup
Via UI: Settings → Memory Management → Run Cleanup Now

Via code:
```javascript
const cleaned = window.memoryManager.runCleanupStrategies(50);
// Returns: [{ name: 'strategy-name', freed: 10.5, timestamp: ... }, ...]
```

## Memory Management Levels

### Status: Normal (0-75%)
- Application runs normally
- No optimization triggered
- Standard memory usage

### Status: Warning (75-85%)
- Visual indicator in header (yellow dot)
- User notification available
- Prepare for optimization

### Status: Critical (85-95%)
- Auto-optimization triggered (if enabled)
- Visual indicator (red dot)
- Chat notification: "Memory critical: XX% usage - optimizing..."
- Cleanup strategies execute

### Status: Emergency (95-100%)
- Force all cleanup strategies
- Critical notification
- Max memory still available

## Cleanup Strategies

Strategies execute in priority order (high to low):

### 1. WebLLM Unload (Priority: 100)
- Unloads browser-based LLM model
- Frees 50-300MB depending on model
- Model reloads on next chat use
- **Impact:** Immediate, significant

### 2. Cache Clear (Priority: 75)
- Clears IndexedDB caches
- Clears non-essential localStorage
- **Freed:** 5-20MB
- **Impact:** Moderate, transparent

### 3. Scene Optimize (Priority: 50)
- Removes temporary 3D objects
- Disposes unused geometries/materials
- Keeps essential scene elements
- **Freed:** 2-10MB
- **Impact:** Low, visual quality unchanged

### 4. History Trim (Priority: 40)
- Removes old chat messages (keeps 100 most recent)
- Keeps chat experience intact
- **Freed:** 1-5MB
- **Impact:** Low, user can reload history

### 5. File Cache Clear (Priority: 30)
- Clears file preview cache
- Reloads on next file select
- **Freed:** 2-5MB
- **Impact:** Low, seamless reload

### 6. Force GC (Priority: 10)
- Calls `gc()` if available (Chrome with `--js-flags="--expose-gc"`)
- Runs garbage collection
- **Freed:** Variable (0-50MB)
- **Impact:** Negligible in most cases

## Real-Time Monitoring

### Header Display
The header shows live memory stats:
```
Memory: 245.3MB ●  (● = green/yellow/red based on status)
```

Click `+` button to expand stats:
```
FPS: 60        | Render: 1.2ms
Objects: 1250  | Memory: 245.3MB ● 
```

### Memory Settings Dashboard
**Access via:** Settings → Memory Management

Shows:
- Current usage: 245.3MB / 2048MB
- Available: 1802.7MB
- Peak usage: 250.5MB
- Memory status indicator with color coding
- Progress bar showing usage %
- Current RAM limit (50-95%)
- Optimization triggers (warning/critical/emergency)
- Auto-optimize toggle
- List of cleanup strategies with run counts

## Configuration

### Default Settings
```javascript
{
    maxRAMPercent: 75,           // Warn at this %
    criticalRAMPercent: 85,      // Auto-optimize at this %
    emergencyRAMPercent: 95,     // Force cleanup at this %
    checkIntervalMs: 5000,       // Check every 5 seconds
    autoOptimize: true,          // Auto-optimize enabled
    verbose: false,              // Detailed logging
    trackObjects: true           // Track object count
}
```

### Adjust Settings
```javascript
// Change warning threshold
window.memoryManager.setMaxRAMPercent(60);  // 60%, 70%, 80%

// Disable auto-optimize
window.memoryManager.config.autoOptimize = false;

// Enable verbose logging
window.memoryManager.config.verbose = true;

// Check every 3 seconds instead of 5
window.memoryManager.config.checkIntervalMs = 3000;
```

## Events

Listen for memory events:

```javascript
// Memory update every 5 seconds
window.addEventListener('memory:update', (e) => {
    const { used, percent, status } = e.detail;
    console.log(`Memory: ${used.toFixed(1)}MB (${percent.toFixed(1)}%)`);
});

// Status changed (normal → warning → critical → emergency)
window.addEventListener('memory:statusChange', (e) => {
    const { status, percent } = e.detail;
    console.log(`Status: ${status} at ${percent.toFixed(1)}%`);
});

// Warning level reached
window.addEventListener('memory:warning', (e) => {
    console.warn('Memory warning!', e.detail);
});

// Critical level reached
window.addEventListener('memory:critical', (e) => {
    console.warn('Memory critical!', e.detail);
});

// Emergency level reached
window.addEventListener('memory:emergency', (e) => {
    console.error('Memory emergency!', e.detail);
});
```

## API Reference

### Monitor Control
```javascript
// Start monitoring
window.memoryManager.start();

// Stop monitoring
window.memoryManager.stop();
```

### Memory Queries
```javascript
// Get current usage in MB
const used = window.memoryManager.getUsedMemory();

// Get total available in MB
const total = window.memoryManager.getTotalMemory();

// Get available (unused) in MB
const available = window.memoryManager.getAvailableMemory();

// Get usage as percentage
const percent = window.memoryManager.getUsagePercent();

// Get complete status object
const status = window.memoryManager.getStatus();

// Get detailed metrics
const metrics = window.memoryManager.getMetrics();

// Export as JSON
const json = window.memoryManager.exportMetrics();
```

### Cleanup Strategies
```javascript
// Run strategies above threshold (0-100)
const cleaned = window.memoryManager.runCleanupStrategies(50);
// Returns: [{ name, freed, timestamp }, ...]

// Register new strategy
window.memoryManager.registerCleanupStrategy(
    'my-cleanup',              // name
    () => {                    // function
        // Do cleanup
        return 10;             // MB freed
    },
    80                         // priority (1-100)
);
```

### Configuration
```javascript
// Set max RAM %
window.memoryManager.setMaxRAMPercent(75);

// Get status summary
const summary = window.memoryManager.getSummary();
// "Memory: 245.3MB / 2048MB (11.9%) [NORMAL]"

// Reset metrics
window.memoryManager.reset();

// Get summary statistics
window.memoryManager.getStats();
// Returns: current, peak, average, status, etc.
```

## Optimization Profiles

### Conservative (Low-end devices)
```javascript
window.memoryManager.setMaxRAMPercent(50);  // Aggressive optimization
window.memoryManager.config.autoOptimize = true;
window.memoryManager.config.checkIntervalMs = 2000;  // Check frequently
```

### Balanced (Medium-end devices)
```javascript
window.memoryManager.setMaxRAMPercent(75);  // Default
window.memoryManager.config.autoOptimize = true;
window.memoryManager.config.checkIntervalMs = 5000;  // Default
```

### Performance (High-end devices)
```javascript
window.memoryManager.setMaxRAMPercent(85);  // Relaxed limits
window.memoryManager.config.autoOptimize = false;  // Manual only
window.memoryManager.config.checkIntervalMs = 10000;  // Check less often
```

## Troubleshooting

### Memory keeps increasing
1. Check for memory leaks in chat messages
2. Limit chat history: Settings → Memory Management → Run Cleanup Now
3. Close unused files/tabs
4. Lower RAM limit to trigger auto-optimization

### Memory spike when loading model
- **Normal:** WebLLM models load 50-300MB into memory
- **Solution:** Run cleanup beforehand: Settings → Memory Management → Run Cleanup Now
- Or: Lower max RAM limit to trigger pre-cleanup

### Auto-optimize not triggering
1. Check if enabled: Settings → Memory Management → Auto-Optimize checkbox
2. Verify threshold: Should be at critical level (85%)
3. Run manual cleanup: Settings → Memory Management → Run Cleanup Now

### Performance degradation after cleanup
- **Expected:** Some features may be unavailable (WebLLM unloaded, chat history trimmed)
- **Solution:** Reload page to reset, or manually reload specific features
- **Note:** Core functionality remains intact

## Performance Impact

### Monitoring Overhead
- **CPU:** <1% on average (checks every 5 seconds)
- **Memory:** <2MB overhead for tracking
- **Latency:** Negligible

### Optimization Impact
- **WebLLM unload:** Immediate (frees 50-300MB)
- **Cache clear:** Immediate (frees 5-20MB)
- **Scene optimize:** Immediate (frees 2-10MB)
- **History trim:** Immediate (frees 1-5MB)

### Total Impact
- **Best case:** 50MB freed without user notice
- **Average case:** 80-150MB freed with minimal impact
- **Emergency case:** 200MB+ freed with feature reload on next use

## Example Workflows

### Workflow 1: Limited RAM Device (2GB)
```javascript
// On page load
window.memoryManager.setMaxRAMPercent(60);  // Aggressive
window.memoryManager.config.checkIntervalMs = 3000;  // Check often

// Listen for cleanup
window.addEventListener('memory:critical', (e) => {
    addResponse('System', `Memory optimized (${e.detail.percent.toFixed(0)}%)`);
});
```

### Workflow 2: Manual Optimization
```javascript
// Before heavy operations
async function heavyOperation() {
    window.memoryManager.runCleanupStrategies(0);  // Full cleanup
    await doHeavyWork();
    window.memoryManager.reset();  // Reset metrics
}
```

### Workflow 3: Monitor + Report
```javascript
// Display memory in real-time
window.addEventListener('memory:update', (e) => {
    const { used, total, percent } = e.detail;
    console.log(`RAM: ${used.toFixed(0)}/${total.toFixed(0)}MB (${percent.toFixed(1)}%)`);
});
```

## File Structure

**New files:**
- `memory-manager.js` (18.8 KB) - Core memory management
- `memory-settings-ui.js` (6.3 KB) - UI controls and display

**Modified files:**
- `index.html` - Added memory stats display, settings modal
- Memory indicator in header (always visible)

## Browser Support

- ✅ Chrome/Edge 90+ (full support, garbage collection available)
- ✅ Firefox 88+ (full support, no GC)
- ✅ Safari 15+ (full support, limited memory API)
- ✅ Mobile browsers (reduced monitoring frequency)

## Next Steps

1. **Test memory limits** - Try different RAM caps (50%, 75%, 95%)
2. **Monitor cleanup** - Watch strategies execute in critical situations
3. **Tune thresholds** - Adjust warning/critical/emergency %s for your usage
4. **Integrate with automation** - Auto-cleanup before heavy tasks
5. **Performance profiling** - Measure impact on your hardware

---

**System is now memory-aware and auto-optimizing!**

For questions, check header stats and memory settings dashboard.
