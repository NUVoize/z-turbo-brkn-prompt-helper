#!/bin/bash

# ========================================
#  Z-TURBO Prompt Generator Installer
#  Linux / macOS
# ========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Z-TURBO Prompt Generator Installer   ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found${NC}"
    echo -e "${YELLOW}Please run this script from the project root directory${NC}"
    exit 1
fi

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ required (found v${NODE_VERSION})${NC}"
    echo -e "${YELLOW}Please upgrade Node.js from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"

# Detect package manager
PKG_MANAGER="npm"
if command -v bun &> /dev/null; then
    echo ""
    echo -e "${YELLOW}Bun detected! Which package manager would you like to use?${NC}"
    echo "  1) npm (recommended for beginners)"
    echo "  2) bun (faster)"
    read -p "Enter choice [1/2]: " choice
    case $choice in
        2) PKG_MANAGER="bun" ;;
        *) PKG_MANAGER="npm" ;;
    esac
else
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Using ${PKG_MANAGER}${NC}"

# Install dependencies
echo ""
echo -e "${BLUE}Installing dependencies...${NC}"
if [ "$PKG_MANAGER" = "bun" ]; then
    bun install
else
    npm install
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies${NC}"
    echo -e "${YELLOW}Try deleting node_modules and package-lock.json, then run again${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}         🎉 SUCCESS! 🎉                ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${GREEN}Z-TURBO Prompt Generator is ready!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${CYAN}1. Configure AI providers in the app settings:${NC}"
echo "   - Google Gemini (recommended)"
echo "   - Qwen (DashScope)"
echo "   - Ollama (local)"
echo "   - LM Studio (local)"
echo ""
echo -e "${CYAN}2. Start the app:${NC}"
echo "   ./start.sh"
echo "   # or manually: ${PKG_MANAGER} run dev"
echo ""
echo -e "${CYAN}3. Open in browser:${NC}"
echo "   http://localhost:8080"
echo ""

# Ask to start now
read -p "Start the app now? [Y/n]: " start_now
case $start_now in
    [Nn]*) 
        echo -e "${GREEN}Run ./start.sh when ready!${NC}"
        ;;
    *)
        echo ""
        echo -e "${BLUE}Starting development server...${NC}"
        if [ "$PKG_MANAGER" = "bun" ]; then
            bun run dev
        else
            npm run dev
        fi
        ;;
esac
