param(
  [string]$HostName = "localhost",
  [int]$Port = 5432,
  [string]$User = "postgres",
  [string]$Password,
  [string]$Database = "bukolabs_online",
  [switch]$Seed,
  [switch]$Reset
)

$ErrorActionPreference = "Stop"

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
$migrationFile = Join-Path $repoRoot "backend-modules\shared\migrations\online\001_initial_schema.postgres.sql"
$seedFile = Join-Path $repoRoot "backend-modules\shared\migrations\online\002_seed_roles.postgres.sql"
$superAdminSeedFile = Join-Path $repoRoot "backend-modules\shared\migrations\online\003_seed_superadmin.postgres.sql"
$recoveryMigrationFile = Join-Path $repoRoot "backend-modules\shared\migrations\online\004_recovery_requests.postgres.sql"
$profileMigrationFile = Join-Path $repoRoot "backend-modules\shared\migrations\online\005_profile_fields.postgres.sql"
$keyMetadataMigrationFile = Join-Path $repoRoot "backend-modules\shared\migrations\online\006_serial_key_metadata.postgres.sql"
$envFile = Join-Path $repoRoot "backend-modules\shared\.env.online"

if (-not (Test-Path $migrationFile)) {
  throw "Migration file not found: $migrationFile"
}

if (-not $Password) {
  Write-Host "Enter the PostgreSQL password for user '$User'."
  $secure = Read-Host "Password" -AsSecureString
  $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  )
}

function Invoke-Psql {
  param(
    [string]$Sql,
    [string]$DatabaseName = "postgres"
  )

  $env:PGPASSWORD = $Password
  $previousErrorAction = $ErrorActionPreference
  $ErrorActionPreference = "Continue"

  try {
    $rawOutput = $Sql | & $psqlExe -h $HostName -p $Port -U $User -d $DatabaseName -v ON_ERROR_STOP=1 2>&1
    $lines = @($rawOutput | ForEach-Object { "$_" })

    if ($LASTEXITCODE -ne 0) {
      throw ($lines -join "`n")
    }

    foreach ($line in $lines) {
      if ($line -match '^\s*NOTICE:') {
        Write-Host $line -ForegroundColor DarkYellow
      }
    }

    return ($lines -join "`n")
  } finally {
    $ErrorActionPreference = $previousErrorAction
  }
}

Write-Host "Creating database '$Database' if needed..."
if ($Reset) {
  Write-Host "Reset requested - dropping database '$Database'..." -ForegroundColor Yellow
  $dropSql = 'DROP DATABASE IF EXISTS ' + $Database + ' WITH (FORCE);'
  Invoke-Psql -Sql $dropSql -DatabaseName 'postgres' | Out-Null
}

try {
  $createSql = 'CREATE DATABASE ' + $Database + ';'
  Invoke-Psql -Sql $createSql -DatabaseName 'postgres' | Out-Null
} catch {
  if ($_.Exception.Message -notmatch 'already exists') {
    throw
  }
}

Write-Host "Running online schema migration..."
$migrationSql = Get-Content $migrationFile -Raw
try {
  Invoke-Psql -Sql $migrationSql -DatabaseName $Database | Out-Null
} catch {
  Write-Host ""
  Write-Host "Migration failed. The database likely has an older partial schema." -ForegroundColor Red
  Write-Host "Re-run with -Reset to drop and recreate a clean database:" -ForegroundColor Yellow
  Write-Host "  npm run setup:db:reset" -ForegroundColor Cyan
  throw
}

if ($Seed -and (Test-Path $seedFile)) {
  Write-Host "Seeding online roles..."
  $seedSql = Get-Content $seedFile -Raw
  Invoke-Psql -Sql $seedSql -DatabaseName $Database | Out-Null
}

if ($Seed -and (Test-Path $superAdminSeedFile)) {
  Write-Host "Seeding default super admin (PIN: 123456)..."
  $superAdminSql = Get-Content $superAdminSeedFile -Raw
  Invoke-Psql -Sql $superAdminSql -DatabaseName $Database | Out-Null
}

if (Test-Path $recoveryMigrationFile) {
  Write-Host "Applying recovery requests migration..."
  $recoverySql = Get-Content $recoveryMigrationFile -Raw
  Invoke-Psql -Sql $recoverySql -DatabaseName $Database | Out-Null
}

if (Test-Path $profileMigrationFile) {
  Write-Host "Applying profile fields migration..."
  $profileSql = Get-Content $profileMigrationFile -Raw
  Invoke-Psql -Sql $profileSql -DatabaseName $Database | Out-Null
}

if (Test-Path $keyMetadataMigrationFile) {
  Write-Host "Applying serial key metadata migration..."
  $keyMetadataSql = Get-Content $keyMetadataMigrationFile -Raw
  Invoke-Psql -Sql $keyMetadataSql -DatabaseName $Database | Out-Null
}

Write-Host "Verifying tables..."
$checkSql = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
$tableList = Invoke-Psql -Sql $checkSql -DatabaseName $Database

$requiredTables = @(
  "roles", "users", "serial_keys", "devices", "folders", "documents",
  "scan_history", "activity_logs", "cloud_sync", "backups"
)

foreach ($table in $requiredTables) {
  if ($tableList -notmatch $table) {
    throw "Missing table after migration: $table"
  }
}

$encodedPassword = [uri]::EscapeDataString($Password)
$databaseUrl = "postgresql://${User}:$encodedPassword@${HostName}:$Port/$Database"

$envContent = @(
  "# Online PostgreSQL - generated by scripts/setup-postgres.ps1"
  ""
  "DATABASE_URL=$databaseUrl"
  "DB_HOST=$HostName"
  "DB_PORT=$Port"
  "DB_USER=$User"
  "DB_PASSWORD=$Password"
  "DB_NAME=$Database"
  ""
)

$envContent | Set-Content $envFile -Encoding UTF8

$gatewayEnvFile = Join-Path $repoRoot "gateway\.env"
$gatewayEnvExample = Join-Path $repoRoot "gateway\.env.example"
if (-not (Test-Path $gatewayEnvFile) -and (Test-Path $gatewayEnvExample)) {
  Copy-Item $gatewayEnvExample $gatewayEnvFile
}
if (Test-Path $gatewayEnvFile) {
  Write-Host "Syncing database credentials to gateway\.env..."
  $gatewayEnv = Get-Content $gatewayEnvFile -Raw
  $gatewayEnv = $gatewayEnv -replace '(?m)^DB_HOST=.*', "DB_HOST=$HostName"
  $gatewayEnv = $gatewayEnv -replace '(?m)^DB_PORT=.*', "DB_PORT=$Port"
  $gatewayEnv = $gatewayEnv -replace '(?m)^DB_USER=.*', "DB_USER=$User"
  $gatewayEnv = $gatewayEnv -replace '(?m)^DB_PASSWORD=.*', "DB_PASSWORD=$Password"
  $gatewayEnv = $gatewayEnv -replace '(?m)^DB_NAME=.*', "DB_NAME=$Database"
  $gatewayEnv | Set-Content $gatewayEnvFile -Encoding UTF8 -NoNewline
  if (-not $gatewayEnv.EndsWith("`n")) {
    Add-Content $gatewayEnvFile "" -Encoding UTF8
  }
}

Write-Host ""
Write-Host "PostgreSQL online database setup complete." -ForegroundColor Green
Write-Host "Database: $Database"
Write-Host "Env file: $envFile"
Write-Host ""
Write-Host "Test with: npm run test:postgres-online"
