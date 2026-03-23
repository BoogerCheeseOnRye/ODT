/**
 * Library Manager - Save and organize reusable code snippets
 */

class LibraryManager {
    constructor() {
        this.snippets = [];
        this.categories = ['General', 'JavaScript', 'Python', 'HTML/CSS', 'WebLLM', 'Utilities'];
        this.loadSnippets();
    }

    loadSnippets() {
        try {
            const saved = localStorage.getItem('code-library');
            if (saved) {
                this.snippets = JSON.parse(saved);
                console.log(`[LibraryManager] Loaded ${this.snippets.length} snippets`);
            }
        } catch (e) {
            console.warn('[LibraryManager] Failed to load snippets:', e.message);
            this.snippets = [];
        }
    }

    saveSnippets() {
        try {
            localStorage.setItem('code-library', JSON.stringify(this.snippets));
        } catch (e) {
            console.error('[LibraryManager] Failed to save snippets:', e.message);
        }
    }

    addSnippet(name, code, category = 'General', description = '', tags = []) {
        if (!name || !code) {
            throw new Error('Name and code are required');
        }

        const snippet = {
            id: 'snippet-' + Date.now(),
            name: name,
            code: code,
            category: category,
            description: description,
            tags: tags,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            uses: 0
        };

        this.snippets.push(snippet);
        this.saveSnippets();
        console.log(`[LibraryManager] Added snippet: ${name}`);
        
        return snippet;
    }

    updateSnippet(snippetId, updates) {
        const snippet = this.snippets.find(s => s.id === snippetId);
        if (!snippet) {
            throw new Error(`Snippet ${snippetId} not found`);
        }

        Object.assign(snippet, updates);
        snippet.modified = new Date().toISOString();
        this.saveSnippets();
        console.log(`[LibraryManager] Updated snippet: ${snippet.name}`);
        
        return snippet;
    }

    deleteSnippet(snippetId) {
        const index = this.snippets.findIndex(s => s.id === snippetId);
        if (index === -1) {
            throw new Error(`Snippet ${snippetId} not found`);
        }

        const snippet = this.snippets[index];
        this.snippets.splice(index, 1);
        this.saveSnippets();
        console.log(`[LibraryManager] Deleted snippet: ${snippet.name}`);
        
        return { success: true };
    }

    getSnippet(snippetId) {
        return this.snippets.find(s => s.id === snippetId);
    }

    getSnippets(filter = {}) {
        let filtered = [...this.snippets];

        if (filter.category) {
            filtered = filtered.filter(s => s.category === filter.category);
        }
        if (filter.search) {
            const query = filter.search.toLowerCase();
            filtered = filtered.filter(s => 
                s.name.toLowerCase().includes(query) || 
                s.description.toLowerCase().includes(query) ||
                s.code.toLowerCase().includes(query)
            );
        }
        if (filter.tags && filter.tags.length > 0) {
            filtered = filtered.filter(s => 
                filter.tags.some(tag => s.tags.includes(tag))
            );
        }

        if (filter.sort === 'recent') {
            filtered.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        } else if (filter.sort === 'popular') {
            filtered.sort((a, b) => b.uses - a.uses);
        } else if (filter.sort === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }

        return filtered;
    }

    insertSnippet(snippetId, editorId) {
        const snippet = this.getSnippet(snippetId);
        if (!snippet) {
            throw new Error(`Snippet ${snippetId} not found`);
        }

        const editor = document.getElementById(editorId);
        if (!editor) {
            throw new Error(`Editor ${editorId} not found`);
        }

        // Insert at cursor position
        if (editor.selectionStart !== undefined) {
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const before = editor.value.substring(0, start);
            const after = editor.value.substring(end);
            
            editor.value = before + snippet.code + after;
            editor.selectionStart = start + snippet.code.length;
            editor.selectionEnd = start + snippet.code.length;
            editor.focus();
        } else {
            editor.value += snippet.code;
        }

        // Increment usage counter
        snippet.uses++;
        this.saveSnippets();
        console.log(`[LibraryManager] Inserted snippet: ${snippet.name} (uses: ${snippet.uses})`);

        return { success: true, inserted: snippet.code.length + ' chars' };
    }

    duplicateSnippet(snippetId) {
        const original = this.getSnippet(snippetId);
        if (!original) {
            throw new Error(`Snippet ${snippetId} not found`);
        }

        const duplicate = this.addSnippet(
            original.name + ' (copy)',
            original.code,
            original.category,
            original.description,
            [...original.tags]
        );

        console.log(`[LibraryManager] Duplicated snippet: ${duplicate.name}`);
        return duplicate;
    }

    exportSnippets(filter = {}) {
        const snippets = this.getSnippets(filter);
        return {
            exported: new Date().toISOString(),
            count: snippets.length,
            snippets: snippets,
            version: '1.0'
        };
    }

    importSnippets(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!Array.isArray(data.snippets)) {
                throw new Error('Invalid format: snippets must be an array');
            }

            let imported = 0;
            data.snippets.forEach(s => {
                try {
                    this.addSnippet(s.name, s.code, s.category, s.description, s.tags);
                    imported++;
                } catch (e) {
                    console.warn(`Failed to import snippet: ${s.name}`, e.message);
                }
            });

            console.log(`[LibraryManager] Imported ${imported} snippets`);
            return { success: true, imported };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    getCategories() {
        return this.categories;
    }

    addCategory(name) {
        if (!this.categories.includes(name)) {
            this.categories.push(name);
        }
        return this.categories;
    }

    getStats() {
        return {
            total: this.snippets.length,
            byCategory: this.categories.map(cat => ({
                name: cat,
                count: this.snippets.filter(s => s.category === cat).length
            })),
            totalCharacters: this.snippets.reduce((sum, s) => sum + s.code.length, 0),
            mostUsed: this.snippets.sort((a, b) => b.uses - a.uses).slice(0, 5),
            recent: this.snippets.sort((a, b) => new Date(b.modified) - new Date(a.modified)).slice(0, 5)
        };
    }

    clearAll() {
        const count = this.snippets.length;
        this.snippets = [];
        this.saveSnippets();
        console.log(`[LibraryManager] Cleared all ${count} snippets`);
        return { success: true, cleared: count };
    }
}

// Global instance
window.libraryManager = new LibraryManager();

console.log('[LibraryManager] Initialized - Code snippet library ready');
