@echo off
REM ODT Lite GitHub Branch - Automated Push Script
REM This script prepares and pushes files to the ODTLite branch

setlocal enabledelayedexpansion

echo.
echo ============================================
echo ODT Lite - GitHub Branch Setup
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

REM Ask user for ODT repo directory
set /p ODT_PATH="Enter the full path to your local ODT repository (e.g., C:\Users\YourName\Documents\ODT): "

if not exist "%ODT_PATH%" (
    echo ERROR: Directory not found: %ODT_PATH%
    pause
    exit /b 1
)

if not exist "%ODT_PATH%\.git" (
    echo ERROR: Not a git repository: %ODT_PATH%
    echo Please make sure this is your local ODT repo with a .git folder
    pause
    exit /b 1
)

cd /d "%ODT_PATH%"
echo.
echo Current directory: %cd%
echo.

REM Check if dashboard-appv2 source files exist
if not exist "E:\dashboard-appv2\ODTLite-index-for-github.html" (
    echo ERROR: Source file not found: E:\dashboard-appv2\ODTLite-index-for-github.html
    pause
    exit /b 1
)

echo Source files location verified: E:\dashboard-appv2\
echo.

REM Switch to ODTLite branch
echo [1/7] Switching to ODTLite branch...
git fetch origin ODTLite >nul 2>&1
git checkout ODTLite >nul 2>&1

if errorlevel 1 (
    echo WARNING: Could not checkout ODTLite. Attempting to create branch...
    git checkout -b ODTLite >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Failed to create/checkout ODTLite branch
        pause
        exit /b 1
    )
)
echo SUCCESS: On ODTLite branch
echo.

REM Remove all existing files from branch (but keep .git)
echo [2/7] Clearing existing files from branch...
REM List files to remove
for /r . %%F in (*) do (
    if "%%~nxF" neq ".git" (
        if "%%~nxF" neq ".gitignore" (
            git rm "%%~nxF" --force --cached >nul 2>&1
        )
    )
)
echo SUCCESS: Branch cleared
echo.

REM Copy index.html
echo [3/7] Copying index.html...
copy "E:\dashboard-appv2\ODTLite-index-for-github.html" "%cd%\index.html" >nul
if errorlevel 1 (
    echo ERROR: Failed to copy index.html
    pause
    exit /b 1
)
echo SUCCESS: index.html copied
echo.

REM Copy warning-lite.html
echo [4/7] Copying warning-lite.html...
copy "E:\dashboard-appv2\lite\warning-lite.html" "%cd%\warning-lite.html" >nul
if errorlevel 1 (
    echo ERROR: Failed to copy warning-lite.html
    pause
    exit /b 1
)
echo SUCCESS: warning-lite.html copied
echo.

REM Copy web-llm-fallback.js
echo [5/7] Copying web-llm-fallback.js...
copy "E:\dashboard-appv2\web-llm-fallback.js" "%cd%\web-llm-fallback.js" >nul
if errorlevel 1 (
    echo ERROR: Failed to copy web-llm-fallback.js
    pause
    exit /b 1
)
echo SUCCESS: web-llm-fallback.js copied
echo.

REM Create README.md
echo [6/7] Creating README.md...
(
echo # ODT Lite - Browser-Based LLM
echo.
echo Minimal, standalone offline LLM chat interface. Zero backend required.
echo.
echo ## Quick Start
echo.
echo 1. Open `index.html` in any modern browser
echo 2. Accept the warning ^(test environment only^)
echo 3. First message downloads DistilGPT-2 ^(50MB^)
echo 4. Chat with browser-based AI
echo.
echo ## Features
echo.
echo - 100%% browser-based ^(no server needed^)
echo - Works completely offline after first load
echo - DistilGPT-2 for fast, quality responses
echo - Real-time memory monitoring
echo - Responsive chat interface
echo.
echo ## Browser Support
echo.
echo - Chrome 90+
echo - Firefox 88+
echo - Safari 15+
echo - Edge 90+
echo.
echo ## How It Works
echo.
echo 1. Open `index.html` - warning modal appears
echo 2. Check "I acknowledge..." checkbox
echo 3. Click "Proceed to ODT Lite"
echo 4. First message triggers model download ^(~30 seconds^)
echo 5. Subsequent messages: ~1-2 seconds each
echo 6. Model cached locally in browser
echo.
echo ## Files
echo.
echo - `index.html` - Main application interface
echo - `warning-lite.html` - Critical warning and disclaimer
echo - `web-llm-fallback.js` - Browser-based LLM engine
echo.
echo ## Model
echo.
echo Uses Xenova/distilgpt2 ^(50MB quantized^)
echo - First load: ~10-30 seconds ^(downloads and caches^)
echo - All processing: 100%% in your browser
echo - No server connection needed
echo - No API keys required
echo.
echo ## Warning
echo.
echo FOR TEST ENVIRONMENTS ONLY - Not for production use
echo.
echo This is a highly automated system. Users must acknowledge all risks before use.
echo See `warning-lite.html` for full legal disclaimer.
echo.
echo ## Performance
echo.
echo - App size: ~35 KB
echo - Model size: ~50 MB ^(downloaded once, cached^)
echo - Memory: ~250 MB typical usage
echo - Generation: 1-2 seconds per message ^(after initial load^)
echo.
echo ## Browser Cache
echo.
echo The model is cached in your browser's IndexedDB. To clear:
echo 1. Open DevTools ^(F12^)
echo 2. Application ^-^> IndexedDB
echo 3. Look for `odt_webllm_cache`
echo 4. Delete database
echo 5. Reload to re-download
echo.
echo ## License
echo.
echo Same as main ODT project
echo.
echo ## Support
echo.
echo For issues or questions, refer to main ODT repository.
) > README.md

echo SUCCESS: README.md created
echo.

REM Stage all files
echo [7/7] Staging and committing files...
git add index.html >nul 2>&1
git add warning-lite.html >nul 2>&1
git add web-llm-fallback.js >nul 2>&1
git add README.md >nul 2>&1

echo Committing changes...
git commit -m "ODT Lite: Standalone browser-based LLM

- Zero backend required
- 100%% offline capable
- DistilGPT-2 model (50MB)
- Critical warning for test environments
- Ready for immediate distribution

Files:
- index.html: Chat interface with warning check
- warning-lite.html: Legal warning modal
- web-llm-fallback.js: Browser-based LLM engine
- README.md: Complete documentation" >nul 2>&1

if errorlevel 1 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo SUCCESS: Changes committed
echo.

REM Push to ODTLite branch
echo Pushing to ODTLite branch...
git push -u origin ODTLite

if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    echo Make sure you have internet connection and proper GitHub credentials
    echo Try running: git config --global user.name "Your Name"
    echo And: git config --global user.email "your@email.com"
    pause
    exit /b 1
)
echo SUCCESS: Pushed to ODTLite branch!
echo.

echo ============================================
echo ODT Lite branch successfully updated!
echo ============================================
echo.
echo Branch: https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite
echo.
echo Files pushed:
echo   - index.html
echo   - warning-lite.html
echo   - web-llm-fallback.js
echo   - README.md
echo.
echo Repository: %ODT_PATH%
echo.

REM List files in current branch
echo Files in ODTLite branch:
git ls-files
echo.

echo ============================================
echo COMPLETE - ODT Lite branch is ready!
echo ============================================
pause
