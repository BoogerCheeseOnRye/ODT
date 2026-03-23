/**
 * Path Manager - Browser cache and download path configuration
 * Manage where models and data are stored in browser
 */

class PathManager {
    constructor() {
        this.paths = this.loadPaths();
        this.validators = {
            cachePath: (p) => p && p.length > 0,
            modelPath: (p) => p && p.length > 0,
            backupPath: (p) => p && p.length > 0
        };
    }

    loadPaths() {
        try {
            const saved = localStorage.getItem('path-config');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {}

        return {
            cachePath: '/cache',
            modelPath: '/models',
            backupPath: '/backups',
            tempPath: '/temp',
            maxCacheSize: 5000, // MB
            autoCleanup: true,
            cleanupThreshold: 80 // percent
        };
    }

    savePaths() {
        try {
            localStorage.setItem('path-config', JSON.stringify(this.paths));
            console.log('[PathManager] Paths saved');
            return true;
        } catch (e) {
            console.error('[PathManager] Save failed:', e.message);
            return false;
        }
    }

    setPaths(config) {
        Object.assign(this.paths, config);
        this.savePaths();
        return this.paths;
    }

    getPath(type) {
        const key = type + 'Path';
        return this.paths[key] || null;
    }

    setPath(type, path) {
        const key = type + 'Path';
        if (!this.validators[key] || this.validators[key](path)) {
            this.paths[key] = path;
            this.savePaths();
            return true;
        }
        return false;
    }

    validatePath(path) {
        // Browser-based validation only
        if (!path || path.length === 0) return { valid: false, reason: 'Path cannot be empty' };
        if (path.length > 255) return { valid: false, reason: 'Path too long' };
        if (!/^[a-zA-Z0-9\/_\-\.]+$/.test(path)) return { valid: false, reason: 'Invalid characters' };
        return { valid: true };
    }

    async getAvailableSpace() {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                return {
                    usage: estimate.usage,
                    quota: estimate.quota,
                    percentage: (estimate.usage / estimate.quota) * 100,
                    available: estimate.quota - estimate.usage
                };
            }
        } catch (e) {
            console.warn('[PathManager] Could not get storage info:', e.message);
        }
        return null;
    }

    async getCurrentCacheSize() {
        let totalSize = 0;

        // IndexedDB size
        try {
            const databases = await window.indexedDB.databases?.();
            if (databases) {
                totalSize += databases.length * 50; // Rough estimate
            }
        } catch (e) {}

        // localStorage size
        try {
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length + key.length;
                }
            }
        } catch (e) {}

        // sessionStorage size
        try {
            for (let key in sessionStorage) {
                if (sessionStorage.hasOwnProperty(key)) {
                    totalSize += sessionStorage[key].length + key.length;
                }
            }
        } catch (e) {}

        return totalSize / (1024 * 1024); // Convert to MB
    }

    async suggestOptimalPaths() {
        const profile = window.hardwareOptimizer?.profile || {};
        const suggestions = {};

        if (profile.memory <= 2) {
            suggestions.modelPath = '/models_light';
            suggestions.maxCacheSize = 1000;
            suggestions.cleanupThreshold = 50;
        } else if (profile.memory <= 4) {
            suggestions.modelPath = '/models';
            suggestions.maxCacheSize = 2000;
            suggestions.cleanupThreshold = 70;
        } else {
            suggestions.modelPath = '/models_full';
            suggestions.maxCacheSize = 5000;
            suggestions.cleanupThreshold = 80;
        }

        suggestions.cachePath = '/cache';
        suggestions.backupPath = '/backups';

        return suggestions;
    }

    async ensurePathStructure() {
        // Browser-based: just verify paths are configured
        const result = {
            cachePath: this.validatePath(this.paths.cachePath),
            modelPath: this.validatePath(this.paths.modelPath),
            backupPath: this.validatePath(this.paths.backupPath)
        };

        return { success: Object.values(result).every(r => r.valid), details: result };
    }

    async cleanupOldFiles() {
        const cacheSize = await this.getCurrentCacheSize();
        const threshold = this.paths.maxCacheSize * (this.paths.cleanupThreshold / 100);

        if (cacheSize > threshold) {
            console.log(`[PathManager] Cache cleanup needed: ${cacheSize.toFixed(1)}MB > ${threshold.toFixed(1)}MB`);
            
            // Remove oldest cache entries
            const keys = Object.keys(localStorage)
                .filter(k => k.startsWith('cache-') || k.startsWith('temp-'))
                .sort();

            let removed = 0;
            while (cacheSize > threshold && keys.length > 0) {
                const key = keys.shift();
                localStorage.removeItem(key);
                removed++;
            }

            console.log(`[PathManager] Removed ${removed} old cache entries`);
            return { success: true, removed };
        }

        return { success: true, removed: 0 };
    }

    getPathInfo() {
        return {
            paths: this.paths,
            validation: {
                cachePath: this.validatePath(this.paths.cachePath),
                modelPath: this.validatePath(this.paths.modelPath),
                backupPath: this.validatePath(this.paths.backupPath)
            }
        };
    }

    exportConfig() {
        return JSON.stringify(this.getPathInfo(), null, 2);
    }

    importConfig(jsonString) {
        try {
            const config = JSON.parse(jsonString);
            if (config.paths) {
                this.setPaths(config.paths);
                return { success: true };
            }
            return { success: false, error: 'Invalid config format' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

// Global instance
window.pathManager = new PathManager();

console.log('[PathManager] Initialized - Path configuration loaded');
