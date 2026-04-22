@echo off
REM TEoAAAG Development Environment Launcher
REM STANDALONE - No Docker required. Uses Ollama CLI directly.

setlocal enabledelayedexpansion

title TEoAAAG Dev Environment (Standalone)
color 0A

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║                                                        ║
echo ║        TEoAAAG DEVELOPMENT ENVIRONMENT                ║
echo ║        STANDALONE | Ollama + Node Proxy | Local       ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check Ollama
echo [*] Checking Ollama status...
netstat -ano | findstr ":11434" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Ollama not running on port 11434
    echo [*] Make sure Ollama is running first
    echo.
    pause
    exit /b 1
)
echo [+] Ollama running on localhost:11434

REM Start Node proxy
echo [*] Starting local proxy (Node.js CORS wrapper)...
start /b node E:\proxy.js
timeout /t 2 /nobreak
echo [+] Proxy running on localhost:9001

REM Show status
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              STANDALONE SETUP READY                   ║
echo ╠════════════════════════════════════════════════════════╣
echo ║                                                        ║
echo ║  SERVICES:                                             ║
echo ║    ✓ Ollama (LLM):        localhost:11434              ║
echo ║    ✓ Node Proxy (CORS):   localhost:9001               ║
echo ║    ✓ Dashboard:           file:///E:/dashboard.html    ║
echo ║                                                        ║
echo ║  STORAGE:                                              ║
echo ║    • Game:                E:\TEoAAAG\                  ║
echo ║    • Engine:              E:\Tribes\                   ║
echo ║    • Archives:            E:\old-builds\               ║
echo ║    • Models:              E:\models\                   ║
echo ║    • Hermes:              E:\hermes\                   ║
echo ║                                                        ║
echo ║  SETUP PHILOSOPHY:                                     ║
echo ║    - NO Docker containers                              ║
echo ║    - NO external servers                               ║
echo ║    - Pure local execution                              ║
echo ║    - All data on E: drive                              ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo  QUICK COMMANDS:
echo.
echo  1) Launch Game        : E:\TEoAAAG\TEoAAAG.exe
echo  2) Open File Explorer : Open E:\ in Windows Explorer
echo  3) View Dashboard     : Open E:\dashboard.html
echo  4) Build Web          : E:\build.bat web
echo  5) Build C++          : E:\build.bat tribes
echo  6) Check Ollama       : curl -s http://localhost:11434/api/tags
echo  7) Open Terminal      : cmd.exe
echo.
echo ────────────────────────────────────────────────────────
echo.
pause

REM Menu
:menu
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║              MAIN MENU                                 ║
echo ╠════════════════════════════════════════════════════════╣
echo ║                                                        ║
echo ║  [1] Launch Game (TEoAAAG.exe)                         ║
echo ║  [2] Open File Explorer (E:\)                          ║
echo ║  [3] Open Dashboard (HTML)                             ║
echo ║  [4] Build Web (Three.js)                              ║
echo ║  [5] Build C++ (Tribes)                                ║
echo ║  [6] Ollama Status                                     ║
echo ║  [7] Open Terminal                                     ║
echo ║  [0] Exit                                              ║
echo ║                                                        ║
echo ╚════════════════════════════════════════════════════════╝
echo.

set /p choice="Enter choice [0-7]: "

if "%choice%"=="1" goto launch_game
if "%choice%"=="2" goto open_explorer
if "%choice%"=="3" goto open_dashboard
if "%choice%"=="4" goto build_web
if "%choice%"=="5" goto build_tribes
if "%choice%"=="6" goto ollama_status
if "%choice%"=="7" goto cmd_here
if "%choice%"=="0" exit /b 0

echo [!] Invalid choice
timeout /t 2
goto menu

:launch_game
echo.
echo [*] Launching TEoAAAG.exe...
cd /d E:\TEoAAAG\
start "" "TEoAAAG.exe"
echo [+] Game started
timeout /t 2
goto menu

:open_explorer
echo.
echo [*] Opening E:\ in Explorer...
explorer.exe E:\
timeout /t 1
goto menu

:open_dashboard
echo.
echo [*] Opening dashboard.html...
start file:///E:/dashboard.html
echo [+] Dashboard opened
timeout /t 2
goto menu

:build_web
echo.
echo [*] Building Web (Three.js)...
cd /d E:\
call build.bat web
pause
goto menu

:build_tribes
echo.
echo [*] Building C++ (Tribes)...
cd /d E:\
call build.bat tribes
pause
goto menu

:ollama_status
echo.
echo [*] Ollama status:
netstat -ano | findstr ":11434"
echo.
curl -s http://localhost:11434/api/tags | findstr /I "name"
echo.
pause
goto menu

:cmd_here
echo.
cd /d E:\
cmd.exe
goto menu
