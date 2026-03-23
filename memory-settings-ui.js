// Memory Settings UI Injection
// Adds memory management modal to settings

function openMemorySettingsModal() {
    document.getElementById('memorySettingsModal').classList.add('active');
    updateMemorySettingsDisplay();
}

function closeMemorySettingsModal() {
    document.getElementById('memorySettingsModal').classList.remove('active');
}

function updateMemorySettingsDisplay() {
    if (!window.memoryManager) return;
    
    const status = window.memoryManager.getStatus();
    
    // Update memory display
    document.getElementById('memCurrent').textContent = status.used.toFixed(1) + ' MB';
    document.getElementById('memAvailable').textContent = status.available.toFixed(1) + ' MB';
    document.getElementById('memPeak').textContent = status.peak.toFixed(1) + ' MB';
    
    // Status colors
    let statusText = '✓ Normal';
    let statusColor = '#34d399';
    
    if (status.status === 'emergency') {
        statusText = '⛔ Emergency';
        statusColor = '#f87171';
    } else if (status.status === 'critical') {
        statusText = '🔴 Critical';
        statusColor = '#ef5350';
    } else if (status.status === 'warning') {
        statusText = '⚠️ Warning';
        statusColor = '#fbbf24';
    }
    
    const statusEl = document.getElementById('memStatus');
    if (statusEl) {
        statusEl.textContent = statusText;
        statusEl.style.color = statusColor;
    }
    
    // Update progress bar
    const fill = document.getElementById('memProgressFill');
    if (fill) {
        const percent = status.percent;
        fill.style.width = percent + '%';
        
        // Color based on usage
        if (percent >= 95) {
            fill.style.background = '#f87171';
        } else if (percent >= 85) {
            fill.style.background = '#ef5350';
        } else if (percent >= 75) {
            fill.style.background = '#fbbf24';
        } else {
            fill.style.background = '#58a6ff';
        }
    }
    
    // Update RAM limit triggers
    document.getElementById('warnTrigger').textContent = window.memoryManager.config.maxRAMPercent + '%';
    document.getElementById('criticalTrigger').textContent = window.memoryManager.config.criticalRAMPercent + '%';
    document.getElementById('emergencyTrigger').textContent = window.memoryManager.config.emergencyRAMPercent + '%';
    
    // Update slider value
    document.getElementById('ramLimitSlider').value = window.memoryManager.config.maxRAMPercent;
    document.getElementById('ramLimitDisplay').textContent = window.memoryManager.config.maxRAMPercent;
    
    // Update auto-optimize toggle
    document.getElementById('autoOptimizeToggle').checked = window.memoryManager.config.autoOptimize;
    
    // Populate cleanup strategies
    const strategiesDiv = document.getElementById('cleanupStrategies');
    if (strategiesDiv) {
        strategiesDiv.innerHTML = window.memoryManager.cleanupStrategies.map(s => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid #30363d;">
                <span style="font-size: 9px; color: #c9d1d9;">
                    ${s.name}
                    <span style="color: #6b7280;">(priority: ${s.priority})</span>
                </span>
                <span style="font-size: 9px; color: #58a6ff;">${s.timesRun} runs</span>
            </div>
        `).join('');
    }
}

function updateRAMLimit(percent) {
    if (window.memoryManager) {
        window.memoryManager.setMaxRAMPercent(parseInt(percent));
        document.getElementById('ramLimitDisplay').textContent = percent;
        updateMemorySettingsDisplay();
    }
}

function toggleAutoOptimize() {
    if (window.memoryManager) {
        const toggle = document.getElementById('autoOptimizeToggle');
        window.memoryManager.config.autoOptimize = toggle.checked;
        console.log('[Memory] Auto-optimize:', toggle.checked ? 'enabled' : 'disabled');
    }
}

function runManualCleanup() {
    if (window.memoryManager) {
        const before = window.memoryManager.getUsedMemory();
        window.memoryManager.runCleanupStrategies(0);
        const after = window.memoryManager.getUsedMemory();
        const freed = Math.max(0, before - after);
        
        addResponse('System', `Manual cleanup: freed ${freed.toFixed(1)}MB`);
        
        // Update display
        setTimeout(updateMemorySettingsDisplay, 500);
    }
}

// Update memory stats in header
function updateMemoryStats() {
    if (!window.memoryManager) return;
    
    const status = window.memoryManager.getStatus();
    
    // Update memory stat
    const memDisplay = document.getElementById('header-memory');
    if (memDisplay) {
        memDisplay.textContent = status.used.toFixed(1) + 'MB';
    }
    
    // Update status indicator
    const statusDisplay = document.getElementById('header-memory-status');
    if (statusDisplay) {
        let dot = '●';
        let color = '#34d399';
        
        if (status.status === 'emergency') {
            dot = '●';
            color = '#f87171';
        } else if (status.status === 'critical') {
            dot = '●';
            color = '#ef5350';
        } else if (status.status === 'warning') {
            dot = '●';
            color = '#fbbf24';
        }
        
        statusDisplay.textContent = dot;
        statusDisplay.style.color = color;
    }
}

// Listen for memory updates
window.addEventListener('memory:update', (e) => {
    updateMemoryStats();
});

window.addEventListener('memory:statusChange', (e) => {
    const detail = e.detail;
    console.log(`[Memory] Status changed to ${detail.status} (${detail.percent.toFixed(1)}%)`);
    updateMemoryStats();
});

window.addEventListener('memory:warning', (e) => {
    addResponse('System', `⚠️ Memory warning: ${e.detail.percent.toFixed(1)}% usage`);
});

window.addEventListener('memory:critical', (e) => {
    addResponse('System', `🔴 Memory critical: ${e.detail.percent.toFixed(1)}% usage - optimizing...`);
});

window.addEventListener('memory:emergency', (e) => {
    addResponse('System', `⛔ Memory emergency: ${e.detail.percent.toFixed(1)}% usage - force cleanup!`);
});

// Update stats regularly
setInterval(updateMemoryStats, 1000);

console.log('[Memory UI] Settings injected');
