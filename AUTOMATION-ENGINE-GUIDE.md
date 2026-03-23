# ODT - Automation Engine Documentation

## Overview

The **Automation Engine** is a self-contained system for orchestrating autonomous AI model execution for production tasks (code generation, testing, deployment, content creation, etc.). It runs multiple loaded models in parallel or sequentially, coordinates their work, enforces safety guardrails, and provides real-time monitoring.

## Architecture

### Components

1. **AutomationEngine** (`automation-engine.js`)
   - Core orchestration logic
   - Execution strategies (parallel, sequential, hierarchical)
   - Safety validation and approval workflows
   - Real-time monitoring and logging
   - Model coordination and consensus

2. **AutomationUI** (`automation-ui.js`)
   - Drawer interface with controls
   - Live monitoring dashboard
   - Log viewer with filtering
   - Configuration inputs
   - Summary reports

3. **AutomationController** (`automation-controller.js`)
   - UI event handlers
   - Real-time updates
   - Integration between engine and UI
   - Approval dialog management

## Features

### 1. Execution Strategies

#### Parallel Mode
All models execute the same task simultaneously.
- Use when: You want consensus, redundancy, or want speed
- Benefit: Fast, can validate output across models

#### Sequential Mode
Output from one model becomes input for the next.
- Use when: Tasks are dependent, output refinement needed
- Benefit: Builds on previous results, context-aware

#### Hierarchical Mode
Lead model plans, executor models execute, consensus vote required.
- Use when: Tasks are complex, need strategic planning
- Benefit: Structured approach, voting on risky ops

### 2. Safety Systems

#### Dangerous Pattern Detection
Detects and blocks:
- Recursive deletes (`rm -rf`)
- Database operations (`DROP TABLE`, `DELETE FROM`)
- Privilege escalation (`sudo`, `chmod 777`)

#### File Whitelist
Restrict model modifications to safe paths:
```
dist/*, build/*, src/*, models/*, output/*
```

#### Approval Gates
Explicit user confirmation required for:
- Critical operations (database, system)
- Restricted files (app code, config)
- File operations outside whitelist

#### Token Limits
Prevent runaway operations:
- Per-operation limit
- Per-model rate limiting
- Duration-based cutoff

### 3. Model Coordination

#### Consensus Model
Requires 2/3+ of executor models to agree before proceeding.

#### Voting Model
Majority vote required.

#### Sequential Model
One model at a time (simple fallback).

### 4. Real-Time Monitoring

Live dashboard shows:
- ⏱️ Elapsed time
- 📈 Total tokens used
- ✅ Tasks completed
- ❌ Tasks failed
- 🤖 Active models
- ⚡ Throughput (tokens/sec)
- 🔒 Safety violations
- ⚠️ Pending approvals

**Configurable Display:**
Toggle any metric on/off per session.

### 5. Logging & History

- **Real-time streaming** to UI
- **Multiple log types:** info, warning, error, success, config
- **Filterable** by type
- **Searchable** in exported reports
- **Auto-capped** at 1000 entries (oldest trimmed)

### 6. Reporting

Post-automation summary includes:
- Duration and tokens used
- Success rate percentage
- Per-model performance stats
- Safety violations
- Task breakdown
- **Exportable** as JSON

## Usage

### Configuration

1. **Set Duration** (slider: 10-600 seconds)
   - How long models can work autonomously

2. **Toggle "Just Build It"**
   - If ON: Skip planning, go straight to execution
   - If OFF: Use planning phase first (more accurate)

3. **Set Token Rate** (100-5000 per operation)
   - Higher = more tokens per task = quality vs speed tradeoff

4. **Choose Execution Strategy**
   - Parallel: All at once
   - Sequential: Pass output forward
   - Hierarchical: Plan + execute + vote

5. **Set Model Coordination**
   - Consensus, voting, or sequential

6. **Enter Instructions** (one per line or semicolon-separated)
   ```
   Build React app with hooks
   Run all tests
   Generate API documentation
   Create deployment config
   ```

7. **Configure Safety Whitelist**
   - Paths models are allowed to modify
   - Use wildcards: `path/to/*`

8. **Specify Restricted Files**
   - Files that require explicit approval to modify
   - Example: `app.js, package.json, .env`

### Starting Automation

1. Click **🤖 Automate** button (bottom-right)
2. Configure settings
3. Click **▶ START**
4. Monitor progress in real-time
5. Approve any risky operations that pop up
6. View summary when complete

### Controls During Execution

- **⏸ PAUSE** - Freeze execution
- **⏯ RESUME** - Continue from pause
- **⏹ ABORT** - Emergency stop

### Post-Execution

- View summary report (duration, tokens, success rate)
- Check model-by-model stats
- Export full report as JSON
- Run again with same config or modify

## Safety System Details

### Approval Workflow

1. Model instruction triggers safety check
2. If violations detected:
   - Check against whitelist
   - Check for restricted files
   - Check for dangerous patterns
3. If requires approval:
   - Dialog pops up with task + violations
   - User clicks Approve or Reject
   - Execution continues or halts

### Example Violations

| Pattern | Severity | Requires Approval |
|---------|----------|-------------------|
| `rm -rf` | Critical | YES |
| `DROP TABLE` | Critical | YES |
| `sudo` | Critical | YES |
| Modify `.env` | High | YES |
| Modify `package.json` | High | YES |
| Write to `dist/` | Medium | NO (whitelisted) |

## API Reference

### AutomationEngine Methods

#### `initialize(config, models)`
Set up engine with configuration and loaded models.

#### `start()`
Begin autonomous execution.

#### `pause()`
Freeze execution (resumable).

#### `resume()`
Continue from pause.

#### `abort()`
Emergency stop.

#### `approveOperation(taskId, approved)`
User response to approval request.

#### `getStats()`
Return current live statistics.

#### `getSummary()`
Return post-execution summary report.

#### `exportReport()`
Return full JSON report.

#### `getLogs(filterType, limit)`
Retrieve logs with optional filtering.

### Controller Functions

#### `startAutomation()`
Begin automation from UI.

#### `pauseAutomation()` / `resumeAutomation()` / `abortAutomation()`
Control execution.

#### `filterLogs(type)`
Filter log display (all, info, warning, error).

#### `approveTask(approved)`
Approve/reject pending task.

#### `exportAutomationReport()`
Download report as JSON.

## Execution Flow Diagram

```
User Input
    ↓
startAutomation()
    ↓
Initialize Engine
    ↓
Parse Instructions → Tasks
    ↓
[Parallel/Sequential/Hierarchical]
    ↓
For Each Task:
    ├→ Safety Check
    │  ├→ Whitelist check
    │  ├→ Dangerous pattern check
    │  └→ Restricted file check
    │      ↓
    │      [Violations?]
    │      ├→ YES → Request Approval
    │      └→ NO → Proceed
    │
    ├→ Execute with Model(s)
    ├→ Log Results
    └→ Update Stats
    ↓
Duration Elapsed?
    ├→ NO → Next Task
    └→ YES → Finish
    ↓
Generate Summary
    ↓
Show Report + Export Option
```

## Model Coordination Examples

### Parallel (All models, same task)
```
Task: "Build React app"
    ├→ Model 1 executes
    ├→ Model 2 executes
    └→ Model 3 executes
        ↓
        Consensus check (2/3 agree?)
        ├→ YES → Proceed
        └→ NO → Log failure, continue
```

### Sequential (Pass output forward)
```
Task 1: "Write API spec" → Model 1 → Output
    ↓
Task 2: "Implement API" → Model 2 → Input: [spec] → Output
    ↓
Task 3: "Write tests" → Model 3 → Input: [implementation] → Output
```

### Hierarchical (Plan + vote)
```
Task: "Build production system"
    ├→ Lead Model: "Create execution plan"
    │   Output: Structured steps
    ├→ Executor Models: Execute plan
    │   Model 2: Execute step 1-3
    │   Model 3: Execute step 1-3
    │   Model 4: Execute step 1-3
    └→ Consensus vote (2/3 approve execution?)
        ├→ YES → Mark task complete
        └→ NO → Log failure, continue next task
```

## Ecosystem Integration

The Automation Engine is designed as a production-ready component for:

- **Game Development**
  - Generate game assets
  - Write game logic
  - Build test suites
  - Deploy to stores

- **Web Development**
  - Generate components
  - Build APIs
  - Write tests
  - Deploy to production

- **Content Creation**
  - Generate documentation
  - Create tutorials
  - Build examples
  - Package for distribution

- **DevOps/Infrastructure**
  - Build Docker images
  - Deploy to servers
  - Run CI/CD pipelines
  - Monitor systems

## Testing Offline

The engine includes mock model execution for testing:

1. Models return simulated responses
2. Execution is timestep-simulated (not blocked on real API calls)
3. Token usage is randomized but realistic
4. Safety system works normally
5. Logs and reporting function fully

**To test:**
1. Load or create mock models
2. Set duration to 30-60 seconds
3. Enter test instructions
4. Run automation
5. Verify logs, reports, safety system

## Performance Considerations

### Token Efficiency
- Higher token rate = higher quality, slower throughput
- Lower token rate = faster, may need retries
- Balance with duration

### Model Selection
- 1 model: Fast but risky (no consensus)
- 2 models: Good balance
- 3+ models: High confidence, slower

### Execution Strategy
- **Parallel:** Fast, high resource usage
- **Sequential:** Slower, builds on prior work
- **Hierarchical:** Slowest, most structured

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No models loaded" | Load models via Model Manager first |
| "Safety violations blocking tasks" | Review and approve in dialog, or adjust whitelist |
| "Tasks failing" | Check model output in logs, reduce token rate, try sequential mode |
| "Duration expired too fast" | Increase duration slider, reduce token rate |
| "Consensus not reached" | Try voting mode or sequential, add more models |

## Next Steps

1. **Load models** via Model Manager
2. **Configure automation** settings
3. **Test with simple task** (e.g., "Write hello world")
4. **Review logs** and summary
5. **Adjust settings** based on results
6. **Run production tasks** with confidence

The Automation Engine is production-ready for autonomous, monitored task execution with full safety guardrails and real-time control.
