# TEoAAAG - Model Isolation Setup Guide

This dashboard enforces **models stored EXTERNAL to the app folder** on the E: drive.

## Quick Start

### 1. Configure Ollama (IMPORTANT)

**Windows PowerShell (Admin):**
```powershell
# Set Ollama to use external models directory
$env:OLLAMA_MODELS = "E:\models"
$env:OLLAMA_CACHE = "E:\cache"

# Start Ollama with these settings
ollama serve
```

**Make it Permanent (System Environment Variables):**
- Open: `Settings → System → Environment Variables`
- Click "New" under System Variables:
  - Variable: `OLLAMA_MODELS`
  - Value: `E:\models`
- Click "New" again:
  - Variable: `OLLAMA_CACHE`
  - Value: `E:\cache`
- Restart Ollama

### 2. Directory Structure

```
E:\
├── dashboard-appv2/          ← App folder (NO models here)
│   ├── index.html
│   ├── server.js
│   └── proxy.js
├── models/                   ← External models (REQUIRED)
│   ├── qwen2.5-7b.gguf
│   ├── mistral-7b.gguf
│   └── ... (your models)
├── cache/                    ← Ollama cache
├── ollama-data/              ← Ollama metadata
└── hermes/                   ← Agent directory
```

### 3. Start the Dashboard

**PowerShell:**
```powershell
cd E:\dashboard-appv2
node server.js
```

The dashboard will:
- Start on `http://localhost:8080`
- Proxy will run on `http://localhost:9001`
- Scan models in `E:\models` (not app folder)
- Reject any attempt to use models from app directory

### 4. Import Local Models

Dashboard UI:
1. Click "📦 Model Manager"
2. Click "🔍 Scan E:\models"
3. Select a model and click "Import"

Models stay in `E:\models` - they are **NOT copied** to the app folder.

## Security Features

✓ Path validation on all model operations
✓ Models cannot be loaded from app directory
✓ Import endpoint rejects app-relative paths
✓ Scan endpoint only searches `E:\models`
✓ Auto-creates `E:\models` if missing

## Troubleshooting

**"Models directory not found"**
→ The system will auto-create `E:\models` on first scan

**"Model must be in external directory"**
→ You tried to use a model from app folder. Use models from `E:\models` only.

**"Ollama unavailable"**
→ Make sure `ollama serve` is running with `OLLAMA_MODELS=E:\models` set

**"No models found after scanning"**
→ Place `.gguf` files in `E:\models\` and rescan

## API Endpoints

- `/api/scan-models` - List models in E:\models (external only)
- `/api/import-model` - Register existing model (validates path)
- `/api/generate` - Query Ollama
- `/api/tags` - Get loaded models

All paths are validated to prevent loading from app directory.

## Environment Variables

Set these before running `node server.js`:

```powershell
$env:DASHBOARD_PORT = "8080"
$env:PROXY_PORT = "9001"
$env:OLLAMA_HOST = "http://localhost:11434"
$env:OLLAMA_MODELS = "E:\models"
$env:OLLAMA_CACHE = "E:\cache"
```

## Notes

- Models must be `.gguf` format
- App folder (`E:\dashboard-appv2`) is READ-ONLY for models
- All downloads/imports go to `E:\models`
- Cache stored in `E:\cache`
- Configuration in `E:\dashboard-appv2\.env` (optional override)
