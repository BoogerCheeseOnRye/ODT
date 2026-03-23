// Injected at start of main script
// File tree and preview management

const FILE_TREE = {
    name: 'E:',
    type: 'folder',
    expanded: true,
    children: [
        {
            name: 'TEoAAAG',
            type: 'folder',
            expanded: false,
            path: 'E:\\TEoAAAG',
            children: [
                { name: 'index.html', type: 'file', size: '45KB', path: 'E:\\TEoAAAG\\index.html' },
                { name: 'TEoAAAG.exe', type: 'file', size: '8.2MB', path: 'E:\\TEoAAAG\\TEoAAAG.exe' },
                { name: 'config.json', type: 'file', size: '2.1KB', path: 'E:\\TEoAAAG\\config.json' }
            ]
        },
        {
            name: 'Tribes',
            type: 'folder',
            expanded: false,
            path: 'E:\\Tribes',
            children: [
                {
                    name: 'base',
                    type: 'folder',
                    expanded: false,
                    path: 'E:\\Tribes\\base',
                    children: [
                        { name: 'terrain.dat', type: 'file', size: '12MB', path: 'E:\\Tribes\\base\\terrain.dat' },
                        { name: 'scripts.c', type: 'file', size: '520KB', path: 'E:\\Tribes\\base\\scripts.c' }
                    ]
                },
                {
                    name: 'RPG',
                    type: 'folder',
                    expanded: false,
                    path: 'E:\\Tribes\\RPG',
                    children: [
                        { name: 'quests.dat', type: 'file', size: '4.3MB', path: 'E:\\Tribes\\RPG\\quests.dat' }
                    ]
                }
            ]
        },
        {
            name: 'dashboard-app',
            type: 'folder',
            expanded: false,
            path: 'E:\\dashboard-app',
            children: [
                { name: 'index.html', type: 'file', size: '39KB', path: 'E:\\dashboard-app\\index.html' },
                { name: 'server.js', type: 'file', size: '9.4KB', path: 'E:\\dashboard-app\\server.js' },
                { name: 'proxy.js', type: 'file', size: '2.5KB', path: 'E:\\dashboard-app\\proxy.js' }
            ]
        },
        { name: 'build.bat', type: 'file', size: '1.2KB', path: 'E:\\build.bat' },
        { name: 'dashboard.bat', type: 'file', size: '856B', path: 'E:\\dashboard.bat' }
    ]
};

let currentFile = null;
let expandedFolders = new Set(['E:']);

function renderFileTree(data, container, depth = 0) {
    if (!container) return;
    const itemDiv = document.createElement('div');
    itemDiv.style.paddingLeft = depth * 12 + 'px';
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.gap = '4px';
    itemDiv.style.cursor = 'pointer';
    itemDiv.style.padding = '4px 6px';
    itemDiv.style.borderRadius = '3px';
    
    if (data.type === 'folder') {
        const isExpanded = expandedFolders.has(data.path || data.name);
        const toggle = document.createElement('span');
        toggle.style.minWidth = '12px';
        toggle.style.color = '#58a6ff';
        toggle.textContent = isExpanded ? '▼' : '▶';
        toggle.onclick = (e) => {
            e.stopPropagation();
            if (expandedFolders.has(data.path || data.name)) {
                expandedFolders.delete(data.path || data.name);
            } else {
                expandedFolders.add(data.path || data.name);
            }
            rebuildTree();
        };
        itemDiv.appendChild(toggle);
        
        const label = document.createElement('span');
        label.textContent = `📁 ${data.name}`;
        label.style.flex = '1';
        itemDiv.appendChild(label);
        itemDiv.onmouseover = () => itemDiv.style.backgroundColor = '#161b22';
        itemDiv.onmouseout = () => itemDiv.style.backgroundColor = '';
        container.appendChild(itemDiv);
        
        if (isExpanded && data.children) {
            data.children.forEach(child => renderFileTree(child, container, depth + 1));
        }
    } else {
        const icon = document.createElement('span');
        icon.textContent = '📄';
        icon.style.minWidth = '12px';
        itemDiv.appendChild(icon);
        
        const label = document.createElement('span');
        label.textContent = data.name;
        label.style.flex = '1';
        label.style.color = currentFile?.path === data.path ? '#58a6ff' : '#8b949e';
        itemDiv.appendChild(label);
        
        const size = document.createElement('span');
        size.textContent = data.size;
        size.style.fontSize = '9px';
        size.style.color = '#6b7280';
        size.style.marginLeft = 'auto';
        itemDiv.appendChild(size);
        
        itemDiv.onclick = () => selectFile(data);
        itemDiv.onmouseover = () => itemDiv.style.backgroundColor = '#161b22';
        itemDiv.onmouseout = () => itemDiv.style.backgroundColor = '';
        container.appendChild(itemDiv);
    }
}

function rebuildTree() {
    const tree = document.getElementById('file-tree');
    if (tree) {
        tree.innerHTML = '';
        renderFileTree(FILE_TREE, tree);
    }
}

function selectFile(file) {
    currentFile = file;
    loadFilePreview(file);
}

function loadFilePreview(file) {
    const centerPanel = document.querySelector('.center-panel');
    if (!centerPanel) return;
    
    const canvas = document.getElementById('preview3d');
    const ext = file.name.split('.').pop();
    const content = generatePreviewContent(file, ext);
    
    // Create preview if needed
    let preview = document.getElementById('file-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'file-preview';
        preview.style.flex = '1';
        preview.style.overflow = 'auto';
        preview.style.padding = '12px';
        preview.style.fontFamily = "'Courier New', monospace";
        preview.style.fontSize = '11px';
        preview.style.color = '#8b949e';
        preview.style.whiteSpace = 'pre-wrap';
        preview.style.wordWrap = 'break-word';
        centerPanel.appendChild(preview);
    }
    
    canvas.style.display = 'none';
    preview.style.display = 'block';
    preview.innerHTML = content;
    
    if (isMobile) switchPanel('preview');
    addResponse('System', `Loaded: ${file.path} (${file.size})`);
}

function generatePreviewContent(file, ext) {
    const templates = {
        'html': `<!DOCTYPE html>\n<html>\n<head><title>${file.name}</title></head>\n<body>\n  <h1>${file.name}</h1>\n  <p>Size: ${file.size}</p>\n</body>\n</html>`,
        'js': `// ${file.name}\n// Size: ${file.size}\n\nfunction init() {\n  console.log('Loaded');\n}\ninit();`,
        'json': `{\n  "file": "${file.name}",\n  "size": "${file.size}",\n  "path": "${file.path}"\n}`,
        'bat': `@echo off\nREM ${file.name}\necho Loading batch...`,
        'c': `// ${file.name}\n#include <stdio.h>\nint main() {\n  return 0;\n}`,
        'exe': `[Binary Executable]\nFile: ${file.name}\nSize: ${file.size}\nCannot preview binary.`,
        'dat': `[Binary Data]\nFile: ${file.name}\nSize: ${file.size}\nCannot preview binary.`
    };
    return templates[ext] || `File: ${file.name}\nType: ${ext || 'unknown'}\nSize: ${file.size}\nPath: ${file.path}`;
}

function showCanvas() {
    const canvas = document.getElementById('preview3d');
    const preview = document.getElementById('file-preview');
    if (preview) preview.style.display = 'none';
    canvas.style.display = 'block';
    currentFile = null;
    rebuildTree();
}
