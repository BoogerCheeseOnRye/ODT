// ODT - Advanced 3D Preview Renderer
// Renders code to interactive 3D preview with real-time compilation
// Supports HTML/CSS/JS rendering + syntax visualization

class PreviewRenderer {
    constructor() {
        this.currentCode = {
            html: '',
            css: '',
            js: ''
        };
        this.previewFrame = null;
        this.syntaxScene = null;
        this.codeLines = [];
        this.lineHeight = 0.15;
        this.stats = {
            lastRenderTime: 0,
            errors: 0,
            warnings: 0,
            compileTime: 0
        };
    }

    /**
     * Initialize preview renderer
     */
    initialize(scene, camera, renderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.setupLighting();
        this.createGrid();
    }

    /**
     * Setup lighting for preview scene
     */
    setupLighting() {
        // Remove default lights if exist
        this.scene.children.forEach(child => {
            if (child instanceof THREE.Light) {
                this.scene.remove(child);
            }
        });

        // Directional light
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(10, 10, 10);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x606060, 0.6);
        this.scene.add(ambientLight);

        // Add point light for depth
        const pointLight = new THREE.PointLight(0x58a6ff, 0.5);
        pointLight.position.set(-5, 5, 5);
        this.scene.add(pointLight);
    }

    /**
     * Create background grid
     */
    createGrid() {
        const gridSize = 20;
        const gridDivisions = 40;
        const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x404040, 0x303030);
        grid.position.y = -2;
        this.scene.add(grid);
    }

    /**
     * Parse and render code to 3D
     */
    async renderCode(htmlCode, cssCode, jsCode) {
        const startTime = performance.now();
        
        try {
            this.currentCode = { html: htmlCode, css: cssCode, js: jsCode };
            
            // Clear existing rendered objects (but keep grid and lights)
            const toRemove = this.scene.children.filter(child => 
                !(child instanceof THREE.Light) && 
                !(child instanceof THREE.GridHelper) &&
                !(child instanceof THREE.Camera)
            );
            toRemove.forEach(child => this.scene.remove(child));

            // Parse HTML structure
            const dom = this.parseHTML(htmlCode);
            
            // Build 3D representation
            await this.buildVisualization(dom, cssCode, jsCode);
            
            this.stats.compileTime = performance.now() - startTime;
            this.stats.errors = 0;
            
            return {
                success: true,
                time: this.stats.compileTime,
                objects: this.scene.children.length
            };
        } catch (err) {
            console.error('[Preview] Render error:', err);
            this.stats.errors++;
            return {
                success: false,
                error: err.message,
                time: performance.now() - startTime
            };
        }
    }

    /**
     * Parse HTML into DOM structure
     */
    parseHTML(htmlCode) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlCode, 'text/html');
            return doc.body || doc;
        } catch (err) {
            console.error('[Preview] HTML parse error:', err);
            throw new Error(`Invalid HTML: ${err.message}`);
        }
    }

    /**
     * Build 3D visualization from DOM
     */
    async buildVisualization(dom, cssCode, jsCode) {
        let yOffset = 0;

        // Process each element
        const elements = dom.children;
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const mesh = this.createElementMesh(element, cssCode);
            
            if (mesh) {
                mesh.position.y = yOffset;
                this.scene.add(mesh);
                yOffset -= this.lineHeight * 2;
            }
        }

        // If no elements, show code visualization
        if (elements.length === 0 && htmlCode.length > 0) {
            this.createCodeVisualization(htmlCode);
        }

        // Show CSS indicator
        if (cssCode.length > 0) {
            this.createIndicator('CSS', 0xff9800, yOffset);
            yOffset -= 0.3;
        }

        // Show JS indicator
        if (jsCode.length > 0) {
            this.createIndicator('JS', 0x4caf50, yOffset);
        }
    }

    /**
     * Create 3D mesh from HTML element
     */
    createElementMesh(element, cssCode) {
        const tag = element.tagName.toLowerCase();
        const text = element.textContent.substring(0, 50);
        
        let geometry, material;
        
        switch (tag) {
            case 'div':
            case 'section':
            case 'main':
            case 'article':
                geometry = new THREE.BoxGeometry(3, 0.4, 0.2);
                material = new THREE.MeshPhongMaterial({ color: 0x58a6ff });
                break;
            case 'button':
            case 'input':
                geometry = new THREE.BoxGeometry(1.5, 0.3, 0.1);
                material = new THREE.MeshPhongMaterial({ color: 0x10b981 });
                break;
            case 'h1':
            case 'h2':
            case 'h3':
                geometry = new THREE.BoxGeometry(2.5, 0.25, 0.15);
                material = new THREE.MeshPhongMaterial({ color: 0x8b5cf6 });
                break;
            case 'p':
            case 'span':
            case 'a':
                geometry = new THREE.BoxGeometry(2, 0.2, 0.1);
                material = new THREE.MeshPhongMaterial({ color: 0xfbbf24 });
                break;
            case 'img':
                geometry = new THREE.BoxGeometry(1.5, 1, 0.1);
                material = new THREE.MeshPhongMaterial({ color: 0xef5350 });
                break;
            case 'form':
                geometry = new THREE.BoxGeometry(2, 1.2, 0.2);
                material = new THREE.MeshPhongMaterial({ color: 0x00bcd4 });
                break;
            default:
                geometry = new THREE.BoxGeometry(2, 0.3, 0.1);
                material = new THREE.MeshPhongMaterial({ color: 0x9ca3af });
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add label
        const label = this.createLabel(tag, text);
        mesh.add(label);
        
        return mesh;
    }

    /**
     * Create label for mesh
     */
    createLabel(tag, text) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#58a6ff';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`<${tag}>`, 10, 40);
        
        ctx.fillStyle = '#c9d1d9';
        ctx.font = '14px monospace';
        ctx.fillText(text, 10, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(2, 0.5, 1);
        sprite.position.z = 0.2;
        
        return sprite;
    }

    /**
     * Create code visualization
     */
    createCodeVisualization(code) {
        const lines = code.split('\n').slice(0, 10);
        const group = new THREE.Group();
        
        lines.forEach((line, index) => {
            const mesh = this.createCodeLineMesh(line.substring(0, 40), index);
            mesh.position.y = -index * this.lineHeight;
            group.add(mesh);
        });
        
        this.scene.add(group);
    }

    /**
     * Create visual mesh for code line
     */
    createCodeLineMesh(line, index) {
        const width = Math.min(line.length * 0.08, 4);
        const geometry = new THREE.BoxGeometry(width, this.lineHeight * 0.8, 0.05);
        
        // Color based on content
        let color = 0x8b949e;
        if (line.includes('<')) color = 0x58a6ff;
        if (line.includes('{')) color = 0xfbbf24;
        if (line.includes('function')) color = 0x10b981;
        if (line.includes('//')) color = 0x6b7280;
        
        const material = new THREE.MeshPhongMaterial({ color: color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        
        return mesh;
    }

    /**
     * Create status indicator
     */
    createIndicator(label, color, yPos) {
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const sphere = new THREE.Mesh(geometry, material);
        
        sphere.position.set(-3, yPos, 0.5);
        this.scene.add(sphere);
        
        // Add glow
        const glowGeometry = new THREE.SphereGeometry(0.18, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(sphere.position);
        this.scene.add(glow);
    }

    /**
     * Create syntax highlighting visualization
     */
    createSyntaxVisualization(code, language = 'html') {
        const tokens = this.tokenizeCode(code, language);
        const group = new THREE.Group();
        
        let xOffset = -5;
        let yOffset = 0;
        let charCount = 0;
        
        tokens.forEach(token => {
            const { type, value } = token;
            const color = this.getTokenColor(type, language);
            
            for (let i = 0; i < value.length; i++) {
                const char = value[i];
                
                if (char === '\n') {
                    xOffset = -5;
                    yOffset -= this.lineHeight;
                    charCount = 0;
                    continue;
                }
                
                if (char === ' ') {
                    xOffset += 0.08;
                    charCount++;
                    continue;
                }
                
                // Create small box for character
                const geometry = new THREE.BoxGeometry(0.06, this.lineHeight * 0.6, 0.02);
                const material = new THREE.MeshPhongMaterial({ color: color });
                const mesh = new THREE.Mesh(geometry, material);
                
                mesh.position.set(xOffset, yOffset, 0);
                group.add(mesh);
                
                xOffset += 0.08;
                charCount++;
                
                if (charCount > 80) {
                    xOffset = -5;
                    yOffset -= this.lineHeight;
                    charCount = 0;
                }
            }
        });
        
        this.scene.add(group);
    }

    /**
     * Tokenize code for highlighting
     */
    tokenizeCode(code, language) {
        const tokens = [];
        let current = '';
        let currentType = 'default';
        
        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            const nextChar = code[i + 1];
            
            // Simple tokenization
            if (language === 'html') {
                if (char === '<') {
                    if (current) tokens.push({ type: currentType, value: current });
                    currentType = 'tag';
                    current = '<';
                } else if (char === '>' && currentType === 'tag') {
                    current += '>';
                    tokens.push({ type: 'tag', value: current });
                    current = '';
                    currentType = 'default';
                } else {
                    current += char;
                }
            } else if (language === 'css') {
                if (char === '{' || char === '}' || char === ':' || char === ';') {
                    if (current) tokens.push({ type: 'default', value: current });
                    tokens.push({ type: 'punctuation', value: char });
                    current = '';
                } else {
                    current += char;
                }
            } else if (language === 'js') {
                if (char === ' ' || char === '\n') {
                    if (current) tokens.push({ type: 'default', value: current });
                    tokens.push({ type: 'whitespace', value: char });
                    current = '';
                } else {
                    current += char;
                }
            }
        }
        
        if (current) tokens.push({ type: currentType, value: current });
        return tokens;
    }

    /**
     * Get color for token type
     */
    getTokenColor(type, language) {
        const colors = {
            tag: 0x58a6ff,
            keyword: 0xff79c6,
            string: 0xa1ffe0,
            number: 0xf1fa8c,
            comment: 0x6272a4,
            function: 0x8be9fd,
            punctuation: 0xfbbf24,
            default: 0xc9d1d9,
            whitespace: 0x0d1117
        };
        
        return colors[type] || colors.default;
    }

    /**
     * Get render statistics
     */
    getStats() {
        return {
            compileTime: this.stats.compileTime.toFixed(2),
            objects: this.scene.children.filter(c => !(c instanceof THREE.Light) && !(c instanceof THREE.GridHelper)).length,
            errors: this.stats.errors,
            warnings: this.stats.warnings
        };
    }

    /**
     * Clear preview
     */
    clear() {
        const toRemove = this.scene.children.filter(child => 
            !(child instanceof THREE.Light) && 
            !(child instanceof THREE.GridHelper)
        );
        toRemove.forEach(child => this.scene.remove(child));
        this.currentCode = { html: '', css: '', js: '' };
    }

    /**
     * Export preview statistics
     */
    exportStats() {
        return {
            ...this.stats,
            codeLines: {
                html: this.currentCode.html.split('\n').length,
                css: this.currentCode.css.split('\n').length,
                js: this.currentCode.js.split('\n').length
            }
        };
    }
}

// Global instance
window.previewRenderer = null;

// Initialize
function initPreviewRenderer(scene, camera, renderer) {
    window.previewRenderer = new PreviewRenderer();
    window.previewRenderer.initialize(scene, camera, renderer);
    console.log('[Preview] Renderer initialized');
}

// Convenience function to render code
async function renderPreviewCode(html, css = '', js = '') {
    if (!window.previewRenderer) return { success: false, error: 'Renderer not initialized' };
    
    return await window.previewRenderer.renderCode(html, css, js);
}

// Export
window.PreviewRenderer = PreviewRenderer;
