# ODT (Offensive Development Terminal)

Complete offline-first collaborative dashboard for AI-assisted development.

## 📁 Folder Structure

```
E:\ODT\
├── dashboard/           # Main dashboard application
│   ├── index.html      # Dashboard UI (39KB)
│   ├── wipe-data.html  # Data reset utility
│   ├── data/           # User data (IndexedDB + localStorage)
│   │   ├── backups/    # Backup storage
│   │   └── README.md   # Data storage docs
│   └── screenshots/    # Captured screenshots (linked from server/)
├── server/             # Backend services
│   ├── dashboard-proxy.js    # Ollama proxy (port 9001)
│   ├── share-server.js       # Tribes protocol collaboration (port 9002)
│   └── package.json
├── utils/              # Utility modules
│   ├── screenshot.js   # Screenshot capture + bot integration
│   ├── integration.js  # Share server + screenshot integration
│   └── features.js     # UI customization + feedback system
├── screenshots/        # Shared screenshots directory
├── launch.bat         # Main launcher script
└── README.md          # This file
```

## 🚀 Quick Start

### 1. Start ODT

```bash
E:\ODT\launch.bat
```

This automatically:
- Starts Ollama proxy (localhost:9001)
- Starts Share server (localhost:9002)
- Opens dashboard in browser

### 2. Run Ollama (separate terminal)

```bash
ollama serve
```

Select model:
```bash
ollama pull qwen2.5:7b
```

### 3. Access Dashboard

- Local: `file:///E:/ODT/dashboard/index.html`
- Network: `http://<your-ip>:9001`
- Share mode: Use 🌐 button to create/join session

## ✨ Features

### Dashboard
- 📋 **Multi-project chat** with AI planning (Plan → Execute stages)
- 📝 **Code editor** with tab management and auto-save
- 🎨 **3D preview** with hardware auto-detection
- ⚙️ **Real-time optimization** (with VM warning)
- 🔧 **UI customization** (theme, layout, font size)

### Collaboration
- 🌐 **Tribes protocol** share server for real-time collaboration
- 📸 **Screenshot capture** (with CDN fallback for html2canvas)
- 🤖 **Bot integration** - bots can request screenshots for analysis
- 💬 **Live chat** between peers
- 🔄 **Project sync** across multiple users

### AI Features
- 💡 **Feedback system** - send suggestions to planning bot
- 📊 **Hardware profile** - auto-optimizes FPS & rendering
- 🔍 **Diagnostics** - 8-point system health check
- 🎯 **First-load modals** - device detection & rendering mode selection

## 🔧 API Endpoints

### Proxy Server (Port 9001)
- `POST /api/generate` - Send prompts to Ollama
- `GET /health` - Health check

### Share Server (Port 9002)

**REST API:**
- `GET /api/sessions` - List active sessions
- `POST /api/sessions/create` - Create new share session
- `POST /api/sessions/:id/join` - Join session
- `POST /api/screenshots/upload` - Upload screenshot
- `GET /api/screenshots/:fileName` - Download screenshot
- `GET /api/bot/screenshot/:fileName` - Bot-accessible screenshot (base64)
- `GET /api/status` - Server status

**WebSocket (ws://localhost:9002):**
```json
{
  "type": "join",
  "sessionId": "abc123",
  "peerName": "User"
}
```

Message types:
- `project-update` - Sync project changes
- `screenshot-shared` - Screenshot broadcast
- `chat-message` - Peer message
- `peer-joined` / `peer-left` - Peer events

## 📸 Screenshot Capture

### Browser-side (Automatic)
```javascript
captureScreenshot('my-screenshot');  // Downloads PNG + uploads if in share session
```

### For Bots
```javascript
// Bot requests screenshot
const screenshot = await fetch('/api/bot/screenshot/sessionId_timestamp_title.png');
const base64 = screenshot.base64;  // Use for image analysis
```

### Fallback Install
If html2canvas not available:
1. Dashboard shows setup dialog
2. Click "Download html2canvas"
3. Page will prompt to refresh
4. Reload and try screenshot again

## 🌐 Share Server (Tribes Protocol v1.0)

### Create Session
```bash
POST /api/sessions/create
{ "sessionName": "My Team" }

Response:
{
  "sessionId": "abc123def456",
  "accessCode": "ABC123D4",
  "joinUrl": "odt://share/abc123def456"
}
```

### Join Session
```bash
POST /api/sessions/abc123def456/join
{
  "peerId": "peer-id",
  "peerName": "Alice"
}
```

### WebSocket Example
```javascript
const ws = new WebSocket('ws://localhost:9002');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'join',
    sessionId: 'abc123',
    peerName: 'Alice'
  }));
};

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === 'peer-joined') {
    console.log(msg.peerName, 'joined');
  }
};

// Send message
ws.send(JSON.stringify({
  type: 'chat-message',
  text: 'Hello team!'
}));
```

## 💾 Data Storage

### IndexedDB (Primary)
- `appData` - Hardware profiles, first-load flags
- `projects` - All project data + chat history
- `editorState` - Open files, tabs, content

### localStorage (Fallback)
- `activeProject` - Current project ID
- `targetFPS` - User FPS preference
- `showStats` - Stats display toggle
- `uiTheme` - Color scheme (dark/light)
- `uiSettings` - Layout customization
- `renderingMode` - Local or Server
- `homeServerHost` / `homeServerPort` - Server config
- `customPaths` - User paths

### Reset Data
Open: `file:///E:/ODT/dashboard/wipe-data.html`

## 🤖 Bot Integration

Bots can:
1. **Request screenshots** - `GET /api/bot/screenshot/fileName`
2. **Submit feedback** - Sends to planning modal automatically
3. **Track projects** - IndexedDB accessible via extension
4. **Share sessions** - WebSocket join for real-time collab
5. **Analyze code** - Access editor state and file tree

### Example Bot Flow
```
1. User submits feedback: "Add dark mode toggle"
2. Planning bot receives prompt with screenshot
3. Bot analyzes screenshot + feedback
4. Bot generates implementation plan
5. Plan appears in chat + sent to bots
6. Developer implements from plan
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Enter` | Send chat message |
| `F` | Toggle fullscreen (3D preview) |
| `F12` | Open dev tools |

## 🔒 Security

- ✅ All data stored locally (E:\ODT\dashboard\data\)
- ✅ No external API calls (except CDN for html2canvas)
- ✅ Self-contained on E: drive
- ✅ Offline-first architecture
- ✅ Input validation on all endpoints
- ✅ WebSocket origin check

## 🚨 VM Optimization Warning

When running optimizations:
- **Desktop**: Safe to run directly
- **Mobile/Tablet**: Use VM (warning shown on first load)
- **Recommended**: Always use VM for system changes

VM Options:
- Hyper-V (Windows Pro+)
- VirtualBox (Free, cross-platform)
- VMware Player (Free, professional)

## 📊 Performance

- Dashboard: 39KB (HTML)
- Proxy server: ~2MB (Node.js)
- Share server: ~3MB (Node.js + WebSocket)
- Features: Modular, load on demand
- Memory: ~50-100MB base + allocation

Tested on:
- Hardware: Intel i5-i9, AMD Ryzen 5-9
- RAM: 8GB minimum, 16GB recommended
- GPU: Integrated + discrete (NVIDIA/AMD)

## 🐛 Troubleshooting

### Ollama not connecting
```bash
# Check Ollama is running
ollama serve

# Test connection
curl http://localhost:11434/api/tags
```

### Share server not working
```bash
# Check port 9002 is available
netstat -ano | findstr :9002

# Kill process on port
taskkill /PID <pid> /F
```

### Screenshot fails
1. Open browser dev tools (F12)
2. Console tab
3. Run: `loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')`
4. Reload page
5. Try screenshot again

### Data not persisting
1. Check localStorage enabled (not in private mode)
2. Open `wipe-data.html` to reset
3. Reload dashboard
4. Create new project to test

## 📝 Development

### Add new feature
1. Create module in `utils/`
2. Export functions for dashboard
3. Add button to header
4. Test locally
5. Commit to GitHub

### Project structure for bots
```
E:\ODT\
  └─ Data structure is IndexedDB:
     └─ projects: [
        {
          id: "main",
          name: "Main Project",
          chatHistory: [{label, text}],
          threads: []
        }
     ]
```

## 📞 Support

- **Docs**: `E:\ODT\README.md` (this file)
- **Data Help**: `E:\ODT\dashboard\data\README.md`
- **Issues**: Check browser console (F12)
- **Logs**: Terminal windows for server output

## 🎯 Roadmap

- [ ] Multi-device sync
- [ ] Model fine-tuning from chat logs
- [ ] GPU monitoring (RTX/AMD)
- [ ] Live code execution preview
- [ ] Hermes multi-agent framework
- [ ] Mobile app companion
- [ ] Cloud backup (optional)

---

**Status**: Production-ready for local/team development
**License**: Self-contained for E: drive
**Last Updated**: 2024
