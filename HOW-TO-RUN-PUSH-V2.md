# push-odtlite-v2.bat - Updated Script (WORKS!)

## What Changed

The new script **asks you for your local ODT repository path** instead of assuming it's the current directory.

This fixes the "not in git repo" error.

## How to Run It

### Step 1: Run the Script
```
Double-click: E:\dashboard-appv2\push-odtlite-v2.bat
```

### Step 2: Enter Your Repository Path
When prompted, type the full path to your local ODT repository:

**Example paths:**
```
C:\Users\YourName\Documents\ODT
C:\Users\YourName\GitHub\ODT
C:\Users\YourName\git\ODT
D:\repos\ODT
```

**Just copy-paste your actual local repo path**

### Step 3: Let It Run
The script will:
1. Navigate to your repo
2. Verify it's a git repository
3. Switch/create ODTLite branch
4. Copy all 4 files
5. Create README.md
6. Commit
7. Push to GitHub
8. Verify

## What It Needs

Before running, have ready:
1. Your local ODT repository path (the folder with `.git`)
2. Internet connection
3. GitHub credentials set up in git

## Finding Your Repository Path

### Option 1: Windows Explorer
1. Open Windows Explorer
2. Navigate to your ODT repository
3. Click the address bar at the top
4. Copy the full path
5. Paste into script when prompted

### Option 2: Command Prompt
1. Open Command Prompt
2. Navigate to your ODT repo: `cd path\to\odt`
3. Type: `cd`
4. Copy the path shown
5. Paste into script when prompted

### Option 3: Git Bash
1. Open Git Bash in your repo
2. Type: `pwd`
3. Copy the path
4. Paste into script

## Example Walkthrough

```
Command Prompt opens:
============================================
ODT Lite - GitHub Branch Setup
============================================

Enter the full path to your local ODT repository: C:\Users\YourName\Documents\ODT

Current directory: C:\Users\YourName\Documents\ODT

[1/7] Switching to ODTLite branch...
SUCCESS: On ODTLite branch

[2/7] Clearing existing files from branch...
SUCCESS: Branch cleared

[3/7] Copying index.html...
SUCCESS: index.html copied

... (continues) ...

============================================
ODT Lite branch successfully updated!
============================================

Branch: https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite

Files pushed:
  - index.html
  - warning-lite.html
  - web-llm-fallback.js
  - README.md

Repository: C:\Users\YourName\Documents\ODT
```

## If You Get Errors

### "Directory not found"
- Check your path is spelled correctly
- Use backslashes: `C:\Users\Name\Documents\ODT`
- Don't include quotes around the path

### "Not a git repository"
- Make sure the folder has a `.git` folder inside
- Verify it's your actual local ODT repo

### "Could not checkout ODTLite"
- Script tries to create the branch if it doesn't exist
- If it fails, try creating manually: `git checkout -b ODTLite`

### "Failed to push to GitHub"
- Check internet connection
- Verify GitHub credentials with:
  ```
  git config --global user.name "Your Name"
  git config --global user.email "your@email.com"
  ```

## Ready to Run

```
E:\dashboard-appv2\push-odtlite-v2.bat
```

Just run it, paste your repo path, and let it do everything!

---

**After it completes, verify at:**
https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite

You should see all 4 files there.
