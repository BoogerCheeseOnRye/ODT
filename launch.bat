@echo off
REM TEoAAAG Dashboard Launcher
REM Standalone - starts proxy and opens dashboard

cd /d "%~dp0"

echo [*] Starting proxy...
start /b node proxy.js
timeout /t 2 /nobreak

echo [+] Proxy running on localhost:9001
echo [*] Opening dashboard...
timeout /t 1 /nobreak

start file:///E:/dashboard-app/index.html

echo [+] Dashboard launched
echo.
echo Dashboard: file:///E:/dashboard-app/index.html
echo Proxy API: http://localhost:9001/api/generate
echo Ollama: http://localhost:11434
echo.
pause
