#!/bin/bash

# Получаем директорию, где находится скрипт
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# === 1. Переход в папку backend ===
cd "$SCRIPT_DIR/back" || exit 1

echo "==============================="
echo "  Start: make up"
echo "==============================="
make up
if [ $? -ne 0 ]; then
    echo "Error: make up complete with mistake"
    read -p "Press Enter to exit..."
    exit 1
fi

echo
echo "==============================="
echo "  Open new window for bun install + bun dev (with --bun)"
echo "==============================="

# Определяем доступный эмулятор терминала
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd \"$SCRIPT_DIR/front/polyclinic\" && bun install && bunx vite; exec bash"
elif command -v xfce4-terminal &> /dev/null; then
    xfce4-terminal -e bash -c "cd \"$SCRIPT_DIR/front/polyclinic\" && bun install && bunx vite; exec bash"
elif command -v konsole &> /dev/null; then
    konsole -e bash -c "cd \"$SCRIPT_DIR/front/polyclinic\" && bun install && bunx vite; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e bash -c "cd \"$SCRIPT_DIR/front/polyclinic\" && bun install && bunx vite; exec bash"
else
    echo "No known terminal emulator found. Please run manually:"
    echo "cd \"$SCRIPT_DIR/front/polyclinic\" && bun install && bunx vite"
fi

echo
echo "==============================="
echo "  Open Browser"
echo "==============================="

xdg-open http://localhost:5173/

echo
echo "==============================="
echo "  Start: make logs"
echo "==============================="
make logs
if [ $? -ne 0 ]; then
    echo "Error: make logs complete with mistake."
    read -p "Press Enter to continue..."
    exit 1
fi

echo
echo "All process start."
read -p "Press Enter to continue..."