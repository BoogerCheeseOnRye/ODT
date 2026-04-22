// ==================== ENHANCED MODEL MANAGER UI ====================
async function displayModelsAdvanced() {
    const list = document.getElementById('models-list');
    list.innerHTML = '<div style="color: #58a6ff; font-size: 9px; padding: 4px;">📦 Loading models...</div>';
    
    try {
        if (!window.modelManager) {
            list.innerHTML = '<div style="color: #f87171; padding: 4px;">Model manager not ready</div>';
            return;
        }

        const allModels = window.modelManager.getModels();
        if (allModels.length === 0) {
            list.innerHTML = '<div style="color: #9ca3af; padding: 4px;">No models found</div>';
            return;
        }

        let html = '<div style="margin-bottom: 6px; padding: 4px; background: #0d1117; border: 1px solid #30363d; border-radius: 2px;">';
        html += `<div style="font-weight: 600; color: #58a6ff; margin-bottom: 2px;">📦 ${allModels.length} Models</div>`;
        
        const cacheInfo = window.modelManager.getCacheInfo();
        html += `<div style="font-size: 8px; color: #8b949e;">💾 Cached: ${cacheInfo.count} (${cacheInfo.totalSize})</div></div>`;

        allModels.forEach(model => {
            const isCached = model.cached ? '✓' : '-';
            const isQuantized = model.quantized ? 'Q' : '';
            html += `
                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 2px; padding: 4px; margin-bottom: 3px; font-size: 9px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                        <div>
                            <div style="color: #e5e7eb; font-weight: 600;">${model.name} <span style="color: #6b7280; font-size: 8px;">${isQuantized}</span></div>
                            <div style="color: #8b949e; font-size: 8px;">${model.type} • ${model.size}</div>
                        </div>
                        <div style="color: #58a6ff; font-weight: 600; font-size: 8px;">[${isCached}]</div>
                    </div>
                    <div style="display: flex; gap: 2px;">
                        ${model.cached ? `<button class="model-btn" style="flex: 1; font-size: 8px; padding: 2px;" onclick="loadModelAdvanced('${model.id}')">Load</button>` : `<button class="model-btn" style="flex: 1; font-size: 8px; padding: 2px;" onclick="downloadModelAdvanced('${model.id}')">Download</button>`}
                        ${model.cached ? `<button class="model-btn" style="flex: 1; font-size: 8px; padding: 2px;" onclick="deleteModelCache('${model.id}')">Delete</button>` : ''}
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    } catch (e) {
        list.innerHTML = `<div style="color: #f87171; padding: 4px;">Error: ${e.message}</div>`;
    }
}

async function downloadModelAdvanced(modelId) {
    const model = window.modelManager.getModel(modelId);
    if (!model) return;

    addResponse('System', `📥 Downloading ${model.name}...`);
    
    try {
        await window.modelManager.downloadModel(modelId, (progress) => {
            const status = window.modelManager.getDownloadStatus(modelId);
            if (status) {
                const percent = status.progress.toFixed(0);
                document.getElementById('models-list').innerHTML = `
                    <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 2px; padding: 4px;">
                        <div style="margin-bottom: 4px; font-size: 9px; color: #c9d1d9;">${model.name} - ${percent}%</div>
                        <div style="background: #161b22; border: 1px solid #30363d; border-radius: 2px; height: 8px; overflow: hidden;">
                            <div style="background: #58a6ff; height: 100%; width: ${percent}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `;
            }
        });
        
        addResponse('System', `✓ ${model.name} downloaded and cached`);
        displayModelsAdvanced();
    } catch (e) {
        addResponse('Error', `Download failed: ${e.message}`);
    }
}

async function loadModelAdvanced(modelId) {
    const model = window.modelManager.getModel(modelId);
    if (!model) return;

    addResponse('System', `🧠 Loading ${model.name}...`);
    
    try {
        await window.modelManager.loadModel(modelId);
        addResponse('System', `✓ ${model.name} loaded and active`);
        displayModelsAdvanced();
    } catch (e) {
        addResponse('Error', `Load failed: ${e.message}`);
    }
}

async function deleteModelCache(modelId) {
    const model = window.modelManager.getModel(modelId);
    if (!model) return;

    if (!confirm(`Delete cache for ${model.name}?`)) return;

    try {
        await window.modelManager.deleteModelCache(modelId);
        addResponse('System', `🗑️ ${model.name} cache deleted`);
        displayModelsAdvanced();
    } catch (e) {
        addResponse('Error', `Delete failed: ${e.message}`);
    }
}

// ==================== SESSION MANAGEMENT ====================
function displaySessions() {
    if (!window.sessionManager) {
        addResponse('Error', 'Session manager not available');
        return;
    }

    const sessions = window.sessionManager.getSessions();
    addResponse('System', `📋 ${sessions.length} session(s) available`);
    sessions.forEach(s => {
        const current = s.isCurrent ? ' (current)' : '';
        addResponse('System', `• ${s.name}${current} - ${s.projectCount} project(s)`);
    });
}

function createNewSession() {
    const name = prompt('New session name:');
    if (!name) return;

    try {
        const session = window.sessionManager.createSession(name);
        addResponse('System', `✓ Session created: ${session.name}`);
    } catch (e) {
        addResponse('Error', `Failed to create session: ${e.message}`);
    }
}

function loadSessionDialog() {
    const sessions = window.sessionManager.getSessions();
    if (sessions.length === 0) {
        addResponse('System', 'No sessions available');
        return;
    }

    const options = sessions.map((s, i) => `${i + 1}. ${s.name}`).join('\n');
    const choice = prompt(`Select session:\n${options}\n\nEnter number:`, '1');
    
    if (!choice) return;
    const index = parseInt(choice) - 1;
    
    try {
        window.sessionManager.loadSession(sessions[index].id);
        addResponse('System', `✓ Session loaded: ${sessions[index].name}`);
        location.reload();
    } catch (e) {
        addResponse('Error', `Failed to load session: ${e.message}`);
    }
}

// ==================== EXPORT/IMPORT ====================
function exportModels() {
    if (!window.modelManager) {
        addResponse('Error', 'Model manager not available');
        return;
    }

    const data = window.modelManager.exportModelList();
    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, 'models-list.json');
    addResponse('System', '💾 Models list exported');
}

function exportSessions() {
    if (!window.sessionManager) {
        addResponse('Error', 'Session manager not available');
        return;
    }

    const data = window.sessionManager.exportAllSessions();
    const json = JSON.stringify(data, null, 2);
    downloadJSON(json, 'sessions-backup.json');
    addResponse('System', '💾 Sessions exported');
}

function downloadJSON(jsonString, filename) {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
