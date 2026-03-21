/**
 * ODT Screenshot Capture & Bot Integration
 * Universal screenshot function with fallback support
 */

class ScreenshotCapture {
    constructor() {
        this.supported = false;
        this.method = null;
        this.detectMethod();
    }

    detectMethod() {
        // Check available methods in priority order
        if (this.checkHtmlToCanvas()) {
            this.method = 'html2canvas';
            this.supported = true;
        } else if (this.checkCanvas()) {
            this.method = 'canvas-api';
            this.supported = true;
        } else if (this.checkFFMpeg()) {
            this.method = 'ffmpeg';
            this.supported = true;
        } else if (this.checkGnuplot()) {
            this.method = 'gnuplot';
            this.supported = true;
        } else {
            this.method = 'none';
            this.supported = false;
        }
    }

    checkHtmlToCanvas() {
        return typeof html2canvas !== 'undefined';
    }

    checkCanvas() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    checkFFMpeg() {
        // Would check if FFmpeg is installed on system
        return false;
    }

    checkGnuplot() {
        // Would check if Gnuplot is installed
        return false;
    }

    async captureScreen() {
        if (this.method === 'html2canvas') {
            return await this.captureWithHtml2Canvas();
        } else if (this.method === 'canvas-api') {
            return await this.captureWithCanvas();
        } else {
            return null;
        }
    }

    async captureWithHtml2Canvas() {
        try {
            const canvas = await html2canvas(document.body, {
                backgroundColor: '#0d1117',
                scale: 2,
                logging: false,
                allowTaint: true,
                useCORS: true
            });
            return canvas.toDataURL('image/png');
        } catch (err) {
            console.error('html2canvas error:', err);
            return null;
        }
    }

    async captureWithCanvas() {
        try {
            const canvas = await html2canvas(document.documentElement, {
                backgroundColor: null,
                scale: window.devicePixelRatio || 1
            });
            return canvas.toDataURL('image/png');
        } catch (err) {
            console.error('Canvas capture error:', err);
            return null;
        }
    }

    async downloadFallback(method) {
        const downloads = {
            'html2canvas': {
                name: 'html2canvas',
                url: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
                description: 'Browser-based screenshot library',
                size: '140KB'
            },
            'screenshot': {
                name: 'screenshot-desktop',
                url: 'https://www.npmjs.com/package/screenshot-desktop',
                description: 'Cross-platform desktop screenshots',
                size: 'npm install'
            },
            'ffmpeg': {
                name: 'FFmpeg',
                url: 'https://ffmpeg.org/download.html',
                description: 'Video/image processing',
                size: '50MB'
            }
        };

        return downloads[method] || downloads['html2canvas'];
    }

    getStatus() {
        return {
            supported: this.supported,
            method: this.method,
            description: this.getMethodDescription(),
            available: this.supported
        };
    }

    getMethodDescription() {
        const descriptions = {
            'html2canvas': 'Browser Canvas API - renders DOM to image',
            'canvas-api': 'Native Canvas - renders visible canvas elements',
            'ffmpeg': 'FFmpeg - system-level screenshot',
            'gnuplot': 'Gnuplot - system visualization',
            'none': 'No screenshot method available'
        };
        return descriptions[this.method];
    }
}

// Browser-side integration
const screenshotCapture = new ScreenshotCapture();

async function captureScreenshot(title = 'dashboard-screenshot') {
    if (!screenshotCapture.supported) {
        return await showScreenshotSetupDialog();
    }

    try {
        const imageData = await screenshotCapture.captureScreen();
        if (!imageData) {
            throw new Error('Screenshot capture returned empty');
        }

        return {
            success: true,
            data: imageData,
            method: screenshotCapture.method,
            timestamp: new Date(),
            title
        };
    } catch (err) {
        console.error('Screenshot error:', err);
        return await showScreenshotSetupDialog();
    }
}

async function showScreenshotSetupDialog() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'screenshotSetupModal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <span>Setup Screenshot Capture</span>
                <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
            </div>
            <div class="modal-body">
                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 12px; margin-bottom: 12px;">
                    <div style="color: #f59e0b; font-weight: 600; margin-bottom: 6px;">📸 Screenshot Not Available</div>
                    <div style="color: #c9d1d9; font-size: 11px; line-height: 1.6;">
                        Your browser needs a screenshot library to capture the dashboard. We'll download the smallest, lightest option.
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <div style="color: #58a6ff; font-weight: 600; margin-bottom: 8px; font-size: 11px;">Recommended Methods:</div>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                        <a href="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js" target="_blank" style="text-decoration: none;">
                            <button class="model-btn" style="width: 100%; background: #3b82f6; border-color: #1d4ed8; color: #fff; text-align: left; padding-left: 12px;">
                                📥 html2canvas (140KB) - Fastest<br>
                                <span style="font-size: 9px; color: #60a5fa;">Browser-based, no system dependencies</span>
                            </button>
                        </a>
                    </div>
                </div>

                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; font-size: 9px; color: #8b949e;">
                    <strong>After loading:</strong> Paste this in console:<br>
                    <code style="color: #58a6ff;">captureScreenshot()</code><br>
                    Or use the Screenshot button in the dashboard.
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.classList.add('active');

    return {
        success: false,
        error: 'Screenshot library not loaded',
        action: 'Install library from link above'
    };
}

// Upload to share server
async function uploadScreenshot(imageData, sessionId, title = 'dashboard') {
    if (!imageData) {
        addResponse('Error', 'No screenshot data');
        return false;
    }

    try {
        const res = await fetch('/api/screenshots/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageData,
                sessionId,
                title
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        addResponse('System', `📸 Screenshot shared: ${data.fileName}`);
        return data;
    } catch (err) {
        addResponse('Error', `Upload failed: ${err.message}`);
        return false;
    }
}

// For bots: fetch screenshot for analysis
async function getBotScreenshot(fileName) {
    try {
        const res = await fetch(`/api/bot/screenshot/${fileName}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.error('Bot screenshot error:', err);
        return null;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScreenshotCapture,
        captureScreenshot,
        showScreenshotSetupDialog,
        uploadScreenshot,
        getBotScreenshot
    };
}
