@echo off
REM TEoAAAG Dashboard Launcher - Uses Dashboard.exe (Rover IO)
REM Starts proxy and opens dashboard with auto-refresh

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ================================================================
echo  TEoAAAG Dashboard - Starting
echo ================================================================
echo.

REM Kill any existing node processes
taskkill /F /IM node.exe >nul 2>&1

REM Start proxy server
echo [1/3] Starting Proxy Server...
start /b node proxy.js
timeout /t 2 /nobreak >nul

REM Open Dashboard.exe
echo [2/3] Launching Dashboard Application...
if exist "Dashboard.exe" (
    start Dashboard.exe file:///E:/dashboard-appv2/index.html
    echo   Dashboard.exe launched
) else (
    echo   Dashboard.exe not found, opening in default browser
    start file:///E:/dashboard-appv2/index.html
)

echo [3/3] Opening Library Manager...
timeout /t 2 /nobreak >nul
powershell -ExecutionPolicy Bypass -File "lib-manager-ui.ps1"

:end
echo.
echo Dashboard is running. Proxy: http://localhost:9001
echo.
pause
