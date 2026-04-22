/**
 * Chat Modes - Multiple reasoning modes for different use cases
 */

class ChatModeEngine {
    constructor() {
        this.modes = this.initializeModes();
        this.activeMode = 'direct';
        this.systemPrompts = this.initializeSystemPrompts();
    }

    initializeModes() {
        return {
            direct: {
                name: 'Direct',
                icon: '💬',
                description: 'Quick, concise responses',
                maxTokens: 150,
                temperature: 0.7,
                systemPrompt: 'direct'
            },
            detailed: {
                name: 'Detailed',
                icon: '📖',
                description: 'Comprehensive, thoughtful responses',
                maxTokens: 400,
                temperature: 0.6,
                systemPrompt: 'detailed'
            },
            code: {
                name: 'Code Gen',
                icon: '💻',
                description: 'Optimized for code generation',
                maxTokens: 500,
                temperature: 0.3,
                systemPrompt: 'code'
            },
            qa: {
                name: 'Q&A',
                icon: '❓',
                description: 'Question-answering mode',
                maxTokens: 250,
                temperature: 0.5,
                systemPrompt: 'qa'
            },
            plan: {
                name: 'Plan',
                icon: '📋',
                description: 'Step-by-step planning',
                maxTokens: 600,
                temperature: 0.4,
                systemPrompt: 'plan'
            }
        };
    }

    initializeSystemPrompts() {
        return {
            direct: 'You are a helpful assistant. Provide concise, direct answers. Keep responses brief and to the point.',
            
            detailed: 'You are a thoughtful assistant. Provide comprehensive, well-structured responses with examples and explanations. Take time to thoroughly address the topic.',
            
            code: 'You are an expert programmer. Generate clean, efficient, well-commented code. Provide explanations of your implementation. Use best practices and modern patterns.',
            
            qa: 'You are a Q&A expert. Answer questions clearly and accurately. If uncertain, say so. Provide relevant context and references when helpful.',
            
            plan: 'You are a planning expert. Break down tasks into clear, actionable steps. Provide reasoning for each step. Consider edge cases and dependencies.'
        };
    }

    setMode(modeId) {
        if (!this.modes[modeId]) {
            throw new Error(`Mode ${modeId} not found`);
        }
        this.activeMode = modeId;
        console.log(`[ChatModeEngine] Switched to mode: ${this.modes[modeId].name}`);
    }

    getMode(modeId) {
        return this.modes[modeId];
    }

    getActiveMode() {
        return { id: this.activeMode, ...this.modes[this.activeMode] };
    }

    getModes() {
        return Object.entries(this.modes).map(([id, mode]) => ({ id, ...mode }));
    }

    getSystemPrompt(modeId = null) {
        const mode = modeId || this.activeMode;
        const modeObj = this.modes[mode];
        return modeObj ? this.systemPrompts[modeObj.systemPrompt] : '';
    }

    async generate(prompt, options = {}) {
        const mode = this.modes[this.activeMode];
        if (!mode) {
            throw new Error('No active mode');
        }

        const config = {
            temperature: options.temperature || mode.temperature,
            max_tokens: options.max_tokens || mode.maxTokens,
            system: this.getSystemPrompt(),
            ...options
        };

        if (!window.llmFallback) {
            throw new Error('LLM fallback not available');
        }

        return await window.llmFallback.generate(prompt, config);
    }

    getRecommendedMode(text) {
        // Auto-suggest mode based on input
        const lowerText = text.toLowerCase();

        if (lowerText.includes('code') || lowerText.includes('write') || lowerText.includes('function')) {
            return 'code';
        } else if (lowerText.includes('plan') || lowerText.includes('step') || lowerText.includes('how to')) {
            return 'plan';
        } else if (lowerText.includes('?') && lowerText.length < 100) {
            return 'qa';
        } else if (lowerText.includes('explain') || lowerText.includes('detail') || lowerText.includes('describe')) {
            return 'detailed';
        }

        return 'direct';
    }

    getModeStats() {
        return {
            available: Object.keys(this.modes).length,
            active: this.activeMode,
            modes: Object.keys(this.modes)
        };
    }
}

// Global instance
window.chatModeEngine = new ChatModeEngine();

console.log('[ChatModeEngine] Initialized - 5 modes available');
