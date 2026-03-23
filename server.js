const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const DriveConfig = require('./drive-config');
const setupWizardHandler = require('./setup-wizard-api');

// Initialize drive configuration
const driveConfig = new DriveConfig();

// Configuration
const DASHBOARD_PORT = process.env.DASHBOARD_PORT || 8080;
const PROXY_PORT = process.env.PROXY_PORT || 9001;
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const APP_DIR = path.normalize(__dirname);

// Get models directory from config (or use default)
let MODELS_DIR = process.env.OLLAMA_MODELS;
if (!MODELS_DIR && driveConfig.isConfigured()) {
    MODELS_DIR = driveConfig.getModelsDir();
} else if (!MODELS_DIR) {
    MODELS_DIR = path.join(process.env.USERPROFILE || os.homedir(), 'teoaaag-data', 'models');
}

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

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const LOCAL_IP = getLocalIP();

console.log(`\n╔════════════════════════════════════════╗`);
console.log(`║    TEoAAAG - Dynamic Drive Config     ║`);
console.log(`╚════════════════════════════════════════╝\n`);
console.log(`Local IP: ${LOCAL_IP}`);
console.log(`Dashboard: http://${LOCAL_IP}:${DASHBOARD_PORT}`);
console.log(`Proxy: http://${LOCAL_IP}:${PROXY_PORT}`);
console.log(`Models Directory: ${MODELS_DIR}`);
console.log(`Configuration Status: ${driveConfig.isConfigured() ? 'CONFIGURED' : 'SETUP REQUIRED'}`);
console.log(`\n📱 From tablet on same WiFi:\n   http://${LOCAL_IP}:${DASHBOARD_PORT}\n`);

// Scan for GGUF model files in configured directory
function scanForModels(scanDir = MODELS_DIR) {
    const models = [];
    
    try {
        if (!fs.existsSync(scanDir)) {
            try {
                fs.mkdirSync(scanDir, { recursive: true });
                console.log(`[Server] Created models directory: ${scanDir}`);
            } catch (mkErr) {
                return { models: [], error: `Directory not found and could not create: ${scanDir}` };
            }
        }

        const files = fs.readdirSync(scanDir);
        
        for (const file of files) {
            const fullPath = path.join(scanDir, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isFile() && file.endsWith('.gguf')) {
                const sizeGB = (stat.size / 1024 / 1024 / 1024).toFixed(2);
                const modelName = file.replace('.gguf', '').replace(/_/g, ':');
                
                models.push({
                    filename: file,
                    path: fullPath,
                    name: modelName,
                    size: sizeGB,
                    sizeBytes: stat.size,
                    external: true
                });
            }
        }
        
        return { models, count: models.length, directory: scanDir };
    } catch (err) {
        return { models: [], error: err.message };
    }
}

// Import model from external directory
async function importModel(modelPath, modelName) {
    try {
        if (!isValidModelPath(modelPath)) {
            return { 
                success: false, 
                error: 'Model path must be in external directory, not app folder'
            };
        }
        
        const modelfile = `FROM ${modelPath}\nPARAMETER top_k 40\nPARAMETER top_p 0.9\nPARAMETER temperature 0.8`;
        const modelfilePath = path.join(os.tmpdir(), `Modelfile_${Date.now()}`);
        
        fs.writeFileSync(modelfilePath, modelfile);
        
        const { stdout, stderr } = await execAsync(`ollama create ${modelName} -f ${modelfilePath}`, {
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024
        });
        
        fs.unlinkSync(modelfilePath);
        
        return { success: true, message: `Model ${modelName} imported from external directory`, external: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Dashboard Server with setup wizard integration
const dashboardServer = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Route setup wizard API calls to setup handler
    if (req.url.startsWith('/api/setup/')) {
        return setupWizardHandler(req, res);
    }

    // If not configured and not requesting setup, serve setup wizard
    if (!driveConfig.isConfigured() && req.url === '/') {
        return fs.readFile(path.join(__dirname, 'setup-wizard.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Setup wizard not found');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content);
        });
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    // Security: prevent directory traversal
    const normalizedPath = path.normalize(filePath);
    const baseDir = path.normalize(__dirname);
    if (!normalizedPath.startsWith(baseDir)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access denied');
        return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File not found</h1>');
            } else {
                res.writeHead(500);
                res.end('Server error');
            }
            return;
        }

        const ext = path.extname(filePath);
        const contentTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };

        let contentType = contentTypes[ext] || 'application/octet-stream';

        // For HTML files, inject API config
        if (ext === '.html' && filePath.endsWith('index.html')) {
            let html = content.toString('utf-8');
            
            const configScript = `
    <script>
        // Network API Configuration
        (function() {
            const isNetworkMode = window.location.protocol !== 'file:';
            const host = window.location.hostname;
            const port = 9001;
            
            window.API_ENDPOINTS = {
                PROXY_API: \`http://\${host}:\${port}/api/generate\`,
                PROXY_HOST: \`http://\${host}:\${port}\`,
                OLLAMA_HOST: \`http://\${host}:\${port}\`,
                API_BASE: \`http://\${host}:\${port}\`
            };
            
            window.IS_NETWORK_MODE = isNetworkMode;
            console.log('[TEoAAAG] Network Config Loaded');
            console.log('[TEoAAAG] API Base: ' + window.API_ENDPOINTS.API_BASE);
        })();
    </script>`;

            html = html.replace('</head>', configScript + '\n</head>');
            
            html = html.replace(
                /const PROXY_API = 'http:\/\/localhost:9001\/api\/generate';[\s\S]*?const MODEL = 'qwen2\.5:7b';/,
                `const PROXY_API = window.API_ENDPOINTS?.PROXY_API || 'http://localhost:9001/api/generate';
        const OLLAMA_HOST = window.API_ENDPOINTS?.OLLAMA_HOST || 'http://localhost:11434';
        const PROXY_HOST = window.API_ENDPOINTS?.PROXY_HOST || 'http://localhost:9001';
        const MODEL = 'qwen2.5:7b';`
            );
            
            content = Buffer.from(html, 'utf-8');
        }

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

// Proxy Server (CORS bridge to Ollama + Setup API)
const proxyServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Setup wizard API routes
    if (req.url.startsWith('/api/setup/')) {
        return setupWizardHandler(req, res);
    }

    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    // Model scanning endpoint
    if (req.url === '/api/scan-models' && req.method === 'GET') {
        const result = scanForModels();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
        return;
    }

    // Model import endpoint
    if (req.url === '/api/import-model' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                
                if (!isValidModelPath(data.path)) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Model must be in external directory, not in app folder' 
                    }));
                    return;
                }
                
                const result = await importModel(data.path, data.name);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const ollamaReq = http.request(OLLAMA_HOST + '/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (ollamaRes) => {
                    let responseBody = '';
                    ollamaRes.on('data', chunk => { responseBody += chunk; });
                    ollamaRes.on('end', () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(responseBody);
                    });
                });

                ollamaReq.on('error', (err) => {
                    console.error('Ollama error:', err.message);
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Ollama unavailable' }));
                });

                ollamaReq.write(JSON.stringify(data));
                ollamaReq.end();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    if (req.url === '/api/tags' && req.method === 'GET') {
        const ollamaReq = http.request(OLLAMA_HOST + '/api/tags', {
            method: 'GET'
        }, (ollamaRes) => {
            let responseBody = '';
            ollamaRes.on('data', chunk => { responseBody += chunk; });
            ollamaRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(responseBody);
            });
        });

        ollamaReq.on('error', (err) => {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Ollama unavailable' }));
        });

        ollamaReq.end();
        return;
    }

    // /api/pull is discouraged - use /api/import-model instead
    if (req.url === '/api/pull' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                console.warn('[Proxy] WARNING: /api/pull called - models may not be in external directory');
                
                const ollamaReq = http.request(OLLAMA_HOST + '/api/pull', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (ollamaRes) => {
                    let responseBody = '';
                    ollamaRes.on('data', chunk => { responseBody += chunk; });
                    ollamaRes.on('end', () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(responseBody);
                    });
                });

                ollamaReq.on('error', (err) => {
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Ollama unavailable' }));
                });

                ollamaReq.write(JSON.stringify(data));
                ollamaReq.end();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// Start servers
dashboardServer.listen(DASHBOARD_PORT, '0.0.0.0', () => {
    console.log(`✓ Dashboard listening on :${DASHBOARD_PORT}`);
});

proxyServer.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log(`✓ Proxy listening on :${PROXY_PORT}`);
    console.log(`\n[SECURITY] Models stored OUTSIDE app folder`);
    console.log(`[SECURITY] App directory has NO model downloads`);
    console.log(`[SECURITY] Dynamic drive configuration enabled\n`);
});

// Shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    dashboardServer.close();
    proxyServer.close();
    process.exit(0);
});
