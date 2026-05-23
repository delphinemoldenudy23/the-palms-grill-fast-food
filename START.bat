@echo off
title Palm's Grill - Starting...
cd /d "%~dp0"

echo.
echo  Starting Palm's Grill (3 servers)...
echo.

start "Palms Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 4 /nobreak >nul
start "Palms Website" cmd /k "cd /d "%~dp0frontend" && npm run dev"
start "Palms Admin" cmd /k "cd /d "%~dp0admin" && npm run dev"
timeout /t 12 /nobreak >nul

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0SHOW-LINKS.ps1"

for /f "tokens=*" %%i in ('powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'vEthernet|Loopback' } | Select-Object -First 1).IPAddress"') do set LAN_IP=%%i

if defined LAN_IP (
  start http://localhost:3000
  echo.
  echo  Share with customers on same Wi-Fi:
  echo    http://%LAN_IP%:3000
  echo  Admin:
  echo    http://%LAN_IP%:3001
) else (
  start http://localhost:3000
  start http://localhost:3001
)

echo.
pause
