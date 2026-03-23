# ODT Automation Engine - Quick Start

## First Launch

1. **Open ODT Dashboard** → `http://localhost:8080`
2. **Load Models** (📦 Models button)
   - Click "🔍 Scan Models"
   - Import models from configured directory
   - You now have 1+ models ready

3. **Click 🤖 Automate button** (bottom-right)
   - Automation drawer slides open from right

## Configure & Run

### Minimal Setup (30 seconds)

1. **Enter one instruction:**
   ```
   Build a simple Hello World application
   ```

2. **Set duration:** 60 seconds (default)

3. **Click ▶ START**

4. **Watch live monitor:**
   - Elapsed time
   - Task progress
   - Token usage
   - Model status

### Full Setup (2 minutes)

1. **Set Duration:** Slider (60 seconds typical)

2. **Toggle Options:**
   - ⚡ **Just Build It:** Yes (skip planning phase)

3. **Set Token Rate:** 500 (balance speed/quality)

4. **Choose Execution Strategy:**
   ```
   Parallel = Fast, all models simultaneously
   Sequential = Builds output chain
   Hierarchical = Plan + vote
   ```

5. **Enter Instructions** (one per line):
   ```
   Initialize React project
   Create components directory
   Build main App component
   Add routing with React Router
   Create build process
   Generate documentation
   ```

6. **Configure Safety:**
   - Whitelist: `src/*, dist/*, build/*, docs/*`
   - Restricted: `package.json, .env, index.js`

7. **Click ▶ START**

## During Execution

### Real-Time Monitoring

The **📊 Live Monitor** shows:
- ⏱️ Elapsed time
- 📈 Tokens used
- ✅ Tasks completed
- ❌ Failed tasks
- 🤖 Active models
- ⚡ Throughput

### Approval Dialogs

If a risky operation is detected:

1. Dialog appears with **task** and **violations**
2. Review carefully
3. Click **✓ Approve** or **✕ Reject**
4. Execution continues or stops

**Common approvals:**
- Modifying `.env` or `package.json`
- Using dangerous commands
- Writing outside whitelisted paths

### Controls

- **⏸ PAUSE** - Freeze (can resume)
- **⏯ RESUME** - Continue from pause
- **⏹ ABORT** - Stop immediately

## After Execution

### Summary Report Shows

```
Duration:          45 seconds
Total Tokens:      2,847
Tokens/second:     63.2
Tasks Completed:   3/3
Success Rate:      100%

Per-Model Stats:
  Model 1: 3 completed, 0 failed, 1,200 tokens
  Model 2: 3 completed, 0 failed, 1,100 tokens
  Model 3: 2 completed, 1 failed, 547 tokens
```

### Actions

- **📥 Export Report** - Save as JSON (full details, logs, timestamps)
- **🔄 Run Again** - Execute with same config
- **⚙️ Modify & Run** - Change settings, run different task

## Common Patterns

### Pattern 1: Code Generation
```
Duration: 120 seconds
Strategy: Sequential
Instructions:
  Generate API specification
  Implement endpoints
  Add authentication
  Write API tests
  Generate API docs
```

### Pattern 2: Quality Assurance
```
Duration: 180 seconds
Strategy: Parallel
Instructions:
  Write unit tests
  Write integration tests
  Run linting checks
  Generate coverage report
```

### Pattern 3: Deployment
```
Duration: 60 seconds
Strategy: Hierarchical
Instructions:
  Build Docker image
  Run security scan
  Push to registry
  Deploy to staging
  Run smoke tests
```

### Pattern 4: Content Creation
```
Duration: 120 seconds
Strategy: Sequential
Instructions:
  Create project outline
  Write main documentation
  Generate code examples
  Create tutorial
  Build package for distribution
```

## Monitor Display Customization

Click **⚙️** in the monitor header to toggle display items:

- ✅ Elapsed Time
- ✅ Token Usage
- ✅ Task Counters
- ✅ Model Status
- ✅ Throughput
- ✅ Safety Stats
- ✅ Pending Approvals

## Log Filtering

Click filter buttons to show:
- **All** - Every log entry
- **Info** - Information messages
- **⚠ Warn** - Warnings
- **❌ Err** - Errors only

## Tips & Tricks

### Maximize Quality
- Set longer duration (180-300 seconds)
- Use hierarchical strategy with 3+ models
- Lower token rate forces refinement

### Maximize Speed
- Set shorter duration (30-60 seconds)
- Use parallel strategy
- Increase token rate (1000-2000)

### Parallel Execution
- Set strategy to "Parallel"
- Enter single, well-defined task
- All models work same task simultaneously
- Compare outputs for consensus

### Sequential Refinement
- Set strategy to "Sequential"
- Instruct models to build on prior output
- Each model refines previous result
- Final output is most polished

### Safe Testing
- Start with whitelist: `test/*, output/*`
- Use simple instructions first
- Monitor closely on first runs
- Gradually increase complexity

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "No models loaded" | Use 📦 Models → 🔍 Scan, then import |
| "Task rejected (safety)" | Click Approve in dialog, or adjust whitelist |
| "Too slow" | Reduce duration, use parallel, increase tokens |
| "Too many failures" | Use hierarchical strategy, increase duration |
| "Models disagreeing" | Lower consensus threshold, try voting |

## Next: Offline Testbench

Once configured and running smoothly:

1. **Document your best configurations**
2. **Save export reports** from successful runs
3. **Move to offline testbench** on your machine
   - No network required
   - Use mock models for testing
   - Validate workflows before production

## Files to Know

- **Configuration:** `.env`, `drive-config.js`
- **Engine:** `automation-engine.js`
- **UI:** `automation-ui.js`, `automation-controller.js`
- **Guide:** `AUTOMATION-ENGINE-GUIDE.md`

## Ready?

Your automation engine is ready to:
- ✅ Orchestrate multiple models
- ✅ Execute complex workflows
- ✅ Enforce safety guardrails
- ✅ Monitor in real-time
- ✅ Generate production artifacts

**Click 🤖 Automate and start building!**
