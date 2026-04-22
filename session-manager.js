/**
 * Session Manager - Save, load, and restore work sessions
 * Full workspace preservation and history
 */

class SessionManager {
    constructor() {
        this.sessions = [];
        this.currentSession = null;
        this.autosaveInterval = 60000; // 60 seconds
        this.maxSessions = 10;
        this.loadSessions();
        this.startAutosave();
    }

    loadSessions() {
        try {
            const saved = localStorage.getItem('sessions-list');
            if (saved) {
                this.sessions = JSON.parse(saved);
                console.log(`[SessionManager] Loaded ${this.sessions.length} sessions`);
            }
        } catch (e) {
            console.warn('[SessionManager] Failed to load sessions:', e.message);
            this.sessions = [];
        }
    }

    saveSessions() {
        try {
            localStorage.setItem('sessions-list', JSON.stringify(this.sessions));
        } catch (e) {
            console.error('[SessionManager] Failed to save sessions:', e.message);
        }
    }

    createSession(name = null) {
        const sessionName = name || `Session ${new Date().toLocaleString()}`;
        
        const session = {
            id: 'session-' + Date.now(),
            name: sessionName,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            data: {
                projects: [],
                activeProject: null,
                chatHistories: {},
                editorStates: {},
                notes: ''
            }
        };

        this.sessions.unshift(session);
        if (this.sessions.length > this.maxSessions) {
            this.sessions.pop();
        }

        this.saveSessions();
        this.currentSession = session.id;
        
        console.log(`[SessionManager] Created session: ${sessionName}`);
        return session;
    }

    saveSession(name = null) {
        if (!this.currentSession) {
            throw new Error('No active session');
        }

        const session = this.sessions.find(s => s.id === this.currentSession);
        if (!session) {
            throw new Error('Session not found');
        }

        // Capture current state
        session.data.projects = window.state?.projects || [];
        session.data.activeProject = window.state?.activeProject || null;
        session.data.editorStates = window.state?.openEditors || {};
        
        // Save chat histories
        const chatEl = document.getElementById('chat-responses');
        if (chatEl) {
            session.data.chatHistories[session.data.activeProject] = 
                Array.from(chatEl.querySelectorAll('.response')).map(el => ({
                    label: el.querySelector('.response-label')?.textContent,
                    text: el.querySelector('div:last-child')?.textContent
                }));
        }

        session.modified = new Date().toISOString();
        if (name) session.name = name;

        this.saveSessions();
        console.log(`[SessionManager] Saved session: ${session.name}`);
        
        return session;
    }

    loadSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        try {
            // Restore projects
            if (window.state && session.data.projects) {
                window.state.projects = session.data.projects;
                window.state.activeProject = session.data.activeProject || 'main';
            }

            // Restore editor states
            if (window.state && session.data.editorStates) {
                window.state.openEditors = session.data.editorStates;
            }

            // Restore chat history
            const chatEl = document.getElementById('chat-responses');
            if (chatEl && session.data.chatHistories[session.data.activeProject]) {
                chatEl.innerHTML = '';
                session.data.chatHistories[session.data.activeProject].forEach(msg => {
                    const div = document.createElement('div');
                    div.className = 'response ' + (msg.label === 'You' ? 'user' : msg.label === 'System' ? 'system' : 'bot');
                    div.innerHTML = `<div class="response-label">${msg.label}</div><div>${msg.text}</div>`;
                    chatEl.appendChild(div);
                });
            }

            this.currentSession = sessionId;
            console.log(`[SessionManager] Loaded session: ${session.name}`);
            
            return session;
        } catch (e) {
            console.error('[SessionManager] Failed to load session:', e.message);
            throw e;
        }
    }

    deleteSession(sessionId) {
        const index = this.sessions.findIndex(s => s.id === sessionId);
        if (index === -1) {
            throw new Error(`Session ${sessionId} not found`);
        }

        const session = this.sessions[index];
        this.sessions.splice(index, 1);
        
        if (this.currentSession === sessionId) {
            this.currentSession = null;
        }

        this.saveSessions();
        console.log(`[SessionManager] Deleted session: ${session.name}`);
        
        return { success: true };
    }

    renameSession(sessionId, newName) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        const oldName = session.name;
        session.name = newName;
        session.modified = new Date().toISOString();
        
        this.saveSessions();
        console.log(`[SessionManager] Renamed session: ${oldName} → ${newName}`);
        
        return session;
    }

    exportSession(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }

        return {
            session: session,
            exported: new Date().toISOString(),
            hardware: window.hardwareOptimizer?.profile,
            version: '1.0'
        };
    }

    importSession(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.session || !data.session.id) {
                throw new Error('Invalid session format');
            }

            const imported = { ...data.session };
            imported.id = 'session-' + Date.now();
            imported.imported = new Date().toISOString();
            
            this.sessions.unshift(imported);
            if (this.sessions.length > this.maxSessions) {
                this.sessions.pop();
            }

            this.saveSessions();
            console.log(`[SessionManager] Imported session: ${imported.name}`);
            
            return { success: true, session: imported };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    getSessions() {
        return this.sessions.map(s => ({
            id: s.id,
            name: s.name,
            created: s.created,
            modified: s.modified,
            projectCount: s.data.projects?.length || 0,
            isCurrent: s.id === this.currentSession
        }));
    }

    getCurrentSession() {
        return this.currentSession ? this.sessions.find(s => s.id === this.currentSession) : null;
    }

    startAutosave() {
        setInterval(() => {
            if (this.currentSession) {
                try {
                    this.saveSession();
                } catch (e) {
                    console.warn('[SessionManager] Autosave failed:', e.message);
                }
            }
        }, this.autosaveInterval);
    }

    setAutosaveInterval(ms) {
        this.autosaveInterval = ms;
        console.log(`[SessionManager] Autosave interval set to ${ms}ms`);
    }

    getSessionStats(sessionId) {
        const session = this.sessions.find(s => s.id === sessionId);
        if (!session) return null;

        return {
            id: session.id,
            name: session.name,
            projects: session.data.projects?.length || 0,
            editors: Object.keys(session.data.editorStates || {}).length,
            files: session.data.projects?.reduce((sum, p) => sum + (p.files?.length || 0), 0) || 0,
            chatMessages: Object.values(session.data.chatHistories || {})
                .reduce((sum, msgs) => sum + (msgs?.length || 0), 0),
            sizeKB: JSON.stringify(session).length / 1024,
            created: session.created,
            modified: session.modified
        };
    }

    exportAllSessions() {
        return {
            sessions: this.sessions,
            exported: new Date().toISOString(),
            count: this.sessions.length,
            version: '1.0'
        };
    }

    importAllSessions(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data.sessions)) {
                throw new Error('Invalid format');
            }

            data.sessions.forEach(s => {
                s.id = 'session-' + Date.now() + Math.random();
                this.sessions.unshift(s);
            });

            // Keep only maxSessions
            this.sessions = this.sessions.slice(0, this.maxSessions);
            this.saveSessions();

            console.log(`[SessionManager] Imported ${data.sessions.length} sessions`);
            return { success: true, imported: data.sessions.length };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    clearAllSessions() {
        if (this.sessions.length === 0) {
            return { success: true, message: 'No sessions to clear' };
        }

        const count = this.sessions.length;
        this.sessions = [];
        this.currentSession = null;
        this.saveSessions();

        console.log(`[SessionManager] Cleared ${count} sessions`);
        return { success: true, cleared: count };
    }
}

// Global instance
window.sessionManager = new SessionManager();

console.log('[SessionManager] Initialized - Session management ready');
