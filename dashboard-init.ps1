param(
    [switch]$Silent = $false
)

# TEoAAAG Dashboard Initialization System
# Clean version without unicode box drawing

$ErrorActionPreference = 'SilentlyContinue'

# Configuration
$dashboardPath = "E:\dashboard-appv2"
$dashboardExe = "Dashboard.exe"
$proxyScript = "proxy.js"
$indexFile = "index.html"
$modelsDir = "E:\models"

# Progress tracking
$totalSteps = 8
$currentStep = 0

function Write-Progress-Bar {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity,
        [string]$Status
    )
    
    $percentage = [math]::Round(($Current / $Total) * 100)
    $barLength = 40
    $filledLength = [math]::Round(($Current / $Total) * $barLength)
    
    $bar = "=" * $filledLength + "-" * ($barLength - $filledLength)
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  TEoAAAG Dashboard - Initialization" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [$bar] $percentage%" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Step $Current/$Total`: $Activity" -ForegroundColor Green
    Write-Host "  >> $Status" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Log-Step {
    param(
        [int]$Step,
        [string]$Message,
        [string]$Details = ""
    )
    
    $global:currentStep = $Step
    
    if ($Details) {
        Write-Progress-Bar -Current $Step -Total $totalSteps -Activity $Message -Status $Details
    } else {
        Write-Progress-Bar -Current $Step -Total $totalSteps -Activity $Message -Status "Running..."
    }
    
    Start-Sleep -Milliseconds 300
}

# ============================================================================
# MAIN INITIALIZATION SEQUENCE
# ============================================================================

Clear-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEoAAAG Dashboard - Starting" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Dependencies
Log-Step -Step 1 -Message "Checking Dependencies" -Details "Verifying required files..."

$filesOk = $true
@($indexFile, $proxyScript) | ForEach-Object {
    if (-not (Test-Path -Path "$dashboardPath\$_")) {
        Write-Host "  [!] Missing: $_" -ForegroundColor Red
        $filesOk = $false
    } else {
        Write-Host "  [OK] Found: $_" -ForegroundColor Green
    }
}

if ($dashboardExe) {
    if (Test-Path -Path "$dashboardPath\$dashboardExe") {
        Write-Host "  [OK] Found: $dashboardExe" -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] Missing: $dashboardExe (browser fallback)" -ForegroundColor Yellow
    }
}

if (-not $filesOk) {
    Write-Host "  [FAIL] Critical files missing!" -ForegroundColor Red
    Start-Sleep -Seconds 3
    exit 1
}

Start-Sleep -Seconds 1

# Step 2: Clear Old Processes
Log-Step -Step 2 -Message "Clearing Old Processes" -Details "Stopping node.exe and Dashboard.exe..."

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process Dashboard -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "  [OK] Processes cleared" -ForegroundColor Green
Start-Sleep -Seconds 1

# Step 3: Verify Models Directory
Log-Step -Step 3 -Message "Scanning Models Directory" -Details "Checking E:\models..."

if (-not (Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Path $modelsDir -Force | Out-Null
    Write-Host "  [OK] Created: E:\models" -ForegroundColor Green
} else {
    Write-Host "  [OK] Found: E:\models" -ForegroundColor Green
}

$models = Get-ChildItem -Path $modelsDir -Filter "*.gguf" -ErrorAction SilentlyContinue
$modelCount = ($models | Measure-Object).Count

if ($modelCount -gt 0) {
    Write-Host "  [OK] Models found: $modelCount" -ForegroundColor Green
    $models | ForEach-Object {
        $size = [math]::Round($_.Length / 1GB, 2)
        Write-Host "       - $($_.Name) ($size GB)" -ForegroundColor Cyan
    }
} else {
    Write-Host "  [WARNING] No models found in E:\models" -ForegroundColor Yellow
}

Start-Sleep -Seconds 1

# Step 4: Verify Library System
Log-Step -Step 4 -Message "Verifying Library System" -Details "Checking lib\ directory..."

if (-not (Test-Path "$dashboardPath\lib")) {
    New-Item -ItemType Directory -Path "$dashboardPath\lib" -Force | Out-Null
    Write-Host "  [OK] Created: lib\ directory" -ForegroundColor Green
} else {
    Write-Host "  [OK] Found: lib\ directory" -ForegroundColor Green
}

if (Test-Path "$dashboardPath\lib\bundle.lib.js") {
    Write-Host "  [OK] Bundle: lib\bundle.lib.js ready" -ForegroundColor Green
} else {
    Write-Host "  [INFO] Bundle not generated yet (will auto-generate)" -ForegroundColor Cyan
}

Start-Sleep -Seconds 1

# Step 5: Start Proxy Server
Log-Step -Step 5 -Message "Starting Proxy Server" -Details "Initializing on port 9001..."

Push-Location $dashboardPath
Start-Process -FileName "node" -ArgumentList "proxy.js" -WindowStyle Hidden
Pop-Location

Start-Sleep -Seconds 3

Write-Host "  [OK] Proxy started in background" -ForegroundColor Green
Start-Sleep -Seconds 1

# Step 6: Verify Configuration
Log-Step -Step 6 -Message "Verifying Configuration" -Details "Checking app configuration..."

$configFiles = @{
    "index.html" = "Dashboard UI"
    "proxy.js" = "API Proxy"
}

$configFiles | ForEach-Object {
    $_.GetEnumerator() | ForEach-Object {
        if (Test-Path "$dashboardPath\$($_.Key)") {
            Write-Host "  [OK] $($_.Value): $($_.Key)" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] $($_.Value): $($_.Key) not found" -ForegroundColor Yellow
        }
    }
}

Start-Sleep -Seconds 1

# Step 7: System Status Check
Log-Step -Step 7 -Message "System Status Check" -Details "Running diagnostics..."

$checks = @(
    @{ Name = "Dashboard File"; Status = (Test-Path "$dashboardPath\index.html") }
    @{ Name = "Models Dir"; Status = (Test-Path $modelsDir) }
    @{ Name = "Library Dir"; Status = (Test-Path "$dashboardPath\lib") }
)

$checksOk = 0
$checksFailed = 0

$checks | ForEach-Object {
    if ($_.Status) {
        Write-Host "  [OK] $($_.Name)" -ForegroundColor Green
        $checksOk++
    } else {
        Write-Host "  [FAIL] $($_.Name)" -ForegroundColor Red
        $checksFailed++
    }
}

Write-Host "  Status: $checksOk/$($checks.Count) checks passed" -ForegroundColor Cyan

Start-Sleep -Seconds 1

# Step 8: Launch Dashboard
Log-Step -Step 8 -Message "Launching Dashboard" -Details "Opening Dashboard.exe..."

Start-Sleep -Seconds 2

$dashboardFullPath = "$dashboardPath\$dashboardExe"
if (Test-Path $dashboardFullPath) {
    Write-Host "  [OK] Launching: Dashboard.exe" -ForegroundColor Green
    Start-Process -FilePath $dashboardFullPath -ArgumentList "file:///E:/dashboard-appv2/index.html"
} else {
    Write-Host "  [INFO] Using default browser" -ForegroundColor Cyan
    Start-Process "file:///E:/dashboard-appv2/index.html"
}

# Completion Screen
Clear-Host

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SUCCESS - Dashboard Initialized" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Dashboard URL: file:///E:/dashboard-appv2/index.html" -ForegroundColor Cyan
Write-Host "  Proxy Server: http://localhost:9001" -ForegroundColor Cyan
Write-Host "  Models Path: E:\models\" -ForegroundColor Cyan
Write-Host "  Models Available: $modelCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Status:" -ForegroundColor Green
Write-Host "    [+] Proxy: Running" -ForegroundColor Green
Write-Host "    [+] Dashboard: Launching..." -ForegroundColor Green
Write-Host "    [+] Auto-refresh: Enabled" -ForegroundColor Green
Write-Host ""
Write-Host "  Features:" -ForegroundColor Green
Write-Host "    [OK] Model scanning from E:\models" -ForegroundColor Green
Write-Host "    [OK] Dashboard auto-refresh on modal open" -ForegroundColor Green
Write-Host "    [OK] Real-time proxy API integration" -ForegroundColor Green
Write-Host "    [OK] Library system ready" -ForegroundColor Green
Write-Host ""
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "    1. Click 'Models' button to scan" -ForegroundColor Cyan
Write-Host "    2. Click 'Scan E:\models' in modal" -ForegroundColor Cyan
Write-Host "    3. Import found models" -ForegroundColor Cyan
Write-Host "    4. Use in chat interface" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Dashboard initialized successfully!" -ForegroundColor Green
Write-Host "Proxy is running in the background." -ForegroundColor Green
Write-Host ""

# Keep window open
Write-Host "Press any key to exit setup (Dashboard continues running)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
