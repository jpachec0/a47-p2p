$ErrorActionPreference = "Stop"

$releaseBaseUrl = if ($env:A47_RELEASE_BASE_URL) { $env:A47_RELEASE_BASE_URL } else { "https://github.com/jpachec0/a47-p2p/releases/latest/download" }
$installDir = if ($env:A47_INSTALL_DIR) { $env:A47_INSTALL_DIR } else { Join-Path $env:LOCALAPPDATA "A47" }
$assetName = "a47-windows-x64.exe"
$targetPath = Join-Path $installDir "a47.exe"

New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Invoke-WebRequest -Uri "$releaseBaseUrl/$assetName" -OutFile $targetPath

Write-Host "A47 installed at $targetPath"
Write-Host "Add $installDir to PATH if it is not already available."
