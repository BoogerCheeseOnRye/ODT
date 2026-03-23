// TEoAAAG - Setup Wizard (API Endpoints)
// Handles first-time configuration via HTTP endpoints
// Called before dashboard fully loads

const http = require('http');
const path = require('path');
const fs = require('fs');
const DriveConfig = require('./drive-config');

const driveConfig = new DriveConfig();

// Create setup wizard HTTP handler
function setupWizardHandler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Get setup status
    if (req.url === '/api/setup/status' && req.method === 'GET') {
        const summary = driveConfig.getSummary();
        res.writeHead(200);
        res.end(JSON.stringify(summary));
        return;
    }

    // Get available drives
    if (req.url === '/api/setup/drives' && req.method === 'GET') {
        const drives = driveConfig.getAvailableDrives();
        res.writeHead(200);
        res.end(JSON.stringify({ 
            drives: drives,
            recommended: drives[0] || null,
            message: `Found ${drives.length} drive(s)`
        }));
        return;
    }

    // Initialize setup for a drive
    if (req.url === '/api/setup/initialize' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const driveLetter = data.drive?.toUpperCase()?.[0];

                if (!driveLetter || !/^[A-Z]$/.test(driveLetter)) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ 
                        success: false, 
                        error: 'Invalid drive letter' 
                    }));
                    return;
                }

                // Initialize for selected drive
                const config = driveConfig.initializeForDrive(driveLetter);

                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    message: `Setup complete for ${driveLetter}:\\`,
                    config: {
                        drive: config.driveLetter,
                        modelsDir: config.modelsDir,
                        cacheDir: config.cacheDir,
                        configuredAt: config.configuredAt
                    }
                }));
            } catch (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ 
                    success: false, 
                    error: err.message 
                }));
            }
        });
        return;
    }

    // Reset setup (for troubleshooting)
    if (req.url === '/api/setup/reset' && req.method === 'POST') {
        const success = driveConfig.resetConfig();
        res.writeHead(200);
        res.end(JSON.stringify({
            success: success,
            message: success ? 'Setup reset. Page will reload.' : 'Error resetting setup'
        }));
        return;
    }

    // Get config details
    if (req.url === '/api/setup/config' && req.method === 'GET') {
        const config = driveConfig.getConfig();
        if (!config) {
            res.writeHead(200);
            res.end(JSON.stringify({ 
                configured: false,
                message: 'Setup not complete'
            }));
            return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({
            configured: true,
            config: config,
            summary: driveConfig.getSummary()
        }));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
}

// Export for use in server.js
module.exports = setupWizardHandler;
