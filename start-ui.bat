@echo off
setlocal enabledelayedexpansion
title Z-TURBO - BRKN AI Prompt Generator

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
echo %CYAN%    Z-TURBO Prompt Generator Start    %RESET%
echo %CYAN%========================================%RESET%
echo.

:: Check if we're in the right directory with better error handling
if not exist "package.json" (
    echo %RED%Error: package.json not found!%RESET%
    echo %YELLOW%Please run this from the project root directory.%RESET%
    echo Current directory: %CD%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo %RED%Error: Dependencies not installed!%RESET%
    echo %YELLOW%Please run install-windows.bat first to install dependencies.%RESET%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

:: Check for package managers with improved detection
echo %BLUE%Detecting package manager...%RESET%
set "PACKAGE_MANAGER="
set "RUN_CMD="

:: Check for Bun first
where bun >nul 2>nul
if not errorlevel 1 (
    bun --version >nul 2>nul
    if not errorlevel 1 (
        set "PACKAGE_MANAGER=bun"
        set "RUN_CMD=bun run dev"
        echo %GREEN%✓ Using Bun%RESET%
    )
)

:: Fallback to npm
if not defined PACKAGE_MANAGER (
    where npm >nul 2>nul
    if not errorlevel 1 (
        npm --version >nul 2>nul
        if not errorlevel 1 (
            set "PACKAGE_MANAGER=npm"
            set "RUN_CMD=npm run dev"
            echo %GREEN%✓ Using npm%RESET%
        )
    )
)

:: Exit if no package manager found
if not defined PACKAGE_MANAGER (
    echo %RED%Error: Neither npm nor Bun found!%RESET%
    echo %YELLOW%Please install Node.js or Bun first.%RESET%
    echo %YELLOW%Visit: https://nodejs.org or https://bun.sh%RESET%
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 1
)

echo.
echo %BLUE%Starting development server...%RESET%
echo %YELLOW%Command: %RUN_CMD%%RESET%
echo.
echo %GREEN%The app will be available at: http://localhost:8080%RESET%
echo %YELLOW%Press Ctrl+C to stop the server%RESET%
echo.

:: Wait a moment then open browser (compatible with all Windows versions)
echo %CYAN%Opening browser in 3 seconds...%RESET%
ping 127.0.0.1 -n 4 >nul
start "" "http://localhost:8080"

:: Start the development server
echo %BLUE%Launching server...%RESET%
%RUN_CMD%

:: If we reach here, the server stopped
echo.
echo %YELLOW%Development server stopped.%RESET%
echo Press any key to exit...
pause >nul