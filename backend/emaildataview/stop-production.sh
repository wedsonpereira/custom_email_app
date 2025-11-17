#!/bin/bash

# Stop Spring Boot Application in Production
# Upload this file to: public_html/spring/

echo "🛑 Stopping Enquiry Backend..."

if [ ! -f app.pid ]; then
    echo "❌ No PID file found. Application may not be running."
    echo "Checking for running Java processes..."
    ps aux | grep emaildataview | grep -v grep
    exit 1
fi

PID=$(cat app.pid)

if ps -p $PID > /dev/null 2>&1; then
    echo "Stopping application with PID: $PID"
    kill $PID
    
    # Wait for process to stop
    sleep 2
    
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Process still running, forcing shutdown..."
        kill -9 $PID
    fi
    
    rm app.pid
    echo "✅ Application stopped successfully!"
else
    echo "⚠️  Process with PID $PID is not running."
    rm app.pid
    echo "Removed stale PID file."
fi
