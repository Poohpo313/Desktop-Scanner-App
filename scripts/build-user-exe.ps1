param(
  [switch]$DirOnly
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$appRoot = Join-Path $repoRoot "User\user-interface-electron"

Write-Host "Building Desktop Scanner Electron app..."
Write-Host "App directory: $appRoot"
Write-Host ""

Write-Host "Preparing bundled gateway for installer..."
powershell -ExecutionPolicy Bypass -File (Join-Path $repoRoot "scripts\prepare-gateway-bundle.ps1")
if ($LASTEXITCODE -ne 0) {
  throw "Gateway bundle preparation failed."
}
Write-Host ""

Push-Location $appRoot
try {
  $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

  if ($DirOnly) {
    npm run pack:dir
  } else {
    npm run pack
  }

  if ($LASTEXITCODE -ne 0) {
    throw "Electron build failed."
  }
} finally {
  Pop-Location
}

$releaseDir = Join-Path $appRoot "release"
Write-Host ""
Write-Host "Build complete." -ForegroundColor Green
Write-Host "Output folder: $releaseDir" -ForegroundColor Green

if (Test-Path $releaseDir) {
  Get-ChildItem $releaseDir | ForEach-Object { Write-Host "  - $($_.Name)" }
}
