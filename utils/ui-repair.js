/**
 * ODT Self-Repairing UI System
 * Detects and fixes UI inconsistencies automatically
 * Triggered on load or via Settings button
 */

class UIRepairSystem {
    constructor() {
        this.issues = [];
        this.repaired = [];
        this.isRepairing = false;
    }

    /**
     * Run diagnostics on page load
     */
    async detectIssuesOnLoad() {
        const issues = await this.runDiagnostics();
        
        if (issues.length > 0) {
            console.warn('[UIRepair] Issues detected on load:', issues);
            // Show repair notification
            this.showRepairNotification(issues, true);
            // Auto-repair critical issues
            await this.autoRepairCritical(issues);
        }
    }

    /**
     * Full UI diagnostics
     */
    async runDiagnostics() {
        this.issues = [];
        
        // Check 1: Header buttons consistency
        this.checkHeaderButtons();
        
        // Check 2: Modal styling
        this.checkModals();
        
        // Check 3: Responsive layout
        this.checkResponsive();
        
        // Check 4: Color scheme consistency
        this.checkColorScheme();
        
        // Check 5: Font sizing
        this.checkFontSizing();
        
        // Check 6: Button alignment
        this.checkButtonAlignment();
        
        // Check 7: Spacing consistency
        this.checkSpacing();
        
        // Check 8: Z-index conflicts
        this.checkZIndex();

        return this.issues;
    }

    /**
     * Check header buttons for uniform sizing
     */
    checkHeaderButtons() {
        const buttons = document.querySelectorAll('.header-btn');
        if (buttons.length === 0) return;

        let minHeight = Infinity;
        let maxHeight = 0;

        buttons.forEach(btn => {
            const height = btn.offsetHeight;
            minHeight = Math.min(minHeight, height);
            maxHeight = Math.max(maxHeight, height);
        });

        if (maxHeight - minHeight > 2) {
            this.issues.push({
                id: 'header-buttons-size',
                severity: 'high',
                message: 'Header buttons have inconsistent sizes',
                details: `Min: ${minHeight}px, Max: ${maxHeight}px (should be uniform)`,
                fix: () => this.fixHeaderButtons()
            });
        }

        // Check for text overflow in buttons
        buttons.forEach((btn, idx) => {
            if (btn.scrollWidth > btn.offsetWidth) {
                this.issues.push({
                    id: 'header-button-overflow-' + idx,
                    severity: 'medium',
                    message: `Header button ${idx} has text overflow`,
                    fix: () => this.fixButtonOverflow(btn)
                });
            }
        });
    }

    /**
     * Check modal consistency
     */
    checkModals() {
        const modals = document.querySelectorAll('.modal');
        
        modals.forEach(modal => {
            const content = modal.querySelector('.modal-content');
            if (!content) {
                this.issues.push({
                    id: 'modal-missing-content',
                    severity: 'high',
                    message: `Modal ${modal.id} missing content wrapper`,
                    fix: () => this.fixModalStructure(modal)
                });
            }
        });

        // Check modal backdrop styling
        modals.forEach(modal => {
            const bgColor = window.getComputedStyle(modal).backgroundColor;
            if (!bgColor.includes('rgba(0, 0, 0')) {
                this.issues.push({
                    id: 'modal-backdrop-style',
                    severity: 'low',
                    message: 'Modal backdrop styling inconsistent',
                    fix: () => this.fixModalBackdrop(modal)
                });
            }
        });
    }

    /**
     * Check responsive layout
     */
    checkResponsive() {
        const width = window.innerWidth;
        const leftPanel = document.getElementById('left-panel');
        const rightPanel = document.getElementById('right-panel');
        const tabs = document.getElementById('panel-tabs');

        if (width <= 1024) {
            // Mobile layout
            if (tabs && !tabs.classList.contains('active')) {
                this.issues.push({
                    id: 'mobile-tabs-missing',
                    severity: 'medium',
                    message: 'Mobile panel tabs not showing on small screen',
                    fix: () => this.fixMobileLayout()
                });
            }
        }
    }

    /**
     * Check color scheme consistency
     */
    checkColorScheme() {
        const bgColor = window.getComputedStyle(document.body).backgroundColor;
        const headerColor = window.getComputedStyle(document.querySelector('.header')).backgroundColor;

        // Expected dark theme colors
        if (!bgColor.includes('13') && !bgColor.includes('17')) {
            this.issues.push({
                id: 'color-scheme-off',
                severity: 'low',
                message: 'Background color doesn\'t match dark theme',
                fix: () => this.fixColorScheme()
            });
        }
    }

    /**
     * Check font sizing
     */
    checkFontSizing() {
        const buttons = document.querySelectorAll('button');
        let sizes = new Set();

        buttons.forEach(btn => {
            sizes.add(window.getComputedStyle(btn).fontSize);
        });

        if (sizes.size > 5) {
            this.issues.push({
                id: 'font-size-inconsistent',
                severity: 'low',
                message: 'Too many different font sizes in buttons',
                details: `Found ${sizes.size} different sizes`,
                fix: () => this.fixFontSizing()
            });
        }
    }

    /**
     * Check button alignment
     */
    checkButtonAlignment() {
        const headerButtons = document.querySelectorAll('.header-btn');
        
        headerButtons.forEach((btn, idx) => {
            const style = window.getComputedStyle(btn);
            if (style.display !== 'flex' && style.display !== 'inline-flex') {
                this.issues.push({
                    id: 'button-alignment-' + idx,
                    severity: 'medium',
                    message: `Header button ${idx} not using flex alignment`,
                    fix: () => this.fixButtonAlignment(btn)
                });
            }
        });
    }

    /**
     * Check spacing consistency
     */
    checkSpacing() {
        const modals = document.querySelectorAll('.modal-body');
        
        modals.forEach(modal => {
            const style = window.getComputedStyle(modal);
            const padding = style.padding;
            
            // Check if padding looks reasonable (not 0 or huge)
            const paddingValue = parseInt(padding);
            if (paddingValue === 0) {
                this.issues.push({
                    id: 'modal-no-padding',
                    severity: 'low',
                    message: 'Modal body has no padding',
                    fix: () => this.fixModalSpacing(modal)
                });
            }
        });
    }

    /**
     * Check z-index conflicts
     */
    checkZIndex() {
        const modals = document.querySelectorAll('.modal');
        const zIndices = new Map();

        modals.forEach(modal => {
            const zIndex = window.getComputedStyle(modal).zIndex;
            if (zIndices.has(zIndex)) {
                this.issues.push({
                    id: 'zindex-conflict',
                    severity: 'medium',
                    message: 'Z-index conflict detected between modals',
                    fix: () => this.fixZIndex()
                });
            }
            zIndices.set(zIndex, modal.id);
        });
    }

    // ============ FIX METHODS ============

    fixHeaderButtons() {
        document.querySelectorAll('.header-btn').forEach(btn => {
            btn.style.height = '32px';
            btn.style.minWidth = '32px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
        });
        this.logRepair('fixHeaderButtons', 'Set all header buttons to 32×32px with flex alignment');
    }

    fixButtonOverflow(btn) {
        btn.style.whiteSpace = 'nowrap';
        btn.style.overflow = 'hidden';
        btn.style.textOverflow = 'ellipsis';
        btn.style.padding = '6px 8px';
        this.logRepair('fixButtonOverflow', 'Fixed text overflow in button');
    }

    fixModalStructure(modal) {
        if (!modal.querySelector('.modal-content')) {
            const content = document.createElement('div');
            content.className = 'modal-content';
            content.innerHTML = modal.innerHTML;
            modal.innerHTML = '';
            modal.appendChild(content);
            this.logRepair('fixModalStructure', `Fixed modal ${modal.id} structure`);
        }
    }

    fixModalBackdrop(modal) {
        modal.style.background = 'rgba(0, 0, 0, 0.85)';
        this.logRepair('fixModalBackdrop', 'Fixed modal backdrop styling');
    }

    fixMobileLayout() {
        const tabs = document.getElementById('panel-tabs');
        if (tabs) {
            tabs.classList.add('active');
            this.logRepair('fixMobileLayout', 'Activated mobile panel tabs');
        }
    }

    fixColorScheme() {
        document.body.style.background = '#0d1117';
        document.body.style.color = '#c9d1d9';
        this.logRepair('fixColorScheme', 'Restored dark theme colors');
    }

    fixFontSizing() {
        document.querySelectorAll('.header-btn').forEach(btn => {
            btn.style.fontSize = '12px';
        });
        document.querySelectorAll('button').forEach(btn => {
            if (!btn.classList.contains('header-btn')) {
                btn.style.fontSize = '10px';
            }
        });
        this.logRepair('fixFontSizing', 'Standardized font sizes');
    }

    fixButtonAlignment(btn) {
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        this.logRepair('fixButtonAlignment', 'Fixed button flex alignment');
    }

    fixModalSpacing(modal) {
        modal.style.padding = '12px';
        this.logRepair('fixModalSpacing', 'Added modal body padding');
    }

    fixZIndex() {
        let zIndex = 1000;
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.zIndex = zIndex++;
        });
        this.logRepair('fixZIndex', 'Resolved z-index conflicts');
    }

    // ============ AUTO REPAIR ============

    async autoRepairCritical(issues) {
        const criticalIssues = issues.filter(i => i.severity === 'high');
        
        if (criticalIssues.length > 0) {
            console.log('[UIRepair] Auto-repairing critical issues...');
            
            for (const issue of criticalIssues) {
                if (issue.fix) {
                    issue.fix();
                    this.repaired.push(issue.id);
                }
            }
            
            addResponse('System', `🔧 UI auto-repaired ${criticalIssues.length} critical issue(s) on load`);
        }
    }

    /**
     * Perform manual full repair
     */
    async repairUI() {
        if (this.isRepairing) {
            addResponse('System', 'Repair already in progress...');
            return;
        }

        this.isRepairing = true;
        this.repaired = [];
        
        addResponse('System', '🔧 Running UI diagnostics...');

        const issues = await this.runDiagnostics();
        
        if (issues.length === 0) {
            addResponse('System', '✓ UI is healthy - no issues detected');
            this.isRepairing = false;
            return;
        }

        addResponse('System', `Found ${issues.length} issue(s):\n` + 
            issues.map(i => `• [${i.severity.toUpperCase()}] ${i.message}`).join('\n'));

        // Show repair modal
        this.showRepairModal(issues);
    }

    /**
     * Show repair diagnostics modal
     */
    showRepairModal(issues) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <span>UI Repair Diagnostics</span>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    <div style="margin-bottom: 12px;">
                        <div style="color: #58a6ff; font-weight: 600; margin-bottom: 8px;">Issues Found: ${issues.length}</div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; text-align: center;">
                                <div style="font-size: 9px; color: #6b7280;">Critical</div>
                                <div style="font-size: 16px; color: #f87171; font-weight: 600;">${issues.filter(i => i.severity === 'high').length}</div>
                            </div>
                            <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; text-align: center;">
                                <div style="font-size: 9px; color: #6b7280;">Minor</div>
                                <div style="font-size: 16px; color: #fbbf24; font-weight: 600;">${issues.filter(i => i.severity === 'low').length}</div>
                            </div>
                        </div>

                        <div style="max-height: 300px; overflow-y: auto; margin-bottom: 12px;">
                            ${issues.map(issue => `
                                <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 4px; padding: 8px; margin-bottom: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start;">
                                        <div>
                                            <div style="color: #c9d1d9; font-size: 11px; font-weight: 600;">${issue.message}</div>
                                            ${issue.details ? `<div style="color: #8b949e; font-size: 9px; margin-top: 2px;">${issue.details}</div>` : ''}
                                        </div>
                                        <div style="font-size: 9px; color: ${issue.severity === 'high' ? '#f87171' : '#fbbf24'}; font-weight: 600; padding: 2px 6px; background: ${issue.severity === 'high' ? 'rgba(248,113,113,0.1)' : 'rgba(251,191,36,0.1)'}; border-radius: 3px;">
                                            ${issue.severity.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div style="display: flex; gap: 6px;">
                        <button class="model-btn" style="flex: 1; background: #10b981; border-color: #059669; color: #fff;" onclick="uiRepairSystem.repairAll()">
                            🔧 Repair All
                        </button>
                        <button class="model-btn" style="flex: 1;" onclick="this.closest('.modal').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    /**
     * Repair all issues
     */
    repairAll() {
        const issues = this.issues;
        let repaired = 0;

        issues.forEach(issue => {
            if (issue.fix && !this.repaired.includes(issue.id)) {
                try {
                    issue.fix();
                    this.repaired.push(issue.id);
                    repaired++;
                } catch (err) {
                    console.error(`Failed to repair ${issue.id}:`, err);
                }
            }
        });

        addResponse('System', `✓ Repaired ${repaired}/${issues.length} issues\n\n${this.repaired.map(id => `• ${id}`).join('\n')}`);
        
        document.querySelector('.modal')?.remove();
        this.isRepairing = false;
    }

    /**
     * Show notification about issues
     */
    showRepairNotification(issues, autoRepaired = false) {
        const criticalCount = issues.filter(i => i.severity === 'high').length;
        
        if (criticalCount > 0) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50px;
                right: 12px;
                background: #1f3a3a;
                border: 1px solid #34d399;
                border-radius: 6px;
                padding: 12px;
                max-width: 300px;
                z-index: 2000;
                font-size: 11px;
                color: #34d399;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            `;
            notification.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 6px;">🔧 UI Issues Detected</div>
                <div style="color: #c9d1d9; font-size: 10px; margin-bottom: 8px;">
                    Found ${criticalCount} critical issue(s)${autoRepaired ? ' - auto-repaired' : ''}
                </div>
                <button class="model-btn" style="width: 100%; font-size: 9px; padding: 4px 8px;" onclick="uiRepairSystem.repairUI(); this.closest('div').remove();">
                    🔧 Repair Now
                </button>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), autoRepaired ? 3000 : 10000);
        }
    }

    logRepair(method, message) {
        console.log(`[UIRepair] ${method}: ${message}`);
    }
}

// Create global instance
const uiRepairSystem = new UIRepairSystem();

// Run on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        uiRepairSystem.detectIssuesOnLoad();
    }, 1000);
});
