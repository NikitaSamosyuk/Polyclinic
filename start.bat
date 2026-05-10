@echo off
setlocal enabledelayedexpansion

REM === 1. Переход в папку backend ===
cd /d "C:\Users\samos\Desktop\Polyclinic\back"

echo ===============================
echo   Запуск: make rebuild
echo ===============================
make rebuild
if errorlevel 1 (
    echo Ошибка: make rebuild завершился с ошибкой.
    pause
    exit /b
)

echo.
echo ===============================
echo   Открытие нового окна для bun dev
echo ===============================

start "BUN DEV" cmd /k "cd /d C:\Users\samos\Desktop\Polyclinic\front\polyclinic && bun dev"

echo.
echo ===============================
echo   Открытие браузера
echo ===============================

start "" http://localhost:5173/

echo.
echo ===============================
echo   Запуск: make logs
echo ===============================
make logs
if errorlevel 1 (
    echo Ошибка: make logs завершился с ошибкой.
    pause
    exit /b
)

echo.
echo Все процессы запущены.
pause
