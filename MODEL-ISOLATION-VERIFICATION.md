# TEoAAAG - Model Isolation Verification

## What Changed

Your dashboard now **enforces model isolation**:

✓ Models stored in `E:\models` (external)
✓ App folder `E:\dashboard-appv2` (no models here)
✓ Path validation on all operations
✓ Startup scripts with auto-config

## Files Created/Updated

### Configuration
- `.env` - Environment variables
- `.ollama-config` - Ollama setup reference
- `MODEL-ISOLATION-SETUP.md` - Detailed setup guide

### Startup Scripts
- `start-dashboard-isolated.bat` - Windows batch launcher
- `start-dashboard-isolated.ps1` - PowerShell launcher

### Core Updates
- `proxy.js` - Added `isValidModelPath()` validation
- `server.js` - Added `isValidModelPath()` validation
- Both enforce: models in E:\models, blocked from E:\dashboard-appv2

## How It Works

### Path Validation Function

Both `proxy.js` and `server.js` have this security function:

```javascript
function isValidModelPath(filePath) {
    const normalized = path.normalize(filePath);
    const appNormalized = path.normalize(APP_DIR);
    
    // REJECT if inside app directory
    if (normalized.startsWith(appNormalized)) {
        return false;
    }
    
    // ACCEPT if in models directory
    if (normalized.startsWith(path.normalize(MODELS_DIR))) {
        return true;
    }
    
    return false;
}
```

**Result:**
- ✓ `E:\models\qwen2.5.gguf` → ALLOWED
- ✓ `E:\models\subfolder\model.gguf` → ALLOWED
- ✗ `E:\dashboard-appv2\models\model.gguf` → BLOCKED
- ✗ Any app-relative path → BLOCKED

### Scan Endpoint

`GET /api/scan-models` now:
1. Only scans `E:\models`
2. Auto-creates it if missing
3. Returns only GGUF files
4. Marks them `external: true`

### Import Endpoint

`POST /api/import-model` now:
1. Validates model path with `isValidModelPath()`
2. Returns HTTP 403 if path is in app folder
3. Only accepts models from `E:\models`
4. Registers with Ollama

## Quick Setup

### 1. Set Ollama Environment (Required)

**Windows Command Prompt:**
```batch
set OLLAMA_MODELS=E:\models
set OLLAMA_CACHE=E:\cache
ollama serve
```

**Windows PowerShell:**
```powershell
$env:OLLAMA_MODELS = "E:\models"
$env:OLLAMA_CACHE = "E:\cache"
ollama serve
```

**Make Permanent:**
- `Settings → System → Environment Variables`
- New: `OLLAMA_MODELS = E:\models`
- New: `OLLAMA_CACHE = E:\cache`
- Restart Ollama

### 2. Start Dashboard

**Option A: Batch (Simple)**
```batch
cd E:\dashboard-appv2
start-dashboard-isolated.bat
```

**Option B: PowerShell (Advanced)**
```powershell
cd E:\dashboard-appv2
.\start-dashboard-isolated.ps1
```

**Option C: Manual**
```batch
set OLLAMA_MODELS=E:\models
set OLLAMA_CACHE=E:\cache
node server.js
```

## Testing Isolation

### Test 1: Scan Models
1. Open dashboard: `http://localhost:8080`
2. Click "📦 Models"
3. Click "🔍 Scan E:\models"
4. **Expected:** Either empty or shows models from `E:\models` only

### Test 2: Verify App Folder
```batch
dir E:\dashboard-appv2
```
**Expected:** NO `models\` subfolder

### Test 3: Check Ollama Data
```batch
dir E:\models
```
**Expected:** GGUF files here if any were imported

### Test 4: API Path Validation
Try importing a model from app folder (should fail with 403):
```powershell
$model = @{
    path = "E:\dashboard-appv2\test.gguf"
    name = "test"
}
Invoke-WebRequest -Uri "http://localhost:9001/api/import-model" `
    -Method POST `
    -ContentType "application/json" `
    -Body (ConvertTo-Json $model)
```
**Expected:** HTTP 403 error

## Directory Structure

```
E:\
├── dashboard-appv2/               ← App (READ-ONLY for models)
│   ├── index.html
│   ├── server.js                 ← Now validates paths
│   ├── proxy.js                  ← Now validates paths
│   ├── start-dashboard-isolated.bat
│   ├── start-dashboard-isolated.ps1
│   ├── MODEL-ISOLATION-SETUP.md
│   ├── .env
│   └── .ollama-config
│
├── models/                        ← External models (NEW)
│   ├── qwen2.5-7b.gguf          ← Safe here
│   ├── mistral-7b.gguf          ← Safe here
│   └── phi-2.7b.gguf            ← Safe here
│
├── cache/                         ← Ollama cache (NEW)
│   └── [auto-managed]
│
└── ollama-data/                   ← Ollama metadata (optional)
    └── [auto-managed]
```

## Troubleshooting

**Error: "Model must be in external directory"**
- Solution: Move model to `E:\models\`
- Check: Model path starts with `E:\models\`

**Error: "Models directory not found"**
- Solution: Create `E:\models\` or let system auto-create
- Check: `E:\models` exists

**No models showing in scan**
- Check: `.gguf` files exist in `E:\models\`
- Check: OLLAMA_MODELS is set before Ollama starts
- Rescan via dashboard UI

**Models disappeared from Ollama**
- Check: OLLAMA_MODELS environment variable is set
- Restart Ollama with: `ollama serve`
- Models stay in `E:\models\` even if Ollama forgets them

## Security Summary

### What's Protected
- App folder cannot access models from within itself
- All import/scan operations validate paths
- Environment variables prevent default Ollama locations
- No model downloads to app folder

### What's External
- Models in `E:\models` (can be moved, shared, backed up)
- Cache in `E:\cache` (can be cleared)
- Ollama data in `E:\ollama-data` (optional)

### What's Allowed
- Scan `E:\models` and subdirectories
- Import any GGUF from `E:\models`
- Use external models in queries
- Move/delete models from `E:\models` anytime

## Next Steps

1. ✓ Review this guide
2. ✓ Set OLLAMA_MODELS environment variable
3. ✓ Start Ollama: `ollama serve`
4. ✓ Start dashboard: `start-dashboard-isolated.bat`
5. ✓ Test model import
6. ✓ Verify models are in `E:\models`, not app folder

Done! Models are now properly isolated.
