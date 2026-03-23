@echo off
REM TEoAAAG Dashboard Library Manager
REM Auto-bundles, deduplicates, and manages script libraries
REM Checks for orphaned scripts, updates index.html, provides UI

setlocal enabledelayedexpansion

cd /d "%~dp0"

title TEoAAAG Dashboard Library Manager

color 0A
cls

echo.
echo ================================================================
echo  TEoAAAG Dashboard Library Manager
echo  Script Bundler, Deduplicator, and Dependency Manager
echo ================================================================
echo.

if "%1"=="auto" (
    goto auto_build
) else if "%1"=="check" (
    goto check_only
) else if "%1"=="ui" (
    goto launch_ui
) else (
    goto menu
)

:menu
cls
color 0A
echo.
echo ================================================================
echo  Main Menu
echo ================================================================
echo.
echo  1. Auto-Bundle Scripts
echo  2. Check for Issues (Duplicates, Orphans)
echo  3. Validate Dependencies
echo  4. Open Library Manager UI
echo  5. Generate Report
echo  6. Clean Build Cache
echo  7. Exit
echo.
echo ================================================================
echo.

set /p choice="Enter your choice (1-7): "

if "%choice%"=="1" goto auto_build
if "%choice%"=="2" goto check_only
if "%choice%"=="3" goto validate_deps
if "%choice%"=="4" goto launch_ui
if "%choice%"=="5" goto gen_report
if "%choice%"=="6" goto clean_cache
if "%choice%"=="7" exit /b 0

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:auto_build
cls
echo.
echo [AUTO-BUNDLE] Starting library bundler...
echo.

echo [SCAN] Searching for library files (*.lib.js)...
echo.

set "libCount=0"
set "totalSize=0"

for /f "delims=" %%F in ('dir /b *.lib.js 2^>nul') do (
    set /a libCount+=1
    for %%S in (%%F) do set /a totalSize+=%%~zS
    echo   Found: %%F
)

if "%libCount%"=="0" (
    echo   [WARNING] No library files found (*.lib.js)
    echo.
    echo   Library files should follow naming: name.lib.js
    echo   Example: gordon-testbench.lib.js
) else (
    echo.
    echo [ANALYSIS] Found %libCount% library files (%totalSize% bytes)
)

echo.
echo [DEDUPLICATE] Checking for duplicate functions...
powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "deduplicate"

echo.
echo [BUNDLE] Creating combined library bundle...
powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "bundle"

echo.
echo [INJECT] Updating index.html with library reference...
powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "inject"

echo.
echo [REPORT] Generating bundler report...
powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "report"

echo.
echo ================================================================
echo  Bundle Complete
echo ================================================================
echo.
echo   Library bundle: ./lib/bundle.lib.js
echo   Report: ./lib/bundle-report.txt
echo   Status: Ready to use
echo.
timeout /t 3 >nul
goto menu

:check_only
cls
echo.
echo [CHECK] Analyzing library structure...
echo.

powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "check"

echo.
timeout /t 3 >nul
goto menu

:validate_deps
cls
echo.
echo [VALIDATE] Checking dependencies...
echo.

powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "validate"

echo.
timeout /t 3 >nul
goto menu

:gen_report
cls
echo.
echo [REPORT] Generating full analysis report...
echo.

powershell -ExecutionPolicy Bypass -File "lib-manager.ps1" -Action "fullreport"

echo.
echo Opening report...
start "" "lib\bundle-report.txt"

timeout /t 2 >nul
goto menu

:clean_cache
cls
echo.
echo [CLEAN] Clearing build cache...
echo.

if exist "lib\*.tmp" (
    del /q "lib\*.tmp"
    echo   Cleared temp files
)

if exist "lib\*.bak" (
    del /q "lib\*.bak"
    echo   Cleared backup files
)

echo   Cache cleaned
echo.
timeout /t 2 >nul
goto menu

:launch_ui
cls
echo.
echo [UI] Launching Library Manager UI...
echo.

powershell -ExecutionPolicy Bypass -File "lib-manager-ui.ps1"

goto menu
