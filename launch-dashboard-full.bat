@echo off
REM TEoAAAG Dashboard - Master Launcher
REM Entry point that launches full initialization sequence

cd /d "%~dp0"

REM Check if PowerShell is available
where powershell >nul 2>&1
if errorlevel 1 (
    echo ERROR: PowerShell not found on system
    echo Please install PowerShell or run dashboard-init.bat instead
    pause
    exit /b 1
)

REM Launch PowerShell initialization with proper execution policy
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0dashboard-init.ps1"

REM If user exited, offer to restart
set /p AGAIN="Restart dashboard? (Y/N): "
if /i "%AGAIN%"=="Y" (
    goto start
)

exit /b 0
