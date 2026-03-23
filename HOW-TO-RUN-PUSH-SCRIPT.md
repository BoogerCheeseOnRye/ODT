# push-odtlite.bat - Automated GitHub Push Script

## What It Does

This batch script automates the entire process of pushing ODT Lite files to your GitHub ODTLite branch.

## Requirements

- Git installed and in your PATH
- Your local ODT repository cloned
- GitHub credentials configured (git config or SSH key)
- Internet connection

## How to Use

### Option 1: Run from Command Line

1. Open Command Prompt or PowerShell
2. Navigate to your local ODT repository root:
   ```bash
   cd path\to\your\local\ODT
   ```
3. Run the script:
   ```bash
   push-odtlite.bat
   ```

### Option 2: Double-Click

1. Copy `push-odtlite.bat` to your local ODT repository root
2. Double-click `push-odtlite.bat`
3. Watch the progress

## What It Does Step-by-Step

1. **Verifies Git Installation** - Checks if git is available
2. **Checks Git Repository** - Ensures you're in an ODT repo
3. **Switches to ODTLite Branch** - Checks out the ODTLite branch
4. **Clears Existing Files** - Removes old files from branch
5. **Copies index.html** - From `ODTLite-index-for-github.html`
6. **Copies warning-lite.html** - From `lite\warning-lite.html`
7. **Copies web-llm-fallback.js** - From root `web-llm-fallback.js`
8. **Creates README.md** - Generates documentation
9. **Stages All Files** - Prepares files for commit
10. **Commits Changes** - Creates git commit
11. **Pushes to GitHub** - Uploads to ODTLite branch
12. **Verifies Upload** - Shows git log and file list

## Expected Output

```
============================================
ODT Lite - GitHub Branch Setup
============================================

Current directory: C:\Users\...\ODT

[1/6] Switching to ODTLite branch...
SUCCESS: Switched to ODTLite branch

[2/6] Clearing existing files from branch...
SUCCESS: Branch cleared

[3/6] Copying index.html...
SUCCESS: index.html copied

[4/6] Copying warning-lite.html...
SUCCESS: warning-lite.html copied

[5/6] Copying web-llm-fallback.js...
SUCCESS: web-llm-fallback.js copied

[5b/6] Creating README.md...
SUCCESS: README.md created

[6/6] Staging files for commit...
SUCCESS: Files staged

...commits and pushes...

============================================
ODT Lite branch successfully updated!
============================================

Branch: https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite

Files pushed:
  - index.html
  - warning-lite.html
  - web-llm-fallback.js
  - README.md
```

## If There Are Errors

### "Not in a git repository"
- Make sure you run the script from your local ODT repo root
- Verify `.git` folder exists in the directory

### "Git is not installed"
- Install Git from https://git-scm.com/
- Add it to your PATH
- Restart Command Prompt

### "Failed to push to GitHub"
- Check internet connection
- Verify GitHub credentials are configured
- Try: `git config --global user.name "Your Name"` and `git config --global user.email "your@email.com"`

### File not found errors
- Make sure all source files exist:
  - `ODTLite-index-for-github.html` (should be in dashboard-appv2)
  - `lite\warning-lite.html` (should be in dashboard-appv2\lite)
  - `web-llm-fallback.js` (should be in dashboard-appv2)

## After Running

The script will:
1. Display git log showing the commit
2. List all files in the branch
3. Wait for you to press a key

Then verify on GitHub at:
https://github.com/BoogerCheeseOnRye/ODT/tree/ODTLite

You should see 4 files:
- index.html
- warning-lite.html
- web-llm-fallback.js
- README.md

## To Run Again

If you need to update the branch again:
1. Make changes to source files (in dashboard-appv2 or lite folders)
2. Run `push-odtlite.bat` again
3. Script handles clearing and updating automatically

---

**Status: Ready to run**

Location: `E:\dashboard-appv2\push-odtlite.bat`

Just run it!
