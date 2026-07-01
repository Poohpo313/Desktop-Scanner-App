# Stops the BukolabsGateway scheduled task and frees port 3000.
# Run PowerShell as Administrator when taskkill reports Access denied.

$ErrorActionPreference = "Continue"
$taskName = "BukolabsGateway"

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Stopping scheduled task: $taskName" -ForegroundColor Cyan
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 2
} else {
  Write-Host "Scheduled task '$taskName' was not found." -ForegroundColor Yellow
}

$repoRoot = Split-Path $PSScriptRoot -Parent
node (Join-Path $repoRoot "scripts\kill-port.js") 3000 | Out-Null

$listening = netstat -ano | Select-String ":3000\s" | Select-String "LISTENING"
if ($listening) {
  Write-Host "Port 3000 is still in use. Re-run this script in an elevated (Administrator) PowerShell." -ForegroundColor Red
  exit 1
}

Write-Host "Port 3000 is free. You can run: npm run dev:gateway" -ForegroundColor Green
