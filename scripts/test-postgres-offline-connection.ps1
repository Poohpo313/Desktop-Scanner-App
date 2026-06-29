param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\backend-modules\shared\.env.offline")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
  Write-Host "Missing file: $EnvFile" -ForegroundColor Red
  Write-Host "Run: npm run setup:postgres-offline"
  exit 1
}

Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    Set-Item -Path "env:$name" -Value $value
  }
}

if ($env:OFFLINE_DB_PASSWORD -eq "YOUR_PASSWORD") {
  Write-Host "Edit .env.offline or run: npm run setup:postgres-offline" -ForegroundColor Yellow
  exit 1
}

$psqlCandidates = @(
  "C:\Program Files\PostgreSQL\18\bin\psql.exe",
  "C:\Program Files\PostgreSQL\17\bin\psql.exe",
  "C:\Program Files\PostgreSQL\16\bin\psql.exe"
)

$psqlExe = $psqlCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $psqlExe) {
  throw "psql.exe not found."
}

Write-Host "Testing PostgreSQL offline connection..."
Write-Host "  Host:     $($env:OFFLINE_DB_HOST)"
Write-Host "  Port:     $($env:OFFLINE_DB_PORT)"
Write-Host "  User:     $($env:OFFLINE_DB_USER)"
Write-Host "  Database: $($env:OFFLINE_DB_NAME)"
Write-Host ""

$env:PGPASSWORD = $env:OFFLINE_DB_PASSWORD
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"

try {
  $rawOutput = & $psqlExe `
    -h $env:OFFLINE_DB_HOST `
    -p $env:OFFLINE_DB_PORT `
    -U $env:OFFLINE_DB_USER `
    -d $env:OFFLINE_DB_NAME `
    -c "SELECT COUNT(*) AS role_count FROM roles;" `
    2>&1

  $lines = @($rawOutput | ForEach-Object { "$_" })

  if ($LASTEXITCODE -ne 0) {
    Write-Host "Connection failed:" -ForegroundColor Red
    $lines | ForEach-Object { Write-Host $_ }
    Write-Host ""
    Write-Host "Run: npm run setup:postgres-offline" -ForegroundColor Yellow
    exit 1
  }

  Write-Host "Connection successful!" -ForegroundColor Green
  $lines | ForEach-Object { Write-Host $_ }
} finally {
  $ErrorActionPreference = $previousErrorAction
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
