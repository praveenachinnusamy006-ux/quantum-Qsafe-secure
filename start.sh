#!/bin/bash
set -e

echo "[*] Installing backend dependencies..."
cd /home/runner/workspace/backend && npm install --silent

echo "[*] Starting backend on port 8080..."
cd /home/runner/workspace/backend && npm run dev &
BACKEND_PID=$!

echo "[*] Installing frontend dependencies..."
cd /home/runner/workspace/frontend && npm install --silent

echo "[*] Starting frontend on port 5000..."
cd /home/runner/workspace/frontend && npm run dev &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID
