param(
    [string]$InstallPath = (Join-Path $PSScriptRoot "..\unibee")
)

$ErrorActionPreference = "Stop"
$InstallPath = [System.IO.Path]::GetFullPath($InstallPath)

if (-not (Test-Path (Join-Path $InstallPath ".git"))) {
    if (Test-Path $InstallPath) {
        throw "Install path exists but is not a UniBee git checkout: $InstallPath"
    }
    git clone https://github.com/UniBee-Billing/unibee $InstallPath
}

$LocalEnv = Join-Path $InstallPath ".env"
if (-not (Test-Path $LocalEnv)) {
    Set-Content -Path $LocalEnv -Value @(
        "# Keep UniBee's host ports separate from the Weave stack."
        "REDIS_PORT=16379"
        "API_PORT=8088"
        "LICENSE_API_PORT=18083"
        "USER_PORT=8082"
        "ADMIN_PORT=8081"
    )
}

Push-Location $InstallPath
try {
    git pull --ff-only
    docker compose up -d
    docker compose ps
} finally {
    Pop-Location
}

Write-Host "UniBee is starting at http://localhost. Wait for the API and portals to become healthy."
Write-Host "Configure the merchant in the UniBee admin portal, then put the API key and gateway ID in weave-backend/.env."
