@echo off
REM TEoAAAG Dashboard Live Testbench
REM Opens dashboard and runs interactive tests

cd /d "%~dp0"

echo.
echo ============================================================
echo  TEoAAAG Dashboard Live Testbench
echo  Gordon Interactive Testing
echo ============================================================
echo.
echo [1/4] Clearing old node processes...
taskkill /F /IM node.exe >nul 2>&1

echo [2/4] Starting proxy server...
start /b node proxy.js
timeout /t 2 /nobreak

echo [3/4] Opening dashboard in browser...
start file:///E:/dashboard-app/index.html

echo.
echo [4/4] Dashboard opened!
echo.
echo ============================================================
echo  DASHBOARD IS NOW LIVE
echo ============================================================
echo.
echo Dashboard URL:    file:///E:/dashboard-app/index.html
echo Proxy API:        http://localhost:9001/api/generate
echo Ollama Host:      http://localhost:11434
echo Test Mode:        LIVE INTERACTIVE
echo.
echo [READY] Open dashboard in your browser above
echo [TEST]  Try these interactive tests:
echo   1. Click "Settings" button to open modal
echo   2. Click "Models" button and scroll
echo   3. Click fullscreen button (F key or corner button)
echo   4. Send a chat message
echo   5. Click "Hardware Profile" in Settings
echo.
echo [MONITORING] Proxy is running. Press Ctrl+C to stop.
echo.

REM Keep window open
pause
