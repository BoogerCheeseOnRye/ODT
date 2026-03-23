# TEoAAAG - Dynamic Drive Configuration & Model Consolidation

## What Changed

### Before
- ❌ Hardcoded to use `E:\` drive
- ❌ No drive selection on first launch
- ❌ Models scattered across drive
- ❌ No duplicate detection

### After
- ✓ **Dynamic drive selection** on first launch
- ✓ **User chooses** any drive (C:, D:, E:, etc.)
- ✓ **Automatic path configuration**
- ✓ **Deduplication tools** included
- ✓ **Drive scanning tools** included
- ✓ **Consolidation tools** included

## New Files Created

### Tools
| File | Purpose |
|------|---------|
| `scan-drive.bat` | Scan entire drive for models & duplicates |
| `consolidate-models.bat` | Move all models to single directory |
| `drive-config.js` | Configuration manager (Node.js module) |
| `setup-wizard-api.js` | Setup wizard HTTP endpoints |
| `setup-wizard.html` | Visual setup wizard UI |

### Updated
| File | Changes |
|------|---------|
| `server.js` | Integrated setup wizard, dynamic paths |
| `proxy.js` | Uses dynamic models directory |

## First-Time Setup Flow

```
User starts app
    ↓
Server checks: Is app configured?
    ├─ NO → Show Setup Wizard (setup-wizard.html)
    │   ├─ Step 1: Welcome
    │   ├─ Step 2: Select Drive (auto-detects available)
    │   ├─ Step 3: Confirm paths
    │   └─ Step 4: Complete
    │       ↓
    │   Creates: X:\teoaaag-data\
    │       ├─ models\
    │       ├─ cache\
    │       └─ ollama\
    │
    └─ YES → Load Dashboard normally
```

## How Setup Wizard Works

### Step 1: Welcome
Shows introductory message and overview

### Step 2: Select Drive
- Auto-detects available drives
- Shows drive letter buttons
- User selects drive
- Can be changed later

### Step 3: Confirm
Shows paths that will be created:
- `X:\teoaaag-data\models\` ← Models here
- `X:\teoaaag-data\cache\` ← Ollama cache
- `X:\teoaaag-data\ollama\` ← Ollama metadata

### Step 4: Complete
- Configuration saved to: `%USERPROFILE%\.teoaaag\config.json`
- Directories created automatically
- Dashboard loads

## Configuration Storage

**Location:** `%USERPROFILE%\.teoaaag\config.json` (NOT in app folder)

**Example:**
```json
{
  "driveLetter": "E",
  "driveRoot": "E:\\",
  "modelsDir": "E:\\teoaaag-data\\models",
  "cacheDir": "E:\\teoaaag-data\\cache",
  "ollamaDataDir": "E:\\teoaaag-data\\ollama",
  "configuredAt": "2024-01-15T10:30:00.000Z",
  "version": "1.0"
}
```

**Why user home?**
- Survives app reinstalls
- Works across multiple app instances
- Portable across user sessions

## Tools: Drive Scanning

### scan-drive.bat
Scans entire drive for models and duplicates

**Usage:**
```batch
cd E:\dashboard-appv2
scan-drive.bat E
```

**Or interactive:**
```batch
scan-drive.bat
REM Prompts for drive letter
```

**Output:**
- `X:\scan-results\drive-scan-report.json` - Detailed JSON report
- `X:\scan-results\models-found.csv` - CSV for Excel

**Detects:**
- All `.gguf` files
- File sizes and hashes
- Potential duplicates (same size)
- Modified dates

## Tools: Model Consolidation

### consolidate-models.bat
Moves all models to single location, removes duplicates

**Usage:**
```batch
consolidate-models.bat E
```

**Or interactive:**
```batch
consolidate-models.bat
REM Prompts for source drive and target location
```

**Process:**
1. Scans entire drive for models
2. Groups by filename
3. For duplicates: keeps newest, deletes older
4. Consolidates all to target directory
5. Reports freed space

**Output:**
```
[Scanner] Finding all GGUF models...
[Found] 5 model(s)

[Processing] Consolidating models...
  [Duplicate] qwen2.5-7b.gguf
    Keep: E:\models\qwen2.5-7b.gguf [3.50GB, modified: 2024-01-10]
    Delete: E:\old-builds\qwen2.5-7b.gguf [3.50GB]
      ✓ Removed

[Result]
Duplicates Removed: 1
Space Freed: 3.50GB
Models in target: 5
```

## API Endpoints (Setup)

### Check Configuration Status
```
GET /api/setup/status
Response: { status: "CONFIGURED" | "NOT_CONFIGURED", ... }
```

### Get Available Drives
```
GET /api/setup/drives
Response: { drives: ["C", "D", "E", ...], recommended: "E" }
```

### Initialize Setup for Drive
```
POST /api/setup/initialize
Body: { drive: "E" }
Response: { success: true, config: { ... } }
```

### Get Current Config
```
GET /api/setup/config
Response: { configured: true, config: { ... } }
```

### Reset Configuration
```
POST /api/setup/reset
Response: { success: true }
```

## Configuration Module (drive-config.js)

Node.js module for managing configuration

**Usage in code:**
```javascript
const DriveConfig = require('./drive-config');
const config = new DriveConfig();

// Check if configured
if (config.isConfigured()) {
    const modelsDir = config.getModelsDir();
    const cacheDir = config.getCacheDir();
} else {
    // Run setup
    config.initializeForDrive('E');
}
```

**Methods:**
- `isConfigured()` - Check if setup is complete
- `getModelsDir()` - Get models directory
- `getCacheDir()` - Get cache directory
- `getDriveLetter()` - Get selected drive
- `getAvailableDrives()` - List available drives
- `initializeForDrive(letter)` - Run setup
- `resetConfig()` - Clear configuration
- `getSummary()` - Get config summary

## Directory Structure After Setup

```
C:\ (or selected drive)
├── teoaaag-data/
│   ├── models/              ← All models here (consolidated)
│   │   ├── qwen2.5-7b.gguf
│   │   ├── mistral-7b.gguf
│   │   └── phi-2.7b.gguf
│   ├── cache/               ← Ollama cache
│   │   └── [auto-managed]
│   └── ollama/              ← Ollama metadata
│       └── [auto-managed]
│
E:\dashboard-appv2/          ← App folder (no models)
│   ├── server.js
│   ├── proxy.js
│   ├── index.html
│   ├── drive-config.js
│   ├── setup-wizard-api.js
│   ├── setup-wizard.html
│   ├── scan-drive.bat
│   ├── consolidate-models.bat
│   └── ...

%USERPROFILE%/.teoaaag/
└── config.json              ← Configuration (survives reinstall)
```

## Deduplication Workflow

### Step 1: Scan
```batch
scan-drive.bat E
```

**Result:** Check `scan-results\drive-scan-report.json` for duplicates

### Step 2: Consolidate
```batch
consolidate-models.bat E E:\my-models
```

**Process:**
- Finds all models on E:
- Removes duplicates (keeps newest)
- Consolidates to `E:\my-models`
- Frees up space

### Step 3: Update App
Setup wizard automatically configures for consolidated location

## Migration from Old Setup

If you have models scattered across E: drive:

```batch
REM Step 1: Scan to see what you have
scan-drive.bat E

REM Step 2: Consolidate to single location
consolidate-models.bat E E:\teoaaag-data\models

REM Step 3: Start app (setup wizard will run)
cd E:\dashboard-appv2
node server.js

REM Step 4: Select E: as target drive
REM Setup wizard creates E:\teoaaag-data\ directories
REM Models automatically found from consolidation
```

## Environment Variables

**Can still be set manually (overrides config.json):**

```powershell
$env:OLLAMA_MODELS = "C:\teoaaag-data\models"
$env:OLLAMA_CACHE = "C:\teoaaag-data\cache"
$env:TEOAAAG_DRIVE = "C"
```

**But normally:** Let setup wizard handle it

## Advanced: Manual Configuration

If you need to reconfigure without setup wizard:

```javascript
// delete %USERPROFILE%\.teoaaag\config.json
// Restart app → Setup wizard runs again
```

Or via API:
```bash
curl -X POST http://localhost:9001/api/setup/reset
# App will show setup wizard on next load
```

## Troubleshooting

### "Setup wizard appears but I already configured"
- Check: `%USERPROFILE%\.teoaaag\config.json` exists
- Fix: Manually set config.json with correct paths

### "Wrong drive selected"
- Solution: Delete `%USERPROFILE%\.teoaaag\config.json`
- Restart app and run setup wizard again

### "Models not found after consolidation"
- Check: Models are actually in consolidated directory
- Run: `scan-drive.bat` to verify
- Check: OLLAMA_MODELS environment variable is set

### "Consolidation is slow"
- Normal for 5TB drive with many files
- Large files (2-7GB models) take time to copy
- Can safely cancel and resume later

### "Can't delete duplicates"
- May be in use by another process
- Close Ollama completely first
- Try again from different terminal

## Security

- Configuration stored in user home (survives reinstalls)
- Models isolated from app folder
- Path validation still enforced
- Setup wizard validates drive selection
- No network access during setup

## Next Steps

1. **First Launch:**
   - Run: `node server.js`
   - Setup wizard appears automatically
   - Select your drive
   - Dashboard loads

2. **Add Models:**
   - Copy models to: `X:\teoaaag-data\models\`
   - Or run consolidation tool
   - Dashboard scans automatically

3. **Optional: Clean Up**
   - Run: `scan-drive.bat` to find old duplicates
   - Run: `consolidate-models.bat` to consolidate
   - Delete old scattered models

Done! App now works on any drive with proper deduplication.
