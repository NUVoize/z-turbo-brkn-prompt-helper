#!/bin/bash

# ========================================
#  Z-TURBO Prompt Generator Launcher
#  Linux / macOS
# ========================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}    Z-TURBO Prompt Generator Start     ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}Error: node_modules not found${NC}"
    echo -e "${YELLOW}Please run ./install.sh first${NC}"
    exit 1
fi

# Detect package manager
PKG_MANAGER="npm"
if command -v bun &> /dev/null && [ -f "bun.lockb" ]; then
    PKG_MANAGER="bun"
elif ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: No package manager found${NC}"
    exit 1
fi

echo -e "${GREEN}Using ${PKG_MANAGER}${NC}"
echo -e "${BLUE}Starting development server...${NC}"
echo ""
echo -e "${CYAN}App will be available at: ${GREEN}http://localhost:8080${NC}"
echo ""

# Try to open browser (works on most systems)
sleep 2 && {
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:8080" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://localhost:8080" 2>/dev/null &
    fi
} &

# Start the dev server
if [ "$PKG_MANAGER" = "bun" ]; then
    bun run dev
else
    npm run dev
fi
