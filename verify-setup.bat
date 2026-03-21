@echo off
REM ODT Setup Verification & Cleanup Script

echo ╔════════════════════════════════════════════════════════════╗
echo ║   ODT Setup Verification                                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion

set "errors=0"
set "warnings=0"

REM Check folder structure
echo Checking folder structure...
if not exist "E:\ODT\dashboard" echo [ERROR] Dashboard folder missing & set /a errors+=1
if not exist "E:\ODT\server" echo [ERROR] Server folder missing & set /a errors+=1
if not exist "E:\ODT\utils" echo [ERROR] Utils folder missing & set /a errors+=1
if not exist "E:\ODT\screenshots" echo [ERROR] Screenshots folder missing & set /a errors+=1

if %errors% equ 0 (
    echo ✓ Folder structure OK
) else (
    echo [!] %errors% folder issues found
)
echo.

REM Check key files
echo Checking files...
if not exist "E:\ODT\dashboard\index.html" echo [ERROR] Dashboard HTML missing & set /a errors+=1
if not exist "E:\ODT\server\dashboard-proxy.js" echo [ERROR] Proxy server missing & set /a errors+=1
if not exist "E:\ODT\server\share-server.js" echo [ERROR] Share server missing & set /a errors+=1
if not exist "E:\ODT\launch.bat" echo [ERROR] Launch script missing & set /a errors+=1
if not exist "E:\ODT\README.md" echo [ERROR] README missing & set /a errors+=1

if %errors% equ 0 (
    echo ✓ All files present
)
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%A in ('node --version') do echo ✓ Node.js %%A installed
) else (
    echo [WARNING] Node.js not found - needed for servers & set /a warnings+=1
)
echo.

REM Check Ollama
echo Checking Ollama...
ollama --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Ollama is installed
) else (
    echo [WARNING] Ollama not found - install from https://ollama.ai & set /a warnings+=1
)
echo.

REM Cleanup old dashboard-app folder if exists
if exist "E:\dashboard-app" (
    echo Cleaning up old dashboard-app folder...
    REM Only remove if ODT is complete
    if exist "E:\ODT\dashboard\index.html" (
        echo [INFO] Keeping E:\dashboard-app for reference
        echo        To remove: rmdir /s /q E:\dashboard-app
    )
)
echo.

REM Count lines of code
echo Calculating project statistics...
for /f %%A in ('find E:\ODT\dashboard -name "*.html" ^| find /c /v ""') do set htmlFiles=%%A
for /f %%A in ('find E:\ODT\server -name "*.js" ^| find /c /v ""') do set jsFiles=%%A
for /f %%A in ('find E:\ODT\utils -name "*.js" ^| find /c /v ""') do set utilFiles=%%A

echo ✓ %htmlFiles% HTML files
echo ✓ %jsFiles% server files
echo ✓ %utilFiles% utility modules
echo.

REM Summary
echo ╔════════════════════════════════════════════════════════════╗
if %errors% equ 0 (
    echo ║   ✓ All checks passed! ODT is ready                      ║
) else (
    echo ║   ✗ %errors% error(s) found - see above                 ║
)
echo ║                                                            ║
if %warnings% gtr 0 (
    echo ║   ⚠ %warnings% warning(s) - see above                    ║
)
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo Next steps:
echo 1. Start Ollama: ollama serve
echo 2. Run launcher: E:\ODT\launch.bat
echo 3. Dashboard opens at http://localhost:9001
echo.

pause
