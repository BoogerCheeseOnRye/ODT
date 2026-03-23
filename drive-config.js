// TEoAAAG - Drive Configuration Manager
// Handles first-time drive selection and persistent configuration
// Replaces hardcoded E:\ with dynamic drive selection

const fs = require('fs');
const path = require('path');
const os = require('os');

// Configuration file location (user home directory, not app folder)
const CONFIG_DIR = path.join(os.homedir(), '.odt');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

class DriveConfig {
    constructor() {
        this.config = this.loadConfig();
    }

    // Ensure config directory exists
    ensureConfigDir() {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
            console.log(`[Config] Created config directory: ${CONFIG_DIR}`);
        }
    }

    // Load existing configuration
    loadConfig() {
        this.ensureConfigDir();

        if (fs.existsSync(CONFIG_FILE)) {
            try {
                const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
                const config = JSON.parse(data);
                console.log(`[Config] Loaded from: ${CONFIG_FILE}`);
                return config;
            } catch (err) {
                console.error(`[Config] Error loading config: ${err.message}`);
                return null;
            }
        }

        console.log(`[Config] No configuration found at: ${CONFIG_FILE}`);
        return null;
    }

    // Save configuration
    saveConfig(config) {
        this.ensureConfigDir();

        try {
            fs.writeFileSync(
                CONFIG_FILE,
                JSON.stringify(config, null, 2),
                'utf-8'
            );
            console.log(`[Config] Saved to: ${CONFIG_FILE}`);
            this.config = config;
            return true;
        } catch (err) {
            console.error(`[Config] Error saving config: ${err.message}`);
            return false;
        }
    }

    // Get current configuration
    getConfig() {
        return this.config;
    }

    // Check if configuration exists and is valid
    isConfigured() {
        if (!this.config) return false;

        const required = ['driveLetter', 'modelsDir', 'cacheDir', 'configuredAt'];
        return required.every(key => this.config.hasOwnProperty(key));
    }

    // Get models directory
    getModelsDir() {
        if (!this.isConfigured()) {
            throw new Error('Application not configured. Run setup wizard.');
        }
        return this.config.modelsDir;
    }

    // Get cache directory
    getCacheDir() {
        if (!this.isConfigured()) {
            throw new Error('Application not configured. Run setup wizard.');
        }
        return this.config.cacheDir;
    }

    // Get drive letter
    getDriveLetter() {
        if (!this.isConfigured()) {
            throw new Error('Application not configured. Run setup wizard.');
        }
        return this.config.driveLetter;
    }

    // Create default configuration for a drive
    createDefaultConfig(driveLetter) {
        const driveRoot = `${driveLetter}:\\`;
        const modelsDir = path.join(driveRoot, 'odt-data', 'models');
        const cacheDir = path.join(driveRoot, 'odt-data', 'cache');

        return {
            driveLetter: driveLetter.toUpperCase(),
            driveRoot: driveRoot,
            modelsDir: modelsDir,
            cacheDir: cacheDir,
            ollamaDataDir: path.join(driveRoot, 'odt-data', 'ollama'),
            configuredAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    // Initialize with user-selected drive
    initializeForDrive(driveLetter) {
        console.log(`\n[Config] Initializing for drive: ${driveLetter}\\`);

        const config = this.createDefaultConfig(driveLetter);

        // Create directories
        this.createDirectories(config);

        // Save configuration
        this.saveConfig(config);

        // Set environment variables
        this.setEnvironmentVariables(config);

        console.log(`[Config] Setup complete for ${driveLetter}:\\`);
        console.log(`[Config] Models: ${config.modelsDir}`);
        console.log(`[Config] Cache: ${config.cacheDir}`);

        return config;
    }

    // Create all necessary directories
    createDirectories(config) {
        const dirs = [
            config.modelsDir,
            config.cacheDir,
            config.ollamaDataDir
        ];

        for (const dir of dirs) {
            try {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                    console.log(`[Setup] Created directory: ${dir}`);
                }
            } catch (err) {
                console.error(`[Setup] Error creating ${dir}: ${err.message}`);
            }
        }
    }

    // Set environment variables for session
    setEnvironmentVariables(config) {
        process.env.OLLAMA_MODELS = config.modelsDir;
        process.env.OLLAMA_CACHE = config.cacheDir;
        process.env.TEOAAAG_DRIVE = config.driveLetter;
        process.env.TEOAAAG_MODELS_DIR = config.modelsDir;
        process.env.TEOAAAG_CACHE_DIR = config.cacheDir;

        console.log(`[Config] Environment variables set:`, {
            OLLAMA_MODELS: process.env.OLLAMA_MODELS,
            OLLAMA_CACHE: process.env.OLLAMA_CACHE,
            TEOAAAG_DRIVE: process.env.TEOAAAG_DRIVE
        });
    }

    // Get all available drives
    getAvailableDrives() {
        const drives = [];

        // Windows: Check A-Z for available drives
        if (process.platform === 'win32') {
            const { execSync } = require('child_process');
            try {
                const result = execSync('wmic logicaldisk get name', { encoding: 'utf-8' });
                const lines = result.split('\n');

                for (const line of lines) {
                    const match = line.match(/^([A-Z]):/);
                    if (match) {
                        drives.push(match[1]);
                    }
                }
            } catch (err) {
                console.warn('[Config] Error detecting drives:', err.message);
            }
        } else {
            // Unix/Linux: Common mount points
            const commonMounts = ['/', '/mnt', '/media'];
            for (const mount of commonMounts) {
                if (fs.existsSync(mount)) {
                    drives.push(mount);
                }
            }
        }

        return drives.sort();
    }

    // Reset configuration
    resetConfig() {
        try {
            if (fs.existsSync(CONFIG_FILE)) {
                fs.unlinkSync(CONFIG_FILE);
                console.log(`[Config] Configuration reset. Delete: ${CONFIG_FILE}`);
            }
            this.config = null;
            return true;
        } catch (err) {
            console.error(`[Config] Error resetting config: ${err.message}`);
            return false;
        }
    }

    // Export configuration summary
    getSummary() {
        if (!this.isConfigured()) {
            return {
                status: 'NOT_CONFIGURED',
                message: 'Application setup wizard needs to run'
            };
        }

        return {
            status: 'CONFIGURED',
            drive: this.config.driveLetter,
            modelsDir: this.config.modelsDir,
            cacheDir: this.config.cacheDir,
            configuredAt: this.config.configuredAt,
            models: this.countModels(),
            version: this.config.version
        };
    }

    // Count models in models directory
    countModels() {
        try {
            if (!fs.existsSync(this.config.modelsDir)) {
                return 0;
            }

            const files = fs.readdirSync(this.config.modelsDir);
            return files.filter(f => f.toLowerCase().endsWith('.gguf')).length;
        } catch (err) {
            return 0;
        }
    }
}

module.exports = DriveConfig;
