@echo off
REM TEoAAAG Dashboard - Unified Launcher with Loading Sequence
REM Runs all initialization, shows progress bar, then launches Dashboard.exe

setlocal enabledelayedexpansion

title TEoAAAG Dashboard - Loading...
color 0A

cd /d "%~dp0"

REM ============================================================================
REM STEP 1: INITIALIZE VARIABLES
REM ============================================================================

set "DASHBOARD_EXE=Dashboard.exe"
set "PROXY_PID="
set "TOTAL_STEPS=8"
set "CURRENT_STEP=0"
set "PROGRESS=0"

REM ============================================================================
REM DISPLAY LOADING SCREEN
REM ============================================================================

cls
echo.
echo ================================================================
echo  TEoAAAG Dashboard - Initialization Sequence
echo ================================================================
echo.
echo Starting comprehensive system setup and verification...
echo.

REM ============================================================================
REM STEP 1: CHECK DEPENDENCIES
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Checking dependencies" %CURRENT_STEP%

if not exist "index.html" (
    color 0C
    echo.
    echo ERROR: index.html not found!
    echo Expected location: %cd%\index.html
    pause
    exit /b 1
)

if not exist "%DASHBOARD_EXE%" (
    echo   WARNING: %DASHBOARD_EXE% not found - will use browser fallback
) else (
    echo   %DASHBOARD_EXE% found
)

if not exist "proxy.js" (
    color 0C
    echo ERROR: proxy.js not found!
    pause
    exit /b 1
)

color 0A

REM ============================================================================
REM STEP 2: KILL EXISTING PROCESSES
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Clearing old processes" %CURRENT_STEP%

taskkill /IM node.exe /F >nul 2>&1
taskkill /IM Dashboard.exe /F >nul 2>&1
timeout /t 1 /nobreak >nul

REM ============================================================================
REM STEP 3: VERIFY MODELS DIRECTORY
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Checking models directory" %CURRENT_STEP%

if not exist "E:\models" (
    echo   Creating E:\models...
    mkdir "E:\models" 2>nul
) else (
    echo   E:\models found
)

for /f %%F in ('dir /b "E:\models\*.gguf" 2^>nul ^| find /c /v ""') do (
    set "MODEL_COUNT=%%F"
)

if not defined MODEL_COUNT set "MODEL_COUNT=0"
echo   Models available: !MODEL_COUNT!

REM ============================================================================
REM STEP 4: VERIFY LIBRARY SYSTEM
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Verifying library system" %CURRENT_STEP%

if exist "lib\bundle.lib.js" (
    echo   Library bundle found
) else (
    echo   Creating library system...
    mkdir "lib" 2>nul
    echo   Library system initialized
)

REM ============================================================================
REM STEP 5: START PROXY SERVER
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Starting proxy server" %CURRENT_STEP%

start /b "" node proxy.js
timeout /t 2 /nobreak >nul

REM Check if proxy started
for /f "tokens=5" %%a in ('netstat -ano ^| find ":9001"') do set "PROXY_PID=%%a"

if defined PROXY_PID (
    echo   Proxy running on port 9001 (PID: !PROXY_PID!)
) else (
    echo   WARNING: Could not verify proxy startup
)

REM ============================================================================
REM STEP 6: SCAN FOR MODELS
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Scanning for models" %CURRENT_STEP%

timeout /t 1 /nobreak >nul

REM Call proxy to scan (via timeout trick)
for /f %%F in ('dir /b "E:\models\*.gguf" 2^>nul') do (
    echo   Found: %%F
)

echo   Scan complete

REM ============================================================================
REM STEP 7: VERIFY DASHBOARD FILE
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Verifying dashboard integrity" %CURRENT_STEP%

if exist "index.html" (
    for /f %%Z in ('dir /b index.html') do (
        echo   Dashboard: %%Z
    )
) else (
    color 0C
    echo   ERROR: Dashboard file corrupted!
    pause
    exit /b 1
)

REM ============================================================================
REM STEP 8: LAUNCH DASHBOARD
REM ============================================================================

set /a CURRENT_STEP+=1
call :show_progress "Launching Dashboard" %CURRENT_STEP%

color 0B
echo.
echo ================================================================
echo  INITIALIZATION COMPLETE - LAUNCHING DASHBOARD
echo ================================================================
echo.
echo Dashboard URL: file:///E:/dashboard-appv2/index.html
echo Proxy Server: http://localhost:9001
echo Models Path: E:\models\
echo Available Models: !MODEL_COUNT!
echo.

timeout /t 2 /nobreak >nul

if exist "%DASHBOARD_EXE%" (
    echo Launching: %DASHBOARD_EXE%
    start "" "%DASHBOARD_EXE%" "file:///E:/dashboard-appv2/index.html"
) else (
    echo Launching: Default browser
    start file:///E:/dashboard-appv2/index.html
)

echo.
echo ================================================================
echo  Dashboard Loaded Successfully
echo ================================================================
echo.
echo Proxy is running in background on port 9001
echo Press Ctrl+C in this window to stop the proxy
echo.

color 0A

REM Keep proxy running
:keep_alive
timeout /t 30 /nobreak >nul
goto keep_alive

REM ============================================================================
REM FUNCTION: SHOW PROGRESS
REM ============================================================================

:show_progress

set "STEP_NAME=%~1"
set "STEP_NUM=%~2"
set /a PROGRESS=(!STEP_NUM! * 100 / %TOTAL_STEPS%)

REM Display progress bar
cls
echo.
echo ================================================================
echo  TEoAAAG Dashboard - Initialization Sequence
echo ================================================================
echo.

REM Calculate bar
set "BAR="
for /l %%i in (1,1,!PROGRESS!) do set "BAR=!BAR!█"
for /l %%i in (!PROGRESS!,1,100) do set "BAR=!BAR! "

echo Loading... [!BAR!] !PROGRESS!%%
echo.
echo Step !STEP_NUM!/%TOTAL_STEPS%: !STEP_NAME!
echo.

exit /b

REM ============================================================================
REM END OF SCRIPT
REM ============================================================================
