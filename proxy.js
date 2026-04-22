// ODT Proxy Server
// Simple CORS wrapper for Ollama
// Run: node proxy.js
// Access: http://localhost:9001

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

// Load config from .env file if exists
let config = {
    ollama: 'http://localhost:11434',
    proxy: 9001,
    model: 'phi:2.7b',
    modelsPath: ''
};

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length) {
                    const value = valueParts.join('=').trim();
                    if (key === 'OLLAMA_HOST') config.ollama = value;
                    if (key === 'PROXY_HOST') config.proxy = parseInt(value) || 9001;
                    if (key === 'MODEL') config.model = value;
                    if (key === 'MODELS_PATH') config.modelsPath = value;
                }
            }
        });
    } catch (e) {
        console.log('[Config] Using defaults');
    }
}

const OLLAMA_HOST = config.ollama;
const PROXY_PORT = 8080;
let llamaCppRunning = null;

// Get Ollama models directory
function getModelsDir() {
    if (config.modelsPath && fs.existsSync(config.modelsPath)) {
        return config.modelsPath;
    }
    const home = os.homedir();
    if (process.platform === 'win32') {
        return path.join(home, '.ollama', 'models');
    }
    return path.join(home, '.ollama', 'models');
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
        const ext = path.extname(fullPath);
        const contentType = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' }[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(fullPath));
        return;
    }

    // API: Generate (chat)
    if (req.url === '/api/generate' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.model || payload.model === 'default') {
                    payload.model = config.model;
                }
                
                const ollamaReq = http.request(`${OLLAMA_HOST}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (ollamaRes) => {
                    let data = '';
                    ollamaRes.on('data', chunk => data += chunk);
                    ollamaRes.on('end', () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(data);
                    });
                });
                
                ollamaReq.on('error', err => {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Ollama unavailable: ' + err.message }));
                });
                
                ollamaReq.write(JSON.stringify(payload));
                ollamaReq.end();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    // API: Chat (for newer Ollama)
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                if (!payload.model) {
                    payload.model = config.model;
                }
                
                const ollamaReq = http.request(`${OLLAMA_HOST}/api/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                }, (ollamaRes) => {
                    let data = '';
                    ollamaRes.on('data', chunk => data += chunk);
                    ollamaRes.on('end', () => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(data);
                    });
                });
                
                ollamaReq.on('error', err => {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message }));
                });
                
                ollamaReq.write(JSON.stringify(payload));
                ollamaReq.end();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    // API: List models
    } else if (req.url === '/api/tags' && req.method === 'GET') {
        const ollamaReq = http.request(`${OLLAMA_HOST}/api/tags`, {
            method: 'GET'
        }, (ollamaRes) => {
            let data = '';
            ollamaRes.on('data', chunk => data += chunk);
            ollamaRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        });
        
        ollamaReq.on('error', err => {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        });
        
        ollamaReq.end();
    // API: Upload GGUF file
    } else if (req.url === '/api/upload-gguf' && req.method === 'POST') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            try {
                body = Buffer.concat(body).toString();
                const boundary = req.headers['content-type'].split('boundary=')[1];
                const parts = body.split('--' + boundary);
                
                let fileName = '';
                let modelName = '';
                let fileData = null;
                
                parts.forEach(part => {
                    if (part.includes('filename=')) {
                        const match = part.match(/filename="([^"]+)"/);
                        if (match) fileName = match[1];
                    }
                    if (part.includes('name="name"')) {
                        const match = part.match(/name="name"\r\n\r\n([^\r\n]+)/);
                        if (match) modelName = match[1].trim();
                    }
                    if (part.includes('Content-Type:')) {
                        const dataMatch = part.match(/Content-Type:[^\r\n]+\r\n\r\n([\s\S]+)/);
                        if (dataMatch) fileData = dataMatch[1];
                    }
                });
                
                if (!modelName) {
                    modelName = fileName.replace(/\.(gguf|bin)$/i, '');
                }
                
                const modelsDir = getModelsDir();
                if (!fs.existsSync(modelsDir)) {
                    fs.mkdirSync(modelsDir, { recursive: true });
                }
                
                const targetPath = path.join(modelsDir, fileName);
                if (fileData) {
                    fs.writeFileSync(targetPath, fileData);
                }
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: true, 
                    name: modelName,
                    path: targetPath,
                    instructions: `GGUF saved. Now run:\nollama create ${modelName} -f "${fileName}"`
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    // API: Health check
    } else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', ollama: OLLAMA_HOST, model: config.model }));
    // API: Scan GGUF files
    } else if (req.url === '/api/scan-gguf' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const opts = JSON.parse(body);
                const scanPath = opts.path || config.modelsPath || getModelsDir();
                const files = [];
                if (fs.existsSync(scanPath)) {
                    const dirFiles = fs.readdirSync(scanPath);
                    dirFiles.forEach(f => {
                        if (f.endsWith('.gguf') || f.endsWith('.bin')) {
                            const fp = path.join(scanPath, f);
                            const stats = fs.statSync(fp);
                            files.push({ name: f, path: fp, size: stats.size });
                        }
                    });
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ path: scanPath, files }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
    // Root
    } else if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', proxy: 'ODT v2.0' }));
    // API: Llama.cpp server
    } else if (req.url === '/api/llama-cpp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const opts = JSON.parse(body);
                const modelName = opts.model;
                if (llamaCppRunning) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Server already running' }));
                    return;
                }
                const { spawn } = require('child_process');
                const exePath = process.platform === 'win32' ? 'llama-server.exe' : 'llama-server';
                const args = ['-m', modelName, '--port', '8888', '-c', '8192'];
                llamaCppRunning = spawn(exePath, args, { detached: true, stdio: 'pipe' });
                llamaCppRunning.stdout.on('data', d => console.log('[llama.cpp]', d.toString()));
                llamaCppRunning.stderr.on('data', d => console.log('[llama.cpp]', d.toString()));
                llamaCppRunning.on('close', () => { llamaCppRunning = null; console.log('[llama.cpp] stopped'); });
                setTimeout(() => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, port: 8888 }));
                }, 2000);
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
            }
        });
    } else if (req.url === '/api/llama-cpp' && req.method === 'DELETE') {
        if (llamaCppRunning) {
            llamaCppRunning.kill();
            llamaCppRunning = null;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
    } else if (req.url === '/api/llama-cpp' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ running: !!llamaCppRunning, port: llamaCppRunning ? 8888 : null }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

// Swarm Hub WebSocket Server
const swarmClients = new Map();
const SWARM_PORT = 9002;
const wss = new WebSocketServer({ port: SWARM_PORT });

function broadcastToSwarm(message, excludeClient = null) {
    const msgStr = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client !== excludeClient && client.readyState === 1) {
            client.send(msgStr);
        }
    });
}

function getMemberCount() {
    return wss.clients.size;
}

wss.on('connection', (ws, req) => {
    const clientId = 'user_' + Date.now();
    ws.clientId = clientId;
    swarmClients.set(clientId, { ws, name: 'Anonymous', role: '' });
    console.log('[Swarm] Client connected: ' + clientId + ' (total: ' + getMemberCount() + ')');

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            const client = swarmClients.get(ws.clientId);

            if (msg.type === 'join') {
                client.name = msg.name || 'Anonymous';
                client.role = msg.role || '';
                client.swarmName = msg.swarmName || 'default';
                ws.send(JSON.stringify({ type: 'system', text: 'Welcome, ' + client.name + '!' }));
                broadcastToSwarm({
                    type: 'member_join',
                    name: client.name,
                    memberCount: getMemberCount()
                }, ws);
            } else if (msg.type === 'message') {
                broadcastToSwarm({
                    type: 'message',
                    author: client.name,
                    authorId: ws.clientId,
                    text: msg.text,
                    role: client.role,
                    isBot: msg.isBot || false
                }, ws);
            } else if (msg.type === 'code') {
                broadcastToSwarm({
                    type: 'code',
                    author: client.name,
                    authorId: ws.clientId,
                    code: msg.code,
                    lang: msg.lang || 'unknown'
                }, ws);
            } else if (msg.type === 'build') {
                broadcastToSwarm({
                    type: 'build',
                    author: client.name,
                    authorId: ws.clientId,
                    title: msg.title,
                    desc: msg.desc,
                    tags: msg.tags || []
                }, ws);
            } else if (msg.type === 'status') {
                broadcastToSwarm({
                    type: 'status',
                    author: client.name,
                    authorId: ws.clientId,
                    text: msg.text
                }, ws);
            }
        } catch (e) {
            console.log('[Swarm] Error: ' + e.message);
        }
    });

    ws.on('close', () => {
        const client = swarmClients.get(ws.clientId);
        if (client) {
            broadcastToSwarm({
                type: 'member_leave',
                name: client.name,
                memberCount: getMemberCount()
            });
            swarmClients.delete(ws.clientId);
        }
        console.log('[Swarm] Client disconnected: ' + ws.clientId + ' (total: ' + getMemberCount() + ')');
    });
});

server.listen(PROXY_PORT, () => {
    console.log('═'.repeat(35));
    console.log('[ODT Proxy] Running on http://localhost:' + PROXY_PORT);
    console.log('[ODT Proxy] Swarm: ws://localhost:' + SWARM_PORT + '/swarm');
    console.log('[ODT Proxy] Ollama: ' + OLLAMA_HOST);
    console.log('[ODT Proxy] Model: ' + config.model);
    console.log('[ODT Proxy] Models: ' + getModelsDir());
    console.log('═'.repeat(35));
});