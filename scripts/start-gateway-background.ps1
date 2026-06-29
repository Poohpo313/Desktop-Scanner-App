# Starts the gateway hidden in the background (dev / manual use).
# Does NOT survive reboot - use install-gateway-service.ps1 for production.

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$gatewayRoot = Join-Path $repoRoot "gateway"
$distMain = Join-Path $gatewayRoot "dist\main.js"

if (-not (Test-Path $distMain)) {
  Push-Location $repoRoot
  try {
    npm install -w @bukolabs/gateway --no-audit
    if ($LASTEXITCODE -ne 0) { throw "Gateway dependency install failed." }
    npm run build -w @bukolabs/gateway
    if ($LASTEXITCODE -ne 0) { throw "Gateway build failed." }
  } finally {
    Pop-Location
  }
}

$nodePath = (Get-Command node -ErrorAction Stop).Source
$logDir = Join-Path $env:ProgramData "Bukolabs\gateway\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir "gateway-dev.log"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $nodePath
$psi.Arguments = "`"$distMain`""
$psi.WorkingDirectory = $gatewayRoot
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.Environment["NODE_ENV"] = "production"
$psi.Environment["BACKEND_ROLE"] = "gateway"

$process = [System.Diagnostics.Process]::Start($psi)
Start-Job -ScriptBlock {
  param($proc, $log)
  $stdout = $proc.StandardOutput
  $stderr = $proc.StandardError
  while (-not $proc.HasExited) {
    while ($stdout.Peek() -ge 0) { Add-Content -Path $log -Value $stdout.ReadLine() }
    while ($stderr.Peek() -ge 0) { Add-Content -Path $log -Value $stderr.ReadLine() }
    Start-Sleep -Milliseconds 200
  }
} -ArgumentList $process, $logFile | Out-Null

Write-Host "Gateway started in background (PID $($process.Id))." -ForegroundColor Green
Write-Host "Log: $logFile" -ForegroundColor Green
Write-Host "Users open only the Desktop Scanner app - no browser required." -ForegroundColor Cyan
