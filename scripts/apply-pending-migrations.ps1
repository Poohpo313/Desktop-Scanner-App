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

$psqlCandidates = @(
  "C:\Program Files\PostgreSQL\18\bin\psql.exe",
  "C:\Program Files\PostgreSQL\17\bin\psql.exe",
  "C:\Program Files\PostgreSQL\16\bin\psql.exe"
)

$psqlExe = $psqlCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $psqlExe) {
  throw "psql.exe not found. Install PostgreSQL or add psql to PATH."
}

$repoRoot = Split-Path $PSScriptRoot -Parent
$migrations = @(
  (Join-Path $repoRoot "backend-modules\shared\migrations\online\005_profile_fields.postgres.sql"),
  (Join-Path $repoRoot "backend-modules\shared\migrations\online\006_serial_key_metadata.postgres.sql"),
  (Join-Path $repoRoot "backend-modules\shared\migrations\online\007_admin_departments_user_concerns.postgres.sql"),
  (Join-Path $repoRoot "backend-modules\shared\migrations\online\008_revocation_requests.postgres.sql"),
  (Join-Path $repoRoot "backend-modules\shared\migrations\online\009_user_concern_replies.postgres.sql"),
  (Join-Path $repoRoot "gateway\src\database\migrations\010_companies_departments.sql"),
  (Join-Path $repoRoot "gateway\src\database\migrations\011_key_extension.sql")
)

$env:PGPASSWORD = $env:DB_PASSWORD

foreach ($migrationFile in $migrations) {
  if (-not (Test-Path $migrationFile)) {
    Write-Host "Skipping missing migration: $migrationFile" -ForegroundColor Yellow
    continue
  }

  Write-Host "Applying $(Split-Path $migrationFile -Leaf)..."
  $sql = Get-Content $migrationFile -Raw
  & $psqlExe -h $env:DB_HOST -p $env:DB_PORT -U $env:DB_USER -d $env:DB_NAME -v ON_ERROR_STOP=1 -c $sql | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Migration failed: $migrationFile"
  }
}

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
Write-Host "Pending migrations applied." -ForegroundColor Green
