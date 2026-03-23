================================================================================
                  TEoAAAG Dashboard Library System
                    C++ Style Include Management
================================================================================

OVERVIEW
--------
The TEoAAAG Dashboard now uses a C++ style library management system. All
modular JavaScript code is organized as child libraries (.lib.js files) and
automatically bundled into a single parent library that's included in index.html.

This provides:
  ✓ Automatic bundling and deduplication
  ✓ Dependency validation
  ✓ Windows UI for library management
  ✓ Build-time code optimization
  ✓ Efficient load times (single script include)

================================================================================
                          QUICK START
================================================================================

1. CREATE A LIBRARY FILE
   Name format: feature-name.lib.js
   Example: gordon-testbench.lib.js

2. RUN LIBRARY MANAGER
   Option A: Double-click: lib-manager.bat
   Option B: GUI: lib-manager.bat ui
   Option C: Auto: lib-manager.bat auto

3. VERIFY
   Run: lib-manager.bat check
   This validates dependencies and finds issues

4. USE IN DASHBOARD
   Libraries auto-load in index.html
   All functions available globally: window.TEoAAAG.*

================================================================================
                       FILE STRUCTURE
================================================================================

E:\dashboard-app\
├── lib-manager.bat              ← Main manager (run this first)
├── lib-manager.ps1              ← PowerShell bundler
├── lib-manager-ui.ps1           ← Windows UI
├── lib/
│   ├── bundle.lib.js            ← Auto-generated bundle (DO NOT EDIT)
│   ├── bundle-report.txt        ← Analysis report
│   └── *.tmp, *.bak             ← Temp files (auto-cleaned)
├── *.lib.js                     ← Your library files
├── gordon-testbench.lib.js      ← Example library
└── index.html                   ← Dashboard (auto-updated)

================================================================================
                        NAMING CONVENTIONS
================================================================================

Files MUST follow this pattern:

  feature-name.lib.js

Examples:
  ✓ gordon-testbench.lib.js
  ✓ analytics.lib.js
  ✓ ui-customizer.lib.js
  ✓ file-manager.lib.js

Bad names (won't be recognized):
  ✗ gordon.js                    (missing .lib)
  ✗ testbench-lib.js             (wrong format)
  ✗ Gordontestbench.lib.js       (avoid spaces/caps)

================================================================================
                      LIBRARY FILE TEMPLATE
================================================================================

// Feature Name: [Brief description]
// Name: feature-name.lib.js
// Description: What this library does
// Dependencies: List other .lib.js files needed

// Put all your code here
function myFunction() {
    // code
}

// Export functions (optional - all are global):
console.log('[TEoAAAG] My Library loaded');

Note:
  - All functions are automatically global after bundle
  - No need for exports/modules
  - Dependencies are loaded in order
  - Keep each library focused on one feature

================================================================================
                        USING LIB-MANAGER
================================================================================

COMMAND LINE OPTIONS:

  lib-manager.bat
    → Opens interactive menu

  lib-manager.bat auto
    → Automatically bundles all .lib.js files

  lib-manager.bat check
    → Checks for duplicates, orphans, missing functions

  lib-manager.bat ui
    → Opens Windows GUI manager

INTERACTIVE MENU OPTIONS:

  1. Auto-Bundle Scripts
     Combines all .lib.js files into lib/bundle.lib.js
     Deduplicates functions, validates syntax

  2. Check for Issues
     Finds: duplicate functions, missing dependencies,
     orphaned code, syntax errors

  3. Validate Dependencies
     Verifies all called functions are defined

  4. Open Library Manager UI
     Windows GUI with visual library browser

  5. Generate Report
     Creates detailed analysis in lib/bundle-report.txt

  6. Clean Build Cache
     Removes temp files, clears old builds

================================================================================
                      LIBRARY MANAGER UI
================================================================================

WINDOWS GUI FEATURES:

  Left Panel:
    📚 Libraries        - List of all .lib.js files found
    🔄 Refresh          - Reload library list
    📦 Bundle All       - Combine and optimize
    🔍 Check Issues     - Find problems

  Right Panel:
    Details View       - File contents and info
    📄 Generate Report - Create analysis
    📂 Open Explorer   - Browse lib folder

  Status Bar:
    Shows operation status and results

USAGE:

  1. Click "Refresh" to scan for libraries
  2. Click "Check Issues" to validate
  3. Click "Bundle All" to create bundle
  4. Check "Details" panel for results
  5. Click "Generate Report" for full analysis

================================================================================
                         BUILD PROCESS
================================================================================

STEP 1: ORGANIZE
  Create your .lib.js files with proper naming
  Example: feature-name.lib.js

STEP 2: VALIDATE
  Run: lib-manager.bat check
  Fix any issues reported

STEP 3: BUNDLE
  Run: lib-manager.bat auto
  This:
    - Scans all .lib.js files
    - Deduplicates functions
    - Combines into lib/bundle.lib.js
    - Injects script tag into index.html
    - Generates report

STEP 4: TEST
  Load dashboard: file:///E:/dashboard-app/index.html
  Check console (F12) for library load messages
  All library functions available globally

STEP 5: DEPLOY
  lib/bundle.lib.js is ready for distribution
  No need to include individual .lib.js files

================================================================================
                       DEDUPLICATION
================================================================================

The bundler automatically detects and reports duplicate functions:

  duplicate-functions.lib.js:
    function updateUI() { ... }

  ui-updater.lib.js:
    function updateUI() { ... }

RESULT: Warning shown during bundle
ACTION: Rename one function or consolidate files

To prevent:
  ✓ Use unique function names across libraries
  ✓ Use namespaces: gordon.updateUI(), ui.updateUI()
  ✓ Keep library scope focused

================================================================================
                      DEPENDENCY INJECTION
================================================================================

The system auto-detects dependencies between libraries:

  library-a.lib.js calls: functionFromB()
  library-b.lib.js defines: functionFromB()

VALIDATION: Ensures functionFromB is defined before A uses it

If missing:
  ✗ Error: "Function 'functionFromB' not defined in library-a.lib.js"
  ACTION: Check library order, ensure function exists

================================================================================
                        BEST PRACTICES
================================================================================

DO:
  ✓ One feature per file (gordon-testbench.lib.js)
  ✓ Use descriptive names
  ✓ Add comments explaining purpose
  ✓ Keep libraries under 50KB
  ✓ Run bundler after adding new files
  ✓ Use npm run build if available

DON'T:
  ✗ Mix multiple features in one file
  ✗ Create .lib.js files without purpose
  ✗ Use generic names like "utils.lib.js"
  ✗ Leave old/unused .lib.js files lying around
  ✗ Manually edit bundle.lib.js
  ✗ Commit bundle.lib.js to git (regenerate on build)

================================================================================
                         EXAMPLE WORKFLOW
================================================================================

SCENARIO: Add new feature "email-notifications.lib.js"

1. Create file: email-notifications.lib.js
   ```javascript
   // Feature: Email Notifications
   // Name: email-notifications.lib.js
   
   function sendEmailNotification(email, message) {
       // implementation
   }
   ```

2. Run validator:
   ```cmd
   lib-manager.bat check
   ```
   Output: "OK - All functions defined"

3. Bundle:
   ```cmd
   lib-manager.bat auto
   ```
   Output: "Bundle created with 2 libraries"

4. Test in dashboard:
   - Open index.html
   - Console should show: "[TEoAAAG] Email Notifications library loaded"
   - Use: sendEmailNotification('user@example.com', 'Hello')

5. Generate report:
   ```cmd
   lib-manager.bat 5
   ```
   Output: Full analysis in lib/bundle-report.txt

================================================================================
                       TROUBLESHOOTING
================================================================================

PROBLEM: "No library files found"
SOLUTION: Check naming - must be *.lib.js
          Example: gordon-testbench.lib.js (not .js)

PROBLEM: Duplicate function errors
SOLUTION: Rename one function or consolidate files
          Use unique names or namespaces

PROBLEM: Function not found in bundle
SOLUTION: Run "lib-manager.bat check"
          Ensure function is defined in a .lib.js file
          Check spelling matches exactly

PROBLEM: Bundle.lib.js not updating
SOLUTION: Run: lib-manager.bat auto (not check)
          Delete old bundle.lib.js manually
          Verify you have write permissions

PROBLEM: UI won't open
SOLUTION: Ensure PowerShell execution allowed:
          Set-ExecutionPolicy -ExecutionPolicy Bypass
          Or run as Administrator

================================================================================
                          ADVANCED
================================================================================

CUSTOM BUNDLER SETTINGS:
  Edit lib-manager.ps1 to customize:
    - Bundle output location
    - Deduplication rules
    - Function name patterns
    - Report format

CONTINUOUS BUILD:
  Option 1: Run lib-manager.bat in loop:
    :loop
    lib-manager.bat auto
    timeout /t 5
    goto loop

  Option 2: Use npm/gulp watcher:
    npm run watch:libs

NAMESPACE USAGE:
  Avoid conflicts by namespacing:
    window.gordon = {}
    gordon.testbench = function() { ... }
    
  Access: gordon.testbench()

================================================================================
                           NEXT STEPS
================================================================================

1. RUN THE MANAGER:
   Double-click: lib-manager.bat
   Or: powershell -File lib-manager-ui.ps1

2. CREATE YOUR FIRST LIBRARY:
   cp gordon-testbench.lib.js my-feature.lib.js
   Edit my-feature.lib.js with your code

3. BUNDLE:
   lib-manager.bat auto
   Check: lib/bundle-report.txt

4. TEST:
   Load dashboard and check console

5. ITERATE:
   Add more .lib.js files
   Run bundler before each test

================================================================================
                       ADDITIONAL RESOURCES
================================================================================

Files in this system:
  - lib-manager.bat          ← Entry point (run this)
  - lib-manager.ps1          ← Core bundler logic
  - lib-manager-ui.ps1       ← Windows UI
  - LIB-SYSTEM-README.txt    ← This file
  - gordon-testbench.lib.js  ← Example library

Folder structure:
  - ./                       ← .lib.js files go here
  - ./lib/                   ← Bundles and reports here

Usage:
  - Double-click lib-manager.bat for interactive menu
  - Use "lib-manager.bat auto" for automated build
  - Use "lib-manager.bat ui" for Windows GUI
  - Check ./lib/bundle-report.txt for analysis

================================================================================
                         END OF DOCUMENTATION
================================================================================

Generated: 2026-03-21
System: TEoAAAG Dashboard v1.0
Version: Library Manager v1.0

Questions? Check:
  1. lib/bundle-report.txt (analysis)
  2. Run "lib-manager.bat check" (validation)
  3. Examine gordon-testbench.lib.js (example)

