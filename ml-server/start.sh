#!/bin/bash

# ML Server Startup Script
# This script starts the FastAPI ML server

echo "Starting ML Server..."
echo "Checking Python environment..."

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if model file exists
if [ ! -f "cnn_accident_model.pth" ]; then
    echo "Warning: cnn_accident_model.pth not found!"
    echo "Make sure the model file is in the ml-server directory"
fi

# Start the server
echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation available at http://localhost:8000/docs"
uvicorn accident_classifier:app --host 0.0.0.0 --port 8000 --reload

