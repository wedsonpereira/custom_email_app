#!/bin/bash

# Start Spring Boot Application in Production
# Upload this file to: public_html/spring/

echo "🚀 Starting Enquiry Backend..."

# Set the JAR file name
JAR_FILE="emaildataview-0.0.1-SNAPSHOT.jar"

# Check if JAR exists
if [ ! -f "$JAR_FILE" ]; then
    echo "❌ Error: $JAR_FILE not found!"
    echo "Please upload the JAR file to this directory."
    exit 1
fi

# Check if already running
if [ -f app.pid ]; then
    PID=$(cat app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Application is already running with PID: $PID"
        echo "Run ./stop-production.sh first to stop it."
        exit 1
    else
        echo "Removing stale PID file..."
        rm app.pid
    fi
fi

# Start the application with production profile
echo "Starting Spring Boot application (Production Mode)..."
nohup java -jar $JAR_FILE --spring.profiles.active=prod > app.log 2>&1 &

# Save PID
echo $! > app.pid

echo "✅ Application started successfully!"
echo "📝 PID: $(cat app.pid)"
echo "📋 Log file: app.log"
echo ""
echo "To view logs in real-time:"
echo "  tail -f app.log"
echo ""
echo "To stop the application:"
echo "  ./stop-production.sh"
