# MUST run as Administrator: Right-click PowerShell -> Run as administrator
# Then: cd Desktop\the-palms-grill-fast-food-main
#       .\setup-hosts.ps1

$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host ""
  Write-Host "ERROR: Run PowerShell as Administrator first!" -ForegroundColor Red
  Write-Host "  1. Press Windows key, type PowerShell"
  Write-Host "  2. Right-click -> Run as administrator"
  Write-Host "  3. cd $PSScriptRoot"
  Write-Host "  4. .\setup-hosts.ps1"
  Write-Host ""
  exit 1
}

$entries = @(
  "127.0.0.1 palmsgrill.com",
  "127.0.0.1 www.palmsgrill.com",
  "127.0.0.1 palmsgrilladmin"
)

$content = Get-Content $hostsPath -ErrorAction Stop
$added = 0

foreach ($line in $entries) {
  $hostName = ($line -split "\s+", 2)[1]
  if ($content -notcontains $line -and ($content -join "`n") -notmatch [regex]::Escape($hostName)) {
    Add-Content -Path $hostsPath -Value $line
    Write-Host "Added: $line" -ForegroundColor Green
    $added++
  } else {
    Write-Host "OK: $hostName" -ForegroundColor Gray
  }
}

Write-Host ""
Write-Host "Done! After starting the apps, you can use:" -ForegroundColor Cyan
Write-Host "  Customer:  http://palmsgrill.com:3000"
Write-Host "  Admin:     http://palmsgrilladmin:3001"
Write-Host ""
Write-Host "Until then, these always work:" -ForegroundColor Yellow
Write-Host "  Customer:  http://localhost:3000"
Write-Host "  Admin:     http://localhost:3001"
