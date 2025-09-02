#!/bin/bash

# Logistics Dashboard Setup Script

echo "🚀 Setting up Interactive Logistics Dashboard..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "Please install Node.js first:"
    echo ""
    echo "🍎 macOS (using Homebrew):"
    echo "   brew install node"
    echo ""
    echo "🐧 Linux (Ubuntu/Debian):"
    echo "   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    echo ""
    echo "🪟 Windows:"
    echo "   Download from https://nodejs.org/"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo "✅ Node.js found: $NODE_VERSION"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm found: $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the dashboard:"
echo "   npm start"
echo ""
echo "To start the mock backend (optional):"
echo "   npm run server"
echo ""
echo "The dashboard will be available at: http://localhost:3000"
echo "The API will be available at: http://localhost:3001"
