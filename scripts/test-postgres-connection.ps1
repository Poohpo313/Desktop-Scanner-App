param(
  [string]$EnvFile = (Join-Path $PSScriptRoot "..\backend-modules\shared\.env.online")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $EnvFile)) {
  Write-Host "Missing file: $EnvFile" -ForegroundColor Red
  Write-Host "Run: npm run setup:db"
  exit 1
}

Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
    $name = $matches[1].Trim()
    $value = $matches[2].Trim()
    Set-Item -Path "env:$name" -Value $value
  }
}

if ($env:DB_PASSWORD -eq "YOUR_PASSWORD") {
  Write-Host "Edit .env.online or run: npm run setup:db" -ForegroundColor Yellow
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

Write-Host "Testing PostgreSQL connection..."
Write-Host "  Host:     $($env:DB_HOST)"
Write-Host "  Port:     $($env:DB_PORT)"
Write-Host "  User:     $($env:DB_USER)"
Write-Host "  Database: $($env:DB_NAME)"
Write-Host ""

$env:PGPASSWORD = $env:DB_PASSWORD
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = "Continue"

try {
  $rawOutput = & $psqlExe `
    -h $env:DB_HOST `
    -p $env:DB_PORT `
    -U $env:DB_USER `
    -d $env:DB_NAME `
    -c "SELECT COUNT(*) AS role_count FROM roles;" `
    2>&1

  $lines = @($rawOutput | ForEach-Object { "$_" })

  if ($LASTEXITCODE -ne 0) {
    Write-Host "Connection failed:" -ForegroundColor Red
    $lines | ForEach-Object { Write-Host $_ }
    Write-Host ""
    Write-Host "Run: npm run setup:db" -ForegroundColor Yellow
    Write-Host "Enter the same password you use in pgAdmin / psql."
    exit 1
  }

  Write-Host "Connection successful!" -ForegroundColor Green
  $lines | ForEach-Object { Write-Host $_ }
} finally {
  $ErrorActionPreference = $previousErrorAction
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
