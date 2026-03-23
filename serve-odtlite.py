#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = 8000
ODTLITE_PATH = r'E:\ODTLite'

os.chdir(ODTLITE_PATH)

Handler = http.server.SimpleHTTPRequestHandler

print(f"Serving ODTLite from: {ODTLITE_PATH}")
print(f"Open http://localhost:{PORT} in your browser")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)
