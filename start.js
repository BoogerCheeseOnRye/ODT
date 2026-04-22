// ═══════════════════════════════════════════════════════════════════
// ODT v2 — The Repliting · Standalone Server
// No dependencies required — pure Node.js built-ins only
// Run: node start.js    →  http://localhost:5000
// ═══════════════════════════════════════════════════════════════════
const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

const PORT   = process.env.PORT || 5000;
const HOST   = process.env.HOST || '0.0.0.0';
const OLLAMA = process.env.OLLAMA_URL || 'http://localhost:11434';
const DIR    = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.wav':  'audio/wav',
  '.mp3':  'audio/mpeg',
  '.ogg':  'audio/ogg',
  '.ico':  'image/x-icon',
};

// ── Static file helper ──────────────────────────────────────────
function serveFile(filePath, res) {
  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
}

// ── Ollama proxy helper ─────────────────────────────────────────
function proxyOllama(req, res, ollamaPath) {
  const parsed = url.parse(OLLAMA);
  const options = {
    hostname: parsed.hostname,
    port:     parsed.port || 11434,
    path:     ollamaPath,
    method:   req.method,
    headers:  { 'Content-Type': 'application/json' },
  };
  const proxy = http.request(options, pr => {
    res.writeHead(pr.statusCode, {
      'Content-Type': pr.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*',
    });
    pr.pipe(res);
  });
  proxy.on('error', () => { res.writeHead(503); res.end(JSON.stringify({ error: 'Ollama not running' })); });
  req.pipe(proxy);
}

// ── Main request handler ────────────────────────────────────────
const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    res.end(); return;
  }

  // API proxy → Ollama
  if (pathname.startsWith('/api/')) {
    proxyOllama(req, res, pathname); return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, time: Date.now() })); return;
  }

  // Route aliases
  const routes = { '/': 'index.html', '/swarm': 'swarm.html', '/odt': 'odt.html' };
  const filePath = path.join(DIR, routes[pathname] || pathname.slice(1) || 'index.html');

  // Security: prevent directory traversal
  if (!filePath.startsWith(DIR)) { res.writeHead(403); res.end('Forbidden'); return; }

  serveFile(filePath, res);
});

server.listen(PORT, HOST, () => {
  console.log('\n╔════════════════════════════════════╗');
  console.log('║   ODT v2 — The Repliting           ║');
  console.log('╚════════════════════════════════════╝');
  console.log(`GameDev Suite → http://localhost:${PORT}`);
  console.log(`Swarm Hub     → http://localhost:${PORT}/swarm`);
  console.log(`ODT Dashboard → http://localhost:${PORT}/odt`);
  console.log(`Ollama proxy  → ${OLLAMA}\n`);
});
