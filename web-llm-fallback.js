// ═══════════════════════════════════════════════════════════════════
// ODT — 4-Tier AI Fallback Chain
// ═══════════════════════════════════════════════════════════════════
// Tier 1 : Ollama        (local server, best quality)
// Tier 2 : Chrome AI     (window.ai / window.LanguageModel — Gemini Nano, zero download)
// Tier 3 : MLC WebLLM    (WebGPU chat models: Qwen/TinyLlama/Llama/Phi, MLC CDN)
// Tier 4 : Transformers  (WASM fallback, any browser, smaller models)
// ═══════════════════════════════════════════════════════════════════

// ── Tier 2: Chrome Built-in AI ─────────────────────────────────────
class ChromeAIBackend {
    constructor() {
        this.session = null;
        this.available = null; // null=unknown, 'readily'|'after-download'|'no'
        this.name = 'Chrome AI (Gemini Nano)';
    }

    // Detect both old window.ai and new window.LanguageModel APIs
    _getAPI() {
        return window.LanguageModel || window.ai?.languageModel || null;
    }

    async check() {
        const api = this._getAPI();
        if (!api) { this.available = 'no'; return 'no'; }
        try {
            const cap = await api.capabilities?.() || await api.availability?.() || null;
            // Chrome 127-137 returns { available: 'readily'|'after-download'|'no' }
            // Chrome 138+    returns 'available'|'downloadable'|'unavailable' string
            if (!cap) { this.available = 'no'; return 'no'; }
            const val = (typeof cap === 'string') ? cap : (cap.available || 'no');
            // Normalize to: 'readily' | 'after-download' | 'no'
            if (val === 'available' || val === 'readily') this.available = 'readily';
            else if (val === 'downloadable' || val === 'after-download') this.available = 'after-download';
            else this.available = 'no';
        } catch { this.available = 'no'; }
        return this.available;
    }

    async generate(prompt, options = {}) {
        const api = this._getAPI();
        if (!api) throw new Error('Chrome AI not available');
        if (this.available === null) await this.check();
        if (this.available === 'no') throw new Error('Chrome AI unavailable on this browser/OS');

        if (!this.session) {
            const systemPrompt = options.system || 'You are ODT, a helpful game development assistant. Be concise and technical.';
            this.session = await api.create({ systemPrompt });
        }
        const result = await this.session.prompt(prompt);
        return {
            success: true,
            response: result,
            model: 'Gemini Nano (Chrome Built-in)',
            source: 'chrome-ai',
            tokens: Math.ceil((result || '').split(/\s+/).length)
        };
    }

    isReady() { return this.available === 'readily' && this.session !== null; }
    getStatus() { return { available: this.available, sessionActive: !!this.session, name: this.name }; }

    async reset() {
        try { this.session?.destroy(); } catch {}
        this.session = null;
    }
}

// ── Tier 3: MLC WebLLM (WebGPU) ────────────────────────────────────
// Source: MLC AI CDN — https://github.com/mlc-ai/web-llm
// No API key. CDN is purpose-built for massive concurrent traffic.
const MLC_MODELS = [
    {
        id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
        label: 'Qwen 2.5 0.5B',
        size: '~370MB',
        speed: 'fastest',
        quality: 'good',
        recommended: true,
        description: 'Tiny instruction-tuned model. Best first choice for WebGPU.'
    },
    {
        id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
        label: 'TinyLlama 1.1B',
        size: '~640MB',
        speed: 'fast',
        quality: 'good',
        description: 'Fast chat model, good general purpose.'
    },
    {
        id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
        label: 'Llama 3.2 1B',
        size: '~740MB',
        speed: 'fast',
        quality: 'better',
        description: 'Meta\'s smallest Llama 3 instruct model.'
    },
    {
        id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
        label: 'Llama 3.2 3B',
        size: '~2GB',
        speed: 'medium',
        quality: 'great',
        description: 'Best quality/size balance on WebGPU.'
    },
    {
        id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
        label: 'Phi 3.5 Mini',
        size: '~2.2GB',
        speed: 'medium',
        quality: 'great',
        description: 'Microsoft\'s compact powerhouse. Excellent for code.'
    },
    {
        id: 'gemma-2-2b-it-q4f16_1-MLC',
        label: 'Gemma 2 2B',
        size: '~1.6GB',
        speed: 'fast',
        quality: 'great',
        description: 'Google\'s Gemma 2 instruct-tuned. Very capable.'
    },
    {
        id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
        label: 'SmolLM2 1.7B',
        size: '~1GB',
        speed: 'fast',
        quality: 'good',
        description: 'HuggingFace\'s compact model, great at following instructions.'
    }
];

class MLCWebLLMBackend {
    constructor() {
        this.engine = null;
        this.isLoading = false;
        this.currentModel = null;
        this.status = 'idle'; // idle | loading | ready | error
        this.webGPUAvailable = null;
        this.name = 'MLC WebLLM';
        this._loadPromise = null;
    }

    async checkWebGPU() {
        if (this.webGPUAvailable !== null) return this.webGPUAvailable;
        this.webGPUAvailable = !!(navigator.gpu);
        return this.webGPUAvailable;
    }

    async _loadMLC() {
        if (typeof mlc !== 'undefined' || window.webllm) return;
        // Load MLC WebLLM from jsDelivr CDN (production-grade CDN, handles heavy traffic)
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.type = 'module';
            s.textContent = `
                import * as webllm from 'https://esm.run/@mlc-ai/web-llm';
                window._mlcWebLLM = webllm;
                window.dispatchEvent(new Event('mlc:loaded'));
            `;
            document.head.appendChild(s);
            const t = setTimeout(() => reject(new Error('MLC load timeout')), 20000);
            window.addEventListener('mlc:loaded', () => { clearTimeout(t); resolve(); }, { once: true });
        });
    }

    async loadModel(modelId, onProgress) {
        if (this._loadPromise) return this._loadPromise;
        if (!(await this.checkWebGPU())) throw new Error('WebGPU not available on this browser');

        this._loadPromise = (async () => {
            try {
                this.status = 'loading';
                this.isLoading = true;
                await this._loadMLC();
                const webllm = window._mlcWebLLM;
                if (!webllm) throw new Error('MLC WebLLM library failed to load');

                const targetModel = modelId || MLC_MODELS[0].id;
                this.engine = await webllm.CreateMLCEngine(targetModel, {
                    initProgressCallback: (report) => {
                        onProgress && onProgress(report.text, report.progress);
                        window.dispatchEvent(new CustomEvent('mlc:progress', { detail: report }));
                    }
                });
                this.currentModel = targetModel;
                this.status = 'ready';
                this.isLoading = false;
                console.log('[MLC] Engine ready:', targetModel);
                return this.engine;
            } catch (err) {
                this.status = 'error';
                this.isLoading = false;
                this._loadPromise = null;
                throw err;
            }
        })();
        return this._loadPromise;
    }

    async generate(prompt, options = {}) {
        if (!this.engine) throw new Error('MLC engine not loaded');
        const messages = [
            { role: 'system', content: options.system || 'You are ODT, a helpful game development assistant.' },
            { role: 'user', content: prompt }
        ];
        const reply = await this.engine.chat.completions.create({
            messages,
            max_tokens: options.max_tokens || 400,
            temperature: options.temperature || 0.7
        });
        const text = reply.choices[0]?.message?.content || '';
        return {
            success: true,
            response: text,
            model: this.currentModel,
            source: 'mlc-webllm',
            tokens: reply.usage?.completion_tokens || Math.ceil(text.split(/\s+/).length)
        };
    }

    isReady() { return this.status === 'ready' && !!this.engine; }
    getStatus() { return { status: this.status, model: this.currentModel, webGPU: this.webGPUAvailable, name: this.name }; }
    getModels() { return MLC_MODELS; }

    async unload() {
        try { await this.engine?.unload(); } catch {}
        this.engine = null;
        this.status = 'idle';
        this._loadPromise = null;
        console.log('[MLC] Engine unloaded');
    }
}

// ── Tier 4: Transformers.js (WASM, any browser) ─────────────────────
// Source: Hugging Face / jsDelivr CDN — handles massive traffic globally
const TRANSFORMERS_MODELS = [
    {
        id: 'HuggingFaceTB/SmolLM2-135M-Instruct',
        pipeline: 'text-generation',
        label: 'SmolLM2 135M',
        size: '~90MB',
        speed: 'fastest',
        recommended: true,
        description: 'Smallest instruct model. Best for low-memory browsers.'
    },
    {
        id: 'HuggingFaceTB/SmolLM2-360M-Instruct',
        pipeline: 'text-generation',
        label: 'SmolLM2 360M',
        size: '~220MB',
        speed: 'fast',
        description: 'Good balance of size and quality.'
    },
    {
        id: 'Xenova/distilgpt2',
        pipeline: 'text-generation',
        label: 'DistilGPT-2',
        size: '~50MB',
        speed: 'fastest',
        description: 'Smallest option. Limited chat ability but always loads.'
    },
    {
        id: 'Xenova/TinyLlama-1.1B-Chat-v1.0',
        pipeline: 'text-generation',
        label: 'TinyLlama 1.1B (WASM)',
        size: '~640MB',
        speed: 'medium',
        description: 'TinyLlama running fully in-browser via WASM.'
    },
    {
        id: 'Xenova/Phi-3-mini-4k-instruct',
        pipeline: 'text-generation',
        label: 'Phi-3 Mini (WASM)',
        size: '~2.2GB',
        speed: 'slow',
        description: 'Best quality WASM option. Needs strong hardware.'
    }
];

class TransformersBackend {
    constructor() {
        this.pipeline = null;
        this.currentModel = null;
        this.isLoading = false;
        this.status = 'idle';
        this.name = 'Transformers.js (WASM)';
    }

    async _loadLib() {
        if (typeof window.transformers !== 'undefined' || typeof transformers !== 'undefined') return;
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            // Use latest v3 which includes SmolLM2 support
            s.src = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';
            s.onload = resolve;
            s.onerror = () => {
                // Fallback to v2 (Xenova namespace) if v3 fails
                const s2 = document.createElement('script');
                s2.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0/dist/transformers.min.js';
                s2.onload = resolve;
                s2.onerror = () => reject(new Error('Transformers.js CDN unreachable'));
                document.head.appendChild(s2);
            };
            document.head.appendChild(s);
        });
    }

    async loadModel(modelId, onProgress) {
        if (this.pipeline && this.currentModel === modelId) return this.pipeline;
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            this.status = 'loading';
            await this._loadLib();

            const lib = window.transformers || window.Transformers;
            const modelInfo = TRANSFORMERS_MODELS.find(m => m.id === modelId) || TRANSFORMERS_MODELS[0];
            const targetId = modelInfo.id;

            this.pipeline = await lib.pipeline(
                modelInfo.pipeline || 'text-generation',
                targetId,
                {
                    quantized: true,
                    device: 'wasm',
                    progress_callback: (p) => {
                        const pct = Math.round((p.progress || 0) * 100);
                        onProgress && onProgress(`Loading ${targetId}: ${pct}%`, p.progress || 0);
                    }
                }
            );
            this.currentModel = targetId;
            this.status = 'ready';
            this.isLoading = false;
            console.log('[Transformers] Model ready:', targetId);
            return this.pipeline;
        } catch (err) {
            this.status = 'error';
            this.isLoading = false;
            throw err;
        }
    }

    async generate(prompt, options = {}) {
        if (!this.pipeline) throw new Error('Transformers pipeline not loaded');

        // Format prompt for chat models that support chat_template
        let input = prompt;
        const modelInfo = TRANSFORMERS_MODELS.find(m => m.id === this.currentModel);
        if (modelInfo?.pipeline === 'text-generation') {
            input = prompt.endsWith(':') ? prompt : prompt + ':';
        }

        const result = await this.pipeline(input, {
            max_new_tokens: Math.min(options.max_tokens || 200, 400),
            temperature: options.temperature || 0.7,
            top_p: 0.9,
            repetition_penalty: 1.15,
            do_sample: true
        });

        let text = '';
        if (Array.isArray(result)) text = result[0]?.generated_text || '';
        else text = result?.generated_text || '';

        // Strip the prompt from output
        if (text.startsWith(input)) text = text.slice(input.length).trim();

        return {
            success: true,
            response: text,
            model: this.currentModel,
            source: 'transformers',
            tokens: Math.ceil(text.split(/\s+/).length)
        };
    }

    isReady() { return this.status === 'ready' && !!this.pipeline; }
    getStatus() { return { status: this.status, model: this.currentModel, name: this.name }; }
    getModels() { return TRANSFORMERS_MODELS; }

    async unload() {
        try { await this.pipeline?.dispose?.(); } catch {}
        this.pipeline = null;
        this.status = 'idle';
        console.log('[Transformers] Pipeline unloaded');
    }
}

// ── 4-Tier Fallback Chain ───────────────────────────────────────────
class LLMFallbackChain {
    constructor() {
        this.ollamaHost = null;
        this.chromeAI    = new ChromeAIBackend();
        this.mlc         = new MLCWebLLMBackend();
        this.transformers = new TransformersBackend();

        this.currentTier = null;
        this.stats = { ollama: 0, chromeAI: 0, mlc: 0, transformers: 0, fallbacks: 0, errors: 0 };

        // Which browser-side backend to use when Ollama fails
        // Options: 'auto' | 'chrome-ai' | 'mlc' | 'transformers'
        this.preferredBrowserBackend = 'auto';

        // Default model IDs for each backend
        this.mlcModel = MLC_MODELS[0].id;
        this.transformersModel = TRANSFORMERS_MODELS[0].id;

        // Keep legacy .webllm reference for memory-manager.js compatibility
        this.webllm = {
            initialized: false,
            pipeline: null,
            isReady: () => this.transformers.isReady() || this.mlc.isReady(),
            initialize: () => this.transformers.loadModel(this.transformersModel),
            unload: async () => { await this.mlc.unload(); await this.transformers.unload(); },
            getStatus: () => this.transformers.getStatus(),
            modelName: TRANSFORMERS_MODELS[0].id,
            getAvailableModels: () => [...MLC_MODELS.map(m => ({ name: m.id, size: m.size, label: m.label, source: 'mlc' })),
                                       ...TRANSFORMERS_MODELS.map(m => ({ name: m.id, size: m.size, label: m.label, source: 'transformers' }))]
        };
    }

    async initialize(ollamaHost = 'http://localhost:11434') {
        this.ollamaHost = ollamaHost;

        // Probe Chrome AI silently in background
        this.chromeAI.check().then(avail => {
            if (avail !== 'no') console.log('[LLM] Chrome Built-in AI detected:', avail);
        });

        console.log('[LLM] 4-tier fallback chain ready');
        console.log('[LLM] Tiers: Ollama → Chrome AI → MLC WebLLM → Transformers.js');
        window.dispatchEvent(new CustomEvent('fallback:ready'));
    }

    // ── Tier routing ──
    async generate(prompt, options = {}) {
        // Tier 1: Ollama
        try {
            const r = await this._ollama(prompt, options);
            this.currentTier = 'ollama'; this.stats.ollama++;
            return r;
        } catch (e) {
            console.warn('[LLM] Tier 1 (Ollama) failed:', e.message);
            this.stats.fallbacks++;
        }

        // Tier 2: Chrome Built-in AI
        try {
            if (this.preferredBrowserBackend !== 'mlc' && this.preferredBrowserBackend !== 'transformers') {
                await this.chromeAI.check();
                if (this.chromeAI.available !== 'no') {
                    const r = await this.chromeAI.generate(prompt, options);
                    this.currentTier = 'chrome-ai'; this.stats.chromeAI++;
                    return r;
                }
            }
        } catch (e) {
            console.warn('[LLM] Tier 2 (Chrome AI) failed:', e.message);
            this.stats.fallbacks++;
        }

        // Tier 3: MLC WebLLM (WebGPU)
        try {
            if (this.preferredBrowserBackend !== 'transformers') {
                if (await this.mlc.checkWebGPU()) {
                    if (!this.mlc.isReady()) await this.mlc.loadModel(this.mlcModel);
                    const r = await this.mlc.generate(prompt, options);
                    this.currentTier = 'mlc'; this.stats.mlc++;
                    return r;
                }
            }
        } catch (e) {
            console.warn('[LLM] Tier 3 (MLC) failed:', e.message);
            this.stats.fallbacks++;
        }

        // Tier 4: Transformers.js (WASM — always works)
        try {
            if (!this.transformers.isReady()) await this.transformers.loadModel(this.transformersModel);
            const r = await this.transformers.generate(prompt, options);
            this.currentTier = 'transformers'; this.stats.transformers++;
            return r;
        } catch (e) {
            console.warn('[LLM] Tier 4 (Transformers) failed:', e.message);
            this.stats.errors++;
        }

        // All tiers exhausted
        this.currentTier = 'degraded';
        return {
            success: false,
            response: null,
            error: 'All AI backends unavailable.',
            source: 'degraded',
            suggestion: 'Start Ollama, or enable Chrome AI flags, or wait for browser download.'
        };
    }

    async _ollama(prompt, options = {}) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 5000);
        try {
            const resp = await fetch(`${this.ollamaHost}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: options.model || 'qwen2.5:7b',
                    prompt, stream: false,
                    num_predict: options.max_tokens || 400
                }),
                signal: ctrl.signal
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const d = await resp.json();
            return { success: true, response: d.response, model: d.model, source: 'ollama', tokens: d.eval_count || 0 };
        } finally { clearTimeout(t); }
    }

    // ── Browser-side model loading (for 🧠 Local button) ────────────
    async loadBrowserAI(backend, modelId, onProgress) {
        if (backend === 'chrome-ai') {
            const avail = await this.chromeAI.check();
            if (avail === 'no') throw new Error('Chrome Built-in AI not available. Enable it in chrome://flags → Prompt API.');
            // Chrome AI auto-loads (no explicit model download)
            if (avail === 'after-download') {
                // Trigger download by creating a session
                await this.chromeAI.generate('hello', {});
            }
            return { backend: 'chrome-ai', model: 'Gemini Nano', ready: true };
        }
        if (backend === 'mlc') {
            const gpuOk = await this.mlc.checkWebGPU();
            if (!gpuOk) throw new Error('WebGPU not supported in this browser. Try Chrome/Edge 113+.');
            await this.mlc.loadModel(modelId || this.mlcModel, onProgress);
            return { backend: 'mlc', model: this.mlc.currentModel, ready: true };
        }
        // Default: transformers
        await this.transformers.loadModel(modelId || this.transformersModel, onProgress);
        return { backend: 'transformers', model: this.transformers.currentModel, ready: true };
    }

    // ── Status & info ────────────────────────────────────────────────
    getStatus() {
        return {
            currentTier: this.currentTier,
            chromeAI: this.chromeAI.getStatus(),
            mlc: this.mlc.getStatus(),
            transformers: this.transformers.getStatus(),
            stats: this.stats,
            preferredBrowserBackend: this.preferredBrowserBackend
        };
    }

    getBrowserModels() {
        return {
            chromeAI: [{ id: 'gemini-nano', label: 'Gemini Nano (Chrome Built-in)', size: '0MB download', source: 'chrome-ai' }],
            mlc: MLC_MODELS.map(m => ({ ...m, source: 'mlc' })),
            transformers: TRANSFORMERS_MODELS.map(m => ({ ...m, source: 'transformers' }))
        };
    }

    // Legacy compatibility
    checkOllamaAvailable() { return this.currentTier === 'ollama' || this.currentTier === null; }
    getStats() { return this.stats; }
    resetStats() { this.stats = { ollama: 0, chromeAI: 0, mlc: 0, transformers: 0, fallbacks: 0, errors: 0 }; }
    switchWebLLMModel(name) {
        const mlcMatch = MLC_MODELS.find(m => m.id === name);
        if (mlcMatch) { this.mlcModel = name; this.mlc._loadPromise = null; return true; }
        const txMatch = TRANSFORMERS_MODELS.find(m => m.id === name);
        if (txMatch) { this.transformersModel = name; return true; }
        return false;
    }
    getWebLLMModels() { return [...MLC_MODELS, ...TRANSFORMERS_MODELS]; }
}

// ── Singleton ────────────────────────────────────────────────────────
window.llmFallback = new LLMFallbackChain();
window.LLMFallbackChain = LLMFallbackChain;
window.MLC_MODELS = MLC_MODELS;
window.TRANSFORMERS_MODELS = TRANSFORMERS_MODELS;

console.log('[LLM] 4-tier AI fallback loaded. Tiers: Ollama → Chrome AI → MLC WebLLM → Transformers.js');
