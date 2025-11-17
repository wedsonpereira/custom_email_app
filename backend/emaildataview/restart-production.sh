#!/bin/bash

# Restart Spring Boot Application in Production
# Upload this file to: public_html/spring/

echo "🔄 Restarting Enquiry Backend..."

# Stop the application
./stop-production.sh

# Wait a moment
sleep 2

# Start the application
./start-production.sh
