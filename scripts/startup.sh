#!/bin/bash

# Startup script for Siloam Web Component
# this script is used for a clean deployment
# it is recommended to run this script in a clean environment
# this script is continously running, so consider running it in the background (or pm2)
# Author: Henry "TJ" Chen

# ------------ SYSTEM SETUP ------------
echo updating system...
sudo apt-get update
sudo apt-get upgrade -y

# ------------ NODE SETUP ------------
# check if node is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed."
fi

# check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Installing npm..."
    sudo apt-get install -y npm
else
    echo "npm is already installed."
fi

# install node modules
if ! command -v npx &> /dev/null
then
    echo "npx is not installed. Installing npx..."
    sudo npm install -g npx
else
    echo "npx is already installed."
fi

echo installing dependencies...
npm i

# ------------ DATABASE SETUP ------------

echo setting up database...
cd ..
npx prisma generate
# npx prisma migrate dev --name init

# Default admin user details:
# username: SUDOMASTER
# password: SUDOMaSTER123$$$
# Hashed password: $2b$10$rMBi0flXfzj5CM.b48pHxOZTdwAUdg7CyVcRcbEy3xOw1zcdouPe2
# Salt: $2b$04$Dj4CSejxfO4vg4yvYN6LPe
# Email: SUDOMASTER@MASTER.com

# uncomment the following lines to create a default admin user
echo creating default admin user...
sqlite3 prisma/dev.db <<EOF
INSERT OR IGNORE INTO User(username, password, salt, email, role)
VALUES('SUDOMASTER', '\$2b\$10\$rMBi0flXfzj5CM.b48pHxOZTdwAUdg7CyVcRcbEy3xOw1zcdouPe2', '\$2b\$04\$Dj4CSejxfO4vg4yvYN6LPe', 'SUDOMASTER@MASTER.com', 'ADMIN');
EOF

# ------------ DOCKER SETUP ------------
# You can ignore this section if you are not using Docker
# echo checking if any compilers are missing...
# [ -z "$(command -v python3)" ] && echo "Command 'python' not found" 
# [ -z "$(command -v java)" ] && echo "Command 'java' not found" 
# [ -z "$(command -v gcc)" ] && echo "Command 'gcc' not found" 
# [ -z "$(command -v node)" ] && echo "Command 'node' not found" 
# [ -z "$(command -v g++)" ] && echo "Command 'g++' not found" 
# echo Done! If you see no "Command not found" message, then all compilers are present
# echo installing docker images...
# docker pull python:3.13-alpine
# docker pull node:23-alpine
# docker pull openjdk:24
# docker pull gcc:14
# docker pull rust:1.82-alpine
# docker pull golang:1.23-alpine
# docker pull ruby:3.3-alpine
# docker pull php:8.2-alpine
# docker pull perl:5.40-slim
# docker pull swift:6.0
# docker pull sergiomtzlosa/brainfuck

# ------------ Development STARTUP ------------
# start the development server for verification (optional)
# skip this step and run run.sh script instead for build deployment directly
# npm run dev

# recommended to run test suite for checking (optional)
# in a new terminal, you should run the following command to start the test suite
# npx jest