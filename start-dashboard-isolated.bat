@echo off
REM TEoAAAG Dashboard Startup with Model Isolation
REM Configures Ollama to use external models directory before starting

cls
echo.
echo ╔════════════════════════════════════════╗
echo ║      TEoAAAG - Model Isolation         ║
echo ╚════════════════════════════════════════╝
echo.

REM Set environment variables for this session
set OLLAMA_MODELS=E:\models
set OLLAMA_CACHE=E:\cache
set OLLAMA_AUTO_UPDATE=false
set DASHBOARD_PORT=8080
set PROXY_PORT=9001
set OLLAMA_HOST=http://localhost:11434

echo [Setup] Environment configured:
echo   - OLLAMA_MODELS=E:\models
echo   - OLLAMA_CACHE=E:\cache
echo   - DASHBOARD_PORT=8080
echo   - PROXY_PORT=9001
echo.

REM Create model directories if missing
if not exist "E:\models" (
    echo [Setup] Creating E:\models...
    mkdir "E:\models"
)

if not exist "E:\cache" (
    echo [Setup] Creating E:\cache...
    mkdir "E:\cache"
)

echo [Setup] Directories ready
echo.
echo ╔════════════════════════════════════════╗
echo ║    Make sure Ollama is running!        ║
echo ║    Run: ollama serve                   ║
echo ║    (in a separate terminal)            ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [Error] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

echo [Server] Starting TEoAAAG Dashboard...
echo.

REM Start the server
cd /d "%~dp0"
node server.js

pause
