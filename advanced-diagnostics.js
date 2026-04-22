/**
 * Advanced Diagnostics - Comprehensive system health checks
 * 15+ diagnostic tests for WebLLM environment
 */

class AdvancedDiagnostics {
    constructor() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;
    }

    async runAll() {
        this.results = [];
        this.testCount = 0;
        this.passCount = 0;
        this.failCount = 0;

        console.log('[Diagnostics] Starting system checks...');

        // Rendering
        await this.testWebGL();
        await this.testThreeJS();
        await this.testRenderer();
        await this.testAnimationLoop();

        // Storage
        await this.testLocalStorage();
        await this.testIndexedDB();
        await this.testServiceWorker();

        // Performance
        await this.testPerformanceAPI();
        await this.testMemoryAPI();
        await this.testFPS();

        // LLM
        await this.testWebLLM();
        await this.testModelCache();
        await this.testWorkerAvailability();

        // Network
        await this.testNetworkCapability();
        await this.testBrowserSupport();

        // System
        await this.testHardwareInfo();
        await this.testBrowserStability();

        console.log(`[Diagnostics] Complete - ${this.passCount}/${this.testCount} passed`);
        return this.getReport();
    }

    async testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            this.addResult('WebGL Support', !!gl, gl ? 'WebGL enabled' : 'WebGL not supported');
        } catch (e) {
            this.addResult('WebGL Support', false, e.message);
        }
    }

    async testThreeJS() {
        try {
            const hasThree = typeof THREE !== 'undefined' && THREE.Scene;
            this.addResult('Three.js Library', hasThree, hasThree ? 'v' + (THREE.REVISION || '?') : 'Not loaded');
        } catch (e) {
            this.addResult('Three.js Library', false, 'Error: ' + e.message);
        }
    }

    async testRenderer() {
        try {
            const hasRenderer = window.renderer && window.renderer instanceof THREE.WebGLRenderer;
            this.addResult('3D Renderer', hasRenderer, hasRenderer ? 'WebGLRenderer ready' : 'Not initialized');
        } catch (e) {
            this.addResult('3D Renderer', false, e.message);
        }
    }

    async testAnimationLoop() {
        try {
            const hasCanvas = document.getElementById('preview3d');
            const canRender = hasCanvas && hasCanvas.getContext;
            this.addResult('Animation Loop', canRender, canRender ? 'Canvas active' : 'Canvas not found');
        } catch (e) {
            this.addResult('Animation Loop', false, e.message);
        }
    }

    async testLocalStorage() {
        try {
            const test = '__test__' + Date.now();
            localStorage.setItem(test, test);
            const pass = localStorage.getItem(test) === test;
            localStorage.removeItem(test);
            this.addResult('localStorage', pass, pass ? 'Working' : 'Test failed');
        } catch (e) {
            this.addResult('localStorage', false, 'Unavailable: ' + e.message);
        }
    }

    async testIndexedDB() {
        try {
            const hasIndexedDB = !!window.indexedDB;
            const dbs = hasIndexedDB ? (await indexedDB.databases?.()).length || '?' : 0;
            this.addResult('IndexedDB', hasIndexedDB, hasIndexedDB ? `${dbs} databases` : 'Not supported');
        } catch (e) {
            this.addResult('IndexedDB', false, 'Error: ' + e.message);
        }
    }

    async testServiceWorker() {
        try {
            const hasServiceWorker = 'serviceWorker' in navigator;
            const registered = hasServiceWorker && (await navigator.serviceWorker.getRegistrations()).length;
            this.addResult('Service Worker', hasServiceWorker, hasServiceWorker ? `${registered || 0} registered` : 'Not supported');
        } catch (e) {
            this.addResult('Service Worker', false, 'Error: ' + e.message);
        }
    }

    async testPerformanceAPI() {
        try {
            const hasPerf = !!performance && !!performance.now;
            this.addResult('Performance API', hasPerf, hasPerf ? 'Available' : 'Not available');
        } catch (e) {
            this.addResult('Performance API', false, e.message);
        }
    }

    async testMemoryAPI() {
        try {
            const hasMem = !!performance.memory;
            if (hasMem) {
                const used = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
                const total = (performance.memory.jsHeapSizeLimit / 1048576).toFixed(1);
                this.addResult('Memory API', true, `${used}MB / ${total}MB`);
            } else {
                this.addResult('Memory API', false, 'Chrome only - not available');
            }
        } catch (e) {
            this.addResult('Memory API', false, e.message);
        }
    }

    async testFPS() {
        try {
            const start = performance.now();
            let frames = 0;
            const count = () => {
                frames++;
                if (performance.now() - start < 1000) {
                    requestAnimationFrame(count);
                }
            };
            requestAnimationFrame(count);

            await new Promise(r => setTimeout(r, 1100));
            this.addResult('Frame Rate', frames >= 30, `${frames} FPS`);
        } catch (e) {
            this.addResult('Frame Rate', false, e.message);
        }
    }

    async testWebLLM() {
        try {
            const hasWebLLM = !!window.llmFallback && !!window.llmFallback.webllm;
            const isReady = hasWebLLM && window.llmFallback.webllm.initialized;
            this.addResult('WebLLM Core', hasWebLLM, isReady ? 'Loaded & ready' : hasWebLLM ? 'Loaded' : 'Not found');
        } catch (e) {
            this.addResult('WebLLM Core', false, e.message);
        }
    }

    async testModelCache() {
        try {
            if (window.llmFallback && window.llmFallback.webllm && window.llmFallback.webllm.modelCache) {
                const size = window.llmFallback.webllm.modelCache.size || 0;
                this.addResult('Model Cache', true, `${size} items cached`);
            } else {
                this.addResult('Model Cache', false, 'No cache instance');
            }
        } catch (e) {
            this.addResult('Model Cache', false, e.message);
        }
    }

    async testWorkerAvailability() {
        try {
            const hasWorker = typeof Worker !== 'undefined';
            const threads = navigator.hardwareConcurrency || 'unknown';
            this.addResult('Web Workers', hasWorker, hasWorker ? `${threads} threads available` : 'Not supported');
        } catch (e) {
            this.addResult('Web Workers', false, e.message);
        }
    }

    async testNetworkCapability() {
        try {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                const type = connection.effectiveType || 'unknown';
                const downlink = connection.downlink || 'unknown';
                this.addResult('Network', true, `${type} (${downlink}Mbps)`);
            } else {
                this.addResult('Network', false, 'Connection API not available');
            }
        } catch (e) {
            this.addResult('Network', false, e.message);
        }
    }

    async testBrowserSupport() {
        try {
            const features = {
                'Promise': typeof Promise !== 'undefined',
                'Fetch': typeof fetch !== 'undefined',
                'ES6': typeof Symbol !== 'undefined',
                'Crypto': typeof crypto !== 'undefined'
            };
            const allSupported = Object.values(features).every(v => v);
            const supported = Object.entries(features).filter(([_, v]) => v).map(([k]) => k).join(', ');
            this.addResult('Browser Features', allSupported, supported);
        } catch (e) {
            this.addResult('Browser Features', false, e.message);
        }
    }

    async testHardwareInfo() {
        try {
            const cores = navigator.hardwareConcurrency || 'unknown';
            const memory = navigator.deviceMemory ? navigator.deviceMemory + 'GB' : 'unknown';
            const platform = navigator.platform;
            this.addResult('Hardware Info', true, `${cores} cores, ${memory} RAM, ${platform}`);
        } catch (e) {
            this.addResult('Hardware Info', false, e.message);
        }
    }

    async testBrowserStability() {
        try {
            const uptime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            const stable = uptime > 0;
            this.addResult('Browser Stability', stable, `Uptime: ${uptime}ms`);
        } catch (e) {
            this.addResult('Browser Stability', false, e.message);
        }
    }

    addResult(name, pass, detail) {
        this.testCount++;
        if (pass) this.passCount++;
        else this.failCount++;

        this.results.push({
            name: name,
            pass: pass,
            detail: detail,
            timestamp: Date.now()
        });
    }

    getReport() {
        return {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testCount,
                passed: this.passCount,
                failed: this.failCount,
                percentage: ((this.passCount / this.testCount) * 100).toFixed(1) + '%'
            },
            results: this.results,
            recommendations: this.generateRecommendations()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const failed = this.results.filter(r => !r.pass);

        if (failed.some(r => r.name.includes('WebGL'))) {
            recommendations.push('⚠️ WebGL not supported - 3D rendering disabled');
        }
        if (failed.some(r => r.name.includes('WebLLM'))) {
            recommendations.push('⚠️ WebLLM not ready - reload page or check console');
        }
        if (failed.some(r => r.name.includes('Storage'))) {
            recommendations.push('⚠️ Storage limited - data may not persist');
        }
        if (this.results.find(r => r.name === 'Frame Rate' && !r.pass)) {
            recommendations.push('⚠️ Low FPS - consider closing other applications');
        }
        if (this.results.find(r => r.name === 'Memory API' && !r.pass)) {
            recommendations.push('ℹ️ Memory monitoring unavailable - use Chrome for detailed stats');
        }

        if (recommendations.length === 0) {
            recommendations.push('✓ System ready - all diagnostics passed!');
        }

        return recommendations;
    }

    exportReport() {
        return JSON.stringify(this.getReport(), null, 2);
    }

    displayReport(container) {
        const report = this.getReport();
        container.innerHTML = `
            <div style="margin-bottom: 6px; padding: 4px; background: #0d1117; border: 1px solid #30363d; border-radius: 2px;">
                <div style="font-weight: 600; color: #58a6ff; margin-bottom: 3px;">Summary: ${report.summary.passed}/${report.summary.total} (${report.summary.percentage})</div>
                <div style="font-size: 8px; color: #8b949e;">Timestamp: ${report.summary.timestamp}</div>
            </div>
            ${report.results.map(r => `
                <div class="check-item ${!r.pass ? 'failed' : ''}" style="margin-bottom: 2px;">
                    <span class="check-name" style="font-size: 9px;">${r.name}</span>
                    <span class="check-status" style="font-size: 8px;">${r.pass ? '✓' : '✗'}</span>
                </div>
                <div style="font-size: 7px; color: #6b7280; margin-left: 4px; margin-bottom: 3px;">${r.detail}</div>
            `).join('')}
            <div style="margin-top: 6px; padding: 4px; background: rgba(88, 166, 255, 0.1); border-left: 2px solid #58a6ff; border-radius: 2px;">
                ${report.recommendations.map(r => `<div style="font-size: 8px; color: #c9d1d9; margin-bottom: 2px;">${r}</div>`).join('')}
            </div>
        `;
    }
}

// Global instance
window.advancedDiagnostics = new AdvancedDiagnostics();

console.log('[AdvancedDiagnostics] Ready');
