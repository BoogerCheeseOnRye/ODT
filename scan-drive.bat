@echo off
REM TEoAAAG - Drive Scanner & Deduplication Tool
REM Scans entire drive for models and duplicates
REM Usage: scan-drive.bat

cls
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║       TEoAAAG - Drive Scanner & Deduplication        ║
echo ║                                                        ║
echo ║     Scans for: .gguf models, duplicates, stats        ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion

REM Get drive letter from user if not specified
if "%1"=="" (
    echo Select drive to scan:
    echo.
    echo Drives available:
    wmic logicaldisk get name | findstr /r "^[A-Z]"
    echo.
    set /p SCAN_DRIVE="Enter drive letter (C, D, E, F, etc): "
) else (
    set SCAN_DRIVE=%1
)

set SCAN_DRIVE=%SCAN_DRIVE:~0,1%

echo.
echo [Scanner] Starting scan of %SCAN_DRIVE%:\ drive...
echo.

REM Create output directory
if not exist "%SCAN_DRIVE%:\scan-results" mkdir "%SCAN_DRIVE%:\scan-results"

REM Create PowerShell script inline to do the scanning
(
    echo # TEoAAAG Drive Scanner
    echo $drive = "%SCAN_DRIVE%:\"
    echo $results = @{
    echo     models = @()
    echo     duplicates = @()
    echo     totalSize = 0
    echo     stats = @{}
    echo }
    echo.
    echo Write-Host "[Scanner] Scanning $drive for .gguf files..." -ForegroundColor Cyan
    echo.
    echo # Find all GGUF files
    echo $ggufFiles = @()
    echo try {
    echo     $ggufFiles = Get-ChildItem -Path $drive -Recurse -Filter "*.gguf" -ErrorAction SilentlyContinue
    echo } catch {
    echo     Write-Host "[Error] $($_.Exception.Message)" -ForegroundColor Red
    echo }
    echo.
    echo Write-Host "[Found] $($ggufFiles.Count) GGUF file(s)" -ForegroundColor Green
    echo.
    echo if ($ggufFiles.Count -gt 0) {
    echo     # Analyze each file
    echo     foreach ($file in $ggufFiles) {
    echo         $sizeGB = [math]::Round($file.Length / 1GB, 2)
    echo         $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256 -ErrorAction SilentlyContinue).Hash
    echo.
    echo         $results.models += @{
    echo             name = $file.Name
    echo             path = $file.FullName
    echo             size = $sizeGB
    echo             hash = $hash
    echo             created = $file.CreationTime
    echo             modified = $file.LastWriteTime
    echo         }
    echo.
    echo         $results.totalSize += $file.Length
    echo     }
    echo.
    echo     # Find duplicates by size and hash
    echo     $bySize = $results.models ^| Group-Object -Property size
    echo     $byHash = $results.models ^| Group-Object -Property hash
    echo.
    echo     foreach ($sizeGroup in $bySize) {
    echo         if ($sizeGroup.Count -gt 1) {
    echo             # Potential duplicates (same size)
    echo             $results.duplicates += @{
    echo                 type = "same-size"
    echo                 size = $sizeGroup.Name
    echo                 count = $sizeGroup.Count
    echo                 files = $sizeGroup.Group.name
    echo             }
    echo         }
    echo     }
    echo.
    echo     # Output report
    echo     Write-Host "[Report] Scan Complete" -ForegroundColor Green
    echo     Write-Host ""
    echo     Write-Host "Models Found: $($results.models.Count)"
    echo     Write-Host "Total Size: $(($results.totalSize / 1GB).ToString('F2')) GB"
    echo     Write-Host "Potential Duplicates: $($results.duplicates.Count)"
    echo     Write-Host ""
    echo.
    echo     # Save detailed JSON report
    echo     $reportPath = "%SCAN_DRIVE%:\scan-results\drive-scan-report.json"
    echo     $results ^| ConvertTo-Json -Depth 10 ^| Out-File -FilePath $reportPath -Encoding UTF8
    echo     Write-Host "[Saved] Report: $reportPath" -ForegroundColor Cyan
    echo     Write-Host ""
    echo.
    echo     # Save CSV for easy viewing
    echo     $csvPath = "%SCAN_DRIVE%:\scan-results\models-found.csv"
    echo     $results.models ^| Select-Object name, path, size, created, modified ^| Export-Csv -Path $csvPath -NoTypeInformation
    echo     Write-Host "[Saved] CSV: $csvPath" -ForegroundColor Cyan
    echo.
    echo     # List models
    echo     Write-Host ""
    echo     Write-Host "Models Found:" -ForegroundColor Yellow
    echo     foreach ($model in $results.models) {
    echo         Write-Host "  [$($model.size)GB] $($model.name)" -ForegroundColor White
    echo         Write-Host "           $($model.path)" -ForegroundColor Gray
    echo     }
    echo.
    echo     # List duplicates
    echo     if ($results.duplicates.Count -gt 0) {
    echo         Write-Host ""
    echo         Write-Host "Potential Duplicates (Same Size):" -ForegroundColor Yellow
    echo         foreach ($dup in $results.duplicates) {
    echo             Write-Host "  Size: $($dup.size)GB - Count: $($dup.count)" -ForegroundColor Red
    echo             foreach ($name in $dup.files) {
    echo                 Write-Host "    - $name" -ForegroundColor Gray
    echo             }
    echo         }
    echo     } else {
    echo         Write-Host ""
    echo         Write-Host "No potential duplicates found." -ForegroundColor Green
    echo     }
    echo }
) > "%temp%\teoaaag-scanner.ps1"

REM Run PowerShell script
powershell -ExecutionPolicy Bypass -File "%temp%\teoaaag-scanner.ps1"

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║              Scan Complete                            ║
echo ║                                                        ║
echo ║   Reports saved to: %SCAN_DRIVE%:\scan-results\       ║
echo ║   - drive-scan-report.json                            ║
echo ║   - models-found.csv                                  ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

REM Cleanup
del "%temp%\teoaaag-scanner.ps1" 2>nul

pause
