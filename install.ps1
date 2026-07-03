$ErrorActionPreference = "Stop"

if (-not $env:A47_RELEASE_BASE_URL) {
  Write-Host "Set A47_RELEASE_BASE_URL to the release asset base URL before running this installer."
  Write-Host "Example: `$env:A47_RELEASE_BASE_URL='https://github.com/OWNER/a47-p2p/releases/latest/download'; .\install.ps1"
  exit 1
}

$installDir = if ($env:A47_INSTALL_DIR) { $env:A47_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "A47" }
$assetName = "a47-windows-x64.exe"
$targetPath = Join-Path $installDir "a47.exe"

New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Invoke-WebRequest -Uri "$env:A47_RELEASE_BASE_URL/$assetName" -OutFile $targetPath

Write-Host "A47 installed at $targetPath"
Write-Host "Add $installDir to PATH if it is not already available."
