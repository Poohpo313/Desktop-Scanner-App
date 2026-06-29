# Starts the latest gateway build. Uses port 3001 when 3000 is held by the old SYSTEM service.
param(
  [int]$PreferredPort = 3000
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$gatewayRoot = Join-Path $repoRoot "gateway"
$distMain = Join-Path $gatewayRoot "dist\main.js"
$logDir = Join-Path $env:ProgramData "Bukolabs\gateway\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Test-PortListening([int]$Port) {
  return [bool](netstat -ano | Select-String ":$Port\s" | Select-String "LISTENING")
}

Push-Location $repoRoot
try {
  if (-not (Test-Path $distMain)) {
    Write-Host "Building gateway..."
    npm run build -w @bukolabs/gateway
    if ($LASTEXITCODE -ne 0) { throw "Gateway build failed." }
  }
} finally {
  Pop-Location
}

$port = $PreferredPort
if (Test-PortListening $port) {
  if ($port -eq 3000) {
    Write-Host "Port 3000 is already in use (likely the old BukolabsGateway service)." -ForegroundColor Yellow
    Write-Host "Starting latest gateway on port 3001 instead." -ForegroundColor Yellow
    $port = 3001
  } else {
    throw "Port $port is already in use."
  }
}

if (Test-PortListening $port) {
  throw "Port $port is already in use."
}

$nodePath = (Get-Command node -ErrorAction Stop).Source
$logFile = Join-Path $logDir "gateway-latest-$port.log"

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
$psi.Environment["PORT"] = "$port"

$process = [System.Diagnostics.Process]::Start($psi)
Start-Sleep -Seconds 3

if ($process.HasExited) {
  throw "Gateway failed to start. Check $logFile"
}

$apiUrl = "http://localhost:$port/api/v1"
Write-Host "Latest gateway running on $apiUrl (PID $($process.Id))." -ForegroundColor Green
Write-Host "Log: $logFile" -ForegroundColor Green

if ($port -ne 3000) {
  Write-Host ""
  Write-Host "Update SuperAdmin/.env to use the new gateway:" -ForegroundColor Cyan
  Write-Host "  VITE_API_URL=$apiUrl"
  Write-Host "  VITE_SOCKET_URL=http://localhost:$port/events"
  Write-Host ""
  Write-Host "Then restart the Super Admin dev server." -ForegroundColor Cyan
  Write-Host "To replace the old service permanently, run install-gateway-service.ps1 as Administrator." -ForegroundColor Cyan
}

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
