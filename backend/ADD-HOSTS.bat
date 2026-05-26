@echo off
:: Right-click this file -> Run as administrator
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup-hosts.ps1"
pause
