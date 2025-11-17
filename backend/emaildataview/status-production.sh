#!/bin/bash

# Check Spring Boot Application Status
# Upload this file to: public_html/spring/

echo "📊 Enquiry Backend Status"
echo "=========================="

if [ -f app.pid ]; then
    PID=$(cat app.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Status: RUNNING"
        echo "📝 PID: $PID"
        echo ""
        echo "Process details:"
        ps -p $PID -o pid,ppid,cmd,%mem,%cpu,etime
        echo ""
        echo "Recent logs (last 20 lines):"
        echo "----------------------------"
        tail -20 app.log
    else
        echo "❌ Status: NOT RUNNING (stale PID file)"
        echo "Run ./start-production.sh to start"
    fi
else
    echo "❌ Status: NOT RUNNING"
    echo "Run ./start-production.sh to start"
fi

echo ""
echo "To view live logs: tail -f app.log"
