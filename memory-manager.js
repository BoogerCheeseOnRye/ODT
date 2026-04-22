// ODT - Memory Manager System
// Real-time RAM monitoring with auto-optimization
// Prevents memory leaks and keeps app responsive

class MemoryManager {
    constructor() {
        this.config = {
            maxRAMPercent: 75,        // Warn at 75% usage
            criticalRAMPercent: 85,   // Auto-optimize at 85%
            emergencyRAMPercent: 95,  // Force cleanup at 95%
            checkIntervalMs: 5000,    // Check every 5 seconds
            autoOptimize: true,       // Auto-optimize enabled
            verbose: false,           // Detailed logging
            trackObjects: true        // Track object count
        };

        this.metrics = {
            current: 0,
            peak: 0,
            average: 0,
            readings: [],
            maxReadings: 100,
            lastCheck: 0,
            status: 'normal', // normal, warning, critical, emergency
            objectCount: 0,
            threeObjectsCount: 0
        };

        this.cleanupStrategies = [];
        this.optimizationHistory = [];
        this.checkTimer = null;
        this.enabled = true;

        this.registerCleanupStrategy('webllm-unload', () => this.unloadWebLLM(), 100);
        this.registerCleanupStrategy('cache-clear', () => this.clearAppCache(), 75);
        this.registerCleanupStrategy('scene-optimize', () => this.optimizeScene(), 50);
        this.registerCleanupStrategy('history-trim', () => this.trimChatHistory(), 40);
        this.registerCleanupStrategy('file-cache-clear', () => this.clearFileCache(), 30);
        this.registerCleanupStrategy('force-gc', () => this.forceGarbageCollection(), 10);
    }

    /**
     * Register cleanup strategy with priority
     * Higher priority executes first
     */
    registerCleanupStrategy(name, fn, priority = 50) {
        this.cleanupStrategies.push({
            name: name,
            fn: fn,
            priority: priority,
            lastRun: 0,
            timesRun: 0
        });
        this.cleanupStrategies.sort((a, b) => b.priority - a.priority);
        console.log(`[Memory] Registered cleanup: ${name} (priority: ${priority})`);
    }

    /**
     * Start monitoring
     */
    start() {
        if (this.checkTimer) return;
        
        console.log('[Memory] Monitor started');
        this.check();
        
        this.checkTimer = setInterval(() => {
            this.check();
        }, this.config.checkIntervalMs);

        // Listen for low memory events
        if (window.addEventListener && 'MemoryStatus' in window) {
            window.addEventListener('lowmemory', () => {
                console.warn('[Memory] Low memory warning from OS');
                this.handleLowMemoryWarning();
            });
        }
    }

    /**
     * Stop monitoring
     */
    stop() {
        if (this.checkTimer) {
            clearInterval(this.checkTimer);
            this.checkTimer = null;
            console.log('[Memory] Monitor stopped');
        }
    }

    /**
     * Check current memory usage
     */
    check() {
        if (!this.enabled) return;

        try {
            const now = performance.now();
            
            // Get memory info if available
            const usedMB = this.getUsedMemory();
            const totalMB = this.getTotalMemory();
            const usagePercent = (usedMB / totalMB) * 100;

            // Update metrics
            this.metrics.current = usedMB;
            this.metrics.objectCount = this.countObjects();
            this.metrics.threeObjectsCount = this.countThreeObjects();
            this.metrics.lastCheck = now;

            // Track peak
            if (usedMB > this.metrics.peak) {
                this.metrics.peak = usedMB;
            }

            // Store reading
            this.metrics.readings.push({
                time: now,
                used: usedMB,
                total: totalMB,
                percent: usagePercent,
                objects: this.metrics.objectCount,
                threeObjects: this.metrics.threeObjectsCount
            });

            // Keep only recent readings
            if (this.metrics.readings.length > this.config.maxReadings) {
                this.metrics.readings.shift();
            }

            // Calculate average
            if (this.metrics.readings.length > 0) {
                const sum = this.metrics.readings.reduce((acc, r) => acc + r.used, 0);
                this.metrics.average = sum / this.metrics.readings.length;
            }

            // Determine status
            const oldStatus = this.metrics.status;
            if (usagePercent >= this.config.emergencyRAMPercent) {
                this.metrics.status = 'emergency';
                this.handleEmergency();
            } else if (usagePercent >= this.config.criticalRAMPercent) {
                this.metrics.status = 'critical';
                if (this.config.autoOptimize) {
                    this.handleCritical();
                }
            } else if (usagePercent >= this.config.maxRAMPercent) {
                this.metrics.status = 'warning';
            } else {
                this.metrics.status = 'normal';
            }

            // Log status change
            if (oldStatus !== this.metrics.status) {
                this.dispatchStatusChange(this.metrics.status, usagePercent);
            }

            // Verbose logging
            if (this.config.verbose) {
                console.log(`[Memory] ${usedMB.toFixed(1)}MB / ${totalMB.toFixed(1)}MB (${usagePercent.toFixed(1)}%) - Objects: ${this.metrics.objectCount}`);
            }

            // Dispatch update event
            this.dispatchUpdate({
                used: usedMB,
                total: totalMB,
                percent: usagePercent,
                status: this.metrics.status,
                objects: this.metrics.objectCount,
                threeObjects: this.metrics.threeObjectsCount
            });

        } catch (err) {
            console.error('[Memory] Check failed:', err);
        }
    }

    /**
     * Get used memory in MB
     */
    getUsedMemory() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1048576; // Convert to MB
        }
        return 0;
    }

    /**
     * Get total memory limit in MB
     */
    getTotalMemory() {
        if (performance.memory) {
            return performance.memory.jsHeapSizeLimit / 1048576; // Convert to MB
        }
        return 2048; // Default estimate (2GB)
    }

    /**
     * Get available memory in MB
     */
    getAvailableMemory() {
        const total = this.getTotalMemory();
        const used = this.getUsedMemory();
        return Math.max(0, total - used);
    }

    /**
     * Count DOM objects
     */
    countObjects() {
        try {
            return document.querySelectorAll('*').length || 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Count Three.js objects in scene
     */
    countThreeObjects() {
        if (typeof scene !== 'undefined' && scene) {
            return (scene.children || []).length;
        }
        return 0;
    }

    /**
     * Handle warning level
     */
    handleWarning() {
        console.warn('[Memory] WARNING: Approaching memory limit');
        window.dispatchEvent(new CustomEvent('memory:warning', {
            detail: this.getStatus()
        }));
    }

    /**
     * Handle critical level - auto-optimize
     */
    handleCritical() {
        console.warn('[Memory] CRITICAL: Memory usage critical, optimizing...');
        
        // Run cleanup strategies up to 75% priority
        this.runCleanupStrategies(75);

        window.dispatchEvent(new CustomEvent('memory:critical', {
            detail: this.getStatus()
        }));
    }

    /**
     * Handle emergency level - force cleanup
     */
    handleEmergency() {
        console.error('[Memory] EMERGENCY: Memory critical, forcing cleanup!');
        
        // Run ALL cleanup strategies
        this.runCleanupStrategies(0);

        window.dispatchEvent(new CustomEvent('memory:emergency', {
            detail: this.getStatus()
        }));
    }

    /**
     * Handle low memory warning from OS
     */
    handleLowMemoryWarning() {
        console.error('[Memory] OS low memory warning!');
        this.runCleanupStrategies(0);
    }

    /**
     * Run cleanup strategies above threshold
     */
    runCleanupStrategies(priorityThreshold = 50) {
        const strategies = this.cleanupStrategies.filter(s => s.priority >= priorityThreshold);
        const cleaned = [];

        for (const strategy of strategies) {
            try {
                const before = this.getUsedMemory();
                strategy.fn();
                const after = this.getUsedMemory();
                const freed = Math.max(0, before - after);

                strategy.lastRun = performance.now();
                strategy.timesRun++;

                if (freed > 0 || this.config.verbose) {
                    console.log(`[Memory] Cleanup "${strategy.name}": freed ${freed.toFixed(1)}MB`);
                }

                cleaned.push({
                    name: strategy.name,
                    freed: freed,
                    timestamp: strategy.lastRun
                });

                // Check if we're out of emergency
                if (this.getUsagePercent() < this.config.criticalRAMPercent) {
                    break; // Stop if we've recovered
                }
            } catch (err) {
                console.error(`[Memory] Cleanup "${strategy.name}" failed:`, err);
            }
        }

        // Track optimization
        if (cleaned.length > 0) {
            const totalFreed = cleaned.reduce((sum, c) => sum + c.freed, 0);
            this.optimizationHistory.push({
                timestamp: performance.now(),
                strategies: cleaned,
                totalFreed: totalFreed,
                status: this.metrics.status
            });

            // Keep only recent history
            if (this.optimizationHistory.length > 50) {
                this.optimizationHistory.shift();
            }
        }

        return cleaned;
    }

    /**
     * Unload WebLLM to free memory
     */
    unloadWebLLM() {
        try {
            if (window.llmFallback && window.llmFallback.webllm) {
                if (window.llmFallback.webllm.pipeline) {
                    console.log('[Memory] Unloading WebLLM...');
                    window.llmFallback.webllm.unload();
                    return true;
                }
            }
        } catch (err) {
            console.error('[Memory] Failed to unload WebLLM:', err);
        }
        return false;
    }

    /**
     * Clear app cache
     */
    clearAppCache() {
        try {
            console.log('[Memory] Clearing app caches...');
            let freed = 0;

            // Clear indexedDB caches
            if (window.db) {
                const stores = ['appData', 'editorState', 'projects'];
                stores.forEach(store => {
                    try {
                        const transaction = window.db.transaction([store], 'readwrite');
                        const objectStore = transaction.objectStore(store);
                        objectStore.clear();
                    } catch (e) {
                        // Ignore
                    }
                });
                freed += 5;
            }

            // Clear localStorage non-essential items
            const keysToKeep = ['activeProject', 'targetFPS', 'customPaths', 'showStats'];
            Object.keys(localStorage).forEach(key => {
                if (!keysToKeep.includes(key) && !key.startsWith('_')) {
                    localStorage.removeItem(key);
                    freed += 0.1;
                }
            });

            return freed;
        } catch (err) {
            console.error('[Memory] Cache clear failed:', err);
            return 0;
        }
    }

    /**
     * Optimize Three.js scene
     */
    optimizeScene() {
        try {
            if (typeof scene === 'undefined' || !scene) return 0;

            console.log('[Memory] Optimizing Three.js scene...');
            let disposed = 0;

            // Dispose unused geometries
            if (scene.children) {
                for (const child of scene.children) {
                    // Remove non-essential objects (keep lights, camera, main mesh)
                    if (!child.isLight && !child.isCamera && 
                        !(child.isGridHelper) &&
                        child.uuid && child.uuid.startsWith('_temp')) {
                        scene.remove(child);
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) {
                                child.material.forEach(m => m.dispose());
                            } else {
                                child.material.dispose();
                            }
                        }
                        disposed += 2;
                    }
                }
            }

            return disposed * 0.5;
        } catch (err) {
            console.error('[Memory] Scene optimization failed:', err);
            return 0;
        }
    }

    /**
     * Trim chat history to recent messages
     */
    trimChatHistory() {
        try {
            console.log('[Memory] Trimming chat history...');
            const chatBox = document.getElementById('chat-responses');
            if (!chatBox) return 0;

            const messages = chatBox.querySelectorAll('.response');
            const maxMessages = 100;
            let removed = 0;

            if (messages.length > maxMessages) {
                for (let i = 0; i < messages.length - maxMessages; i++) {
                    const msg = messages[i];
                    const textLength = msg.textContent.length;
                    msg.remove();
                    removed += textLength / 10000; // Rough estimate
                }
            }

            return removed;
        } catch (err) {
            console.error('[Memory] History trim failed:', err);
            return 0;
        }
    }

    /**
     * Clear file cache
     */
    clearFileCache() {
        try {
            console.log('[Memory] Clearing file cache...');
            // Clear file preview if open
            const preview = document.getElementById('file-preview');
            if (preview) {
                preview.innerHTML = '';
            }
            return 2;
        } catch (err) {
            console.error('[Memory] File cache clear failed:', err);
            return 0;
        }
    }

    /**
     * Force garbage collection (Chrome only, not reliable)
     */
    forceGarbageCollection() {
        try {
            // This only works in Chrome with --js-flags="--expose-gc"
            if (typeof gc === 'function') {
                console.log('[Memory] Running garbage collection...');
                gc();
                return 10; // Estimated
            }
            return 0;
        } catch (err) {
            console.error('[Memory] GC failed:', err);
            return 0;
        }
    }

    /**
     * Set max RAM limit (as percentage of total)
     */
    setMaxRAMPercent(percent) {
        if (percent < 50 || percent > 99) {
            console.warn('[Memory] RAM limit must be 50-99%');
            return false;
        }
        
        this.config.maxRAMPercent = percent;
        this.config.criticalRAMPercent = percent + 10;
        this.config.emergencyRAMPercent = percent + 20;
        
        console.log(`[Memory] RAM limits: warn=${percent}%, critical=${percent + 10}%, emergency=${percent + 20}%`);
        return true;
    }

    /**
     * Get current usage as percentage
     */
    getUsagePercent() {
        const used = this.getUsedMemory();
        const total = this.getTotalMemory();
        return (used / total) * 100;
    }

    /**
     * Get status object
     */
    getStatus() {
        return {
            used: this.metrics.current,
            total: this.getTotalMemory(),
            available: this.getAvailableMemory(),
            percent: this.getUsagePercent(),
            status: this.metrics.status,
            peak: this.metrics.peak,
            average: this.metrics.average,
            objects: this.metrics.objectCount,
            threeObjects: this.metrics.threeObjectsCount,
            lastCheck: this.metrics.lastCheck,
            readingsCount: this.metrics.readings.length,
            optimizations: this.optimizationHistory.length
        };
    }

    /**
     * Get detailed metrics
     */
    getMetrics() {
        return {
            status: this.getStatus(),
            readings: this.metrics.readings.slice(-20), // Last 20 readings
            history: this.optimizationHistory.slice(-10), // Last 10 optimizations
            config: this.config,
            strategies: this.cleanupStrategies.map(s => ({
                name: s.name,
                priority: s.priority,
                timesRun: s.timesRun,
                lastRun: s.lastRun
            }))
        };
    }

    /**
     * Export metrics as JSON
     */
    exportMetrics() {
        return JSON.stringify(this.getMetrics(), null, 2);
    }

    /**
     * Dispatch custom event
     */
    dispatchStatusChange(status, percent) {
        window.dispatchEvent(new CustomEvent('memory:statusChange', {
            detail: { status, percent, timestamp: performance.now() }
        }));
    }

    /**
     * Dispatch update event
     */
    dispatchUpdate(data) {
        window.dispatchEvent(new CustomEvent('memory:update', {
            detail: data
        }));
    }

    /**
     * Reset metrics
     */
    reset() {
        this.metrics = {
            current: 0,
            peak: 0,
            average: 0,
            readings: [],
            lastCheck: 0,
            status: 'normal',
            objectCount: 0,
            threeObjectsCount: 0
        };
        this.optimizationHistory = [];
        console.log('[Memory] Metrics reset');
    }

    /**
     * Get readable status summary
     */
    getSummary() {
        const status = this.getStatus();
        return `Memory: ${status.used.toFixed(1)}MB / ${status.total.toFixed(0)}MB (${status.percent.toFixed(1)}%) [${status.status.toUpperCase()}]`;
    }
}

// Global instance
window.memoryManager = new MemoryManager();

// Auto-start on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.memoryManager.start();
    });
} else {
    window.memoryManager.start();
}

console.log('[Memory] Manager initialized');
