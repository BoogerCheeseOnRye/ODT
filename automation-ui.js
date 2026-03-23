// ODT - Automation UI Drawer
// Drawer interface for automation control and live monitoring

const AUTOMATION_UI = `
<!-- Automation Drawer Toggle Button -->
<button class="automation-drawer-toggle" id="automationToggle" onclick="toggleAutomationDrawer()" title="Automation Engine">🤖 Automate</button>

<!-- Automation Drawer -->
<div class="automation-drawer" id="automationDrawer">
    <div class="automation-drawer-header">
        <h2>🤖 Automation Engine</h2>
        <button class="drawer-close" onclick="toggleAutomationDrawer()">✕</button>
    </div>

    <div class="automation-drawer-content">
        <!-- Control Panel -->
        <div class="automation-section">
            <div class="section-header">
                <h3>⚙️ Control Panel</h3>
                <button class="collapse-btn" onclick="toggleSection(this)">−</button>
            </div>
            <div class="section-body">
                <!-- Duration Slider -->
                <div class="control-group">
                    <label>⏱️ Duration (seconds)</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="range" id="durationSlider" min="10" max="600" value="60" onchange="updateDurationDisplay(this.value)" style="flex: 1;">
                        <span id="durationDisplay" style="min-width: 40px; text-align: center; color: #58a6ff; font-weight: 600;">60s</span>
                    </div>
                </div>

                <!-- Just Build Toggle -->
                <div class="control-group">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" id="justBuildToggle" onchange="updateConfig()">
                        <span>⚡ Just Build It (skip planning)</span>
                    </label>
                </div>

                <!-- Token Rate -->
                <div class="control-group">
                    <label>🎯 Token Rate per Model</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="tokenRate" value="500" min="100" max="5000" step="100" onchange="updateConfig()" placeholder="tokens">
                        <span style="color: #9ca3af;">(per operation)</span>
                    </div>
                </div>

                <!-- Max Tokens Cap -->
                <div class="control-group">
                    <label>📊 Max Tokens per Operation</label>
                    <input type="number" id="maxTokensOp" value="2000" min="500" max="10000" step="500" onchange="updateConfig()">
                </div>

                <!-- Execution Strategy -->
                <div class="control-group">
                    <label>🔄 Execution Strategy</label>
                    <select id="executionStrategy" onchange="updateConfig()" style="width: 100%; padding: 8px; background: #0d1117; border: 1px solid #30363d; color: #58a6ff; border-radius: 4px; font-size: 12px;">
                        <option value="parallel">Parallel (all models, same task)</option>
                        <option value="sequential">Sequential (pass output forward)</option>
                        <option value="hierarchical">Hierarchical (lead model + consensus)</option>
                    </select>
                </div>

                <!-- Model Coordination -->
                <div class="control-group">
                    <label>🤝 Model Coordination</label>
                    <select id="coordination" onchange="updateConfig()" style="width: 100%; padding: 8px; background: #0d1117; border: 1px solid #30363d; color: #58a6ff; border-radius: 4px; font-size: 12px;">
                        <option value="consensus">Consensus (2/3 agree)</option>
                        <option value="voting">Voting (majority)</option>
                        <option value="sequential">Sequential (one after one)</option>
                    </select>
                </div>

                <!-- Instructions -->
                <div class="control-group">
                    <label>📝 Instructions (one per line or semicolon)</label>
                    <textarea id="automationInstructions" placeholder="e.g.&#10;Build React app&#10;Run tests&#10;Generate documentation&#10;Deploy to staging" style="width: 100%; height: 100px; padding: 8px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; font-size: 11px; font-family: 'Courier New', monospace; resize: vertical;" onchange="updateConfig()"></textarea>
                </div>

                <!-- Safety Whitelist -->
                <div class="control-group">
                    <label>🔒 Safety Whitelist (comma-separated paths)</label>
                    <textarea id="safetyWhitelist" placeholder="e.g. dist/*, build/*, src/*, models/*, output/*" style="width: 100%; height: 60px; padding: 8px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; font-size: 11px; font-family: 'Courier New', monospace; resize: vertical;" onchange="updateConfig()"></textarea>
                </div>

                <!-- Restricted Files -->
                <div class="control-group">
                    <label>⛔ Require Approval For (comma-separated)</label>
                    <textarea id="restrictedFiles" placeholder="e.g. app.js, package.json, index.html, .env, server.js" style="width: 100%; height: 60px; padding: 8px; background: #0d1117; border: 1px solid #30363d; color: #c9d1d9; border-radius: 4px; font-size: 11px; font-family: 'Courier New', monospace; resize: vertical;" onchange="updateConfig()"></textarea>
                </div>

                <!-- Action Buttons -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px;">
                    <button id="startBtn" onclick="startAutomation()" style="background: #10b981; border-color: #059669; color: white; padding: 10px; border-radius: 4px; border: 1px solid #059669; cursor: pointer; font-weight: 600; font-size: 12px;">▶ START</button>
                    <button id="pauseBtn" onclick="pauseAutomation()" disabled style="background: #f59e0b; border-color: #d97706; color: white; padding: 10px; border-radius: 4px; border: 1px solid #d97706; cursor: pointer; font-weight: 600; font-size: 12px;">⏸ PAUSE</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                    <button id="resumeBtn" onclick="resumeAutomation()" disabled style="background: #3b82f6; border-color: #1d4ed8; color: white; padding: 10px; border-radius: 4px; border: 1px solid #1d4ed8; cursor: pointer; font-weight: 600; font-size: 12px;">⏯ RESUME</button>
                    <button id="stopBtn" onclick="abortAutomation()" style="background: #ef4444; border-color: #dc2626; color: white; padding: 10px; border-radius: 4px; border: 1px solid #dc2626; cursor: pointer; font-weight: 600; font-size: 12px;">⏹ ABORT</button>
                </div>
            </div>
        </div>

        <!-- Live Monitoring -->
        <div class="automation-section">
            <div class="section-header">
                <h3>📊 Live Monitor</h3>
                <button class="collapse-btn" onclick="toggleSection(this)">−</button>
                <button class="info-toggle" onclick="toggleMonitorSettings()">⚙️</button>
            </div>
            <div class="section-body" id="monitorPanel">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <div class="stat-card">
                        <div class="stat-label">⏱️ Elapsed</div>
                        <div class="stat-value" id="statElapsed">0s</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">📈 Tokens</div>
                        <div class="stat-value" id="statTokens">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">✅ Tasks Done</div>
                        <div class="stat-value" id="statCompleted">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">❌ Failed</div>
                        <div class="stat-value" id="statFailed">0</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                    <div class="stat-card">
                        <div class="stat-label">🤖 Active Models</div>
                        <div class="stat-value" id="statActiveModels">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">⚡ Tok/sec</div>
                        <div class="stat-value" id="statTokPerSec">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">🔒 Violations</div>
                        <div class="stat-value" id="statViolations">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">⚠️ Pending</div>
                        <div class="stat-value" id="statPending">0</div>
                    </div>
                </div>

                <!-- Model Status List -->
                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; max-height: 150px; overflow-y: auto;">
                    <div style="color: #58a6ff; font-size: 11px; font-weight: 600; margin-bottom: 6px;">Model Status</div>
                    <div id="modelStatusList" style="font-size: 10px;"></div>
                </div>
            </div>

            <!-- Monitor Settings Modal -->
            <div id="monitorSettings" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <span>Monitor Display Settings</span>
                        <button class="modal-close" onclick="toggleMonitorSettings()">✕</button>
                    </div>
                    <div class="modal-body" style="display: grid; gap: 8px; font-size: 12px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showElapsed" checked onchange="updateMonitorDisplay()">
                            <span>Elapsed Time</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showTokens" checked onchange="updateMonitorDisplay()">
                            <span>Token Usage</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showTasks" checked onchange="updateMonitorDisplay()">
                            <span>Task Counters</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showModels" checked onchange="updateMonitorDisplay()">
                            <span>Model Status</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showThroughput" checked onchange="updateMonitorDisplay()">
                            <span>Throughput (Tok/sec)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showSafety" checked onchange="updateMonitorDisplay()">
                            <span>Safety Stats</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" id="showPending" checked onchange="updateMonitorDisplay()">
                            <span>Pending Approvals</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Live Log Viewer -->
        <div class="automation-section">
            <div class="section-header">
                <h3>📜 Live Log</h3>
                <button class="collapse-btn" onclick="toggleSection(this)">−</button>
                <button class="log-filter" onclick="filterLogs('all')" data-filter="all">All</button>
                <button class="log-filter" onclick="filterLogs('info')" data-filter="info">Info</button>
                <button class="log-filter" onclick="filterLogs('warning')" data-filter="warning">⚠ Warn</button>
                <button class="log-filter" onclick="filterLogs('error')" data-filter="error">❌ Err</button>
            </div>
            <div class="section-body">
                <div id="logViewer" style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; height: 200px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 10px; padding: 8px;">
                    <div style="color: #9ca3af; padding: 20px; text-align: center;">Logs appear here...</div>
                </div>
                <button onclick="clearLogs()" style="width: 100%; margin-top: 8px; padding: 6px; background: #374151; border: 1px solid #4b5563; color: #e5e7eb; border-radius: 4px; font-size: 11px; cursor: pointer;">Clear Logs</button>
            </div>
        </div>

        <!-- Summary Report -->
        <div class="automation-section" id="summarySection" style="display: none;">
            <div class="section-header">
                <h3>📋 Summary Report</h3>
                <button class="collapse-btn" onclick="toggleSection(this)">−</button>
            </div>
            <div class="section-body" id="summaryContent">
                <!-- Generated when automation completes -->
            </div>
        </div>
    </div>
</div>

<!-- Approval Dialog -->
<div id="approvalDialog" class="modal" style="display: none;">
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header">
            <span>⚠️ Approval Required</span>
            <button class="modal-close" onclick="closeApprovalDialog()">✕</button>
        </div>
        <div class="modal-body">
            <div style="margin-bottom: 12px;">
                <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">Task:</div>
                <div id="approvalTaskText" style="background: #0d1117; padding: 8px; border-radius: 4px; border: 1px solid #30363d; color: #c9d1d9; font-size: 11px; font-family: 'Courier New', monospace; word-break: break-all;"></div>
            </div>
            <div style="margin-bottom: 16px;">
                <div style="color: #f87171; font-size: 11px; margin-bottom: 4px;">Violations:</div>
                <div id="approvalViolations" style="background: #0d1117; padding: 8px; border-radius: 4px; border: 1px solid #30363d; color: #fecaca; font-size: 10px;"></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <button onclick="approveTask(true)" style="background: #10b981; border-color: #059669; color: white; padding: 10px; border-radius: 4px; border: 1px solid #059669; cursor: pointer; font-weight: 600;">✓ Approve</button>
                <button onclick="approveTask(false)" style="background: #ef4444; border-color: #dc2626; color: white; padding: 10px; border-radius: 4px; border: 1px solid #dc2626; cursor: pointer; font-weight: 600;">✕ Reject</button>
            </div>
        </div>
    </div>
</div>

<style>
/* Automation Drawer Styles */
.automation-drawer-toggle {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #3b82f6;
    border: 2px solid #1d4ed8;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 400;
}

.automation-drawer-toggle:hover {
    background: #2563eb;
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.automation-drawer {
    position: fixed;
    right: -400px;
    top: 0;
    width: 400px;
    height: 100vh;
    background: #161b22;
    border-left: 2px solid #30363d;
    transition: right 0.3s ease;
    z-index: 800;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.5);
}

.automation-drawer.open {
    right: 0;
}

.automation-drawer-header {
    background: #0d1117;
    border-bottom: 1px solid #30363d;
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.automation-drawer-header h2 {
    color: #58a6ff;
    font-size: 14px;
    font-weight: 600;
}

.drawer-close {
    background: none;
    border: none;
    color: #9ca3af;
    font-size: 18px;
    cursor: pointer;
    transition: color 0.2s;
}

.drawer-close:hover {
    color: #f3f4f6;
}

.automation-drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
}

.automation-section {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
}

.section-header {
    background: #161b22;
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    cursor: pointer;
    border-bottom: 1px solid #30363d;
}

.section-header h3 {
    color: #58a6ff;
    font-size: 12px;
    font-weight: 600;
    margin: 0;
    flex: 1;
}

.collapse-btn, .log-filter, .info-toggle {
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 11px;
    padding: 2px 4px;
    transition: color 0.2s;
}

.collapse-btn:hover, .log-filter:hover, .info-toggle:hover {
    color: #58a6ff;
}

.log-filter {
    background: #0d1117;
    border: 1px solid #30363d;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 9px;
}

.log-filter.active {
    background: #58a6ff;
    color: #0d1117;
    border-color: #58a6ff;
}

.section-body {
    padding: 12px;
}

.control-group {
    margin-bottom: 12px;
}

.control-group label {
    display: block;
    color: #c9d1d9;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 4px;
}

.control-group input[type="text"],
.control-group input[type="number"],
.control-group textarea,
.control-group select {
    width: 100%;
    padding: 6px 8px;
    background: #0d1117;
    border: 1px solid #30363d;
    color: #c9d1d9;
    border-radius: 4px;
    font-size: 11px;
    font-family: 'Courier New', monospace;
}

.control-group input[type="text"]:focus,
.control-group input[type="number"]:focus,
.control-group textarea:focus,
.control-group select:focus {
    border-color: #58a6ff;
    outline: none;
}

.stat-card {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 4px;
    padding: 8px;
    text-align: center;
}

.stat-label {
    color: #9ca3af;
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.stat-value {
    color: #58a6ff;
    font-size: 16px;
    font-weight: 600;
    font-family: 'Courier New', monospace;
}

#logViewer {
    display: flex;
    flex-direction: column;
}

.log-entry {
    padding: 4px 0;
    border-bottom: 1px solid #262f3a;
    font-size: 10px;
    line-height: 1.4;
}

.log-entry:last-child {
    border-bottom: none;
}

.log-entry.info { color: #58a6ff; }
.log-entry.warning { color: #f59e0b; }
.log-entry.error { color: #f87171; }
.log-entry.success { color: #10b981; }
.log-entry.config { color: #8b949e; }

.log-timestamp {
    color: #6b7280;
    margin-right: 6px;
}

.log-source {
    font-weight: 600;
    margin-right: 6px;
}

/* Responsive */
@media (max-width: 768px) {
    .automation-drawer {
        width: 100%;
        right: -100%;
    }

    .automation-drawer-toggle {
        right: 10px;
        bottom: 10px;
        width: 50px;
        height: 50px;
        font-size: 14px;
    }
}

::-webkit-scrollbar-thumb:hover {
    background: #4b5563;
}
</style>
`;

// Export for injection into index.html
window.AUTOMATION_UI = AUTOMATION_UI;
