#!/bin/bash

BACKEND_URL="http://localhost:3000/test"

# Function to check backend status
check_backend() {
    echo "Checking backend status..."
    if curl --silent --fail "$BACKEND_URL"; then
        echo "✅ Backend is online"
    else
        echo "❌ Backend is offline. Exiting."
        exit 1
    fi
}

# Check if live-server is installed
if ! command -v live-server &> /dev/null
then
    echo "Error: live-server is not installed. Install it with: npm install -g live-server"
    exit 1
fi

# Run backend health check before starting live-server
check_backend

# Start live-server on port 8888
echo "Starting live-server on http://localhost:8888..."
live-server --port=8888
