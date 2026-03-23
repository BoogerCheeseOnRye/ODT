// Network Mode Detection & Auto-Configuration
// Injected at top of dashboard script

(function() {
    // Detect if running locally (file://) or over network (http://)
    const isNetworkMode = window.location.protocol === 'http:' || window.location.protocol === 'https:';
    const isLocalMode = window.location.protocol === 'file:';
    
    // Setup API endpoints
    let apiEndpoints = {};
    
    if (isLocalMode) {
        // Local file:// mode - connect to localhost services
        apiEndpoints = {
            PROXY_API: 'http://localhost:9001/api/generate',
            OLLAMA_HOST: 'http://localhost:11434',
            PROXY_HOST: 'http://localhost:9001',
            API_BASE: 'http://localhost:9001'
        };
    } else if (isNetworkMode) {
        // Network http:// mode - use current host (tablet/other device access)
        const host = window.location.hostname;
        const port = 9001;
        apiEndpoints = {
            PROXY_API: `http://${host}:${port}/api/generate`,
            OLLAMA_HOST: `http://${host}:${port}`,
            PROXY_HOST: `http://${host}:${port}`,
            API_BASE: `http://${host}:${port}`
        };
    }
    
    // Expose globally for dashboard script
    window.API_ENDPOINTS = apiEndpoints;
    window.IS_NETWORK_MODE = isNetworkMode;
    window.IS_LOCAL_MODE = isLocalMode;
    
    console.log(`[TEoAAAG] Mode: ${isNetworkMode ? 'NETWORK' : 'LOCAL'}`);
    console.log(`[TEoAAAG] API Base: ${apiEndpoints.API_BASE}`);
    console.log(`[TEoAAAG] Dashboard: ${window.location.href}`);
})();
