#!/usr/bin/env python3
"""
TEoAAAG Dashboard Live Testbench
Gordon Interactive Testing with Live Logging
Monitors proxy requests and logs all interactions
"""

import os
import json
import time
import socket
import threading
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

class InteractionLogger(BaseHTTPRequestHandler):
    """Log all interactions from the dashboard"""
    
    log_file = None
    interactions = []
    
    def do_POST(self):
        """Handle POST requests from dashboard"""
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        interaction = {
            'timestamp': datetime.now().isoformat(),
            'method': 'POST',
            'path': self.path,
            'ip': self.client_address[0],
            'body': body.decode('utf-8', errors='ignore')[:500]
        }
        
        self.interactions.append(interaction)
        self.log_interaction(interaction)
        
        # Send response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status": "logged"}')
    
    def do_GET(self):
        """Handle GET requests"""
        interaction = {
            'timestamp': datetime.now().isoformat(),
            'method': 'GET',
            'path': self.path,
            'ip': self.client_address[0]
        }
        
        self.interactions.append(interaction)
        self.log_interaction(interaction)
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status": "logged"}')
    
    @classmethod
    def log_interaction(cls, interaction):
        """Log interaction to file and console"""
        timestamp = interaction['timestamp']
        method = interaction['method']
        path = interaction['path']
        
        log_line = f"[{timestamp}] {method} {path}"
        
        if 'body' in interaction and interaction['body']:
            log_line += f"\n  Body: {interaction['body'][:100]}"
        
        print(log_line)
        
        if cls.log_file:
            with open(cls.log_file, 'a') as f:
                f.write(log_line + "\n")
    
    def log_message(self, format, *args):
        """Suppress default logging"""
        pass

def find_free_port(start=9002):
    """Find an available port"""
    for port in range(start, start + 100):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.bind(('localhost', port))
            sock.close()
            return port
        except OSError:
            continue
    return None

def run_logger_server(port, log_file):
    """Run the interaction logger server"""
    InteractionLogger.log_file = log_file
    server = HTTPServer(('localhost', port), InteractionLogger)
    print(f"[LOGGER] Listening on localhost:{port}")
    server.serve_forever()

def main():
    results_dir = Path('E:\\dashboard-app\\testbench-results')
    results_dir.mkdir(exist_ok=True)
    
    log_file = results_dir / f"testbench-live-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
    
    print("=" * 70)
    print("TEoAAAG DASHBOARD LIVE TESTBENCH")
    print("Gordon Interactive Testing & Logging")
    print("=" * 70)
    print()
    
    # Find free port for logger
    logger_port = find_free_port(9002)
    
    if not logger_port:
        print("[ERROR] Could not find free port for logger")
        return
    
    print(f"[SETUP] Interaction logger ready on: localhost:{logger_port}")
    print(f"[SETUP] Log file: {log_file}")
    print()
    
    # Start logger in background thread
    logger_thread = threading.Thread(
        target=run_logger_server,
        args=(logger_port, log_file),
        daemon=True
    )
    logger_thread.start()
    
    print("=" * 70)
    print("INSTRUCTIONS FOR LIVE TESTING")
    print("=" * 70)
    print()
    print("1. Dashboard is now LIVE at: file:///E:/dashboard-app/index.html")
    print("2. Proxy API: http://localhost:9001/api/generate")
    print("3. Ollama: http://localhost:11434")
    print()
    print("Interactive Tests (do these in the browser):")
    print("  • Click Settings button")
    print("  • Open Models modal")
    print("  • Toggle fullscreen (F key)")
    print("  • Type a chat message and send")
    print("  • Click Hardware Profile")
    print("  • Open File tree")
    print("  • Try FPS/performance sliders")
    print()
    print("All interactions are being logged to: testbench-results/")
    print()
    print("=" * 70)
    print()
    
    # Keep running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[COMPLETE] Testbench finished")
        print(f"[OUTPUT] Log saved to: {log_file}")
        print(f"[STATS] Total interactions logged: {len(InteractionLogger.interactions)}")

if __name__ == '__main__':
    main()
