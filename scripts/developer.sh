#!/bin/bash

# Run this script to build and run the Siloam Web Component in DEVELOPER MODE
# This mode is used for development and testing purposes
# It allows for hot reloading and other development features
# You should run startup.sh first (if you have not already) to set up the environment
# Author: Henry "TJ" Chen

# Exit immediately if a command exits with a non-zero status
set -e

# Start the application
echo "Starting the application in developer mode..."
npm run dev