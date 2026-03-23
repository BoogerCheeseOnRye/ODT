@echo off
REM TEoAAAG Dashboard Testbench - Gordon Automated Testing
REM This batch file launches Docker with Gordon as the test user
REM Gordon will interact with the dashboard, generate test data, and create benchmarks

setlocal enabledelayedexpansion

echo.
echo ============================================
echo  TEoAAAG Dashboard Testbench (Gordon Mode)
echo ============================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

REM Check if dashboard is accessible
timeout /t 2 /nobreak >nul
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Dashboard may not be running on localhost:3000
    echo [INFO] Make sure your dashboard server is running
    echo.
)

REM Create test output directory
if not exist "E:\dashboard-app\testbench-results" mkdir E:\dashboard-app\testbench-results

echo [1/5] Starting Gordon testbench container...
echo.

REM Run Gordon in interactive mode as testbench
docker run -it --rm ^
  --name gordon-testbench ^
  -v E:\dashboard-app:/workspace ^
  -v E:\dashboard-app\testbench-results:/results ^
  -e DASHBOARD_URL=http://host.docker.internal:3000 ^
  -e TEST_MODE=true ^
  -e TEST_OUTPUT_DIR=/results ^
  alpine:latest /bin/sh -c "^
    apk add --no-cache curl jq nodejs npm python3 py3-pip && ^
    echo '[GORDON TESTBENCH INITIALIZED]' && ^
    echo 'Dashboard URL: http://host.docker.internal:3000' && ^
    echo 'Test mode: ACTIVE' && ^
    echo 'Output directory: /results' && ^
    echo '' && ^
    echo 'Ready to accept test instructions. Type your commands:' && ^
    /bin/sh ^
  "

echo.
echo [2/5] Test session completed.
echo [3/5] Collecting results from: E:\dashboard-app\testbench-results
echo.

if exist "E:\dashboard-app\testbench-results" (
    echo Results saved to:
    dir "E:\dashboard-app\testbench-results"
) else (
    echo No test results generated.
)

echo.
echo [4/5] Testbench finished.
echo [5/5] Results available in E:\dashboard-app\testbench-results\
echo.
pause
