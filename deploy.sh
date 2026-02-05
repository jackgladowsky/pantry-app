#!/bin/bash
# Pantry App - Simple Deploy Script
# Usage: ./deploy.sh [dev|prod|stop]

set -e
cd "$(dirname "$0")"

case "${1:-prod}" in
  dev)
    echo "🥬 Starting dev server..."
    npm run dev
    ;;
  prod)
    echo "🥬 Building and starting production..."
    npm install
    npm run build
    echo "🚀 Starting on port 3000..."
    npm run start
    ;;
  stop)
    echo "🛑 Stopping pantry-app..."
    pkill -f "next start" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    echo "Stopped."
    ;;
  bg)
    echo "🥬 Starting in background..."
    npm install
    npm run build
    nohup npm run start > /tmp/pantry-app.log 2>&1 &
    echo "🚀 Running in background (PID: $!)"
    echo "   Logs: /tmp/pantry-app.log"
    echo "   Stop: ./deploy.sh stop"
    ;;
  *)
    echo "Usage: ./deploy.sh [dev|prod|stop|bg]"
    echo "  dev  - Start dev server with hot reload"
    echo "  prod - Build and start production (foreground)"
    echo "  bg   - Build and start production (background)"
    echo "  stop - Stop running instance"
    ;;
esac
