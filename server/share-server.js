/**
 * ODT Collaborative Share Server
 * Tribes Protocol-based peer collaboration
 * Allows multiple users to work together on projects
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Configuration
const PORT = process.env.SHARE_PORT || 9002;
const SHARE_PORT = process.env.SHARE_PORT || 9002;
const DATA_DIR = path.join(__dirname, '..', 'dashboard', 'data');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Ensure directories exist
[DATA_DIR, SCREENSHOTS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Active sessions & peers
const sessions = new Map();
const peers = new Map();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'dashboard')));

// ============ REST API ============

// Get active sessions
app.get('/api/sessions', (req, res) => {
    const sessionList = Array.from(sessions.entries()).map(([id, session]) => ({
        id,
        name: session.name,
        peers: session.peers.size,
        created: session.created,
        lastActivity: session.lastActivity
    }));
    res.json({ sessions: sessionList, total: sessionList.length });
});

// Create new share session
app.post('/api/sessions/create', (req, res) => {
    const { sessionName } = req.body;
    const sessionId = crypto.randomBytes(8).toString('hex');
    
    const session = {
        id: sessionId,
        name: sessionName || `Session ${sessionId.substring(0, 4)}`,
        peers: new Set(),
        projects: new Map(),
        created: new Date(),
        lastActivity: new Date(),
        protocol: 'tribes-1.0'
    };
    
    sessions.set(sessionId, session);
    
    res.json({
        success: true,
        sessionId,
        accessCode: sessionId.substring(0, 8).toUpperCase(),
        joinUrl: `odt://share/${sessionId}`
    });
});

// Join share session
app.post('/api/sessions/:sessionId/join', (req, res) => {
    const { sessionId } = req.params;
    const { peerId, peerName } = req.body;
    
    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    session.peers.add(peerId);
    session.lastActivity = new Date();
    
    peers.set(peerId, {
        id: peerId,
        name: peerName || 'Anonymous',
        sessionId,
        joined: new Date()
    });
    
    res.json({
        success: true,
        session: {
            id: session.id,
            name: session.name,
            peers: Array.from(session.peers),
            protocol: session.protocol
        }
    });
});

// Upload screenshot for sharing
app.post('/api/screenshots/upload', (req, res) => {
    const { imageData, sessionId, title } = req.body;
    
    if (!imageData || !sessionId) {
        return res.status(400).json({ error: 'Missing imageData or sessionId' });
    }
    
    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Session not found' });
    }
    
    try {
        // Remove data URL prefix
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const fileName = `${sessionId}_${Date.now()}_${title || 'screenshot'}.png`;
        const filePath = path.join(SCREENSHOTS_DIR, fileName);
        
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        res.json({
            success: true,
            fileName,
            url: `/api/screenshots/${fileName}`,
            timestamp: new Date()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get screenshot
app.get('/api/screenshots/:fileName', (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(SCREENSHOTS_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Screenshot not found' });
    }
    
    res.sendFile(filePath);
});

// List screenshots for session
app.get('/api/screenshots/session/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    try {
        const files = fs.readdirSync(SCREENSHOTS_DIR)
            .filter(f => f.startsWith(sessionId))
            .map(f => ({
                name: f,
                url: `/api/screenshots/${f}`,
                created: fs.statSync(path.join(SCREENSHOTS_DIR, f)).birthtime
            }))
            .sort((a, b) => b.created - a.created);
        
        res.json({ screenshots: files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bot-accessible screenshot endpoint (for AI analysis)
app.get('/api/bot/screenshot/:fileName', (req, res) => {
    const { fileName } = req.params;
    const filePath = path.join(SCREENSHOTS_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Screenshot not found' });
    }
    
    // Return as base64 for bot processing
    const imageData = fs.readFileSync(filePath);
    const base64 = imageData.toString('base64');
    
    res.json({
        success: true,
        fileName,
        format: 'png',
        base64: `data:image/png;base64,${base64}`,
        size: imageData.length,
        timestamp: fs.statSync(filePath).mtime
    });
});

// ============ WebSocket (Tribes Protocol) ============

wss.on('connection', (ws) => {
    const peerId = crypto.randomBytes(8).toString('hex');
    let sessionId = null;
    
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'join':
                    sessionId = message.sessionId;
                    const session = sessions.get(sessionId);
                    if (session) {
                        session.peers.add(peerId);
                        session.lastActivity = new Date();
                        
                        // Broadcast join event
                        broadcast(sessionId, {
                            type: 'peer-joined',
                            peerId,
                            peerName: message.peerName,
                            timestamp: new Date()
                        });
                        
                        ws.send(JSON.stringify({
                            type: 'joined',
                            success: true,
                            peerId,
                            peers: Array.from(session.peers)
                        }));
                    }
                    break;
                
                case 'project-update':
                    broadcast(sessionId, {
                        type: 'project-update',
                        peerId,
                        projectId: message.projectId,
                        changes: message.changes,
                        timestamp: new Date()
                    });
                    break;
                
                case 'screenshot-shared':
                    broadcast(sessionId, {
                        type: 'screenshot-shared',
                        peerId,
                        fileName: message.fileName,
                        title: message.title,
                        timestamp: new Date()
                    });
                    break;
                
                case 'chat-message':
                    broadcast(sessionId, {
                        type: 'chat-message',
                        peerId,
                        message: message.text,
                        timestamp: new Date()
                    });
                    break;
                
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: new Date() }));
                    break;
            }
        } catch (err) {
            console.error('WebSocket error:', err);
        }
    });
    
    ws.on('close', () => {
        if (sessionId) {
            const session = sessions.get(sessionId);
            if (session) {
                session.peers.delete(peerId);
                broadcast(sessionId, {
                    type: 'peer-left',
                    peerId,
                    timestamp: new Date()
                });
            }
        }
    });
});

function broadcast(sessionId, message) {
    const data = JSON.stringify(message);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

// ============ Health & Status ============

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ODT-Share-Server',
        timestamp: new Date(),
        sessions: sessions.size,
        peers: peers.size
    });
});

app.get('/api/status', (req, res) => {
    res.json({
        online: true,
        uptime: process.uptime(),
        sessions: sessions.size,
        peers: peers.size,
        memory: process.memoryUsage(),
        protocol: 'tribes-1.0',
        features: [
            'project-sharing',
            'real-time-sync',
            'screenshot-capture',
            'bot-integration',
            'websocket-protocol'
        ]
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║          ODT Collaborative Share Server                    ║
║                   Tribes Protocol v1.0                     ║
╚════════════════════════════════════════════════════════════╝

✓ Server running on: http://localhost:${PORT}
✓ WebSocket endpoint: ws://localhost:${PORT}
✓ Sessions: ${sessions.size}
✓ Connected peers: ${peers.size}

Share URL: odt://share/[sessionId]
API Docs: http://localhost:${PORT}/api/status

Press Ctrl+C to stop
    `);
});

module.exports = { app, server, sessions, peers };
