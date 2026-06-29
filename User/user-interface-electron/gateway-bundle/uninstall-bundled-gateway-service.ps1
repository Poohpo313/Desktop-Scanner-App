# Removes the bundled Bukolabs gateway scheduled task (called from NSIS uninstall).

$ErrorActionPreference = "Stop"

$taskName = "BukolabsGateway"
$existing = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existing) {
  Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

Write-Host "Removed scheduled task $taskName (if present)."
