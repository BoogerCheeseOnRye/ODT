// TEoAAAG Local Proxy - Standalone CORS wrapper for Ollama
// NO EXTERNAL PATHS. Everything on E: drive.
// Run: node proxy.js
// Access: http://localhost:9001

const http = require('http');
const OLLAMA_HOST = 'http://localhost:11434';
const PROXY_PORT = 9001;
const MODELS_DIR = 'E:\\models';
const HERMES_AGENT = 'E:\\hermes\\hermes-agent';

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
    } else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok', ollama: OLLAMA_HOST }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PROXY_PORT, () => {
    console.log(`[TEoAAAG Proxy] Running on http://localhost:${PROXY_PORT}`);
    console.log(`[TEoAAAG Proxy] Forwarding to Ollama at ${OLLAMA_HOST}`);
    console.log(`[TEoAAAG Proxy] CORS enabled - safe for file:// access`);
});
