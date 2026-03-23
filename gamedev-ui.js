/**
 * ODTLite Game Dev UI - Integrated Dashboard Interface
 * 
 * Panels:
 * - Projects sidebar (left)
 * - Code editor (center)
 * - Game viewport (right)
 * - Real-time diagnostics overlay
 */

// ==================== UI INITIALIZATION ====================

function initGameDevUI() {
    // Create sidebar
    createProjectsSidebar();
    
    // Create editor panel
    createEditorPanel();
    
    // Create diagnostics panel
    createDiagnosticsOverlay();
    
    // Create hardware profile display
    displayHardwareProfile();
    
    // Render projects list
    renderProjectsList();
    
    // Render editor tabs
    renderEditorTabs();

    console.log('[GameDevUI] Initialized');
}

// ==================== PROJECTS SIDEBAR ====================

function createProjectsSidebar() {
    if (document.getElementById('gamedev-sidebar')) return;

    const sidebar = document.createElement('div');
    sidebar.id = 'gamedev-sidebar';
    sidebar.className = 'gamedev-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <span class="sidebar-title">Projects</span>
            <button class="sidebar-toggle" onclick="toggleProjectsSidebar()">⬅</button>
        </div>
        <div class="sidebar-content">
            <div id="projectsList" class="projects-list"></div>
        </div>
        <div class="sidebar-footer">
            <button class="model-btn" onclick="openNewProjectModal()" style="width: 100%;">+ New Project</button>
        </div>
    `;

    document.body.appendChild(sidebar);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .gamedev-sidebar {
            position: fixed;
            left: 0;
            top: 40px;
            width: 280px;
            height: calc(100vh - 40px);
            background: #0d1117;
            border-right: 1px solid #30363d;
            z-index: 400;
            display: flex;
            flex-direction: column;
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.5);
            transition: left 0.3s ease;
        }

        .gamedev-sidebar.hidden {
            left: -280px;
        }

        .sidebar-header {
            background: #161b22;
            border-bottom: 1px solid #30363d;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .sidebar-title {
            color: #58a6ff;
            font-weight: 600;
            font-size: 12px;
        }

        .sidebar-toggle {
            background: none;
            border: none;
            color: #58a6ff;
            cursor: pointer;
            font-size: 14px;
        }

        .sidebar-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
        }

        .projects-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .project-item {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
        }

        .project-item:hover {
            background: #1f2937;
            border-color: #4b5563;
        }

        .project-item.active {
            background: #1e3a4c;
            border-color: #2d5a7b;
            color: #58a6ff;
        }

        .sidebar-footer {
            background: #161b22;
            border-top: 1px solid #30363d;
            padding: 8px;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
}

function renderProjectsList() {
    const list = document.getElementById('projectsList');
    if (!list) return;

    const projects = window.projectManager.getAll();
    list.innerHTML = projects.map(p => `
        <div class="project-item ${p.isActive ? 'active' : ''}" onclick="switchProject('${p.id}')">
            <div>
                <div style="color: #c9d1d9;">${p.name}</div>
                <div style="color: #6b7280; font-size: 9px;">${p.fileCount} files</div>
            </div>
            <button style="background: none; border: none; color: #6b7280; cursor: pointer; font-size: 12px;" onclick="deleteProject('${p.id}'); event.stopPropagation();">×</button>
        </div>
    `).join('');
}

function switchProject(projectId) {
    if (window.projectManager.setActive(projectId)) {
        renderProjectsList();
        addResponse('System', `Switched to: ${window.projectManager.getActive().name}`);
    }
}

function deleteProject(projectId) {
    if (projectId === 'main') {
        addResponse('Error', 'Cannot delete main project');
        return;
    }
    if (confirm('Delete this project?')) {
        window.projectManager.delete(projectId);
        renderProjectsList();
        addResponse('System', 'Project deleted');
    }
}

function openNewProjectModal() {
    const name = prompt('Project name:');
    if (name) {
        window.projectManager.create(name);
        renderProjectsList();
        addResponse('System', `Created project: ${name}`);
    }
}

function toggleProjectsSidebar() {
    const sidebar = document.getElementById('gamedev-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
}

// ==================== CODE EDITOR PANEL ====================

function createEditorPanel() {
    if (document.getElementById('gamedev-editor')) return;

    const editor = document.createElement('div');
    editor.id = 'gamedev-editor';
    editor.className = 'gamedev-editor';
    editor.innerHTML = `
        <div class="editor-header">
            <div id="editorTabs" class="editor-tabs"></div>
        </div>
        <textarea id="editorContent" class="editor-content" placeholder="Select or create a file..."></textarea>
        <div class="editor-footer">
            <button class="model-btn" onclick="saveEditorFile()" style="flex: 1;">💾 Save</button>
            <button class="model-btn" onclick="newEditorFile()" style="flex: 1;">📄 New</button>
        </div>
    `;

    document.body.appendChild(editor);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .gamedev-editor {
            position: fixed;
            left: 280px;
            top: 40px;
            width: calc(50% - 140px);
            height: calc(100vh - 40px);
            background: #0d1117;
            border-right: 1px solid #30363d;
            z-index: 300;
            display: flex;
            flex-direction: column;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
        }

        .editor-header {
            background: #161b22;
            border-bottom: 1px solid #30363d;
            padding: 8px;
            flex-shrink: 0;
            overflow-x: auto;
        }

        .editor-tabs {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }

        .editor-tab {
            background: #0d1117;
            border: 1px solid #30363d;
            border-radius: 3px;
            padding: 4px 8px;
            font-size: 10px;
            color: #8b949e;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }

        .editor-tab:hover {
            color: #c9d1d9;
            border-color: #4b5563;
        }

        .editor-tab.active {
            background: #0d1117;
            color: #58a6ff;
            border-color: #58a6ff;
        }

        .editor-tab-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            font-size: 11px;
            padding: 0;
            margin-left: 4px;
        }

        .editor-tab-close:hover {
            color: #f87171;
        }

        .editor-content {
            flex: 1;
            padding: 12px;
            background: #0d1117;
            color: #c9d1d9;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            border: none;
            outline: none;
            resize: none;
        }

        .editor-content:focus {
            outline: 1px solid #58a6ff;
        }

        .editor-footer {
            background: #161b22;
            border-top: 1px solid #30363d;
            padding: 8px;
            display: flex;
            gap: 6px;
            flex-shrink: 0;
        }
    `;
    document.head.appendChild(style);
}

function renderEditorTabs() {
    const tabsContainer = document.getElementById('editorTabs');
    if (!tabsContainer) return;

    const files = window.codeEditor.getOpenFiles();
    tabsContainer.innerHTML = files.map(f => `
        <div class="editor-tab ${f.active ? 'active' : ''}" onclick="switchEditorFile('${f.path}')">
            <span>${f.name}${f.modified ? ' •' : ''}</span>
            <button class="editor-tab-close" onclick="closeEditorFile('${f.path}'); event.stopPropagation();">×</button>
        </div>
    `).join('');
}

function switchEditorFile(path) {
    const file = window.codeEditor.openFiles.find(f => f.path === path);
    if (file) {
        window.codeEditor.currentFile = file;
        document.getElementById('editorContent').value = file.content;
        renderEditorTabs();
    }
}

function closeEditorFile(path) {
    window.codeEditor.closeFile(path);
    if (window.codeEditor.currentFile) {
        document.getElementById('editorContent').value = window.codeEditor.currentFile.content;
    } else {
        document.getElementById('editorContent').value = '';
    }
    renderEditorTabs();
}

function saveEditorFile() {
    if (!window.codeEditor.currentFile) {
        addResponse('Error', 'No file open');
        return;
    }
    window.codeEditor.currentFile.content = document.getElementById('editorContent').value;
    if (window.codeEditor.save()) {
        addResponse('System', `✓ Saved: ${window.codeEditor.currentFile.name}`);
        renderEditorTabs();
    }
}

function newEditorFile() {
    const name = prompt('File name:');
    if (name) {
        window.codeEditor.openFile(name, 'file-' + Date.now(), '');
        renderEditorTabs();
        document.getElementById('editorContent').value = '';
        document.getElementById('editorContent').focus();
    }
}

// ==================== DIAGNOSTICS OVERLAY ====================

function createDiagnosticsOverlay() {
    if (document.getElementById('gamedev-diagnostics')) return;

    const diag = document.createElement('div');
    diag.id = 'gamedev-diagnostics';
    diag.className = 'gamedev-diagnostics hidden';
    diag.innerHTML = `
        <div class="diagnostics-header">
            <span>System Diagnostics</span>
            <button onclick="toggleDiagnostics()" style="background: none; border: none; color: #58a6ff; cursor: pointer;">×</button>
        </div>
        <div id="diagnosticsContent" class="diagnostics-content"></div>
    `;

    document.body.appendChild(diag);

    const style = document.createElement('style');
    style.textContent = `
        .gamedev-diagnostics {
            position: fixed;
            right: 0;
            top: 40px;
            width: 50%;
            height: calc(100vh - 40px);
            background: #0d1117;
            border-left: 1px solid #30363d;
            z-index: 250;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
            transition: right 0.3s ease;
        }

        .gamedev-diagnostics.hidden {
            right: -50%;
        }

        .diagnostics-header {
            background: #161b22;
            border-bottom: 1px solid #30363d;
            padding: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            color: #58a6ff;
            font-weight: 600;
        }

        .diagnostics-content {
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            font-size: 10px;
            color: #c9d1d9;
        }
    `;
    document.head.appendChild(style);
}

function toggleDiagnostics() {
    const diag = document.getElementById('gamedev-diagnostics');
    if (diag) {
        diag.classList.toggle('hidden');
    }
}

async function displayDiagnostics() {
    const content = document.getElementById('diagnosticsContent');
    if (!content) return;

    content.innerHTML = '<div style="text-align: center; padding: 20px; color: #58a6ff;">Running diagnostics...</div>';

    const report = await window.systemDiagnostics.runAll();

    content.innerHTML = `
        <div style="margin-bottom: 12px;">
            <div style="color: #58a6ff; font-weight: 600; margin-bottom: 6px;">System Health: ${report.summary.health}%</div>
            <div style="display: flex; gap: 6px;">
                <div style="flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 3px; padding: 6px; text-align: center;">
                    <div style="font-size: 9px; color: #6b7280;">Passed</div>
                    <div style="color: #34d399; font-weight: 600;">${report.summary.passed}</div>
                </div>
                <div style="flex: 1; background: #161b22; border: 1px solid #30363d; border-radius: 3px; padding: 6px; text-align: center;">
                    <div style="font-size: 9px; color: #6b7280;">Failed</div>
                    <div style="color: #f87171; font-weight: 600;">${report.summary.failed}</div>
                </div>
            </div>
        </div>

        <div style="border-top: 1px solid #30363d; padding-top: 12px;">
            ${report.results.map(r => `
                <div style="margin-bottom: 8px; background: #161b22; border: 1px solid #30363d; border-radius: 3px; padding: 6px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span style="color: #c9d1d9; font-weight: 600;">${r.name}</span>
                        <span style="color: ${r.pass ? '#34d399' : '#f87171'};">${r.pass ? '✓' : '✗'}</span>
                    </div>
                    <div style="color: #6b7280; font-size: 9px;">${r.details}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function displayHardwareProfile() {
    const profile = window.hardwareDetector.profile;
    const settings = window.hardwareDetector.getOptimizationSettings(profile.tier);
    
    console.log('[Hardware Profile]', {
        gpu: profile.gpu,
        cores: profile.cores,
        ram: profile.ram,
        tier: profile.tier,
        recommendedFPS: profile.recommendedFPS,
        optimizations: settings
    });
}

// ==================== INITIALIZATION ====================

// Call on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initGameDevUI, 500);
    });
} else {
    initGameDevUI();
}

console.log('[GameDevUI] Module loaded');
