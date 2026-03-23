@echo off
REM TEoAAAG Library System Setup
REM One-time setup to initialize library system

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ================================================================
echo  TEoAAAG Library System Setup
echo ================================================================
echo.

echo [1/4] Creating library directory...
if not exist "lib" mkdir lib
echo   ✓ lib\ directory ready

echo [2/4] Checking for library files...
set "libCount=0"
for /f "delims=" %%F in ('dir /b *.lib.js 2^>nul') do set /a libCount+=1

if "%libCount%"=="0" (
    echo   [WARNING] No .lib.js files found yet
    echo   Example file: gordon-testbench.lib.js
) else (
    echo   ✓ Found %libCount% library file(s)
)

echo [3/4] Initializing bundle...
powershell -ExecutionPolicy Bypass -Command "
    if (-not (Test-Path '.\lib\bundle.lib.js')) {
        @'
// TEoAAAG Dashboard - Library Bundle
// Auto-generated. DO NOT EDIT.
// Run lib-manager.bat to regenerate

console.log('[TEoAAAG] Library bundle loaded');
'@ | Out-File '.\lib\bundle.lib.js' -Encoding UTF8
        Write-Host '   Created: lib\bundle.lib.js'
    } else {
        Write-Host '   Bundle already exists'
    }
"

echo [4/4] Verifying setup...
if exist "lib-manager.bat" (
    echo   ✓ lib-manager.bat ready
) else (
    echo   ✗ lib-manager.bat not found
)

if exist "lib-manager.ps1" (
    echo   ✓ lib-manager.ps1 ready
) else (
    echo   ✗ lib-manager.ps1 not found
)

if exist "index.html" (
    echo   ✓ index.html present
) else (
    echo   ✗ index.html not found
)

echo.
echo ================================================================
echo  Setup Complete
echo ================================================================
echo.
echo Next steps:
echo   1. Run: lib-manager.bat auto
echo   2. Or:  start-all.bat
echo   3. Or:  lib-manager.bat ui
echo.
pause
