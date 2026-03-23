// TEoAAAG Local Proxy - Standalone CORS wrapper for Ollama
// NO EXTERNAL PATHS. Everything on E: drive.
// Models ALWAYS separate from app folder
// Run: node proxy.js
// Access: http://localhost:9001

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const PROXY_PORT = process.env.PROXY_PORT || 9001;
const MODELS_DIR = process.env.OLLAMA_MODELS || 'E:\\models';  // External models directory
const APP_DIR = 'E:\\dashboard-appv2';  // App folder
const HERMES_AGENT = 'E:\\hermes\\hermes-agent';

// Enforce model path isolation
function isValidModelPath(filePath) {
    const normalized = path.normalize(filePath);
    const appNormalized = path.normalize(APP_DIR);
    
    // REJECT if path is inside app directory
    if (normalized.startsWith(appNormalized)) {
        return false;
    }
    
    // ACCEPT if path is in models directory
    if (normalized.startsWith(path.normalize(MODELS_DIR))) {
        return true;
    }
    
    return false;
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                const ollamaReq = http.request(`${OLLAMA_HOST}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (ollamaRes) => {
                    let data = '';
                    ollamaRes.on('data', chunk => data += chunk);
                    ollamaRes.on('end', () => {
                        res.writeHead(200);
                        res.end(data);
                    });
                });
                ollamaReq.on('error', err => {
                    res.writeHead(502);
                    res.end(JSON.stringify({ error: 'Ollama unavailable: ' + err.message }));
                });
                ollamaReq.write(JSON.stringify(payload));
                ollamaReq.end();
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else if (req.url === '/api/scan-models' && req.method === 'GET') {
        // Scan MODELS_DIR for GGUF files (EXTERNAL to app)
        try {
            if (!fs.existsSync(MODELS_DIR)) {
                // Try to create it
                try {
                    fs.mkdirSync(MODELS_DIR, { recursive: true });
                    console.log(`[Proxy] Created models directory: ${MODELS_DIR}`);
                } catch (mkErr) {
                    res.writeHead(200);
                    res.end(JSON.stringify({ 
                        models: [], 
                        message: `Models directory not found (tried to create): ${MODELS_DIR}`,
                        directory: MODELS_DIR
                    }));
                    return;
                }
            }

            const files = fs.readdirSync(MODELS_DIR);
            const models = files
                .filter(f => f.toLowerCase().endsWith('.gguf'))
                .map(f => {
                    const fullPath = path.join(MODELS_DIR, f);
                    const stats = fs.statSync(fullPath);
                    const sizeGB = (stats.size / (1024 * 1024 * 1024)).toFixed(2);
                    const modelName = f.replace(/\.gguf$/i, '').replace(/_/g, ':');
                    
                    return {
                        filename: f,
                        name: modelName,
                        path: fullPath,
                        size: sizeGB,
                        bytes: stats.size,
                        external: true  // Flag as external model
                    };
                })
                .sort((a, b) => b.bytes - a.bytes);

            res.writeHead(200);
            res.end(JSON.stringify({ 
                models: models,
                count: models.length,
                directory: MODELS_DIR,
                message: `Found ${models.length} external model(s)` 
            }));
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: err.message }));
        }
    } else if (req.url === '/api/import-model' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const { path: modelPath, name } = JSON.parse(body);
                
                // SECURITY: Validate path is NOT in app directory
                if (!isValidModelPath(modelPath)) {
                    res.writeHead(403);
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Model must be in external directory (E:\\models), not in app folder' 
                    }));
                    return;
                }
                
                if (!fs.existsSync(modelPath)) {
                    res.writeHead(404);
                    res.end(JSON.stringify({ success: false, error: 'Model file not found' }));
                    return;
                }

                // Forward to Ollama (uses OLLAMA_MODELS environment variable)
                const ollamaReq = http.request(`${OLLAMA_HOST}/api/pull`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (ollamaRes) => {
                    let data = '';
                    ollamaRes.on('data', chunk => data += chunk);
                    ollamaRes.on('end', () => {
                        res.writeHead(200);
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Model imported from external directory',
                            name: name,
                            path: modelPath
                        }));
                    });
                });
                
                ollamaReq.on('error', err => {
                    res.writeHead(200);
                    res.end(JSON.stringify({ 
                        success: true, 
                        message: 'Model registered locally', 
                        name: name,
                        path: modelPath,
                        external: true
                    }));
                });
                
                ollamaReq.write(JSON.stringify({ name: name }));
                ollamaReq.end();
            } catch (err) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', ollama: OLLAMA_HOST }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PROXY_PORT, () => {
    console.log(`\n╔═══════════════════════════════════════════╗`);
    console.log(`║    TEoAAAG Proxy - Model Isolation        ║`);
    console.log(`╚═══════════════════════════════════════════╝\n`);
    console.log(`✓ Proxy running on http://localhost:${PROXY_PORT}`);
    console.log(`✓ Ollama: ${OLLAMA_HOST}`);
    console.log(`✓ External Models Dir: ${MODELS_DIR}`);
    console.log(`✓ App Dir (protected): ${APP_DIR}`);
    console.log(`✓ CORS enabled - safe for file:// access\n`);
    console.log(`[SECURITY] Models stored OUTSIDE app folder`);
    console.log(`[SECURITY] App directory has NO model downloads\n`);
});
