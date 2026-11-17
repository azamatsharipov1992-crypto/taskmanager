@echo off
echo =================================================================
echo    TASK CONTROL: WINDOWS INSTALLER PACKAGER (TAURI 2)
echo =================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build_windows_installer.ps1"
pause
