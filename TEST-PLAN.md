# Dashboard-AppV2 Test Plan

## Quick Test Procedure

### Prerequisites
- Node.js installed
- Ollama running (optional, WebLLM fallback available)
- Modern browser (Chrome 90+, Firefox 88+, Safari 15+)

### Test 1: Start the Application
```bash
cd E:\dashboard-appv2
node server.js
```

Expected:
- Server starts on http://localhost:8000
- Browser opens dashboard
- All panels visible (left, center, right)
- No console errors

### Test 2: Check Memory Management
1. Open **Settings** → **Memory Management**
2. Verify:
   - Current memory display (MB)
   - Progress bar with usage %
   - RAM limit slider (50-95%)
   - Auto-optimize toggle
   - Manual cleanup button
   - Cleanup strategy list

Expected:
- Real-time memory updates
- Correct percentages
- Status colors (green/yellow/red)

### Test 3: Chat with WebLLM
1. Lower Ollama connection (or let it fail naturally)
2. Type message in chat
3. Wait for WebLLM to load

Expected:
- WebLLM initializes
- Model downloads (10-30s)
- Response generated in browser
- "Browser LLM" source shown
- ~1-2s response time

### Test 4: 3D Preview
1. Right-click any file
2. Select preview
3. Open in code area

Expected:
- 3D scene renders
- Rotating cube visible
- No artifacts
- 60 FPS in stats

### Test 5: UI Compactness
Visual inspection:
- Header should be tight (32px)
- Padding reduced throughout
- More content visible
- Professional appearance

### Test 6: Memory Auto-Optimization
1. Fill up memory (load large files, large chat)
2. Watch header memory stat
3. When critical (85%), auto-cleanup triggers

Expected:
- Auto-cleanup runs
- Chat notification appears
- Memory drops
- Status changes to normal

### Test 7: Header Stats
1. Click `+` in header
2. Verify stats expand:
   - FPS
   - Render time
   - Object count
   - Memory usage
   - Memory status

Expected:
- Stats display correctly
- Real-time updates
- Color coding works

### Test 8: File Management
1. Click file in right panel
2. Open file in editor
3. Edit and save

Expected:
- File loads
- Editor opens
- Save works
- No errors

## Success Criteria

✅ Memory stats display in header
✅ Auto-optimization works
✅ WebLLM fallback works
✅ UI is compact (20-33% tighter)
✅ 3D preview renders
✅ Chat responds
✅ No console errors
✅ Performance good (60 FPS)

## Test Coverage

- [x] Memory monitoring
- [x] Auto-optimization
- [x] WebLLM fallback
- [x] UI compactness
- [x] 3D preview
- [x] Chat functionality
- [x] File management
- [x] Memory management UI

## What to Watch For

1. **Memory leaks** - Should stay <400MB
2. **Frame rate** - Should stay 55-60 FPS
3. **Response time** - Chat <3s, WebLLM 1-2s
4. **UI responsiveness** - No freezing
5. **Auto-optimize** - Triggers at 85%
6. **3D rendering** - Smooth animation

## Test Results Template

```
Date: ___________
Browser: ___________
System RAM: ___________

Memory Management: PASS / FAIL
Chat (Ollama): PASS / FAIL
Chat (WebLLM): PASS / FAIL
3D Preview: PASS / FAIL
UI Compactness: PASS / FAIL
File Management: PASS / FAIL
Performance (FPS): PASS / FAIL
No Errors: PASS / FAIL

Overall: PASS / FAIL

Notes:
_________________________
_________________________
```

## Command to Start Testing

```bash
cd E:\dashboard-appv2
node server.js
```

Then navigate to: **http://localhost:8000**

---

Ready to test!
