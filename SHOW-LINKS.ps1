$ip = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
  Select-Object -First 1 -ExpandProperty IPAddress
)

if (-not $ip) {
  $ip = "YOUR-PC-IP"
}

Write-Host ""
Write-Host "=== Palm's Grill — share these links on same Wi-Fi ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Customer website:  http://${ip}:3000"
Write-Host "  Admin dashboard:   http://${ip}:3001"
Write-Host "  Backend API:       http://${ip}:5000"
Write-Host ""
Write-Host "  On THIS computer you can also use:"
Write-Host "    http://localhost:3000"
Write-Host "    http://localhost:3001"
Write-Host ""
Write-Host "  MoMo Pay: 0551720664"
Write-Host ""
Write-Host "  Tip: Allow Node.js through Windows Firewall if phones cannot connect."
Write-Host ""
