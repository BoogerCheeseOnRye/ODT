// ODT - WebLLM Fallback System (OPTIMIZED)
// Browser-based LLM for offline operation when Ollama unavailable
// Uses transformers.js for 100% local execution
// MODEL: Xenova/distilgpt2 (50MB, fast, good quality chat)
// NO AUTOMATIC DOWNLOADS - User consent required

class WebLLMFallback {
    constructor() {
        this.enabled = false;
        this.initialized = false;
        this.model = null;
        // Use DistilGPT-2 for text generation (better for chat than sentiment)
        this.modelName = 'Xenova/distilgpt2';
        this.pipeline = null;
        this.isLoading = false;
        this.isBusy = false;
        this.cacheKey = 'odt_webllm_cache';
        this.modelStatus = 'idle'; // idle, loading, ready, generating
        this.pipelineType = 'text-generation'; // Will use text-generation pipeline
        this.config = {
            minModelSize: 50, // MB - use small models
            autoLoad: false, // Don't auto-load, only on demand
            useIndexedDB: true, // Cache models locally
            timeoutMs: 30000, // 30 second timeout
            maxTokens: 200, // Default max tokens for generation
            temperature: 0.7, // Creativity (0-1)
            topP: 0.9 // Diversity in token selection
        };
        // Model performance metrics
        this.metrics = {
            totalGenerations: 0,
            totalTokens: 0,
            averageTime: 0,
            lastGenerationTime: 0
        };
    }

    /**
     * Initialize WebLLM system - ONLY CALL AFTER USER CONSENT
     */
    async initialize() {
        console.log('[WebLLM] Initializing fallback system (user consent)...');
        
        try {
            // Check if we can load transformers.js
            if (typeof transformers === 'undefined') {
                console.log('[WebLLM] transformers.js not available, loading from CDN...');
                await this.loadTransformersLibrary();
            }

            this.initialized = true;
            this.enabled = true;
            console.log('[WebLLM] Fallback system ready (model: ' + this.modelName + ')');
            return true;
        } catch (err) {
            console.error('[WebLLM] Failed to initialize:', err);
            this.initialized = false;
            this.enabled = false;
            return false;
        }
    }

    /**
     * Load transformers.js library from CDN (using import)
     */
    async loadTransformersLibrary() {
        return new Promise((resolve, reject) => {
            // Use dynamic import for ESM module
            import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0').then(module => {
                window.transformers = module;
                console.log('[WebLLM] transformers.js loaded via ESM import');
                resolve();
            }).catch(err => {
                console.error('[WebLLM] Failed to load transformers.js:', err);
                reject(new Error('Failed to load transformers.js: ' + err.message));
            });
        });
    }

    /**
     * Load model on-demand (only when needed)
     */
    async loadModel() {
        if (this.isLoading) {
            console.log('[WebLLM] Model already loading...');
            return this.pipeline;
        }

        if (this.pipeline) {
            console.log('[WebLLM] Model already loaded');
            return this.pipeline;
        }

        try {
            this.isLoading = true;
            this.modelStatus = 'loading';
            this.dispatch('statusChange', { status: 'loading', message: 'Loading browser LLM...' });

            console.log('[WebLLM] Loading model:', this.modelName);

            // Load text generation pipeline
            this.pipeline = await transformers.pipeline(
                this.pipelineType,
                this.modelName,
                {
                    quantized: true, // Use quantized version for speed/size (~50-60MB)
                    device: 'wasm', // Use WASM for better browser compatibility
                    progress_callback: (progress) => {
                        const percent = Math.round(progress.progress * 100);
                        console.log(`[WebLLM] Loading ${this.modelName}: ${percent}%`);
                        this.dispatch('loadingProgress', { progress: progress.progress });
                    }
                }
            );

            this.modelStatus = 'ready';
            this.dispatch('statusChange', { status: 'ready', message: 'Browser LLM ready' });
            console.log('[WebLLM] Model loaded successfully');

            return this.pipeline;
        } catch (err) {
            console.error('[WebLLM] Failed to load model:', err);
            this.modelStatus = 'error';
            this.dispatch('statusChange', { status: 'error', message: 'Failed to load browser LLM' });
            throw err;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Generate response using browser LLM
     */
    async generate(prompt, options = {}) {
        if (!this.initialized || !this.enabled) {
            throw new Error('WebLLM not initialized - user consent required');
        }

        if (this.isBusy) {
            throw new Error('Model currently generating');
        }

        try {
            this.isBusy = true;
            this.modelStatus = 'generating';

            // Load model if not already loaded
            if (!this.pipeline) {
                await this.loadModel();
            }

            this.dispatch('generating', { message: 'Generating response...' });

            // Generate text with optimized parameters
            const startTime = performance.now();
            
            // Clean prompt (remove trailing punctuation for better continuity)
            let cleanPrompt = prompt.trim();
            if (!cleanPrompt.endsWith(':') && !cleanPrompt.endsWith('?') && !cleanPrompt.endsWith('.')) {
                cleanPrompt += ':';
            }
            
            const result = await Promise.race([
                this.pipeline(cleanPrompt, {
                    max_new_tokens: Math.min(options.max_tokens || this.config.maxTokens, 300),
                    temperature: Math.min(Math.max(options.temperature || this.config.temperature, 0.1), 1.0),
                    top_p: Math.min(Math.max(options.top_p || this.config.topP, 0.1), 1.0),
                    top_k: 50, // Limit vocabulary to top 50 tokens
                    repetition_penalty: 1.2 // Penalize repetitive text
                }),
                this.createTimeout(this.config.timeoutMs)
            ]);

            const generationTime = performance.now() - startTime;
            
            // Extract text from result
            let generatedText = '';
            if (Array.isArray(result)) {
                generatedText = result[0]?.generated_text || result[0]?.text || '';
            } else {
                generatedText = result?.generated_text || result?.text || '';
            }

            // Clean up: remove prompt from output and extra whitespace
            generatedText = generatedText.replace(cleanPrompt, '').trim();
            generatedText = generatedText.replace(/\s+/g, ' ').trim();
            
            // Truncate if too long
            if (generatedText.length > 1000) {
                generatedText = generatedText.substring(0, 1000) + '...';
            }
            
            // Update metrics
            this.metrics.totalGenerations++;
            const tokens = Math.ceil(generatedText.split(/\s+/).length);
            this.metrics.totalTokens += tokens;
            this.metrics.lastGenerationTime = generationTime;
            this.metrics.averageTime = this.metrics.totalTokens > 0 
                ? (this.metrics.totalTokens / this.metrics.totalGenerations).toFixed(2)
                : 0;

            this.modelStatus = 'ready';
            this.dispatch('generationComplete', { success: true });

            return {
                success: true,
                response: generatedText,
                model: this.modelName,
                tokens: Math.ceil(generatedText.split(/\s+/).length),
                source: 'webllm',
                generationTime: generationTime.toFixed(2),
                temperature: options.temperature || this.config.temperature,
                topP: options.top_p || this.config.topP
            };

        } catch (err) {
            console.error('[WebLLM] Generation failed:', err);
            this.modelStatus = 'error';
            this.dispatch('generationComplete', { success: false, error: err.message });

            return {
                success: false,
                error: err.message,
                model: this.modelName,
                source: 'webllm'
            };
        } finally {
            this.isBusy = false;
        }
    }

    /**
     * Create timeout promise
     */
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Generation timeout')), ms);
        });
    }

    /**
     * Simple text summarization (alternative)
     */
    async summarize(text) {
        if (!this.initialized) return null;

        try {
            // Use current pipeline for summary-like generation
            const summary = await this.generate(`Summarize: ${text}`, {
                max_tokens: 100
            });
            return summary.response || text;
        } catch (err) {
            console.error('[WebLLM] Summarization failed:', err);
            return text;
        }
    }
    
    /**
     * Get detailed metrics
     */
    getMetrics() {
        return {
            totalGenerations: this.metrics.totalGenerations,
            totalTokens: this.metrics.totalTokens,
            averageTime: this.metrics.averageTime,
            lastGenerationTime: this.metrics.lastGenerationTime,
            tokensPerSecond: this.metrics.lastGenerationTime > 0 
                ? (1000 / this.metrics.lastGenerationTime).toFixed(1)
                : 0
        };
    }

    /**
     * Check if WebLLM is available and ready
     */
    isReady() {
        return this.initialized && this.enabled && this.pipeline !== null;
    }

    /**
     * Get status with model info
     */
    getStatus() {
        return {
            enabled: this.enabled,
            initialized: this.initialized,
            modelLoaded: this.pipeline !== null,
            status: this.modelStatus,
            model: this.modelName,
            pipelineType: this.pipelineType,
            busy: this.isBusy,
            loading: this.isLoading,
            metrics: this.getMetrics()
        };
    }

    /**
     * Unload model to free memory
     */
    async unload() {
        console.log('[WebLLM] Unloading model...');
        this.pipeline = null;
        this.modelStatus = 'idle';
        this.dispatch('statusChange', { status: 'unloaded' });
    }

    /**
     * Dispatch custom events
     */
    dispatch(eventName, detail) {
        window.dispatchEvent(new CustomEvent(`webllm:${eventName}`, { detail }));
    }

    /**
     * Configure model selection
     */
    setModel(modelName) {
        const availableModels = this.getAvailableModels();
        const validModels = availableModels.map(m => m.name);

        if (validModels.includes(modelName)) {
            const oldModel = this.modelName;
            this.modelName = modelName;
            this.pipeline = null; // Reset so it reloads on next generate
            
            // Update pipeline type if needed
            const modelInfo = availableModels.find(m => m.name === modelName);
            this.pipelineType = modelInfo?.type || 'text-generation';
            
            console.log(`[WebLLM] Model switched: ${oldModel} → ${modelName}`);
            this.dispatch('statusChange', { 
                status: 'model_switched', 
                message: `Switched to ${modelName}. Will reload on next generation.` 
            });
            return true;
        }

        console.error('[WebLLM] Invalid model:', modelName);
        console.log('[WebLLM] Available models:', validModels);
        return false;
    }

    /**
     * Get available models optimized for chat
     */
    getAvailableModels() {
        return [
            { 
                name: 'Xenova/distilgpt2', 
                size: '50MB', 
                speed: 'fast', 
                type: 'text-generation',
                quality: 'good',
                recommended: true,
                description: 'Best balance: small, fast, good quality. Recommended for chat.'
            },
            { 
                name: 'Xenova/gpt2', 
                size: '124MB', 
                speed: 'medium', 
                type: 'text-generation',
                quality: 'excellent',
                recommended: false,
                description: 'Larger GPT-2. Better quality but needs more RAM. Good for detailed responses.'
            },
            { 
                name: 'Xenova/Mistral-7B-Instruct-v0.1', 
                size: '320MB', 
                speed: 'slow', 
                type: 'text-generation',
                quality: 'premium',
                recommended: false,
                description: 'Large instruction-following model. Excellent but requires significant resources.'
            },
            { 
                name: 'Xenova/phi-2', 
                size: '280MB', 
                speed: 'slow', 
                type: 'text-generation',
                quality: 'excellent',
                recommended: false,
                description: 'Small but powerful 2.7B model. Good balance if you have memory.'
            }
        ];
    }

    /**
     * Get memory usage estimate
     */
    getMemoryUsage() {
        if (!this.pipeline) return 0;
        
        if (performance.memory) {
            return Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
        }

        return 0;
    }
}

// 3-Tier Fallback System
class LLMFallbackChain {
    constructor() {
        this.ollama = null;
        this.webllm = new WebLLMFallback();
        this.currentTier = null;
        this.stats = {
            ollama_calls: 0,
            webllm_calls: 0,
            fallbacks: 0,
            errors: 0
        };
    }

    /**
     * Initialize fallback chain - NO AUTOMATIC DOWNLOADS
     */
    async initialize(ollamaHost = 'http://localhost:11434') {
        console.log('[Fallback] Fallback system ready (NO automatic downloads - awaiting user consent)');
        this.ollama = ollamaHost;
        // DO NOT auto-initialize WebLLM - wait for explicit user consent
    }

    /**
     * Try Ollama first, fall back to WebLLM
     */
    async generate(prompt, options = {}) {
        console.log('[Fallback] Attempting generation...');

        // Tier 1: Try Ollama
        try {
            console.log('[Fallback] Tier 1: Trying Ollama...');
            const response = await this.callOllama(prompt, options);
            this.currentTier = 'ollama';
            this.stats.ollama_calls++;
            return response;
        } catch (ollamaErr) {
            console.warn('[Fallback] Tier 1 failed:', ollamaErr.message);
            this.stats.fallbacks++;
        }

        // Tier 2: Try WebLLM (only if initialized with user consent)
        try {
            console.log('[Fallback] Tier 2: Falling back to WebLLM...');
            if (!this.webllm.initialized) {
                throw new Error('WebLLM not initialized - user consent required before first message');
            }
            const response = await this.webllm.generate(prompt, options);
            
            if (response.success) {
                this.currentTier = 'webllm';
                this.stats.webllm_calls++;
                return response;
            }
        } catch (webllmErr) {
            console.warn('[Fallback] Tier 2 failed:', webllmErr.message);
            this.stats.fallbacks++;
        }

        // Tier 3: Graceful degradation
        console.log('[Fallback] Tier 3: Graceful degradation');
        this.currentTier = 'degraded';
        this.stats.errors++;

        return {
            success: false,
            response: null,
            error: 'All AI backends unavailable. Please accept consent to enable browser LLM.',
            source: 'degraded',
            suggestion: 'Accept the warning to initialize WebLLM or start Ollama locally'
        };
    }

    /**
     * Call Ollama API
     */
    async callOllama(prompt, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        try {
            const response = await fetch(`${this.ollama}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: options.model || 'qwen2.5:7b',
                    prompt: prompt,
                    stream: false,
                    num_predict: options.max_tokens || 200
                }),
                signal: controller.signal
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            return {
                success: true,
                response: data.response,
                model: options.model || 'qwen2.5:7b',
                tokens: data.eval_count || 0,
                source: 'ollama'
            };
        } catch (err) {
            throw new Error(`Ollama unavailable: ${err.message}`);
        } finally {
            clearTimeout(timeout);
        }
    }

    /**
     * Get current tier status
     */
    getStatus() {
        return {
            currentTier: this.currentTier,
            ollamaAvailable: this.checkOllamaAvailable(),
            webllmReady: this.webllm.isReady(),
            webllmStatus: this.webllm.getStatus(),
            stats: this.stats,
            memory: {
                webllm_mb: this.webllm.getMemoryUsage()
            }
        };
    }

    /**
     * Quick check if Ollama is available (non-blocking)
     */
    checkOllamaAvailable() {
        return this.currentTier === 'ollama' || this.currentTier === null;
    }

    /**
     * Get stats
     */
    getStats() {
        return this.stats;
    }

    /**
     * Reset stats
     */
    resetStats() {
        this.stats = {
            ollama_calls: 0,
            webllm_calls: 0,
            fallbacks: 0,
            errors: 0
        };
    }

    /**
     * Switch WebLLM model
     */
    switchWebLLMModel(modelName) {
        const result = this.webllm.setModel(modelName);
        if (result) {
            window.dispatchEvent(new CustomEvent('fallback:modelSwitched', {
                detail: { model: modelName, tier: 'webllm' }
            }));
        }
        return result;
    }

    /**
     * Get available WebLLM models
     */
    getWebLLMModels() {
        return this.webllm.getAvailableModels();
    }

    /**
     * Get WebLLM metrics
     */
    getWebLLMMetrics() {
        return this.webllm.getMetrics();
    }
}

// Global fallback chain instance
window.llmFallback = new LLMFallbackChain();

// Export classes
window.WebLLMFallback = WebLLMFallback;
window.LLMFallbackChain = LLMFallbackChain;

// User consent handler - call this ONLY after user explicitly approves
window.initializeWebLLMWithConsent = async function() {
    console.log('[WebLLM] User consent received. Initializing WebLLM...');
    try {
        await window.llmFallback.webllm.initialize();
        console.log('[WebLLM] WebLLM ready. User can now send messages.');
        window.dispatchEvent(new CustomEvent('webllm:consentInitialized'));
        return true;
    } catch (err) {
        console.error('[WebLLM] Failed to initialize with consent:', err);
        return false;
    }
};

console.log('[WebLLM] System loaded. WAITING FOR USER CONSENT before any downloads.');
console.log('[WebLLM] Default model: Xenova/distilgpt2 (50MB, optimized for chat)');
