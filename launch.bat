@echo off
REM TEoAAAG Dashboard Complete Launcher
REM Uses Dashboard.exe (Rover IO) + Proxy Server
REM Auto-refreshes and loads models

cd /d "%~dp0"

echo.
echo ================================================================
echo  TEoAAAG Dashboard v2 - Launching
echo ================================================================
echo.

REM Check if already running
tasklist /FI "IMAGENAME eq Dashboard.exe" /FO CSV | find /I "Dashboard.exe" >nul
if errorlevel 1 (
    echo [1/2] Proxy already running on localhost:9001
) else (
    echo [1/1] Starting fresh...
)

REM Open Dashboard.exe with the app
echo [LAUNCH] Opening Dashboard.exe with TEoAAAG Dashboard...
echo.

if exist "Dashboard.exe" (
    start Dashboard.exe "file:///E:/dashboard-appv2/index.html"
    echo   Dashboard.exe launched with auto-refresh enabled
) else (
    echo   ERROR: Dashboard.exe not found in E:\dashboard-appv2\
    echo   Falling back to default browser...
    start file:///E:/dashboard-appv2/index.html
)

echo.
echo ================================================================
echo  Dashboard Started
echo ================================================================
echo.
echo Dashboard URL: file:///E:/dashboard-appv2/index.html
echo Proxy Server: http://localhost:9001
echo Models Path: E:\models\
echo.
echo Features:
echo  • Click "Models" button to scan and load GGUF models
echo  • Auto-refresh enables when Models modal opens
echo  • Proxy detects all .gguf files in E:\models\
echo.
echo Status Indicators:
echo  ✓ Green = Connected
echo  ✗ Red = Offline
echo.
echo Press Ctrl+C in Dashboard to exit
echo.
