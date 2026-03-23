/**
 * Hardware Optimizer - Detect system specs and apply optimizations
 * Auto-tunes WebLLM for device capabilities
 */

class HardwareOptimizer {
    constructor() {
        this.profile = this.detectProfile();
        this.optimizations = this.generateOptimizations();
        this.applied = false;
    }

    detectProfile() {
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4;
        const gpu = this.detectGPU();
        
        let tier = 'balanced';
        if (cores <= 2 && memory <= 2) {
            tier = 'conservative';
        } else if (cores >= 8 && memory >= 8) {
            tier = 'performance';
        }

        return {
            tier: tier,
            cores: cores,
            memory: memory,
            gpu: gpu,
            platform: navigator.platform,
            ram_gb: memory,
            detected_at: new Date().toISOString()
        };
    }

    detectGPU() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return 'Unknown';
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            }
            return 'WebGL Supported';
        } catch (e) {
            return 'Unknown';
        }
    }

    generateOptimizations() {
        const tier = this.profile.tier;
        const cores = this.profile.cores;
        const memory = this.profile.memory;

        const profiles = {
            conservative: {
                name: 'Conservative (Low-End 2GB)',
                maxRAMPercent: 50,
                criticalRAMPercent: 60,
                emergencyRAMPercent: 75,
                checkIntervalMs: 2000,
                modelChunkSize: 512,
                workerThreads: 1,
                maxChatMessages: 50,
                renderQuality: 'low',
                updateFrequency: 15 // FPS
            },
            balanced: {
                name: 'Balanced (Medium 4-8GB)',
                maxRAMPercent: 75,
                criticalRAMPercent: 85,
                emergencyRAMPercent: 95,
                checkIntervalMs: 5000,
                modelChunkSize: 1024,
                workerThreads: Math.max(1, Math.floor(cores / 2)),
                maxChatMessages: 100,
                renderQuality: 'medium',
                updateFrequency: 30
            },
            performance: {
                name: 'Performance (High-End 8GB+)',
                maxRAMPercent: 80,
                criticalRAMPercent: 90,
                emergencyRAMPercent: 98,
                checkIntervalMs: 10000,
                modelChunkSize: 2048,
                workerThreads: Math.floor(cores * 0.75),
                maxChatMessages: 200,
                renderQuality: 'high',
                updateFrequency: 60
            }
        };

        return profiles[tier] || profiles.balanced;
    }

    apply() {
        if (this.applied) return;

        // Apply memory settings
        if (window.memoryManager) {
            window.memoryManager.config.maxRAMPercent = this.optimizations.maxRAMPercent;
            window.memoryManager.config.criticalRAMPercent = this.optimizations.criticalRAMPercent;
            window.memoryManager.config.emergencyRAMPercent = this.optimizations.emergencyRAMPercent;
            window.memoryManager.config.checkIntervalMs = this.optimizations.checkIntervalMs;
            
            if (this.optimizations.checkIntervalMs !== 5000) {
                window.memoryManager.stop();
                window.memoryManager.start();
            }
        }

        // Store settings
        localStorage.setItem('hardware-profile', JSON.stringify(this.profile));
        localStorage.setItem('hardware-optimizations', JSON.stringify(this.optimizations));

        this.applied = true;
        console.log('[HardwareOptimizer] Applied:', this.optimizations.name);
    }

    getRecommendations() {
        const profile = this.profile;
        const recommendations = [];

        if (profile.cores <= 2) {
            recommendations.push('Your CPU is limited. Close other applications for better performance.');
        }
        if (profile.memory <= 2) {
            recommendations.push('RAM is limited (2GB). Use conservative mode and limit model size.');
        }
        if (profile.gpu === 'Unknown') {
            recommendations.push('GPU detection failed. Enable WebGL for 3D rendering.');
        }

        // Model recommendations
        if (profile.memory <= 2) {
            recommendations.push('Recommended model: distilgpt2 (0.35GB)');
        } else if (profile.memory <= 4) {
            recommendations.push('Recommended models: distilgpt2, phi-2.7b');
        } else {
            recommendations.push('Recommended models: phi-2.7b, mistral-7b (with quantization)');
        }

        return recommendations;
    }

    getStatus() {
        return {
            profile: this.profile,
            optimizations: this.optimizations,
            applied: this.applied,
            recommendations: this.getRecommendations()
        };
    }

    exportProfile() {
        return JSON.stringify(this.getStatus(), null, 2);
    }
}

// Global instance
window.hardwareOptimizer = new HardwareOptimizer();

console.log('[HardwareOptimizer] Initialized - Profile:', window.hardwareOptimizer.profile.tier);
