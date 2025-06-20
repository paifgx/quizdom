#!/bin/bash

# Setup script for Quizdom development environment
set -e  # Exit on any error

echo "🚀 Setting up Quizdom development environment..."

# Debug: Show current working directory and contents
echo "📍 Current working directory: $(pwd)"
echo "📁 Contents of current directory:"
ls -la

# Work from the current directory (where the workspace is mounted)
# No need to cd to /workspace since we'll be in the right place

echo "📍 Working from directory: $(pwd)"

# Install backend Python dependencies
echo "📦 Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ backend/requirements.txt not found"
    echo "📁 Contents of backend directory (if exists):"
    if [ -d "backend" ]; then
        ls -la backend/
    else
        echo "   backend directory does not exist"
    fi
    exit 1
fi

# Install frontend Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "frontend/package.json" ]; then
    echo "🔧 Node.js version: $(node --version)"
    echo "🔧 npm version: $(npm --version)"

    # Ensure corepack is enabled and prepare pnpm
    echo "🔧 Enabling corepack..."
    corepack enable || echo "Corepack already enabled or failed to enable"

    echo "🔧 Preparing pnpm..."
    corepack prepare pnpm@latest --activate || echo "Failed to prepare pnpm, continuing..."

    cd frontend
    echo "📍 Now in frontend directory: $(pwd)"

    # Try to install dependencies with pnpm
    echo "🔧 Installing with pnpm..."
    if command -v pnpm >/dev/null 2>&1; then
        echo "✅ pnpm is available: $(pnpm --version)"
        pnpm install
    else
        echo "⚠️ pnpm not available, trying with corepack pnpm..."
        corepack pnpm install
    fi

    echo "✅ Node.js dependencies installed successfully"
    cd ..
else
    echo "❌ frontend/package.json not found"
    echo "📁 Contents of frontend directory (if exists):"
    if [ -d "frontend" ]; then
        ls -la frontend/
    else
        echo "   frontend directory does not exist"
    fi
    exit 1
fi

echo "🎉 Development environment setup complete!"
