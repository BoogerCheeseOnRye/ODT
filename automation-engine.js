// ODT - Automation Engine
// Orchestrates autonomous model execution for production tasks
// Handles safety, coordination, monitoring, and execution strategies

class AutomationEngine {
    constructor() {
        this.state = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            endTime: null,
            totalTokensUsed: 0,
            tasksCompleted: 0,
            tasksFailed: 0,
            currentTask: null,
            operationQueue: [],
            executionStrategy: 'parallel', // parallel, sequential, hierarchical
            logs: [],
            results: [],
            errors: [],
            safetyViolations: [],
            modelStatus: {},
            checkpoints: []
        };

        this.config = {
            duration: 60, // seconds
            justBuild: false,
            tokenRatePerModel: 500, // tokens/operation
            instructions: '',
            executionMode: 'parallel',
            safetyWhitelist: ['dist/*', 'build/*', 'models/*', 'src/*'],
            maxTokensPerOp: 2000,
            requiresApprovalFor: ['app.js', 'package.json', 'index.html', '.env'],
            pendingApprovals: [],
            modelCoordination: 'consensus', // consensus, voting, sequential
            consensusThreshold: 0.66 // 2/3 of models must agree
        };

        this.models = []; // Loaded models
        this.abortController = null;
    }

    /**
     * Initialize automation with user config
     */
    initialize(config, loadedModels) {
        this.config = { ...this.config, ...config };
        this.models = loadedModels || [];
        
        this.state = {
            ...this.state,
            startTime: Date.now(),
            isRunning: false,
            isPaused: false,
            logs: [],
            results: [],
            errors: [],
            safetyViolations: [],
            modelStatus: {}
        };

        // Initialize model status tracking
        this.models.forEach(model => {
            this.state.modelStatus[model.name] = {
                status: 'idle',
                tokensUsed: 0,
                tasksCompleted: 0,
                tasksFailed: 0,
                lastError: null,
                lastUpdate: Date.now()
            };
        });

        this.addLog('SYSTEM', `Automation initialized with ${this.models.length} model(s)`, 'info');
        this.addLog('CONFIG', `Strategy: ${this.config.executionMode} | Duration: ${this.config.duration}s | Just Build: ${this.config.justBuild}`, 'config');
    }

    /**
     * Start automation execution
     */
    async start() {
        if (this.state.isRunning) {
            this.addLog('WARN', 'Automation already running', 'warning');
            return false;
        }

        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        this.abortController = new AbortController();

        this.addLog('SYSTEM', 'Automation started', 'success');

        try {
            await this.executeAutomation();
        } catch (err) {
            this.addLog('ERROR', `Execution failed: ${err.message}`, 'error');
            this.state.errors.push(err);
        } finally {
            this.stop();
        }

        return true;
    }

    /**
     * Main execution loop
     */
    async executeAutomation() {
        const endTime = Date.now() + (this.config.duration * 1000);

        while (Date.now() < endTime && this.state.isRunning) {
            // Check for pause
            if (this.state.isPaused) {
                await this.sleep(100);
                continue;
            }

            // Check for abort
            if (this.abortController.signal.aborted) {
                this.addLog('SYSTEM', 'Automation aborted by user', 'warning');
                break;
            }

            // Parse instructions into tasks
            const tasks = this.parseInstructions();

            if (tasks.length === 0) {
                this.addLog('WARN', 'No tasks to execute', 'warning');
                break;
            }

            // Execute based on strategy
            switch (this.config.executionMode) {
                case 'parallel':
                    await this.executeParallel(tasks);
                    break;
                case 'sequential':
                    await this.executeSequential(tasks);
                    break;
                case 'hierarchical':
                    await this.executeHierarchical(tasks);
                    break;
                default:
                    await this.executeParallel(tasks);
            }

            // Check remaining time
            const remainingMs = endTime - Date.now();
            if (remainingMs > 0) {
                this.addLog('TIMER', `${Math.ceil(remainingMs / 1000)}s remaining`, 'info');
            }
        }

        this.addLog('SYSTEM', 'Automation execution complete', 'success');
    }

    /**
     * Parse user instructions into executable tasks
     */
    parseInstructions() {
        const instructions = this.config.instructions.trim();
        if (!instructions) return [];

        // Split by newlines or semicolons
        const tasks = instructions
            .split(/[\n;]+/)
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map((task, idx) => ({
                id: `task-${idx}`,
                instruction: task,
                status: 'pending',
                attempts: 0,
                results: [],
                errors: [],
                createdAt: Date.now()
            }));

        this.addLog('PARSE', `Parsed ${tasks.length} task(s) from instructions`, 'info');
        return tasks;
    }

    /**
     * Execute all tasks in parallel with all models
     */
    async executeParallel(tasks) {
        const promises = [];

        for (const task of tasks) {
            // Run task with all available models in parallel
            const modelPromises = this.models.map(model =>
                this.executeTaskWithModel(task, model)
            );

            promises.push(Promise.allSettled(modelPromises));
        }

        const results = await Promise.allSettled(promises);
        
        results.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
                this.state.tasksCompleted++;
            } else {
                this.state.tasksFailed++;
            }
        });
    }

    /**
     * Execute tasks sequentially, passing output of one as input to next
     */
    async executeSequential(tasks) {
        let previousOutput = null;

        for (const task of tasks) {
            const taskWithContext = {
                ...task,
                instruction: previousOutput 
                    ? `${task.instruction}\n\nContext from previous task:\n${previousOutput}`
                    : task.instruction
            };

            // Use first model in sequence
            const result = await this.executeTaskWithModel(taskWithContext, this.models[0]);
            previousOutput = result?.output || null;

            if (result?.success) {
                this.state.tasksCompleted++;
            } else {
                this.state.tasksFailed++;
                break; // Stop on first failure in sequential mode
            }
        }
    }

    /**
     * Hierarchical: Lead model plans, other models execute, consensus on risky ops
     */
    async executeHierarchical(tasks) {
        const leadModel = this.models[0];
        const executorModels = this.models.slice(1);

        if (!leadModel) {
            this.addLog('ERROR', 'No lead model available for hierarchical execution', 'error');
            return;
        }

        for (const task of tasks) {
            // Lead model creates execution plan
            this.addLog('PLANNER', `Planning: ${task.instruction}`, 'info');
            const plan = await this.executeTaskWithModel(
                { ...task, instruction: `Create an execution plan for: ${task.instruction}` },
                leadModel
            );

            if (!plan?.success) {
                this.state.tasksFailed++;
                continue;
            }

            // Executor models execute the plan
            const executionPromises = executorModels.map(model =>
                this.executeTaskWithModel(
                    { ...task, instruction: plan.output },
                    model
                )
            );

            const results = await Promise.allSettled(executionPromises);

            // Check if consensus reached
            const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            const threshold = Math.ceil(executorModels.length * this.config.consensusThreshold);

            if (successCount >= threshold) {
                this.state.tasksCompleted++;
                this.addLog('CONSENSUS', `Task approved by ${successCount}/${executorModels.length} models`, 'success');
            } else {
                this.state.tasksFailed++;
                this.addLog('CONSENSUS', `Task rejected: ${successCount}/${executorModels.length} models approved (need ${threshold})`, 'warning');
            }
        }
    }

    /**
     * Execute single task with single model
     */
    async executeTaskWithModel(task, model) {
        const modelName = model.name || model.id || 'unknown';

        try {
            // Update model status
            this.state.modelStatus[modelName].status = 'busy';
            this.state.modelStatus[modelName].lastUpdate = Date.now();

            // Safety check before execution
            const safetyCheck = this.checkSafety(task.instruction);
            if (safetyCheck.violations.length > 0) {
                this.addLog('SAFETY', `Safety violations detected: ${safetyCheck.violations.join(', ')}`, 'warning');
                this.state.safetyViolations.push({ task: task.id, violations: safetyCheck.violations });

                // If requires approval and not approved yet, request it
                if (safetyCheck.requiresApproval) {
                    const approved = await this.requestApproval(task, safetyCheck);
                    if (!approved) {
                        this.addLog('BLOCKED', `Task blocked pending user approval: ${task.instruction.substring(0, 50)}...`, 'warning');
                        return { success: false, reason: 'awaiting_approval' };
                    }
                }
            }

            // Simulate model execution (in real use, call actual model API)
            this.addLog(modelName, `Executing: ${task.instruction.substring(0, 80)}...`, 'info');

            // Simulated delay
            await this.sleep(Math.random() * 1000 + 500);

            // Simulate response
            const output = this.generateMockResponse(task.instruction);
            const tokensUsed = Math.floor(Math.random() * this.config.tokenRatePerModel) + 100;

            this.state.modelStatus[modelName].tokensUsed += tokensUsed;
            this.state.modelStatus[modelName].tasksCompleted++;
            this.state.totalTokensUsed += tokensUsed;

            this.addLog(modelName, `✓ Completed (${tokensUsed} tokens)`, 'success');

            return {
                success: true,
                modelName: modelName,
                output: output,
                tokensUsed: tokensUsed,
                taskId: task.id,
                timestamp: Date.now()
            };

        } catch (err) {
            this.state.modelStatus[modelName].tasksFailed++;
            this.state.modelStatus[modelName].lastError = err.message;
            this.addLog(modelName, `✗ Failed: ${err.message}`, 'error');

            return {
                success: false,
                modelName: modelName,
                error: err.message,
                taskId: task.id
            };
        } finally {
            this.state.modelStatus[modelName].status = 'idle';
        }
    }

    /**
     * Safety check for instructions
     */
    checkSafety(instruction) {
        const violations = [];
        const requiresApproval = [];

        // Check for dangerous patterns
        const dangerousPatterns = [
            { pattern: /rm\s+-rf/i, name: 'recursive delete', severity: 'critical' },
            { pattern: /DROP\s+TABLE/i, name: 'database drop', severity: 'critical' },
            { pattern: /DELETE\s+FROM/i, name: 'delete database records', severity: 'critical' },
            { pattern: /chmod\s+777/i, name: 'permission escalation', severity: 'high' },
            { pattern: /sudo/i, name: 'privilege escalation', severity: 'critical' }
        ];

        for (const { pattern, name, severity } of dangerousPatterns) {
            if (pattern.test(instruction)) {
                violations.push(`${name} (${severity})`);
                if (severity === 'critical') requiresApproval.push(name);
            }
        }

        // Check for restricted files
        for (const restrictedFile of this.config.requiresApprovalFor) {
            if (instruction.includes(restrictedFile)) {
                requiresApproval.push(`modifying ${restrictedFile}`);
            }
        }

        // Check against whitelist
        const isWhitelisted = this.config.safetyWhitelist.some(pattern =>
            this.matchesPattern(instruction, pattern)
        );

        if (!isWhitelisted && instruction.includes('file') || instruction.includes('write')) {
            requiresApproval.push('file system operation on non-whitelisted path');
        }

        return {
            violations: violations,
            requiresApproval: requiresApproval.length > 0,
            needsUserConfirm: requiresApproval
        };
    }

    /**
     * Pattern matching for whitelisted paths
     */
    matchesPattern(text, pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(text);
    }

    /**
     * Request user approval for risky operations
     */
    async requestApproval(task, safetyCheck) {
        return new Promise((resolve) => {
            const approval = {
                taskId: task.id,
                instruction: task.instruction,
                violations: safetyCheck.needsUserConfirm,
                timestamp: Date.now(),
                resolved: false,
                approved: false,
                resolve: resolve
            };

            this.config.pendingApprovals.push(approval);

            // Dispatch event so UI can show confirmation dialog
            window.dispatchEvent(new CustomEvent('automationApprovalNeeded', { 
                detail: approval 
            }));

            // Note: The actual approval happens via user interaction in the UI
            // This will resolve when user clicks approve/reject
        });
    }

    /**
     * Handle user approval response
     */
    approveOperation(taskId, approved) {
        const approval = this.config.pendingApprovals.find(a => a.taskId === taskId);
        if (approval) {
            approval.resolved = true;
            approval.approved = approved;
            approval.resolve(approved);
            this.config.pendingApprovals = this.config.pendingApprovals.filter(a => a.taskId !== taskId);
        }
    }

    /**
     * Generate mock response (simulates model output)
     */
    generateMockResponse(instruction) {
        const responses = [
            'Task executed successfully',
            'Operation completed with no errors',
            'Generated output successfully',
            'Processed all inputs and created outputs',
            'Completed: ' + instruction.substring(0, 50)
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Add log entry
     */
    addLog(source, message, type = 'info') {
        const entry = {
            timestamp: Date.now(),
            source: source,
            message: message,
            type: type // info, warning, error, success, config
        };

        this.state.logs.push(entry);

        // Keep only last 1000 logs
        if (this.state.logs.length > 1000) {
            this.state.logs = this.state.logs.slice(-1000);
        }

        // Dispatch event for real-time UI updates
        window.dispatchEvent(new CustomEvent('automationLogUpdate', { detail: entry }));
    }

    /**
     * Pause automation
     */
    pause() {
        this.state.isPaused = true;
        this.addLog('SYSTEM', 'Automation paused', 'warning');
    }

    /**
     * Resume automation
     */
    resume() {
        if (this.state.isRunning) {
            this.state.isPaused = false;
            this.addLog('SYSTEM', 'Automation resumed', 'success');
        }
    }

    /**
     * Stop automation
     */
    stop() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.state.endTime = Date.now();
        this.addLog('SYSTEM', 'Automation stopped', 'warning');
    }

    /**
     * Abort automation
     */
    abort() {
        if (this.abortController) {
            this.abortController.abort();
        }
        this.stop();
    }

    /**
     * Get summary report
     */
    getSummary() {
        const duration = (this.state.endTime - this.state.startTime) / 1000;
        const tokensPerSecond = this.state.totalTokensUsed / duration || 0;

        return {
            status: this.state.isRunning ? 'running' : 'completed',
            duration: duration,
            totalTokensUsed: this.state.totalTokensUsed,
            tokensPerSecond: tokensPerSecond.toFixed(2),
            tasksCompleted: this.state.tasksCompleted,
            tasksFailed: this.state.tasksFailed,
            totalTasks: this.state.tasksCompleted + this.state.tasksFailed,
            successRate: ((this.state.tasksCompleted / (this.state.tasksCompleted + this.state.tasksFailed)) * 100).toFixed(1),
            safetyViolations: this.state.safetyViolations.length,
            modelStats: this.state.modelStatus,
            logCount: this.state.logs.length,
            startTime: new Date(this.state.startTime).toLocaleString(),
            endTime: this.state.endTime ? new Date(this.state.endTime).toLocaleString() : 'N/A'
        };
    }

    /**
     * Get current statistics for live display
     */
    getStats() {
        const elapsed = (Date.now() - this.state.startTime) / 1000;

        return {
            isRunning: this.state.isRunning,
            isPaused: this.state.isPaused,
            elapsedSeconds: Math.floor(elapsed),
            totalTokens: this.state.totalTokensUsed,
            tokensPerSecond: (this.state.totalTokensUsed / elapsed).toFixed(2),
            tasksCompleted: this.state.tasksCompleted,
            tasksFailed: this.state.tasksFailed,
            activeModels: Object.values(this.state.modelStatus).filter(m => m.status === 'busy').length,
            totalModels: this.models.length,
            safetyViolations: this.state.safetyViolations.length,
            pendingApprovals: this.config.pendingApprovals.length
        };
    }

    /**
     * Utility sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get logs filtered by type or source
     */
    getLogs(filterType = null, limit = 100) {
        let logs = this.state.logs;

        if (filterType) {
            logs = logs.filter(l => l.type === filterType);
        }

        return logs.slice(-limit);
    }

    /**
     * Export automation report
     */
    exportReport() {
        const summary = this.getSummary();
        const report = {
            summary: summary,
            logs: this.state.logs,
            safetyViolations: this.state.safetyViolations,
            errors: this.state.errors,
            modelStatus: this.state.modelStatus,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(report, null, 2);
    }
}

// Export for use in index.html
window.AutomationEngine = AutomationEngine;
