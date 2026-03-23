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

REM Get current directory
set CURRENT_DIR=%cd%

REM Check if we're in a git repository
if not exist ".git" (
    echo ERROR: Not in a git repository
    echo Please run this script from your local ODT repository root
    echo.
    echo Current directory: %CURRENT_DIR%
    pause
    exit /b 1
)

echo Current directory: %CURRENT_DIR%
echo.

REM Switch to ODTLite branch
echo [1/6] Switching to ODTLite branch...
git checkout ODTLite
if errorlevel 1 (
    echo ERROR: Failed to checkout ODTLite branch
    pause
    exit /b 1
)
echo SUCCESS: Switched to ODTLite branch
echo.

REM Remove all existing files from branch
echo [2/6] Clearing existing files from branch...
git rm -r . --force --cached >nul 2>&1
if errorlevel 1 (
    REM Ignore error if nothing to remove
)
echo SUCCESS: Branch cleared
echo.

REM Copy index.html
echo [3/6] Copying index.html...
if not exist "..\dashboard-appv2\ODTLite-index-for-github.html" (
    echo ERROR: ODTLite-index-for-github.html not found
    echo Expected location: ..\dashboard-appv2\ODTLite-index-for-github.html
    pause
    exit /b 1
)
copy "..\dashboard-appv2\ODTLite-index-for-github.html" "index.html" >nul
echo SUCCESS: index.html copied
echo.

REM Copy warning-lite.html
echo [4/6] Copying warning-lite.html...
if not exist "..\dashboard-appv2\lite\warning-lite.html" (
    echo ERROR: warning-lite.html not found
    echo Expected location: ..\dashboard-appv2\lite\warning-lite.html
    pause
    exit /b 1
)
copy "..\dashboard-appv2\lite\warning-lite.html" "warning-lite.html" >nul
echo SUCCESS: warning-lite.html copied
echo.

REM Copy web-llm-fallback.js
echo [5/6] Copying web-llm-fallback.js...
if not exist "..\dashboard-appv2\web-llm-fallback.js" (
    echo ERROR: web-llm-fallback.js not found
    echo Expected location: ..\dashboard-appv2\web-llm-fallback.js
    pause
    exit /b 1
)
copy "..\dashboard-appv2\web-llm-fallback.js" "web-llm-fallback.js" >nul
echo SUCCESS: web-llm-fallback.js copied
echo.

REM Create README.md
echo [5b/6] Creating README.md...
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
echo [6/6] Staging files for commit...
git add index.html
git add warning-lite.html
git add web-llm-fallback.js
git add README.md
echo SUCCESS: Files staged
echo.

REM Check what's staged
echo Files to be committed:
git diff --name-only --cached
echo.

REM Commit
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
- README.md: Complete documentation"

if errorlevel 1 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo SUCCESS: Changes committed
echo.

REM Push to ODTLite branch
echo Pushing to ODTLite branch...
git push origin ODTLite

if errorlevel 1 (
    echo ERROR: Failed to push to GitHub
    echo Make sure you have internet connection and proper GitHub credentials
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
echo Waiting for verification...
pause

REM Verify files on GitHub (display git log)
echo.
echo Recent commits on ODTLite:
git log --oneline -5 ODTLite
echo.

REM List files in current branch
echo Files in current branch:
git ls-files
echo.

echo ============================================
echo COMPLETE - ODT Lite branch is ready!
echo ============================================
pause
