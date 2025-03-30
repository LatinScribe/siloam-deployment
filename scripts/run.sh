#!/bin/bash

# Run this script to build and run the Siloam Web Component
# You should run startup.sh first (if you have not already) to set up the environment
# Author: Henry "TJ" Chen

# Exit immediately if a command exits with a non-zero status
set -e

# Run the build process
echo "Running npm build..."
npm run build

# Start the application
echo "Starting the application..."
npm start