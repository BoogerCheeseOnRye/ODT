// UI Customization & Feedback Features

// VM Detection & Optimization
function detectVMCapabilities() {
    const capabilities = {
        hyperV: false,
        virtualBox: false,
        vmware: false,
        parallels: false,
        kvm: false
    };
    return capabilities;
}

function checkVMInstalled() {
    const message = `
        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
            <div style="color: #8b949e; font-size: 10px; line-height: 1.8;">
                <div style="margin-bottom: 8px;"><strong>🖥️ Hyper-V</strong> (Windows 10/11 Pro+)</div>
                <div style="margin-bottom: 12px; color: #6b7280; font-size: 9px;">Recommended for Windows. Native hypervisor.</div>
                
                <div style="margin-bottom: 8px;"><strong>📦 VirtualBox</strong> (Free)</div>
                <div style="margin-bottom: 12px; color: #6b7280; font-size: 9px;">Cross-platform, open-source.</div>
                
                <div style="margin-bottom: 8px;"><strong>⚙️ VMware Player</strong> (Free)</div>
                <div style="margin-bottom: 12px; color: #6b7280; font-size: 9px;">Professional-grade performance.</div>
            </div>
        </div>
        <div style="background: #1f3a3a; border: 1px solid #34d399; border-radius: 4px; padding: 8px; margin-bottom: 12px; font-size: 9px; color: #34d399;">
            💡 Download a VM below and we'll handle the rest
        </div>
    `;
    document.getElementById('vmDetectionResults').innerHTML = message;
    
    const downloads = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="https://www.virtualbox.org/wiki/Downloads" target="_blank" rel="noopener" style="text-decoration: none;">
                <button class="model-btn" style="width: 100%; background: #3b82f6; border-color: #1d4ed8; color: #fff; text-align: center; cursor: pointer;">⬇️ VirtualBox (Free)</button>
            </a>
            <a href="https://www.vmware.com/products/workstation-player/workstation-player-evaluation.html" target="_blank" rel="noopener" style="text-decoration: none;">
                <button class="model-btn" style="width: 100%; text-align: center; cursor: pointer;">⬇️ VMware Player (Free)</button>
            </a>
            <a href="https://learn.microsoft.com/en-us/virtualization/hyper-v-on-windows/quick-start/enable-hyper-v" target="_blank" rel="noopener" style="text-decoration: none;">
                <button class="model-btn" style="width: 100%; text-align: center; cursor: pointer;">⬇️ Hyper-V (Windows)</button>
            </a>
            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; font-size: 9px; color: #8b949e;">
                After installing, we can prepare an optimized test environment for your dashboard changes.
            </div>
        </div>
    `;
    document.getElementById('vmDownloadOptions').innerHTML = downloads;
}

function launchVMOptimization() {
    checkVMInstalled();
    closeVMWarningModal();
    document.getElementById('vmSetupModal').classList.add('active');
    addResponse('System', '🖥️ Opening VM setup options...');
}

function runOptimizeHere() {
    closeVMWarningModal();
    addResponse('System', '⚠️ Starting optimization on live system...');
    setTimeout(() => {
        // Call the original runOptimize function (which we'll need to save)
        originalRunOptimizeFunction();
    }, 500);
}

function closeVMWarningModal() {
    document.getElementById('vmWarningModal').classList.remove('active');
}

function closeVMSetupModal() {
    document.getElementById('vmSetupModal').classList.remove('active');
}

// UI Customization
let currentTheme = loadFromLocalStorage('uiTheme') || 'dark';
let uiSettings = loadFromLocalStorage('uiSettings') || {};

function openUICustomizerModal() {
    document.getElementById('uiCustomizerModal').classList.add('active');
    loadUISettings();
}

function closeUICustomizerModal() {
    document.getElementById('uiCustomizerModal').classList.remove('active');
}

function loadUISettings() {
    document.getElementById('fontSizeSlider').value = uiSettings.fontSize || 11;
    document.getElementById('fontSizePreview').textContent = (uiSettings.fontSize || 11) + 'px';
    document.getElementById('compactHeader').checked = uiSettings.compactHeader || false;
    document.getElementById('wideLayout').checked = uiSettings.wideLayout || false;
}

function applyTheme(theme) {
    currentTheme = theme;
    const root = document.documentElement;
    
    if (theme === 'light') {
        root.style.colorScheme = 'light';
        document.body.style.background = '#f3f4f6';
        document.body.style.color = '#1f2937';
    } else {
        root.style.colorScheme = 'dark';
        document.body.style.background = '#0d1117';
        document.body.style.color = '#c9d1d9';
    }
    addResponse('System', `Theme changed to: ${theme}`);
}

function applyFontSize(size) {
    document.getElementById('fontSizePreview').textContent = size + 'px';
    document.documentElement.style.fontSize = size + 'px';
    uiSettings.fontSize = parseInt(size);
}

function applyHeaderLayout() {
    const compact = document.getElementById('compactHeader').checked;
    const header = document.getElementById('header');
    
    if (compact) {
        header.style.minHeight = '28px';
        header.style.padding = '4px 8px';
    } else {
        header.style.minHeight = '40px';
        header.style.padding = '10px 12px';
    }
    uiSettings.compactHeader = compact;
}

function applyLayoutPreference() {
    const wide = document.getElementById('wideLayout').checked;
    const leftPanel = document.getElementById('left-panel');
    const rightPanel = document.getElementById('right-panel');
    
    if (wide && !isMobile) {
        leftPanel.style.flex = '0 0 400px';
        rightPanel.style.flex = '0 0 400px';
    } else {
        leftPanel.style.flex = '';
        rightPanel.style.flex = '';
    }
    uiSettings.wideLayout = wide;
}

function saveUIChanges() {
    saveToLocalStorage('uiTheme', currentTheme);
    saveToLocalStorage('uiSettings', uiSettings);
    addResponse('System', '✓ UI settings saved');
    closeUICustomizerModal();
}

function resetUIToDefaults() {
    currentTheme = 'dark';
    uiSettings = {};
    applyTheme('dark');
    document.getElementById('compactHeader').checked = false;
    document.getElementById('wideLayout').checked = false;
    applyHeaderLayout();
    applyLayoutPreference();
    saveUIChanges();
    addResponse('System', '↻ UI reset to defaults');
}

// Feedback System
function openFeedbackModal() {
    document.getElementById('feedbackModal').classList.add('active');
}

function closeFeedbackModal() {
    document.getElementById('feedbackModal').classList.remove('active');
}

async function submitFeedback() {
    const type = document.getElementById('feedbackType').value;
    const text = document.getElementById('feedbackText').value.trim();
    
    if (!text) {
        addResponse('Error', 'Please enter your feedback');
        return;
    }

    const feedbackPrompt = `You are a product planning expert. Analyze this user feedback for TEoAAAG Dashboard and create a detailed plan:\n\nFeedback Type: ${type}\nUser Input: ${text}\n\nProvide:\n1. Summary of the request\n2. Proposed solution/implementation\n3. UI/UX changes needed (if any)\n4. Estimated complexity (Easy/Medium/Hard)\n5. Suggested priority (Low/Medium/High)\n6. Dependencies or risks\n\nBe specific and actionable.`;

    const result = document.getElementById('feedbackResult');
    result.style.display = 'block';
    result.innerHTML = '<div style="color: #58a6ff;">Sending to planning bot...</div>';

    try {
        const res = await fetch(PROXY_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL,
                prompt: feedbackPrompt,
                stream: false
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (data.response) {
            result.innerHTML = `
                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px;">
                    <div style="color: #58a6ff; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Planning Bot Response:</div>
                    <div style="color: #c9d1d9; font-size: 10px; line-height: 1.6; white-space: pre-wrap;">${data.response.substring(0, 500)}...</div>
                    <div style="margin-top: 8px; font-size: 9px; color: #6b7280;">Full response added to chat</div>
                </div>
            `;
            addResponse('Planner', data.response);
            document.getElementById('feedbackText').value = '';
        }
    } catch (err) {
        result.innerHTML = `<div style="color: #f87171;">Error: ${err.message}</div>`;
    }
}

// Override runOptimize to show warning
function replaceOptimizeWithWarning() {
    // Save original if needed for "Optimize Here" path
    window.originalRunOptimizeFunction = window.runOptimize;
    
    // Replace with warning version
    window.runOptimize = function() {
        document.getElementById('vmWarningModal').classList.add('active');
    };
}
