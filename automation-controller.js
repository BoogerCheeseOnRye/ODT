// ODT - Automation Controller
// Handles UI interactions, real-time updates, and integration with AutomationEngine

let automationEngine = null;
let currentLogFilter = 'all';
let monitorInterval = null;
let currentApprovalTask = null;

/**
 * Initialize automation system
 */
function initAutomation() {
    automationEngine = new AutomationEngine();
    
    // Listen for log updates
    window.addEventListener('automationLogUpdate', (e) => {
        addLogEntry(e.detail);
    });

    // Listen for approval requests
    window.addEventListener('automationApprovalNeeded', (e) => {
        showApprovalDialog(e.detail);
    });

    console.log('[Automation] Controller initialized');
}

/**
 * Toggle automation drawer
 */
function toggleAutomationDrawer() {
    const drawer = document.getElementById('automationDrawer');
    drawer.classList.toggle('open');
    
    if (drawer.classList.contains('open')) {
        startMonitoring();
    } else {
        stopMonitoring();
    }
}

/**
 * Toggle section expansion
 */
function toggleSection(btn) {
    const section = btn.closest('.automation-section');
    const body = section.querySelector('.section-body');
    
    if (body.style.display === 'none') {
        body.style.display = 'block';
        btn.textContent = '−';
    } else {
        body.style.display = 'none';
        btn.textContent = '+';
    }
}

/**
 * Update duration display
 */
function updateDurationDisplay(value) {
    document.getElementById('durationDisplay').textContent = value + 's';
}

/**
 * Update configuration from UI
 */
function updateConfig() {
    if (!automationEngine) return;

    const whitelist = document.getElementById('safetyWhitelist').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

    const restricted = document.getElementById('restrictedFiles').value
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

    automationEngine.config = {
        duration: parseInt(document.getElementById('durationSlider').value),
        justBuild: document.getElementById('justBuildToggle').checked,
        tokenRatePerModel: parseInt(document.getElementById('tokenRate').value) || 500,
        maxTokensPerOp: parseInt(document.getElementById('maxTokensOp').value) || 2000,
        instructions: document.getElementById('automationInstructions').value,
        executionMode: document.getElementById('executionStrategy').value,
        modelCoordination: document.getElementById('coordination').value,
        safetyWhitelist: whitelist.length > 0 ? whitelist : automationEngine.config.safetyWhitelist,
        requiresApprovalFor: restricted.length > 0 ? restricted : automationEngine.config.requiresApprovalFor
    };
}

/**
 * Start automation
 */
async function startAutomation() {
    if (!automationEngine) {
        initAutomation();
    }

    // Validate configuration
    if (!document.getElementById('automationInstructions').value.trim()) {
        alert('Please enter at least one instruction');
        return;
    }

    if (automationEngine.models.length === 0) {
        alert('No models loaded. Please load models first.');
        return;
    }

    // Update config from UI
    updateConfig();

    // Initialize with loaded models
    const loadedModels = projects.find(p => p.id === activeProject)?.loadedModels || 
                        [{ name: 'Mock Model 1', id: 'mock-1' }];
    
    automationEngine.initialize(automationEngine.config, loadedModels);

    // Update UI state
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('resumeBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    document.getElementById('automationInstructions').disabled = true;

    // Ensure drawer is visible
    if (!document.getElementById('automationDrawer').classList.contains('open')) {
        toggleAutomationDrawer();
    }

    // Start monitoring
    startMonitoring();

    // Begin execution
    await automationEngine.start();

    // Show summary when complete
    showSummaryReport();
    
    // Update UI state
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resumeBtn').disabled = true;
    document.getElementById('stopBtn').disabled = true;
    document.getElementById('automationInstructions').disabled = false;
}

/**
 * Pause automation
 */
function pauseAutomation() {
    if (!automationEngine || !automationEngine.state.isRunning) return;

    automationEngine.pause();
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('resumeBtn').disabled = false;
}

/**
 * Resume automation
 */
function resumeAutomation() {
    if (!automationEngine || !automationEngine.state.isPaused) return;

    automationEngine.resume();
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('resumeBtn').disabled = true;
}

/**
 * Abort automation
 */
function abortAutomation() {
    if (!automationEngine) return;

    if (confirm('Are you sure? This will stop the automation.')) {
        automationEngine.abort();
        stopMonitoring();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('resumeBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('automationInstructions').disabled = false;
    }
}

/**
 * Start live monitoring
 */
function startMonitoring() {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(() => {
        if (!automationEngine) return;

        const stats = automationEngine.getStats();
        
        // Update stats display if visible
        if (document.getElementById('showElapsed')?.checked !== false) {
            document.getElementById('statElapsed').textContent = stats.elapsedSeconds + 's';
        }

        if (document.getElementById('showTokens')?.checked !== false) {
            document.getElementById('statTokens').textContent = stats.totalTokens.toLocaleString();
        }

        if (document.getElementById('showTasks')?.checked !== false) {
            document.getElementById('statCompleted').textContent = stats.tasksCompleted;
            document.getElementById('statFailed').textContent = stats.tasksFailed;
        }

        if (document.getElementById('showModels')?.checked !== false) {
            document.getElementById('statActiveModels').textContent = stats.activeModels + '/' + stats.totalModels;
        }

        if (document.getElementById('showThroughput')?.checked !== false) {
            document.getElementById('statTokPerSec').textContent = stats.tokensPerSecond;
        }

        if (document.getElementById('showSafety')?.checked !== false) {
            document.getElementById('statViolations').textContent = stats.safetyViolations;
        }

        if (document.getElementById('showPending')?.checked !== false) {
            document.getElementById('statPending').textContent = stats.pendingApprovals;
        }

        // Update model status list
        updateModelStatusDisplay();

    }, 500); // Update every 500ms
}

/**
 * Stop monitoring
 */
function stopMonitoring() {
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
    }
}

/**
 * Add log entry to viewer
 */
function addLogEntry(entry) {
    const logViewer = document.getElementById('logViewer');
    
    // Clear placeholder if first entry
    if (logViewer.innerHTML.includes('Logs appear here')) {
        logViewer.innerHTML = '';
    }

    // Check if should display based on filter
    if (currentLogFilter !== 'all' && currentLogFilter !== entry.type) {
        return;
    }

    const logEl = document.createElement('div');
    logEl.className = `log-entry ${entry.type}`;
    
    const time = new Date(entry.timestamp).toLocaleTimeString();
    logEl.innerHTML = `<span class="log-timestamp">[${time}]</span><span class="log-source">${entry.source}</span>${entry.message}`;
    
    logViewer.appendChild(logEl);
    
    // Auto-scroll to bottom
    logViewer.scrollTop = logViewer.scrollHeight;

    // Keep only last 200 entries
    const entries = logViewer.querySelectorAll('.log-entry');
    if (entries.length > 200) {
        entries[0].remove();
    }
}

/**
 * Filter logs by type
 */
function filterLogs(filterType) {
    currentLogFilter = filterType;

    // Update active button
    document.querySelectorAll('.log-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Rebuild log display
    const logViewer = document.getElementById('logViewer');
    logViewer.innerHTML = '';

    let filteredLogs = automationEngine.state.logs;
    if (filterType !== 'all') {
        filteredLogs = filteredLogs.filter(l => l.type === filterType);
    }

    filteredLogs.forEach(log => {
        addLogEntry(log);
    });

    if (filteredLogs.length === 0) {
        logViewer.innerHTML = '<div style="color: #9ca3af; padding: 20px; text-align: center;">No logs found</div>';
    }
}

/**
 * Clear all logs
 */
function clearLogs() {
    if (confirm('Clear all logs?')) {
        document.getElementById('logViewer').innerHTML = '<div style="color: #9ca3af; padding: 20px; text-align: center;">Logs appear here...</div>';
        if (automationEngine) {
            automationEngine.state.logs = [];
        }
    }
}

/**
 * Update model status display
 */
function updateModelStatusDisplay() {
    if (!automationEngine) return;

    const statusList = document.getElementById('modelStatusList');
    const modelStatus = automationEngine.state.modelStatus;

    let html = '';
    for (const [modelName, status] of Object.entries(modelStatus)) {
        const statusColor = status.status === 'busy' ? '#f59e0b' : '#34d399';
        const statusIcon = status.status === 'busy' ? '⚙️' : '✓';

        html += `
            <div style="margin-bottom: 6px; padding: 4px; background: #0d1117; border-radius: 3px; border-left: 2px solid ${statusColor};">
                <div style="color: #c9d1d9; font-weight: 600;">${statusIcon} ${modelName}</div>
                <div style="color: #8b949e; font-size: 9px;">
                    Tasks: ${status.tasksCompleted} | Failed: ${status.tasksFailed} | Tokens: ${status.tokensUsed}
                </div>
            </div>
        `;
    }

    statusList.innerHTML = html || '<div style="color: #9ca3af;">No models</div>';
}

/**
 * Toggle monitor settings modal
 */
function toggleMonitorSettings() {
    const modal = document.getElementById('monitorSettings');
    modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
}

/**
 * Update monitor display based on settings
 */
function updateMonitorDisplay() {
    // Just trigger a monitor update
    if (automationEngine) {
        startMonitoring();
    }
}

/**
 * Show approval dialog
 */
function showApprovalDialog(approval) {
    currentApprovalTask = approval;

    const dialog = document.getElementById('approvalDialog');
    document.getElementById('approvalTaskText').textContent = approval.instruction;
    document.getElementById('approvalViolations').innerHTML = 
        approval.violations.map(v => `<div>⚠️ ${v}</div>`).join('');

    dialog.style.display = 'flex';
}

/**
 * Close approval dialog
 */
function closeApprovalDialog() {
    document.getElementById('approvalDialog').style.display = 'none';
    currentApprovalTask = null;
}

/**
 * Approve or reject task
 */
function approveTask(approved) {
    if (!currentApprovalTask || !automationEngine) return;

    automationEngine.approveOperation(currentApprovalTask.taskId, approved);
    
    const action = approved ? 'Approved' : 'Rejected';
    automationEngine.addLog('APPROVAL', `User ${action} task: ${currentApprovalTask.instruction.substring(0, 50)}...`, approved ? 'success' : 'warning');

    closeApprovalDialog();
}

/**
 * Show summary report
 */
function showSummaryReport() {
    if (!automationEngine) return;

    const summary = automationEngine.getSummary();
    const summarySection = document.getElementById('summarySection');
    const summaryContent = document.getElementById('summaryContent');

    let html = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="background: #1f2937; border: 1px solid #374151; padding: 8px; border-radius: 4px; text-align: center;">
                <div style="color: #9ca3af; font-size: 10px;">Duration</div>
                <div style="color: #58a6ff; font-weight: 600;">${summary.duration.toFixed(1)}s</div>
            </div>
            <div style="background: #1f2937; border: 1px solid #374151; padding: 8px; border-radius: 4px; text-align: center;">
                <div style="color: #9ca3af; font-size: 10px;">Tokens Used</div>
                <div style="color: #58a6ff; font-weight: 600;">${summary.totalTokensUsed.toLocaleString()}</div>
            </div>
            <div style="background: #1f2937; border: 1px solid #374151; padding: 8px; border-radius: 4px; text-align: center;">
                <div style="color: #9ca3af; font-size: 10px;">Tok/sec</div>
                <div style="color: #58a6ff; font-weight: 600;">${summary.tokensPerSecond}</div>
            </div>
            <div style="background: #1f2937; border: 1px solid #374151; padding: 8px; border-radius: 4px; text-align: center;">
                <div style="color: #9ca3af; font-size: 10px;">Success Rate</div>
                <div style="color: #10b981; font-weight: 600;">${summary.successRate}%</div>
            </div>
        </div>

        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
            <div style="color: #58a6ff; font-weight: 600; margin-bottom: 8px; font-size: 12px;">Tasks Summary</div>
            <div style="color: #c9d1d9; font-size: 11px; line-height: 1.6;">
                <div>✓ Completed: ${summary.tasksCompleted}/${summary.totalTasks}</div>
                <div>✗ Failed: ${summary.tasksFailed}/${summary.totalTasks}</div>
                <div>⚠️ Safety Violations: ${summary.safetyViolations}</div>
                <div>📜 Total Log Entries: ${summary.logCount}</div>
            </div>
        </div>

        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px;">
            <div style="color: #58a6ff; font-weight: 600; margin-bottom: 8px; font-size: 12px;">Model Performance</div>
            <div style="font-size: 10px; color: #c9d1d9;">
                ${Object.entries(summary.modelStats).map(([name, stats]) => `
                    <div style="margin-bottom: 6px; padding: 4px; background: #161b22; border-radius: 3px;">
                        <div>${name}</div>
                        <div style="color: #8b949e; margin-top: 2px;">
                            Completed: ${stats.tasksCompleted} | Failed: ${stats.tasksFailed} | Tokens: ${stats.tokensUsed}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button onclick="exportAutomationReport()" style="background: #3b82f6; border-color: #1d4ed8; color: white; padding: 8px; border-radius: 4px; border: 1px solid #1d4ed8; cursor: pointer; font-weight: 600; font-size: 11px;">📥 Export Report</button>
            <button onclick="restartAutomation()" style="background: #10b981; border-color: #059669; color: white; padding: 8px; border-radius: 4px; border: 1px solid #059669; cursor: pointer; font-weight: 600; font-size: 11px;">🔄 Run Again</button>
        </div>
    `;

    summaryContent.innerHTML = html;
    summarySection.style.display = 'block';
}

/**
 * Export automation report
 */
function exportAutomationReport() {
    if (!automationEngine) return;

    const report = automationEngine.exportReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Restart automation
 */
function restartAutomation() {
    // Reset summary display
    document.getElementById('summarySection').style.display = 'none';
    
    // Clear logs
    document.getElementById('logViewer').innerHTML = '<div style="color: #9ca3af; padding: 20px; text-align: center;">Logs appear here...</div>';

    // Start again
    startAutomation();
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutomation);
} else {
    initAutomation();
}
