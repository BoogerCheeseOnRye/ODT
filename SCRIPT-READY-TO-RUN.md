# Automated Push Script - Ready to Execute

## Files Created

✅ **push-odtlite.bat** - Automated deployment script
✅ **HOW-TO-RUN-PUSH-SCRIPT.md** - Usage instructions

Location: `E:\dashboard-appv2\push-odtlite.bat`

## What the Script Does

The batch script automatically:

1. Verifies git is installed
2. Confirms you're in ODT repository
3. Switches to ODTLite branch
4. Clears old files from branch
5. Copies 4 files:
   - `ODTLite-index-for-github.html` → `index.html`
   - `lite\warning-lite.html` → `warning-lite.html`
   - `web-llm-fallback.js` → `web-llm-fallback.js`
   - Creates `README.md`
6. Commits all files
7. Pushes to GitHub ODTLite branch
8. Verifies upload

## How to Run It

### Method 1: Double-Click (Easiest)
1. Open Windows Explorer
2. Navigate to `E:\dashboard-appv2\`
3. Double-click `push-odtlite.bat`
4. Watch it run
5. Press Enter when prompted

### Method 2: Command Line
```bash
cd C:\Users\YourName\path\to\local\ODT
E:\dashboard-appv2\push-odtlite.bat
```

### Method 3: Copy to Your Repo
1. Copy `push-odtlite.bat` to your local ODT repo root
2. Double-click it there
3. Script automatically finds files relative to its location

## What Happens After You Run It

1. **Command window opens** - Shows progress
2. **Files copied** - Confirms each file copy
3. **README created** - Generated automatically
4. **Git commits** - Creates commit with message
5. **Pushes to GitHub** - Uploads to ODTLite branch
6. **Verification** - Shows git log and file list
7. **Press Enter** - Script completes

## Verification After Running

Visit: **https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite**

You should see:
- ✅ index.html
- ✅ warning-lite.html
- ✅ web-llm-fallback.js
- ✅ README.md

## If Something Goes Wrong

The script will tell you exactly what failed. Common issues:

| Error | Solution |
|-------|----------|
| "Not in a git repository" | Run from your local ODT repo root |
| "Git is not installed" | Install Git from git-scm.com |
| "File not found" | Check source files exist in E:\dashboard-appv2\ |
| "Failed to push" | Check internet and GitHub credentials |

## Ready to Go

You have everything you need. Just run:

```
E:\dashboard-appv2\push-odtlite.bat
```

Or double-click it in Windows Explorer.

---

**Next Step:** Run the script and verify files appear on GitHub at:
https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite
