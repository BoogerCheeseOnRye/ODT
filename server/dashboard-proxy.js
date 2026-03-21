const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const DASHBOARD_PORT = 8080;
const PROXY_PORT = 9001;
const OLLAMA_HOST = 'http://localhost:11434';
const MODELS_DIR = 'E:\\models';

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
console.log(`║         TEoAAAG - Network Server        ║`);
console.log(`╚════════════════════════════════════════╝\n`);
console.log(`Local IP: ${LOCAL_IP}`);
console.log(`Dashboard: http://${LOCAL_IP}:${DASHBOARD_PORT}`);
console.log(`Proxy: http://${LOCAL_IP}:${PROXY_PORT}`);
console.log(`\n📱 From tablet on same WiFi:\n   http://${LOCAL_IP}:${DASHBOARD_PORT}\n`);

// Scan for GGUF model files
async function scanForModels(scanDir = MODELS_DIR) {
    const models = [];
    
    try {
        if (!fs.existsSync(scanDir)) {
            return { models: [], error: `Directory not found: ${scanDir}` };
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
                    discovered: true
                });
            }
        }
        
        return { models, count: models.length };
    } catch (err) {
        return { models: [], error: err.message };
    }
}

// Import model to Ollama via modelfile
async function importModel(modelPath, modelName) {
    try {
        const modelfile = `FROM ${modelPath}\nPARAMETER top_k 40\nPARAMETER top_p 0.9\nPARAMETER temperature 0.8`;
        const modelfilePath = path.join(os.tmpdir(), `Modelfile_${Date.now()}`);
        
        fs.writeFileSync(modelfilePath, modelfile);
        
        const { stdout, stderr } = await execAsync(`ollama create ${modelName} -f ${modelfilePath}`, {
            timeout: 30000,
            maxBuffer: 10 * 1024 * 1024
        });
        
        fs.unlinkSync(modelfilePath);
        
        return { success: true, message: `Model ${modelName} imported` };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Dashboard Server with dynamic API config injection
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
        if (ext === '.html') {
            let html = content.toString('utf-8');
            
            // Inject config script before the closing </head>
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
            
            // Also update the script configuration
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

// Proxy Server (CORS bridge to Ollama)
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

    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }

    // Model scanning endpoint
    if (req.url === '/api/scan-models' && req.method === 'GET') {
        const result = await scanForModels();
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

    if (req.url === '/api/pull' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
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
});

// Shutdown
process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    dashboardServer.close();
    proxyServer.close();
    process.exit(0);
});
