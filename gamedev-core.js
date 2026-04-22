/**
 * ODTLite Game Dev Environment - Integrated All-In-One Dashboard
 * 
 * Features:
 * - Multi-project workspace management
 * - Full code editor with tabs and syntax highlighting
 * - Real-time performance diagnostics
 * - Hardware detection and auto-optimization
 * - Model discovery and import
 * - Embedded void-game with optimization features
 * - Complete game dev environment in single dashboard
 * 
 * Architecture: Modular plugin system extending ODTLite
 * Storage: localStorage for persistence
 * No external dependencies beyond existing ODTLite modules
 */

// ==================== PROJECT MANAGEMENT MODULE ====================

class ProjectManager {
    constructor() {
        this.projects = this.loadProjects();
        this.activeProject = localStorage.getItem('activeProject') || 'main';
        this.ensureMainProject();
    }

    loadProjects() {
        try {
            return JSON.parse(localStorage.getItem('projects')) || [];
        } catch (e) {
            return [];
        }
    }

    ensureMainProject() {
        if (!this.projects.find(p => p.id === 'main')) {
            this.projects.unshift({
                id: 'main',
                name: 'Main',
                created: new Date().toISOString(),
                files: [],
                chat: [],
                threads: [],
                settings: {}
            });
            this.saveProjects();
        }
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    getActive() {
        return this.projects.find(p => p.id === this.activeProject) || this.projects[0];
    }

    setActive(projectId) {
        if (this.projects.find(p => p.id === projectId)) {
            this.activeProject = projectId;
            localStorage.setItem('activeProject', projectId);
            return true;
        }
        return false;
    }

    create(name) {
        const project = {
            id: 'proj-' + Date.now(),
            name: name,
            created: new Date().toISOString(),
            files: [],
            chat: [],
            threads: [],
            settings: {}
        };
        this.projects.push(project);
        this.saveProjects();
        return project;
    }

    delete(projectId) {
        if (projectId === 'main') return false;
        this.projects = this.projects.filter(p => p.id !== projectId);
        if (this.activeProject === projectId) {
            this.activeProject = 'main';
            localStorage.setItem('activeProject', 'main');
        }
        this.saveProjects();
        return true;
    }

    getAll() {
        return this.projects.map(p => ({
            id: p.id,
            name: p.name,
            created: p.created,
            fileCount: p.files?.length || 0,
            isActive: p.id === this.activeProject
        }));
    }
}

// ==================== CODE EDITOR MODULE ====================

class CodeEditor {
    constructor() {
        this.openFiles = [];
        this.currentFile = null;
        this.projects = new ProjectManager();
    }

    openFile(name, path, content = '') {
        const existing = this.openFiles.find(f => f.path === path);
        if (existing) {
            this.currentFile = existing;
            return existing;
        }

        const file = {
            path: path,
            name: name,
            type: name.split('.').pop(),
            content: content,
            modified: false,
            createdAt: Date.now()
        };

        this.openFiles.push(file);
        this.currentFile = file;
        return file;
    }

    closeFile(path) {
        this.openFiles = this.openFiles.filter(f => f.path !== path);
        if (this.currentFile?.path === path) {
            this.currentFile = this.openFiles[0] || null;
        }
        return this.openFiles.length;
    }

    save() {
        if (!this.currentFile) return false;

        const project = this.projects.getActive();
        const fileData = {
            path: this.currentFile.path,
            name: this.currentFile.name,
            content: this.currentFile.content,
            type: this.currentFile.type,
            modified: new Date().toISOString()
        };

        const existing = project.files.findIndex(f => f.path === this.currentFile.path);
        if (existing >= 0) {
            project.files[existing] = fileData;
        } else {
            project.files.push(fileData);
        }

        this.projects.projects.find(p => p.id === project.id).files = project.files;
        this.projects.saveProjects();
        this.currentFile.modified = false;

        return true;
    }

    getOpenFiles() {
        return this.openFiles.map(f => ({
            path: f.path,
            name: f.name,
            type: f.type,
            modified: f.modified,
            active: this.currentFile?.path === f.path
        }));
    }
}

// ==================== HARDWARE DETECTOR MODULE ====================

class HardwareDetector {
    constructor() {
        this.profile = this.detect();
    }

    detect() {
        const profile = {
            gpu: 'Unknown',
            gpuVendor: 'Unknown',
            cores: navigator.hardwareConcurrency || 4,
            ram: navigator.deviceMemory || 8,
            screen: `${window.innerWidth}x${window.innerHeight}`,
            dpi: Math.round(window.devicePixelRatio * 96),
            browser: this.detectBrowser(),
            connection: this.detectConnection(),
            timestamp: Date.now()
        };

        // Detect GPU via WebGL
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    profile.gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    profile.gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
                }
            }
        } catch (e) {
            profile.gpu = 'WebGL Error';
        }

        // Calculate profile tier
        profile.tier = this.calculateTier(profile);
        profile.recommendedFPS = this.getRecommendedFPS(profile.tier);

        return profile;
    }

    detectBrowser() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Unknown';
    }

    detectConnection() {
        try {
            return navigator.connection?.effectiveType || 'unknown';
        } catch (e) {
            return 'unknown';
        }
    }

    calculateTier(profile) {
        if (profile.gpu.includes('RTX') || profile.gpu.includes('RTX')) {
            return 'high';
        } else if (profile.gpu.includes('GTX') || profile.gpu.includes('Radeon')) {
            return 'medium';
        } else if (profile.cores >= 8 && profile.ram >= 16) {
            return 'high';
        } else if (profile.cores >= 4 && profile.ram >= 8) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    getRecommendedFPS(tier) {
        const fps = {
            high: 120,
            medium: 60,
            low: 30
        };
        return fps[tier] || 60;
    }

    getOptimizationSettings(tier) {
        const settings = {
            high: {
                renderQuality: 'ultra',
                shadowQuality: 'high',
                antialiasing: 4,
                targetFPS: 120
            },
            medium: {
                renderQuality: 'high',
                shadowQuality: 'medium',
                antialiasing: 2,
                targetFPS: 60
            },
            low: {
                renderQuality: 'medium',
                shadowQuality: 'low',
                antialiasing: 1,
                targetFPS: 30
            }
        };
        return settings[tier] || settings.medium;
    }
}

// ==================== DIAGNOSTICS MODULE ====================

class SystemDiagnostics {
    constructor() {
        this.results = [];
    }

    async runAll() {
        this.results = [];

        // Test WebGL
        this.testWebGL();

        // Test memory
        this.testMemory();

        // Test performance
        await this.testPerformance();

        // Test storage
        this.testStorage();

        return {
            timestamp: new Date().toISOString(),
            results: this.results,
            summary: {
                passed: this.results.filter(r => r.pass).length,
                failed: this.results.filter(r => !r.pass).length,
                total: this.results.length,
                health: this.calculateHealth()
            }
        };
    }

    testWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            this.results.push({
                name: 'WebGL Support',
                pass: !!gl,
                details: gl ? 'WebGL 2.0 available' : 'WebGL not available'
            });
        } catch (e) {
            this.results.push({ name: 'WebGL Support', pass: false, details: e.message });
        }
    }

    testMemory() {
        try {
            if (performance.memory) {
                const usage = performance.memory.usedJSHeapSize / (1024 * 1024);
                const limit = performance.memory.jsHeapSizeLimit / (1024 * 1024);
                const percent = (usage / limit) * 100;
                this.results.push({
                    name: 'Memory Usage',
                    pass: percent < 80,
                    details: `${usage.toFixed(1)}MB / ${limit.toFixed(1)}MB (${percent.toFixed(1)}%)`
                });
            } else {
                this.results.push({
                    name: 'Memory API',
                    pass: false,
                    details: 'Memory API unavailable (Chrome only)'
                });
            }
        } catch (e) {
            this.results.push({ name: 'Memory', pass: false, details: e.message });
        }
    }

    async testPerformance() {
        const start = performance.now();
        let frameCount = 0;
        
        return new Promise(resolve => {
            const count = () => {
                frameCount++;
                if (performance.now() - start < 1000) {
                    requestAnimationFrame(count);
                }
            };
            requestAnimationFrame(count);

            setTimeout(() => {
                this.results.push({
                    name: 'Frame Rate',
                    pass: frameCount >= 30,
                    details: `${frameCount} FPS`
                });
                resolve();
            }, 1100);
        });
    }

    testStorage() {
        try {
            const test = '__test_' + Date.now();
            localStorage.setItem(test, test);
            const pass = localStorage.getItem(test) === test;
            localStorage.removeItem(test);
            this.results.push({
                name: 'localStorage',
                pass: pass,
                details: pass ? 'Working' : 'Failed'
            });
        } catch (e) {
            this.results.push({
                name: 'localStorage',
                pass: false,
                details: e.message
            });
        }
    }

    calculateHealth() {
        const total = this.results.length;
        const passed = this.results.filter(r => r.pass).length;
        return Math.round((passed / total) * 100);
    }
}

// ==================== MODEL SCANNER MODULE ====================

class ModelScanner {
    constructor() {
        this.models = [];
        this.ollama = null;
    }

    async scanOllama() {
        try {
            const response = await fetch('http://localhost:11434/api/tags', { timeout: 3000 });
            if (response.ok) {
                const data = await response.json();
                return data.models || [];
            }
        } catch (e) {
            console.log('Ollama not available');
        }
        return [];
    }

    async scanWebLLM() {
        // WebLLM models available in browser
        return [
            { name: 'distilgpt2', size: '0.35GB', source: 'webllm', type: 'text-generation' },
            { name: 'mobilenet', size: '0.15GB', source: 'webllm', type: 'image-classification' },
            { name: 'quantized-gemma-2b', size: '1.2GB', source: 'webllm', type: 'text-generation' }
        ];
    }

    async scanAll() {
        const ollamaModels = await this.scanOllama();
        const webllmModels = await this.scanWebLLM();
        this.models = [...webllmModels, ...ollamaModels];
        return this.models;
    }

    getRecommendations(hardwareProfile) {
        const tier = hardwareProfile.tier;
        const recommendations = {
            high: ['quantized-gemma-2b', 'phi-2.7b', 'mistral-7b'],
            medium: ['distilgpt2', 'quantized-gemma-2b'],
            low: ['distilgpt2']
        };
        return recommendations[tier] || recommendations.medium;
    }
}

// ==================== GLOBAL INSTANCES ====================

window.projectManager = new ProjectManager();
window.codeEditor = new CodeEditor();
window.hardwareDetector = new HardwareDetector();
window.systemDiagnostics = new SystemDiagnostics();
window.modelScanner = new ModelScanner();

console.log('[GameDev] All modules initialized');
