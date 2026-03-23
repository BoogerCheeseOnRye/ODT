// Example Library File
// Name: gordon-testbench.lib.js
// Description: Gordon automated testing library
// Dependencies: None

// Gordon Testbench System
let gordonTestCount = 0, gordonTestRunning = false;
const gordonMessages = [
    'Hello! Gordon testbench running live interaction tests.',
    'Analyzing dashboard performance and UI responsiveness.',
    'Testing chat system with live message injection.',
    'All interactions logged for dataset collection.',
    'Testbench session complete - data saved to results.'
];

function openGordonTestbench() {
    // Create modal if doesn't exist
    let modal = document.getElementById('gordonTestbenchModal');
    if (!modal) {
        const html = `<div id="gordonTestbenchModal" class="modal active">
            <div class="modal-content" style="max-width: 600px; max-height: 80vh;">
                <div class="modal-header">
                    <span>🤖 Gordon Live Testbench</span>
                    <button class="modal-close" onclick="closeGordonTestbench()">✕</button>
                </div>
                <div class="modal-body" style="display: flex; flex-direction: column; height: 100%;">
                    <div style="margin-bottom: 12px;">
                        <div class="section-label">Interaction Log</div>
                        <div id="gordonLog" style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 10px; height: 200px; overflow-y: auto; font-family: Courier New, monospace; font-size: 9px; color: #58a6ff; line-height: 1.4; margin-bottom: 12px;"><div style="color: #6b7280;">[Ready...]</div></div>
                    </div>
                    <div class="section-label">Test Controls</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;">
                        <button class="model-btn" style="background: #3b82f6; border-color: #1d4ed8; color: #fff;" onclick="runGordonAutoTest()">▶️ Auto Test</button>
                        <button class="model-btn" style="background: #10b981; border-color: #059669; color: #fff;" onclick="runGordonSingleTest()">➕ Send 1</button>
                    </div>
                    <input type="text" id="gordonCustomMsg" class="modal-input" placeholder="Custom message..." style="margin-bottom: 6px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;">
                        <button class="model-btn" style="background: #f59e0b; border-color: #d97706; color: #fff;" onclick="sendGordonCustom()">📤 Send</button>
                        <button class="model-btn" onclick="clearGordonLog()">🗑️ Clear</button>
                    </div>
                    <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; font-size: 10px; color: #8b949e; line-height: 1.5;">
                        <div style="color: #58a6ff; font-weight: 600; margin-bottom: 4px;">Status</div>
                        <div>Injected: <span id="gordonCount">0</span> | Mode: <span id="gordonMode">Ready</span></div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    }
    document.getElementById('gordonTestbenchModal').classList.add('active');
    logGordon('Testbench ready. Click Auto Test or Send Custom Message.');
}

function closeGordonTestbench() {
    const modal = document.getElementById('gordonTestbenchModal');
    if (modal) modal.classList.remove('active');
}

function logGordon(msg, type) {
    const log = document.getElementById('gordonLog');
    if (!log) return;
    const ts = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.textContent = '[' + ts + '] ' + msg;
    if (type === 'send') line.style.color = '#34d399';
    if (type === 'inject') line.style.color = '#58a6ff';
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
}

function clearGordonLog() {
    const log = document.getElementById('gordonLog');
    if (log) log.innerHTML = '';
    gordonTestCount = 0;
    const count = document.getElementById('gordonCount');
    if (count) count.textContent = '0';
    logGordon('Log cleared.');
}

async function runGordonAutoTest() {
    if (gordonTestRunning) return;
    gordonTestRunning = true;
    gordonTestCount = 0;
    const mode = document.getElementById('gordonMode');
    if (mode) mode.textContent = 'Auto Running';
    logGordon('Starting auto test (' + gordonMessages.length + ' msgs)...');
    
    for (let i = 0; i < gordonMessages.length; i++) {
        logGordon('Message ' + (i + 1) + '/' + gordonMessages.length, 'send');
        injectGordonMessage(gordonMessages[i]);
        gordonTestCount++;
        const count = document.getElementById('gordonCount');
        if (count) count.textContent = gordonTestCount;
        await new Promise(r => setTimeout(r, 1500));
        logGordon('Message received', 'inject');
        await new Promise(r => setTimeout(r, 1000));
    }
    if (mode) mode.textContent = 'Ready';
    gordonTestRunning = false;
    logGordon('Auto test complete!');
}

function runGordonSingleTest() {
    const msg = gordonMessages[Math.floor(Math.random() * gordonMessages.length)];
    logGordon('Sending 1 message...', 'send');
    injectGordonMessage(msg);
    gordonTestCount++;
    const count = document.getElementById('gordonCount');
    if (count) count.textContent = gordonTestCount;
    logGordon('Message injected', 'inject');
}

function sendGordonCustom() {
    const input = document.getElementById('gordonCustomMsg');
    if (!input) { logGordon('Error: input not found'); return; }
    const msg = input.value.trim();
    if (!msg) { logGordon('Enter a message', 'info'); return; }
    logGordon('Custom: "' + msg + '"', 'send');
    injectGordonMessage(msg);
    gordonTestCount++;
    const count = document.getElementById('gordonCount');
    if (count) count.textContent = gordonTestCount;
    logGordon('Message injected', 'inject');
    input.value = '';
}

function injectGordonMessage(message) {
    try {
        const chatContainer = document.getElementById('chat-responses');
        if (!chatContainer) { logGordon('Error: chat not found'); return; }
        const div = document.createElement('div');
        div.className = 'response bot';
        const label = document.createElement('div');
        label.className = 'response-label';
        label.textContent = '🤖 Gordon';
        const content = document.createElement('div');
        content.textContent = '[GORDON] ' + message;
        div.appendChild(label);
        div.appendChild(content);
        chatContainer.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (err) {
        logGordon('Injection failed: ' + err.message);
    }
}

console.log('[TEoAAAG] Gordon Testbench library loaded');
