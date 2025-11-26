#!/bin/sh
set -e

echo "Starting Unified Server (Backend + Frontend)..."
cd /app/backend

node --dns-result-order=ipv4first dist/server.js