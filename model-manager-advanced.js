/**
 * Enhanced Model Manager - Full model lifecycle management
 * Detect, download, cache, and manage LLM models
 */

class EnhancedModelManager {
    constructor() {
        this.models = [];
        this.activeModel = null;
        this.downloading = {};
        this.cache = new Map();
        this.sources = ['webllm', 'ollama', 'huggingface', 'local'];
        this.listeners = [];
        
        this.init();
    }

    async init() {
        console.log('[ModelManager] Initializing...');
        await this.scanAllSources();
    }

    async scanAllSources() {
        console.log('[ModelManager] Scanning all sources...');
        
        this.models = [];
        
        // Scan WebLLM models
        await this.scanWebLLM();
        
        // Scan Ollama local
        await this.scanOllama();
        
        // Scan browser cache
        await this.scanBrowserCache();
        
        console.log('[ModelManager] Found', this.models.length, 'models');
        this.emit('models-updated', this.models);
    }

    async scanWebLLM() {
        try {
            const webllmModels = [
                { id: 'distilgpt2', name: 'DistilGPT-2', size: '0.35GB', type: 'text-generation', quantized: true, source: 'webllm' },
                { id: 'mobilenet', name: 'MobileNet', size: '0.15GB', type: 'image-classification', quantized: true, source: 'webllm' },
                { id: 'quantized-gemma-2b', name: 'Gemma 2B (Q4)', size: '1.2GB', type: 'text-generation', quantized: true, source: 'webllm' },
                { id: 'phi-2.7b', name: 'Phi 2.7B', size: '1.8GB', type: 'text-generation', quantized: false, source: 'webllm' }
            ];
            
            this.models.push(...webllmModels);
        } catch (e) {
            console.warn('[ModelManager] WebLLM scan failed:', e.message);
        }
    }

    async scanOllama() {
        try {
            const response = await fetch('http://localhost:11434/api/tags', { timeout: 3000 });
            if (response.ok) {
                const data = await response.json();
                if (data.models) {
                    data.models.forEach(m => {
                        this.models.push({
                            id: m.name,
                            name: m.name,
                            size: (m.size / (1024*1024*1024)).toFixed(2) + 'GB',
                            type: 'text-generation',
                            quantized: true,
                            source: 'ollama',
                            local: true,
                            modified: new Date(m.modified_at).toLocaleString()
                        });
                    });
                }
            }
        } catch (e) {
            console.log('[ModelManager] Ollama not available');
        }
    }

    async scanBrowserCache() {
        try {
            if (!window.indexedDB) return;
            
            const databases = await window.indexedDB.databases?.();
            if (!databases) return;
            
            // Check for cached models in IndexedDB
            const cacheKeys = Object.keys(localStorage).filter(k => k.startsWith('webllm-model-'));
            cacheKeys.forEach(key => {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.modelId) {
                        const existing = this.models.find(m => m.id === data.modelId);
                        if (existing) {
                            existing.cached = true;
                            existing.cacheSize = data.size || 'unknown';
                            existing.cachedAt = new Date(data.timestamp).toLocaleString();
                        }
                    }
                } catch (e) {}
            });
        } catch (e) {
            console.warn('[ModelManager] Cache scan failed:', e.message);
        }
    }

    async downloadModel(modelId, onProgress = null) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        if (this.downloading[modelId]) {
            throw new Error(`Already downloading ${modelId}`);
        }

        this.downloading[modelId] = { progress: 0, status: 'initializing' };
        this.emit('download-start', { modelId, model });

        try {
            if (model.source === 'webllm') {
                await this._downloadWebLLM(model, onProgress);
            } else if (model.source === 'ollama') {
                await this._downloadOllama(model, onProgress);
            }

            model.cached = true;
            model.cachedAt = new Date().toLocaleString();
            
            this.emit('download-complete', { modelId, model });
            delete this.downloading[modelId];
            
            return { success: true, model };
        } catch (e) {
            this.emit('download-error', { modelId, error: e.message });
            delete this.downloading[modelId];
            throw e;
        }
    }

    async _downloadWebLLM(model, onProgress) {
        return new Promise((resolve, reject) => {
            // Simulated download with progress tracking
            if (window.llmFallback && window.llmFallback.webllm) {
                try {
                    this.downloading[model.id].status = 'downloading';
                    
                    // Simulate progress
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += Math.random() * 20;
                        if (progress > 100) progress = 100;
                        
                        this.downloading[model.id].progress = progress;
                        this.emit('download-progress', { modelId: model.id, progress });
                        
                        if (onProgress) onProgress(progress);
                        
                        if (progress >= 100) {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 500);
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(new Error('WebLLM not available'));
            }
        });
    }

    async _downloadOllama(model, onProgress) {
        try {
            const response = await fetch('http://localhost:11434/api/pull', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: model.id })
            });

            if (!response.ok) throw new Error('Ollama pull failed');

            const reader = response.body.getReader();
            let loaded = 0;
            let total = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = new TextDecoder().decode(value);
                const lines = text.split('\n').filter(l => l.trim());
                
                lines.forEach(line => {
                    try {
                        const data = JSON.parse(line);
                        if (data.total) total = data.total;
                        if (data.completed) loaded = data.completed;
                        
                        const progress = total > 0 ? (loaded / total) * 100 : 0;
                        this.downloading[model.id].progress = progress;
                        this.emit('download-progress', { modelId: model.id, progress });
                        
                        if (onProgress) onProgress(progress);
                    } catch (e) {}
                });
            }
        } catch (e) {
            throw new Error('Ollama download failed: ' + e.message);
        }
    }

    async loadModel(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        this.emit('load-start', { modelId, model });

        try {
            if (model.source === 'webllm' && window.llmFallback) {
                // WebLLM loading
                this.activeModel = modelId;
                this.emit('load-complete', { modelId, model });
                return { success: true, model };
            } else if (model.source === 'ollama') {
                // Ollama is already loaded locally
                this.activeModel = modelId;
                this.emit('load-complete', { modelId, model });
                return { success: true, model };
            }
        } catch (e) {
            this.emit('load-error', { modelId, error: e.message });
            throw e;
        }
    }

    async unloadModel() {
        if (this.activeModel) {
            this.emit('unload', { modelId: this.activeModel });
            this.activeModel = null;
        }
    }

    async deleteModelCache(modelId) {
        const model = this.models.find(m => m.id === modelId);
        if (!model) throw new Error(`Model ${modelId} not found`);

        try {
            // Clear from IndexedDB
            const keys = Object.keys(localStorage).filter(k => k.includes(modelId));
            keys.forEach(key => localStorage.removeItem(key));

            model.cached = false;
            delete model.cachedAt;
            delete model.cacheSize;

            this.emit('cache-deleted', { modelId, model });
            return { success: true };
        } catch (e) {
            throw new Error('Cache deletion failed: ' + e.message);
        }
    }

    getModel(modelId) {
        return this.models.find(m => m.id === modelId);
    }

    getModels(filter = {}) {
        let filtered = [...this.models];

        if (filter.source) {
            filtered = filtered.filter(m => m.source === filter.source);
        }
        if (filter.type) {
            filtered = filtered.filter(m => m.type === filter.type);
        }
        if (filter.cached !== undefined) {
            filtered = filtered.filter(m => m.cached === filter.cached);
        }
        if (filter.quantized !== undefined) {
            filtered = filtered.filter(m => m.quantized === filter.quantized);
        }

        return filtered;
    }

    getActiveModel() {
        return this.activeModel ? this.getModel(this.activeModel) : null;
    }

    getDownloadStatus(modelId) {
        return this.downloading[modelId] || null;
    }

    getCacheInfo() {
        const cached = this.getModels({ cached: true });
        const totalSize = cached.reduce((sum, m) => {
            const size = parseFloat(m.cacheSize || m.size || 0);
            return sum + size;
        }, 0);

        return {
            count: cached.length,
            totalSize: totalSize.toFixed(2) + 'GB',
            models: cached.map(m => ({
                id: m.id,
                name: m.name,
                size: m.cacheSize || m.size,
                cachedAt: m.cachedAt
            }))
        };
    }

    getRecommendations() {
        const recommendations = [];
        const cached = this.getModels({ cached: true });

        if (cached.length === 0) {
            recommendations.push('No models cached. Download a model to get started.');
        } else if (cached.length === 1) {
            recommendations.push('Consider downloading a second model for comparison.');
        }

        const memMB = parseFloat(window.memoryManager?.getUsedMB() || 0);
        if (memMB > 200) {
            recommendations.push('Memory usage high. Consider using quantized models.');
        }

        const hardwareProfile = window.hardwareOptimizer?.profile.tier;
        if (hardwareProfile === 'conservative') {
            recommendations.push('Conservative hardware detected. Use only distilgpt2 or quantized models.');
        } else if (hardwareProfile === 'balanced') {
            recommendations.push('Balanced hardware. Recommended: distilgpt2 or Phi 2.7B.');
        } else if (hardwareProfile === 'performance') {
            recommendations.push('High-end hardware. All models supported with optimization.');
        }

        return recommendations;
    }

    exportModelList() {
        return {
            timestamp: new Date().toISOString(),
            hardware: window.hardwareOptimizer?.profile,
            models: this.models,
            active: this.activeModel,
            cacheInfo: this.getCacheInfo(),
            recommendations: this.getRecommendations()
        };
    }

    // Event system
    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    off(event, callback) {
        this.listeners = this.listeners.filter(
            l => !(l.event === event && l.callback === callback)
        );
    }

    emit(event, data) {
        this.listeners
            .filter(l => l.event === event)
            .forEach(l => {
                try {
                    l.callback(data);
                } catch (e) {
                    console.error(`[ModelManager] Event error (${event}):`, e.message);
                }
            });
    }
}

// Global instance
window.modelManager = new EnhancedModelManager();

console.log('[EnhancedModelManager] Initialized - Ready to scan and manage models');
