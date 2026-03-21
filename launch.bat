@echo off
REM ODT (Offensive Development Terminal) - Complete Launcher
REM Launches dashboard, share server, and all supporting services

SETLOCAL ENABLEDELAYEDEXPANSION

cd /d "E:\ODT"

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   ODT - Offensive Development Terminal                    ║
echo ║   Collaborative Dashboard + AI Agent Platform             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm packages
cd server
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install express ws --save
)
cd ..

REM Start services
echo.
echo Starting services...
echo.

REM Terminal 1: Dashboard Proxy Server (port 9001)
echo [1/3] Starting Ollama Proxy Server (localhost:9001)...
start "ODT-Proxy" cmd /k "cd server && node dashboard-proxy.js"
timeout /t 2 /nobreak

REM Terminal 2: Share/Collaboration Server (port 9002)
echo [2/3] Starting Share Server (localhost:9002)...
start "ODT-Share" cmd /k "cd server && node share-server.js"
timeout /t 2 /nobreak

REM Terminal 3: Dashboard in Browser
echo [3/3] Opening Dashboard...
start "" "http://localhost:9001/file:///E:/ODT/dashboard/index.html"

echo.
echo ════════════════════════════════════════════════════════════
echo ✓ ODT Startup Complete
echo ════════════════════════════════════════════════════════════
echo.
echo Services:
echo   • Proxy Server:    http://localhost:9001
echo   • Share Server:    http://localhost:9002  (WebSocket: ws://...)
echo   • Dashboard:       file:///E:/ODT/dashboard/index.html
echo   • Ollama (must run separately): ollama serve
echo.
echo Features:
echo   • Multi-project chat with AI planning
echo   • Live code editor with file tree
echo   • 3D preview with hardware optimization
echo   • Collaborative sharing (Tribes protocol)
echo   • Screenshot capture & bot analysis
echo   • UI customization
echo   • Real-time feedback to planning bot
echo.
echo Keyboard Shortcuts:
echo   • Ctrl+Enter: Send chat message
echo   • F: Toggle fullscreen preview
echo   • F12: Browser dev tools
echo.
echo Data Location: E:\ODT\dashboard\data\
echo Screenshots: E:\ODT\screenshots\
echo.
echo To stop all services: Close the terminal windows
echo.
pause
