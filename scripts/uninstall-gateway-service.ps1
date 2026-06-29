# Removes the Bukolabs gateway background task.
# Run as Administrator.

$ErrorActionPreference = "Stop"
$taskName = "BukolabsGateway"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script in an elevated PowerShell window (Run as administrator)."
}

$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
  Write-Host "Removed scheduled task: $taskName" -ForegroundColor Green
} else {
  Write-Host "No scheduled task named $taskName was found." -ForegroundColor Yellow
}
