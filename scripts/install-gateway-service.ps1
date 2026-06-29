# Installs the Bukolabs gateway as a Windows background service (Scheduled Task).
# Run once on the server PC as Administrator. Users never open a browser or terminal.
#
# Usage (PowerShell as Admin):
#   cd "c:\Desktop Scanner App"
#   powershell -ExecutionPolicy Bypass -File scripts\install-gateway-service.ps1

param(
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$gatewayRoot = Join-Path $repoRoot "gateway"
$distMain = Join-Path $gatewayRoot "dist\main.js"
$envFile = Join-Path $gatewayRoot ".env"
$logDir = Join-Path $env:ProgramData "Bukolabs\gateway\logs"
$taskName = "BukolabsGateway"

function Require-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Run this script in an elevated PowerShell window (Run as administrator)."
  }
}

Require-Admin

if (-not (Test-Path $envFile)) {
  throw "Missing gateway\.env - copy gateway\.env.example and configure PostgreSQL first."
}

if (-not $SkipBuild) {
  Write-Host "Ensuring gateway dependencies..."
  Push-Location $repoRoot
  try {
    npm install -w @bukolabs/gateway --no-audit
    if ($LASTEXITCODE -ne 0) { throw "Gateway dependency install failed." }
    Write-Host "Building gateway..."
    npm run build -w @bukolabs/gateway
    if ($LASTEXITCODE -ne 0) { throw "Gateway build failed." }
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path $distMain)) {
  throw "Gateway build output not found at $distMain"
}

$nodePath = (Get-Command node -ErrorAction Stop).Source
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$runnerPath = Join-Path $env:ProgramData "Bukolabs\gateway\run-gateway.cmd"
$runnerContent = @"
@echo off
cd /d "$gatewayRoot"
set NODE_ENV=production
set BACKEND_ROLE=gateway
"$nodePath" "$distMain" >> "$logDir\gateway.log" 2>&1
"@
Set-Content -Path $runnerPath -Value $runnerContent -Encoding ASCII

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute $runnerPath
$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -RestartCount 3 `
  -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Principal $principal `
  -Description "Bukolabs online API gateway - auto-starts in the background for desktop scanner users." | Out-Null

Start-ScheduledTask -TaskName $taskName

$firewallRuleName = "Bukolabs Gateway API (TCP 3000)"
$existingRule = Get-NetFirewallRule -DisplayName $firewallRuleName -ErrorAction SilentlyContinue
if ($existingRule) {
  Remove-NetFirewallRule -DisplayName $firewallRuleName
}
New-NetFirewallRule `
  -DisplayName $firewallRuleName `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 3000 `
  -Action Allow `
  -Profile Any | Out-Null

Write-Host ""
Write-Host "Bukolabs gateway installed and started in the background." -ForegroundColor Green
Write-Host "Task name: $taskName (starts automatically when Windows boots)" -ForegroundColor Green
Write-Host "Logs: $logDir\gateway.log" -ForegroundColor Green
Write-Host ""
Write-Host "Desktop users only open the Scanner .exe - no browser or terminal needed." -ForegroundColor Cyan
Write-Host "Other PCs on the same network will auto-discover this gateway." -ForegroundColor Cyan
Write-Host "Health check from another device: http://<this-pc-ip>:3000/api/v1/health" -ForegroundColor Cyan
