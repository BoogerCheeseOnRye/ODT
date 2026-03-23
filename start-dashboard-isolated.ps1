# TEoAAAG Dashboard Startup with Model Isolation
# PowerShell version with better output and validation

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      TEoAAAG - Model Isolation         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Set environment variables
$env:OLLAMA_MODELS = "E:\models"
$env:OLLAMA_CACHE = "E:\cache"
$env:OLLAMA_AUTO_UPDATE = "false"
$env:DASHBOARD_PORT = "8080"
$env:PROXY_PORT = "9001"
$env:OLLAMA_HOST = "http://localhost:11434"

Write-Host "[Setup] Environment configured:" -ForegroundColor Green
Write-Host "  ✓ OLLAMA_MODELS=E:\models"
Write-Host "  ✓ OLLAMA_CACHE=E:\cache"
Write-Host "  ✓ DASHBOARD_PORT=8080"
Write-Host "  ✓ PROXY_PORT=9001`n"

# Create directories
if (-not (Test-Path "E:\models")) {
    Write-Host "[Setup] Creating E:\models..." -ForegroundColor Yellow
    New-Item -Path "E:\models" -ItemType Directory -Force | Out-Null
}

if (-not (Test-Path "E:\cache")) {
    Write-Host "[Setup] Creating E:\cache..." -ForegroundColor Yellow
    New-Item -Path "E:\cache" -ItemType Directory -Force | Out-Null
}

Write-Host "[Setup] Directories ready`n" -ForegroundColor Green

# Check Node.js
$nodeExists = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
if (-not $nodeExists) {
    Write-Host "[Error] Node.js not found!" -ForegroundColor Red
    Write-Host "Install from: https://nodejs.org`n"
    Read-Host "Press Enter to exit"
    exit 1
}

# Check Ollama status
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Starting TEoAAAG Dashboard...       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Start server
Set-Location -Path $PSScriptRoot
Write-Host "[Server] Launching on http://localhost:8080`n" -ForegroundColor Green
node server.js
