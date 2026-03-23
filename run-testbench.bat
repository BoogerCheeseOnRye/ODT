@echo off
REM ============================================================
REM  TEoAAAG Dashboard Testbench Launcher
REM  Gordon Automated Testing Suite
REM ============================================================

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ============================================================
echo  TEoAAAG Dashboard Testbench Launcher
echo ============================================================
echo.
echo Choose testbench mode:
echo.
echo  1 - PowerShell Testbench (Recommended)
echo  2 - Python Testbench (Requires Python 3)
echo  3 - Docker Testbench (Requires Docker)
echo  4 - Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo [LAUNCHING] PowerShell Testbench...
    echo.
    powershell -ExecutionPolicy Bypass -File "gordon-testbench.ps1"
    goto end
)

if "%choice%"=="2" (
    echo.
    echo [LAUNCHING] Python Testbench...
    echo.
    python gordon-testbench.py
    goto end
)

if "%choice%"=="3" (
    echo.
    echo [LAUNCHING] Docker Testbench...
    echo.
    call testbench.bat
    goto end
)

if "%choice%"=="4" (
    echo Exiting.
    goto end
)

echo Invalid choice. Please try again.
echo.
pause
goto start

:end
echo.
echo [COMPLETE] Testbench finished.
echo [OUTPUT] Results saved to: testbench-results\
echo.
pause
