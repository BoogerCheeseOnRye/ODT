@echo off
REM TEoAAAG Network Dashboard Launcher
REM Starts: Ollama, Node.js server (dashboard + proxy), and opens browser

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║             TEoAAAG - Network Dashboard Launch                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Check if Ollama is running
echo Checking Ollama...
curl -s http://localhost:11434 >nul 2>&1
if errorlevel 1 (
    echo ERROR: Ollama is not running!
    echo.
    echo Start Ollama with: ollama serve
    echo.
    pause
    exit /b 1
)
echo ✓ Ollama is running

REM Start Node.js server
echo.
echo Starting dashboard server...
echo   - Dashboard: http://localhost:8080
echo   - Proxy: http://localhost:9001
echo.

cd /d E:\dashboard-app
node server.js

pause
