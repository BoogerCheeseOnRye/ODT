# Updated Push Script - Now Works!

## The Issue

The first script assumed you were already in your local ODT repository directory. It wasn't - hence "not in git repo" error.

## The Fix

**New script: `push-odtlite-v2.bat`**

This version **asks you for your local repository path** and navigates there automatically.

## How to Use It

### Run the Script
```
Double-click: E:\dashboard-appv2\push-odtlite-v2.bat
```

### When It Asks for Your Path

Type your local ODT repository path. Examples:
```
C:\Users\YourName\Documents\ODT
C:\Users\YourName\GitHub\ODT
D:\repos\ODT
```

**That's it!** Script handles everything else.

## What It Does

1. Opens command window
2. **Asks for your repo path**
3. Navigates to your repo
4. Verifies `.git` exists
5. Switches to ODTLite branch
6. Copies all 4 files from E:\dashboard-appv2\
7. Creates README.md
8. Commits with message
9. Pushes to GitHub
10. Shows verification

## After Running

Go to: **https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite**

You'll see 4 files:
- index.html
- warning-lite.html
- web-llm-fallback.js
- README.md

## If You're Not Sure of Your Repo Path

1. Open Windows Explorer
2. Find your ODT repository folder
3. Click address bar at top
4. Copy the full path shown
5. Paste into script

## Ready to Try Again?

Just run:
```
E:\dashboard-appv2\push-odtlite-v2.bat
```

And paste your local repo path when asked.

---

**This version should work!** Let me know if it succeeds.
