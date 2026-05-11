@echo off
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"

cd /d "%SCRIPT_DIR%back"

echo ===============================
echo   Start: make up
echo ===============================
make up
if errorlevel 1 (
    echo Error: make up complete with mistake
    pause
    exit /b
)

echo.
echo ===============================
echo   Open new window for bun install + bun dev (with --bun)
echo ===============================

start "BUN DEV" cmd /k "cd /d %SCRIPT_DIR%front\polyclinic && bun install && bunx vite"

echo.
echo ===============================
echo   Open Browser
echo ===============================

start "" http://localhost:5173/

echo.
echo ===============================
echo   Start: make logs
echo ===============================
make logs
if errorlevel 1 (
    echo Error: make logs complete with mistake.
    pause
    exit /b
)

echo.
echo All process start.
pause