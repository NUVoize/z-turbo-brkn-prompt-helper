@echo off
setlocal enabledelayedexpansion
title Z-TURBO - BRKN AI Prompt Generator - Installer

:: Enhanced Windows 10/11 compatibility
:: Disable ANSI colors if not supported
set "ENABLE_COLORS=1"
ver | find "Windows" >nul 2>&1
if errorlevel 1 set "ENABLE_COLORS=0"

:: Try to enable ANSI colors (Windows 10 version 1511+)
if "%ENABLE_COLORS%"=="1" (
    for /F %%a in ('echo prompt $E ^| cmd /q') do set "ESC=%%a"
    if defined ESC (
        set "GREEN=%ESC%[32m"
        set "RED=%ESC%[31m"
        set "YELLOW=%ESC%[33m"
        set "BLUE=%ESC%[34m"
        set "CYAN=%ESC%[36m"
        set "RESET=%ESC%[0m"
    ) else (
        set "ENABLE_COLORS=0"
    )
)

:: Fallback to no colors if ANSI not supported
if "%ENABLE_COLORS%"=="0" (
    set "GREEN="
    set "RED="
    set "YELLOW="
    set "BLUE="
    set "CYAN="
    set "RESET="
)

echo %CYAN%========================================%RESET%
echo %CYAN%  Z-TURBO Prompt Generator Installer  %RESET%
echo %CYAN%========================================%RESET%
echo.

:: Check if we're in the right directory with better error handling
if not exist "package.json" (
    echo %RED%Error: package.json not found!%RESET%
    echo %YELLOW%Please run this installer from the project root directory.%RESET%
    echo Current directory: %CD%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check Node.js installation with improved error handling
echo %BLUE%[1/6] Checking Node.js installation...%RESET%
where node >nul 2>nul
if errorlevel 1 (
    echo %RED%Error: Node.js is not installed or not in PATH!%RESET%
    echo %YELLOW%Please install Node.js 18+ from: https://nodejs.org%RESET%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Get Node.js version with better parsing
node --version >temp_version.txt 2>nul
if errorlevel 1 (
    echo %RED%Error: Cannot get Node.js version!%RESET%
    del temp_version.txt 2>nul
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

set /p NODE_VERSION=<temp_version.txt
del temp_version.txt 2>nul
echo %GREEN%✓ Node.js found: %NODE_VERSION%%RESET%

:: Check npm with improved error handling
echo %BLUE%[2/6] Checking npm installation...%RESET%
where npm >nul 2>nul
if errorlevel 1 (
    echo %RED%Error: npm is not available!%RESET%
    echo %YELLOW%npm should come with Node.js. Please reinstall Node.js.%RESET%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

npm --version >temp_npm.txt 2>nul
if errorlevel 1 (
    echo %RED%Error: Cannot get npm version!%RESET%
    del temp_npm.txt 2>nul
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

set /p NPM_VERSION=<temp_npm.txt
del temp_npm.txt 2>nul
echo %GREEN%✓ npm found: %NPM_VERSION%%RESET%

:: Check for Bun (optional) with improved detection
echo %BLUE%[3/6] Checking for Bun (optional)...%RESET%
set "HAS_BUN=0"
where bun >nul 2>nul
if not errorlevel 1 (
    bun --version >temp_bun.txt 2>nul
    if not errorlevel 1 (
        set /p BUN_VERSION=<temp_bun.txt
        echo %GREEN%✓ Bun found: !BUN_VERSION!%RESET%
        set "HAS_BUN=1"
    )
    del temp_bun.txt 2>nul
)

if "%HAS_BUN%"=="0" (
    echo %YELLOW%• Bun not found (npm will be used)%RESET%
)

:: Choose package manager with better input handling
echo.
echo %BLUE%[4/6] Choose package manager:%RESET%
if "%HAS_BUN%"=="1" (
    echo %CYAN%1) npm (recommended for beginners)%RESET%
    echo %CYAN%2) Bun (faster, for advanced users)%RESET%
    echo.
    set /p "choice=%YELLOW%Enter your choice (1 or 2, default: 1): %RESET%"
    if not defined choice set "choice=1"
    if "%choice%"=="2" (
        set "PACKAGE_MANAGER=bun"
        set "INSTALL_CMD=bun install"
        set "RUN_CMD=bun run dev"
    ) else (
        set "PACKAGE_MANAGER=npm"
        set "INSTALL_CMD=npm install"
        set "RUN_CMD=npm run dev"
    )
) else (
    set "PACKAGE_MANAGER=npm"
    set "INSTALL_CMD=npm install"
    set "RUN_CMD=npm run dev"
)

echo %GREEN%✓ Using %PACKAGE_MANAGER% for installation%RESET%

:: Install dependencies with better error handling
echo.
echo %BLUE%[5/6] Installing dependencies...%RESET%
echo %YELLOW%Running: %INSTALL_CMD%%RESET%
echo %YELLOW%This may take a few minutes...%RESET%
echo.

%INSTALL_CMD%
set "INSTALL_ERROR=%errorlevel%"

if not "%INSTALL_ERROR%"=="0" (
    echo.
    echo %RED%Error: Failed to install dependencies! (Exit code: %INSTALL_ERROR%)%RESET%
    echo %YELLOW%Common solutions:%RESET%
    echo %YELLOW%• Check your internet connection%RESET%
    echo %YELLOW%• Clear npm cache: npm cache clean --force%RESET%
    echo %YELLOW%• Delete node_modules folder and try again%RESET%
    echo %YELLOW%• Try using npm instead of Bun%RESET%
    echo %YELLOW%• Run as Administrator if permission errors occur%RESET%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo %GREEN%✓ Dependencies installed successfully!%RESET%

:: Launch options with improved handling
echo.
echo %BLUE%[6/6] Installation complete!%RESET%
echo.
echo %CYAN%========================================%RESET%
echo %CYAN%         🎉 SUCCESS! 🎉                %RESET%
echo %CYAN%========================================%RESET%
echo.
echo %GREEN%Z-TURBO - BRKN AI Prompt Generator is ready to use!%RESET%
echo.
echo %YELLOW%Next steps:%RESET%
echo %CYAN%1. Configure AI providers (in-app settings):%RESET%
echo    • Google Gemini API key
echo    • DashScope (Qwen) API key
echo    • Ollama local server (http://localhost:11434)
echo    • LM Studio local server (http://localhost:1234)
echo.
echo %CYAN%2. Launch the application:%RESET%
echo    • Development server: %YELLOW%start-ui.bat%RESET%
echo    • Manual command: %YELLOW%%RUN_CMD%%RESET%
echo    • Production build: %YELLOW%%PACKAGE_MANAGER% run build%RESET%
echo.

:: Ask if user wants to start immediately with better input handling
set /p "start=%CYAN%Start the development server now? (Y/n): %RESET%"
if not defined start set "start=y"
if /i "%start%"=="n" goto :end
if /i "%start%"=="no" goto :end

echo.
echo %BLUE%Starting development server...%RESET%
echo %YELLOW%The app will open at: http://localhost:8080%RESET%
echo %YELLOW%Press Ctrl+C to stop the server%RESET%
echo.

:: Wait a moment then open browser (compatible with all Windows versions)
echo %CYAN%Opening browser in 3 seconds...%RESET%
ping 127.0.0.1 -n 4 >nul
start "" "http://localhost:8080"

:: Start the development server
%RUN_CMD%

:end
echo.
echo %GREEN%Installation completed successfully!%RESET%
echo %CYAN%To start later, run: start-ui.bat%RESET%
echo.
echo Press any key to exit...
pause >nul