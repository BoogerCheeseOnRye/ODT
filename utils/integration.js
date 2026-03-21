/**
 * ODT Dashboard - Share Server & Screenshot Integration
 * Consolidated feature module for collaboration
 */

// ============ SHARE SERVER ============

let shareSession = null;
let shareWebSocket = null;

function openShareServerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'shareServerModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <span>Collaborative Share Server</span>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px; margin-bottom: 16px;">
                    <div style="color: #58a6ff; font-weight: 600; margin-bottom: 4px;">🌐 Tribes Protocol Sharing</div>
                    <div style="color: #8b949e; font-size: 10px; line-height: 1.6;">
                        Work together with others on projects. Real-time sync, screenshot sharing, and bot assistance.
                    </div>
                </div>

                <div id="shareSessionStatus" style="display: none; background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
                    <div style="color: #34d399; font-weight: 600; margin-bottom: 8px;">✓ Connected</div>
                    <div style="font-size: 10px; color: #8b949e;">
                        Session ID: <code id="sessionIdDisplay" style="color: #58a6ff;"></code><br>
                        Peers: <span id="peerCount" style="color: #58a6ff;">1</span><br>
                        Status: <span id="shareStatus" style="color: #58a6ff;">Active</span>
                    </div>
                </div>

                <div id="shareSessionForm" style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 6px; color: #c9d1d9; font-size: 11px;">Session Name</label>
                        <input type="text" id="sessionNameInput" class="modal-input" placeholder="e.g., TEoAAAG Dev Team" value="ODT Session">
                    </div>

                    <button class="model-btn" style="background: #10b981; border-color: #059669; color: #fff; margin-bottom: 8px;" onclick="createShareSession()">
                        ✨ Create New Session
                    </button>

                    <div style="margin-bottom: 12px;">
                        <label style="display: block; margin-bottom: 6px; color: #c9d1d9; font-size: 11px;">Join Existing</label>
                        <input type="text" id="joinCodeInput" class="modal-input" placeholder="Session ID or 8-char code">
                        <button class="model-btn" style="margin-top: 6px;" onclick="joinShareSession()">Join Session</button>
                    </div>
                </div>

                <div id="activePeers" style="display: none; margin-top: 12px; padding-top: 12px; border-top: 1px solid #30363d;">
                    <div style="color: #58a6ff; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Connected Peers</div>
                    <div id="peersList" style="font-size: 10px; color: #8b949e;"></div>
                </div>

                <div style="margin-top: 12px; display: flex; gap: 6px;">
                    <button class="model-btn" style="flex: 1;" id="shareCloseBtn" onclick="this.closest('.modal').remove()">Close</button>
                    <button class="model-btn" style="flex: 1; background: #3b82f6; border-color: #1d4ed8; color: #fff; display: none;" id="disconnectBtn" onclick="disconnectShareServer()">Disconnect</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

async function createShareSession() {
    const sessionName = document.getElementById('sessionNameInput').value;

    try {
        const res = await fetch('/api/sessions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionName })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        shareSession = data;
        displayShareSessionActive(data);
        connectShareWebSocket(data.sessionId);
        addResponse('System', `✨ Share session created: ${data.accessCode}`);
    } catch (err) {
        addResponse('Error', `Failed to create session: ${err.message}`);
    }
}

async function joinShareSession() {
    const code = document.getElementById('joinCodeInput').value.trim();

    try {
        const res = await fetch(`/api/sessions/${code}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                peerId: crypto.getRandomValues(new Uint8Array(8)).toString(),
                peerName: 'User'
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        shareSession = data.session;
        displayShareSessionActive(data.session);
        connectShareWebSocket(code);
        addResponse('System', `🤝 Joined session: ${data.session.name}`);
    } catch (err) {
        addResponse('Error', `Failed to join: ${err.message}`);
    }
}

function displayShareSessionActive(session) {
    document.getElementById('shareSessionForm').style.display = 'none';
    document.getElementById('shareSessionStatus').style.display = 'block';
    document.getElementById('activePeers').style.display = 'block';
    document.getElementById('disconnectBtn').style.display = 'block';

    document.getElementById('sessionIdDisplay').textContent = session.id || session.sessionId;
    document.getElementById('peerCount').textContent = session.peers?.length || 1;
    document.getElementById('shareStatus').textContent = 'Connected';
}

function connectShareWebSocket(sessionId) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    shareWebSocket = new WebSocket(wsUrl);

    shareWebSocket.onopen = () => {
        shareWebSocket.send(JSON.stringify({
            type: 'join',
            sessionId: sessionId,
            peerName: 'Dashboard User'
        }));
    };

    shareWebSocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleShareMessage(message);
    };

    shareWebSocket.onerror = (err) => {
        console.error('WebSocket error:', err);
        addResponse('Error', 'Connection failed');
    };
}

function handleShareMessage(message) {
    switch (message.type) {
        case 'peer-joined':
            addResponse('System', `🤝 ${message.peerName} joined`);
            break;
        case 'peer-left':
            addResponse('System', `👋 Peer left`);
            break;
        case 'screenshot-shared':
            addResponse('System', `📸 ${message.peerName} shared screenshot`);
            break;
        case 'project-update':
            addResponse('System', `📝 Project updated by peer`);
            break;
        case 'chat-message':
            addResponse('Peer', message.message);
            break;
    }
}

function disconnectShareServer() {
    if (shareWebSocket) {
        shareWebSocket.close();
        shareWebSocket = null;
    }
    shareSession = null;
    addResponse('System', '👋 Disconnected from share server');
}

// ============ SCREENSHOT ============

async function takeScreenshot() {
    const title = prompt('Screenshot title (optional):', 'dashboard-screenshot');
    if (title === null) return;

    addResponse('System', '📸 Capturing screenshot...');

    try {
        // Try html2canvas first
        if (typeof html2canvas === 'undefined') {
            // Load from CDN
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }

        const canvas = await html2canvas(document.body, {
            backgroundColor: '#0d1117',
            scale: 2,
            logging: false,
            allowTaint: true,
            useCORS: true
        });

        const imageData = canvas.toDataURL('image/png');

        // Save locally
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `${title || 'screenshot'}_${Date.now()}.png`;
        link.click();

        // Upload to share server if connected
        if (shareSession) {
            await uploadScreenshot(imageData, shareSession.id, title);
        }

        addResponse('System', '✓ Screenshot captured and saved');
    } catch (err) {
        addResponse('Error', `Screenshot failed: ${err.message}`);
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function uploadScreenshot(imageData, sessionId, title) {
    try {
        const res = await fetch('/api/screenshots/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageData, sessionId, title })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Broadcast to peers
        if (shareWebSocket) {
            shareWebSocket.send(JSON.stringify({
                type: 'screenshot-shared',
                fileName: data.fileName,
                title: title
            }));
        }

        return data;
    } catch (err) {
        console.error('Upload error:', err);
    }
}

// ============ INITIALIZATION ============

// Load features on page ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ Share & Screenshot features loaded');
});

// Export for bots
if (typeof window !== 'undefined') {
    window.shareServer = {
        createSession: createShareSession,
        joinSession: joinShareSession,
        disconnect: disconnectShareServer,
        takeScreenshot: takeScreenshot,
        uploadScreenshot: uploadScreenshot
    };
}
