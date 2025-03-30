#!/bin/bash

# script for setting up cron jobs for Siloam Web Component
# This is optional and can be run separately
# Author: Henry "TJ" Chen

# Check if cron is already installed and up to date
if dpkg -l | grep -q "^ii  cron "; then
    echo "Cron is already installed and up to date. Skipping installation step."
else
    # Update package list and install cron
    echo "Updating package list and installing cron..."
    sudo apt-get update
    sudo apt-get install -y cron
fi

# Enable cron service to start on boot
echo "Enabling cron service to start on boot..."
sudo systemctl enable cron

# Start cron service
echo "Starting cron service..."
sudo systemctl start cron

# Verify cron service status
echo "Checking cron service status..."
sudo systemctl status cron

echo "Cron installation and setup complete."