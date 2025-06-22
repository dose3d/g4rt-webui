#!/bin/bash

# Resolve the directory this script is in
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Navigate to the docker-compose directory
cd "$SCRIPT_DIR/g4rt-webui-devops/local-desktop" || {
    echo "❌ Could not find target directory"
    exit 1
}

# Copy .env.example to .env if needed
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ .env created from .env.example"
else
    echo "ℹ️ .env already exists"
fi

# --- XQuartz configuration ---
echo "🔧 Configuring XQuartz for network access"

# Allow TCP and enable indirect GLX rendering
defaults write org.xquartz.X11 enable_iglx -bool true
defaults write org.xquartz.X11 nolisten_tcp -bool false
defaults write org.macosforge.xquartz.X11 enable_tcp -bool true

# Kill any running XQuartz
pkill XQuartz || true
sleep 1

# Start XQuartz
open -a XQuartz
sleep 3

# Allow local Docker containers to connect to XQuartz
xhost +127.0.0.1
xhost +localhost
xhost +local:
xhost +SI:localuser:root

# Export DISPLAY variable
export DISPLAY=host.docker.internal:0

# Optional: verify DISPLAY is accessible
echo "🔍 DISPLAY is set to: $DISPLAY"

# Start docker-compose
docker-compose up
