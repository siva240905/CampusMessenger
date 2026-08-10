@echo off
title CampusLink Student Background Service Setup
color 0A
echo ============================================================
echo   CampusLink - Windows Background Service Auto-Installer
echo ============================================================
echo.

set SCRIPT_DIR=%~dp0
set VBS_PATH=%SCRIPT_DIR%run_silent.vbs

echo [1/3] Registering CampusLink Service to Windows Startup...
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "CampusLinkBackgroundService" /t REG_SZ /d "wscript.exe \"%VBS_PATH%\"" /f >nul 2>&1

if %errorlevel% equ 0 (
    echo [SUCCESS] Windows Startup Registry updated!
) else (
    echo [WARNING] Registry update failed. Please run as Administrator.
)

echo.
echo [2/3] Starting CampusLink Silent Background Service...
wscript.exe "%VBS_PATH%"

echo.
echo [3/3] Done! CampusLink is now running silently in the background.
echo Check your System Tray for the CampusLink icon.
echo.
pause
