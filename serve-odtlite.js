const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const ODTLITE_PATH = 'E:\\ODTLite';

const server = http.createServer((req, res) => {
    let filePath = path.join(ODTLITE_PATH, req.url === '/' ? 'index.html' : req.url);
    
    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.md': 'text/markdown',
        '.css': 'text/css',
        '.json': 'application/json'
    };
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<h1>404 Not Found</h1>');
            return;
        }
        
        res.writeHead(200, {'Content-Type': mimeTypes[ext] || 'application/octet-stream'});
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Serving ODTLite from: ${ODTLITE_PATH}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
