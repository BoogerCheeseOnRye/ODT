@echo off
REM ODT v2.0 - First Time Setup
REM This script helps new users set up ODT

setlocal enabledelayedexpansion

color 0A
cls

echo.
echo ========================================
echo   ODT v2.0 - Setup Wizard
echo ========================================
echo.

REM Step 1: Check Node.js
echo [Step 1] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is required!
    echo.
    echo Download and install from: https://nodejs.org/
    echo Choose the LTS version (recommended)
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Found: !NODE_VERSION!
)

REM Step 2: Check Ollama
echo.
echo [Step 2] Checking Ollama...
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Ollama not installed
    echo.
    echo Ollama provides local LLM models.
    echo Without it, ODT cannot chat.
    echo.
    echo Download from: https://ollama.ai/
    echo.
    set /p INSTALL_OLLAMA="Install Ollama now? (y/n): "
    if /i "!INSTALL_OLLAMA!"=="y" (
        start https://ollama.ai/
        echo.
        echo Opening browser...
        echo Please install Ollama and then run this setup again.
        pause
        exit /b 1
    )
) else (
    for /f "tokens=*" %%i in ('ollama --version') do set OLLAMA_VERSION=%%i
    echo [OK] Found: !OLLAMA_VERSION!
)

REM Step 3: Install Node dependencies
echo.
echo [Step 3] Installing Node dependencies...
if not exist "node_modules" (
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
) else (
    echo [OK] Already installed
)

REM Step 4: Verify setup
echo.
echo [Step 4] Verifying setup...
if exist "index.html" (
    echo [OK] Dashboard found
) else (
    echo [ERROR] index.html not found
    pause
    exit /b 1
)

if exist "proxy.js" (
    echo [OK] Proxy found
) else (
    echo [ERROR] proxy.js not found
    pause
    exit /b 1
)

REM Step 5: Success
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start Ollama (in a new terminal):
echo    ollama serve
echo.
echo 2. Pull a model (in Ollama terminal):
echo    ollama pull phi:2.7b
echo.
echo 3. Start ODT:
echo    START-ODT.bat
echo    or
echo    npm start
echo.
echo 4. Open dashboard:
echo    file:///E:/ODTV2/index.html
echo.
echo ========================================
echo.
pause
