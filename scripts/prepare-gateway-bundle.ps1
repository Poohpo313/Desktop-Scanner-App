# Stages the gateway API for bundling inside the Desktop Scanner installer.
# Output: User/user-interface-electron/gateway-bundle/

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$gatewayRoot = Join-Path $repoRoot "gateway"
$bundleRoot = Join-Path $repoRoot "User\user-interface-electron\gateway-bundle"
$distMain = Join-Path $gatewayRoot "dist\main.js"

Write-Host "Building gateway..."
Push-Location $repoRoot
try {
  npm run build -w @bukolabs/gateway
  if ($LASTEXITCODE -ne 0) { throw "Gateway build failed." }
} finally {
  Pop-Location
}

if (-not (Test-Path $distMain)) {
  throw "Gateway build output not found at $distMain"
}

Write-Host "Staging gateway bundle at $bundleRoot"
if (Test-Path $bundleRoot) {
  Remove-Item $bundleRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $bundleRoot | Out-Null

Copy-Item -Path (Join-Path $gatewayRoot "dist") -Destination (Join-Path $bundleRoot "dist") -Recurse
Copy-Item -Path (Join-Path $gatewayRoot "package.json") -Destination (Join-Path $bundleRoot "package.json")

Write-Host "Installing production gateway dependencies into bundle (isolated from repo node_modules)..."
Push-Location $bundleRoot
try {
  npm install --omit=dev --no-audit --ignore-scripts
  if ($LASTEXITCODE -ne 0) { throw "Gateway bundle dependency install failed." }
} finally {
  Pop-Location
}

$envSource = Join-Path $gatewayRoot ".env"
$envExample = Join-Path $gatewayRoot ".env.example"
if (Test-Path $envSource) {
  Copy-Item -Path $envSource -Destination (Join-Path $bundleRoot ".env.template")
} elseif (Test-Path $envExample) {
  Copy-Item -Path $envExample -Destination (Join-Path $bundleRoot ".env.template")
}

Copy-Item -Path (Join-Path $PSScriptRoot "install-bundled-gateway-service.ps1") `
  -Destination (Join-Path $bundleRoot "install-bundled-gateway-service.ps1")
Copy-Item -Path (Join-Path $PSScriptRoot "uninstall-bundled-gateway-service.ps1") `
  -Destination (Join-Path $bundleRoot "uninstall-bundled-gateway-service.ps1")

Write-Host "Gateway bundle ready." -ForegroundColor Green
