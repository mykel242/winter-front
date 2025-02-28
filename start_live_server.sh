#!/bin/bash

# Check if live-server is installed
if ! command -v live-server &> /dev/null
then
    echo "Error: live-server is not installed. Install it with: npm install -g live-server"
    exit 1
fi

# Start live-server on port 8888
echo "Starting live-server on http://localhost:8888..."
live-server --port=8888
