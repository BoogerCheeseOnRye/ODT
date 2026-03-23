@echo off
REM TEoAAAG - Deduplication & Consolidation Tool
REM Moves all models to single directory, removes duplicates
REM Usage: consolidate-models.bat

cls
echo.
echo ╔═════════════════════════════════════════════════════╗
echo ║    TEoAAAG - Model Consolidation Tool              ║
echo ║                                                    ║
echo ║  Moves all models to one location                 ║
echo ║  Removes duplicates (keeps newest)                ║
echo ║  Updates app configuration                        ║
echo ╚═════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion

REM Step 1: Get source drive
if "%1"=="" (
    echo Step 1: Select drive to scan for models
    echo.
    echo Available drives:
    wmic logicaldisk get name ^| findstr /r "^[A-Z]"
    echo.
    set /p SOURCE_DRIVE="Enter drive letter (E, C, D, etc): "
) else (
    set SOURCE_DRIVE=%1
)

set SOURCE_DRIVE=%SOURCE_DRIVE:~0,1%

REM Step 2: Get target location
echo.
echo Step 2: Where should models be consolidated?
echo.
echo Option 1: %SOURCE_DRIVE%:\models (recommended)
echo Option 2: Custom location
echo.
set /p CHOICE="Enter choice (1 or 2): "

if "!CHOICE!"=="2" (
    set /p TARGET_DIR="Enter full path (e.g., %SOURCE_DRIVE%:\my-models): "
) else (
    set TARGET_DIR=%SOURCE_DRIVE%:\models
)

REM Create target directory
if not exist "!TARGET_DIR!" (
    echo [Setup] Creating directory: !TARGET_DIR!
    mkdir "!TARGET_DIR!"
)

echo.
echo [Config] Source: %SOURCE_DRIVE%:\
echo [Config] Target: !TARGET_DIR!
echo.

REM Create PowerShell consolidation script
(
    echo # TEoAAAG Model Consolidation
    echo $sourceDrive = "%SOURCE_DRIVE%:\"
    echo $targetDir = "!TARGET_DIR!"
    echo.
    echo Write-Host "[Scanner] Finding all GGUF models on $sourceDrive..." -ForegroundColor Cyan
    echo.
    echo # Find all GGUF files
    echo $models = @()
    echo try {
    echo     $models = Get-ChildItem -Path $sourceDrive -Recurse -Filter "*.gguf" -ErrorAction SilentlyContinue
    echo } catch {
    echo     Write-Host "[Error] $_" -ForegroundColor Red
    echo }
    echo.
    echo Write-Host "[Found] $($models.Count) model(s)" -ForegroundColor Green
    echo.
    echo if ($models.Count -eq 0) {
    echo     Write-Host "[Info] No models found to consolidate." -ForegroundColor Yellow
    echo     exit
    echo }
    echo.
    echo # Group by filename to find duplicates
    echo $byName = $models ^| Group-Object -Property Name
    echo $consolidated = @()
    echo $duplicatesRemoved = 0
    echo $totalFreed = 0
    echo.
    echo Write-Host "[Processing] Consolidating models..." -ForegroundColor Cyan
    echo Write-Host ""
    echo.
    echo foreach ($nameGroup in $byName) {
    echo     $fileName = $nameGroup.Name
    echo     $copies = $nameGroup.Group ^| Sort-Object -Property LastWriteTime -Descending
    echo.
    echo     # Keep the newest, mark others for deletion
    echo     $keep = $copies[0]
    echo     $dupsToDelete = $copies[1..($copies.Length-1)]
    echo.
    echo     if ($dupsToDelete.Count -gt 0) {
    echo         Write-Host "  [Duplicate] $fileName" -ForegroundColor Yellow
    echo         Write-Host "    Keep: $($keep.FullName) [$(($keep.Length/1GB).ToString('F2'))GB, modified: $($keep.LastWriteTime.ToString('yyyy-MM-dd'))]" -ForegroundColor Green
    echo.
    echo         foreach ($dup in $dupsToDelete) {
    echo             Write-Host "    Delete: $($dup.FullName) [$(($dup.Length/1GB).ToString('F2'))GB]" -ForegroundColor Red
    echo             try {
    echo                 Remove-Item -Path $dup.FullName -Force
    echo                 $duplicatesRemoved++
    echo                 $totalFreed += $dup.Length
    echo                 Write-Host "      ✓ Removed" -ForegroundColor Green
    echo             } catch {
    echo                 Write-Host "      ✗ Error: $_" -ForegroundColor Red
    echo             }
    echo         }
    echo     }
    echo.
    echo     # Copy to target if not already there
    echo     $targetPath = Join-Path $targetDir $fileName
    echo     if (-not (Test-Path $targetPath)) {
    echo         Write-Host "  [Copy] $fileName -> $targetDir" -ForegroundColor Cyan
    echo         try {
    echo             Copy-Item -Path $keep.FullName -Destination $targetPath -Force
    echo             Write-Host "    ✓ Copied $(($keep.Length/1GB).ToString('F2'))GB" -ForegroundColor Green
    echo         } catch {
    echo             Write-Host "    ✗ Error: $_" -ForegroundColor Red
    echo         }
    echo     } else {
    echo         Write-Host "  [Exists] $fileName already in target" -ForegroundColor Gray
    echo     }
    echo     Write-Host ""
    echo }
    echo.
    echo # Summary
    echo Write-Host ""
    echo Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    echo Write-Host "Consolidation Complete" -ForegroundColor Green
    echo Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    echo Write-Host "Duplicates Removed: $duplicatesRemoved" -ForegroundColor Yellow
    echo Write-Host "Space Freed: $(($totalFreed/1GB).ToString('F2'))GB" -ForegroundColor Yellow
    echo Write-Host "Models in $targetDir: $($byName.Count)" -ForegroundColor Green
    echo Write-Host ""
    echo.
    echo # List final models
    echo Write-Host "Final Models:" -ForegroundColor Cyan
    echo $finalModels = Get-ChildItem -Path $targetDir -Filter "*.gguf" -ErrorAction SilentlyContinue
    echo foreach ($model in $finalModels) {
    echo     Write-Host "  [$((model.Length/1GB).ToString('F2'))GB] $($model.Name)" -ForegroundColor White
    echo }
) > "%temp%\consolidate.ps1"

REM Run consolidation
powershell -ExecutionPolicy Bypass -File "%temp%\consolidate.ps1"

echo.
echo [Done] Models consolidated to: !TARGET_DIR!
echo.

REM Cleanup
del "%temp%\consolidate.ps1" 2>nul

pause
