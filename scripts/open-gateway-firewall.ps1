# Opens Windows Firewall for the Bukolabs gateway on port 3000 (Private/Domain networks).
# Run once as Administrator on the PC that hosts the gateway.

$ErrorActionPreference = "Stop"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script in an elevated PowerShell window (Run as administrator)."
}

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

Write-Host "Firewall rule added for TCP port 3000 (all network profiles)." -ForegroundColor Green
Write-Host "Test from another device: http://<gateway-pc-ip>:3000/api/v1/health" -ForegroundColor Cyan
