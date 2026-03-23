@echo off
REM Quick start all dashboard systems
REM Run this to launch dashboard + library manager together

cd /d "%~dp0"

echo.
echo ================================================================
echo  TEoAAAG Dashboard - Quick Start
echo ================================================================
echo.

if "%1"=="help" (
    echo Usage:
    echo   start-all.bat          - Opens dashboard and library manager menu
    echo   start-all.bat lib      - Library manager UI only
    echo   start-all.bat dash     - Dashboard only
    echo   start-all.bat bundle   - Auto-bundle libraries
    echo   start-all.bat help     - Show this help
    echo.
    goto end
)

if "%1"=="lib" (
    echo [LIB] Opening Library Manager UI...
    powershell -ExecutionPolicy Bypass -File "lib-manager-ui.ps1"
    goto end
)

if "%1"=="dash" (
    echo [DASH] Opening dashboard...
    start file:///E:/dashboard-appv2/index.html
    goto end
)

if "%1"=="bundle" (
    echo [BUNDLE] Auto-bundling libraries...
    lib-manager.bat auto
    goto end
)

echo [DASHBOARD] Launching dashboard...
start file:///E:/dashboard-appv2/index.html

timeout /t 2 /nobreak

echo [LIBRARY MANAGER] Opening menu...
call lib-manager.bat

:end
echo.
echo Done.
