// File Tree and Preview Management

let currentFile = null;
let expandedFolders = new Set(['E:']);

// Render file tree with expandable folders
function renderFileTree(data, container, depth = 0) {
    if (!container) return;
    
    const itemDiv = document.createElement('div');
    itemDiv.style.paddingLeft = depth * 16 + 'px';
    itemDiv.className = 'file-item';
    itemDiv.style.display = 'flex';
    itemDiv.style.alignItems = 'center';
    itemDiv.style.gap = '4px';
    
    if (data.type === 'folder') {
        const isExpanded = expandedFolders.has(data.path || data.name);
        
        // Folder toggle button
        const toggle = document.createElement('span');
        toggle.style.cursor = 'pointer';
        toggle.style.minWidth = '16px';
        toggle.textContent = isExpanded ? '▼' : '▶';
        toggle.style.color = '#58a6ff';
        toggle.onclick = (e) => {
            e.stopPropagation();
            toggleFolder(data.path || data.name, container);
        };
        
        itemDiv.appendChild(toggle);
        
        // Folder icon and name
        const label = document.createElement('span');
        label.textContent = `📁 ${data.name}`;
        label.style.flex = '1';
        label.style.cursor = 'pointer';
        label.onclick = () => selectFile(data);
        itemDiv.appendChild(label);
        
        container.appendChild(itemDiv);
        
        // Children
        if (isExpanded && data.children) {
            data.children.forEach(child => renderFileTree(child, container, depth + 1));
        }
    } else {
        // File item
        const fileIcon = document.createElement('span');
        fileIcon.textContent = '📄';
        fileIcon.style.minWidth = '16px';
        itemDiv.appendChild(fileIcon);
        
        const label = document.createElement('span');
        label.textContent = data.name;
        label.style.flex = '1';
        label.style.cursor = 'pointer';
        label.style.color = currentFile?.path === data.path ? '#58a6ff' : '#8b949e';
        label.onclick = () => selectFile(data);
        itemDiv.appendChild(label);
        
        const size = document.createElement('span');
        size.textContent = data.size;
        size.style.fontSize = '9px';
        size.style.color = '#6b7280';
        size.style.marginLeft = 'auto';
        itemDiv.appendChild(size);
        
        container.appendChild(itemDiv);
    }
}

function toggleFolder(folderPath, container) {
    if (expandedFolders.has(folderPath)) {
        expandedFolders.delete(folderPath);
    } else {
        expandedFolders.add(folderPath);
    }
    
    // Rebuild tree
    container.innerHTML = '';
    renderFileTree(FILE_TREE, container);
}

function selectFile(file) {
    if (file.type === 'file') {
        currentFile = file;
        loadFilePreview(file);
        
        // Highlight selected file
        document.querySelectorAll('.file-item').forEach(item => {
            item.style.backgroundColor = item.textContent.includes(file.name) ? '#161b22' : '';
        });
    }
}

function loadFilePreview(file) {
    const centerPanel = document.querySelector('.center-panel');
    if (!centerPanel) return;
    
    // Switch to file preview if not in fullscreen
    if (!isFullscreen) {
        const canvas = document.getElementById('preview3d');
        if (canvas.style.display !== 'none') {
            canvas.style.display = 'none';
            createFilePreviewArea();
        }
    }
    
    // Display file content
    const preview = document.getElementById('file-preview') || createFilePreviewArea();
    
    // Simulate loading file content
    const ext = file.name.split('.').pop();
    let content = generatePreviewContent(file, ext);
    
    preview.innerHTML = content;
    
    // Switch to preview tab on mobile
    if (isMobile) {
        switchPanel('preview');
    }
    
    // Add to chat
    addResponse('System', `Loading: ${file.path}`);
}

function createFilePreviewArea() {
    const centerPanel = document.querySelector('.center-panel');
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
        preview.style.display = 'none';
        centerPanel.appendChild(preview);
    }
    
    return preview;
}

function generatePreviewContent(file, ext) {
    const fileTypes = {
        'html': `<!DOCTYPE html>
<html>
<head>
    <title>${file.name}</title>
</head>
<body>
    <h1>${file.name}</h1>
    <p>File size: ${file.size}</p>
    <!-- Content preview -->
</body>
</html>`,
        'js': `// ${file.name}
// File size: ${file.size}

function init() {
    console.log('Loaded: ${file.path}');
}

init();`,
        'json': `{
  "file": "${file.name}",
  "size": "${file.size}",
  "type": "${ext}",
  "path": "${file.path}",
  "created": "${new Date().toISOString()}",
  "content": "..."
}`,
        'bat': `@echo off
REM ${file.name}
REM Size: ${file.size}

echo Loading batch script...
echo Path: ${file.path}`,
        'exe': `[Binary Executable]
File: ${file.name}
Size: ${file.size}
Type: Windows Executable
Path: ${file.path}

Cannot preview binary files.`,
        'dat': `[Binary Data File]
File: ${file.name}
Size: ${file.size}
Type: Data File
Path: ${file.path}

Cannot preview binary data.`,
        'c': `// ${file.name}
// File size: ${file.size}
// Language: C

#include <stdio.h>

int main() {
    printf("Loaded: ${file.path}\\n");
    return 0;
}`
    };
    
    return fileTypes[ext] || `File: ${file.name}
Type: ${ext.toUpperCase() || 'Unknown'}
Size: ${file.size}
Path: ${file.path}

Preview not available for this file type.`;
}

// Initialize file tree on load
function initializeFileTree() {
    const fileTree = document.getElementById('file-tree');
    if (fileTree && FILE_TREE) {
        fileTree.innerHTML = '';
        renderFileTree(FILE_TREE, fileTree);
    }
}
