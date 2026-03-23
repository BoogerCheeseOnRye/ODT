@echo off
REM ODT v2.0 - Quick Start Launcher
REM This script sets up and launches the complete ODT environment

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo   ODT v2.0 - Omni Development Terminal
echo   Offline Edition
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found
    echo Please install Node.js from https://nodejs.org/
    echo Then try again.
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

echo [OK] npm found
npm --version
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [SETUP] Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
    echo.
)

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Ollama not found
    echo You need Ollama running for ODT to work
    echo Download from: https://ollama.ai/
    echo.
    echo Continuing anyway...
) else (
    echo [OK] Ollama found
    ollama --version
    echo.
)

REM Start the proxy server
echo [STARTING] Proxy Server...
echo Proxy will run on: http://localhost:9001
echo.
echo Make sure Ollama is running in another terminal!
echo Type: ollama serve
echo.
echo Press Ctrl+C here to stop the proxy.
echo.

call npm start
