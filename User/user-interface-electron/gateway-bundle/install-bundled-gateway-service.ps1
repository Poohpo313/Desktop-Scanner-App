# Installs the bundled Bukolabs gateway as a Windows background task + firewall rule.
# Called from the Desktop Scanner NSIS installer (elevated) or manually after install.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File install-bundled-gateway-service.ps1 `
#     -InstallDir "C:\Program Files\Desktop Scanner App" `
#     -BundleSourceDir "C:\Program Files\Desktop Scanner App\resources\gateway"

param(
  [Parameter(Mandatory = $true)]
  [string]$InstallDir,

  [Parameter(Mandatory = $true)]
  [string]$BundleSourceDir,

  [switch]$SkipFirewall
)

$ErrorActionPreference = "Stop"

$taskName = "BukolabsGateway"
$gatewayRoot = Join-Path $env:ProgramData "Bukolabs\gateway"
$logDir = Join-Path $gatewayRoot "logs"
$envFile = Join-Path $gatewayRoot ".env"
$distMain = Join-Path $gatewayRoot "dist\main.js"

function Require-Admin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Gateway service install requires administrator privileges."
  }
}

function Install-GatewayFirewallRule {
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
}

Require-Admin

if (-not (Test-Path $BundleSourceDir)) {
  Write-Warning "Gateway bundle not found at $BundleSourceDir - skipping gateway service install."
  exit 0
}

$electronExe = Join-Path $InstallDir "Desktop Scanner App.exe"
if (-not (Test-Path $electronExe)) {
  throw "Desktop Scanner executable not found at $electronExe"
}

Write-Host "Installing gateway to $gatewayRoot"
New-Item -ItemType Directory -Force -Path $gatewayRoot | Out-Null
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$preserveEnv = Test-Path $envFile
$preserveLogs = Test-Path $logDir

foreach ($entry in Get-ChildItem -Path $gatewayRoot -Force -ErrorAction SilentlyContinue) {
  if ($entry.Name -eq ".env" -and $preserveEnv) { continue }
  if ($entry.Name -eq "logs" -and $preserveLogs) { continue }
  Remove-Item -Path $entry.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

Copy-Item -Path (Join-Path $BundleSourceDir "*") -Destination $gatewayRoot -Recurse -Force

if (-not $preserveEnv) {
  $template = Join-Path $gatewayRoot ".env.template"
  if (Test-Path $template) {
    Copy-Item -Path $template -Destination $envFile
    Write-Host "Created $envFile from template. Configure PostgreSQL credentials before relying on online mode." -ForegroundColor Yellow
  }
}

if (-not (Test-Path $distMain)) {
  throw "Bundled gateway entry point not found at $distMain"
}

$runnerPath = Join-Path $gatewayRoot "run-gateway.cmd"
$runnerContent = @"
@echo off
cd /d "$gatewayRoot"
set ELECTRON_RUN_AS_NODE=1
set NODE_ENV=production
set BACKEND_ROLE=gateway
set HOST=0.0.0.0
"$electronExe" "$distMain" >> "$logDir\gateway.log" 2>&1
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
  -Description "Bukolabs online API gateway bundled with Desktop Scanner - starts at boot." | Out-Null

if (-not $SkipFirewall) {
  Install-GatewayFirewallRule
}

Start-ScheduledTask -TaskName $taskName

Write-Host ""
Write-Host "Bukolabs gateway service installed." -ForegroundColor Green
Write-Host "Task: $taskName | Logs: $logDir\gateway.log" -ForegroundColor Green
Write-Host "LAN health check: http://<this-pc-ip>:3000/api/v1/health" -ForegroundColor Cyan
Write-Host "Set this PC's network to Private (not Public) if other devices still cannot connect." -ForegroundColor Yellow
