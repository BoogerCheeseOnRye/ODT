# Test Checklist - Dashboard-AppV2

## Pre-Test Setup

- [ ] Node.js installed and working
- [ ] Browser open and ready (Chrome recommended)
- [ ] Ollama running (optional, WebLLM will be fallback)
- [ ] Command prompt or terminal open

## Test Execution

### Phase 1: Startup
- [ ] Run: `cd E:\dashboard-appv2 && node server.js`
- [ ] Server starts without errors
- [ ] Dashboard opens automatically or at http://localhost:8000
- [ ] All UI panels visible
- [ ] No console errors (F12 to check)

### Phase 2: Memory Management Display
- [ ] Memory stat visible in header: "245.3MB" or similar
- [ ] Status dot shows color (green/yellow/red)
- [ ] Click `+` button to expand stats
- [ ] Stats bar shows: FPS, Render, Objects, Memory, Status
- [ ] Stats update every ~1 second

### Phase 3: Memory Settings Modal
- [ ] Click **Settings** → **Memory Management** button
- [ ] Modal opens with memory information
- [ ] Current/Available/Peak memory shows correct values
- [ ] Progress bar shows usage percentage
- [ ] Progress bar colors change (blue → yellow → red)
- [ ] RAM limit slider works (50-95%)
- [ ] Auto-optimize toggle present
- [ ] Cleanup strategy list displays with counts
- [ ] Manual cleanup button works
- [ ] Close button works

### Phase 4: Chat Functionality
- [ ] Type message in chat input
- [ ] Ctrl+Enter sends message
- [ ] Message appears in chat (user side)
- [ ] Response appears from model
- [ ] Should use Ollama if available, else WebLLM
- [ ] No errors in console
- [ ] Chat remains responsive

### Phase 5: 3D Preview
- [ ] Center panel shows 3D canvas
- [ ] Rotating cube visible
- [ ] Canvas renders smoothly (60 FPS in stats)
- [ ] No visual artifacts
- [ ] Can see in header stats: "60" FPS

### Phase 6: UI Compactness
Visual inspection:
- [ ] Header appears tighter (smaller padding)
- [ ] Chat area more compact
- [ ] Buttons smaller
- [ ] Fonts slightly smaller
- [ ] Overall: noticeably more content visible
- [ ] Still readable and usable

### Phase 7: WebLLM Fallback (Optional)
If running without Ollama:
- [ ] First chat message triggers model download
- [ ] Console shows loading progress (0%, 10%, 20%, etc.)
- [ ] Modal message: "Loading browser LLM..."
- [ ] Takes 10-30 seconds for first load
- [ ] Response generates in browser
- [ ] Source shows "webllm"
- [ ] Subsequent chats are ~1-2 seconds

### Phase 8: Memory Auto-Optimization
Advanced test (load many items):
- [ ] Watch memory stat in header
- [ ] When reaches ~85%, auto-cleanup should trigger
- [ ] Chat notification appears: "Memory critical..."
- [ ] Memory stat should decrease
- [ ] Status dot changes from red to yellow/green

### Phase 9: File Management
- [ ] Right panel shows "Files"
- [ ] Files are listed
- [ ] Click file to select
- [ ] File appears in code area
- [ ] Can edit (no errors)
- [ ] Save button works

### Phase 10: Responsiveness
- [ ] All buttons click instantly
- [ ] No lag or freezing
- [ ] Chat input responsive
- [ ] Sliders smooth
- [ ] Scrolling smooth
- [ ] 60 FPS maintained

## Failure Points to Watch

⚠️ **If any of these occur, note it:**
- Memory stat shows 0MB or invalid
- Auto-optimize doesn't trigger at 85%
- WebLLM fails to load (check internet)
- UI doesn't appear compact
- 3D canvas shows black
- Chat message doesn't send
- Console has red errors
- FPS drops below 30

## Final Check

- [ ] No red errors in console (F12)
- [ ] Memory under 400MB
- [ ] FPS stable 55-60
- [ ] All features responsive
- [ ] UI appears professional and compact
- [ ] Memory management working

## Test Result

**Overall Status:**
- [ ] ✅ PASS (All tests passed)
- [ ] ⚠️ PARTIAL (Some features working)
- [ ] ❌ FAIL (Major issues)

**Issues Found (if any):**
```
1. _______________________________
2. _______________________________
3. _______________________________
```

**Notes:**
```
_________________________________
_________________________________
_________________________________
```

---

## After Testing

1. **If PASS:** Features are production-ready ✅
2. **If PARTIAL:** Note which features work, which don't
3. **If FAIL:** Check console errors and debug

## To Debug Issues

1. **Open console:** Press F12
2. **Check console tab** - Look for red errors
3. **Check network tab** - Look for failed requests
4. **Look for:**
   - `[Memory]` messages
   - `[WebLLM]` messages
   - `[Chat]` messages
   - Any red errors

## Commands for Testing

```javascript
// In browser console (F12):

// Check memory status
window.memoryManager.getStatus()

// Manual cleanup
window.memoryManager.runCleanupStrategies(0)

// Check WebLLM
window.llmFallback.webllm.getStatus()

// Check 3D stats
scene.children.length

// Force memory check
window.memoryManager.check()
```

---

**Test this now and report results!**

Ready to proceed with Phase 1?
