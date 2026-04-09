$ConfigPath = Join-Path $PSScriptRoot "tool-config.json"
$Config = Get-Content $ConfigPath -Raw | ConvertFrom-Json

function OpenEditor {
    Set-Location $Config.repoRoot
    $env:Path = "$([System.IO.Path]::GetDirectoryName($Config.nodeExe));$([System.IO.Path]::GetDirectoryName($Config.gitExe));$env:Path"
    & $Config.nodeExe ".\scripts\workflow-editor.mjs"
}

function FullSend {
    param(
        [string]$Message = "chore: fullSend sync"
    )

    Set-Location $Config.repoRoot
    $env:Path = "$([System.IO.Path]::GetDirectoryName($Config.nodeExe));$([System.IO.Path]::GetDirectoryName($Config.gitExe));$env:Path"

    & $Config.npmCmd run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed. Aborting commit/push."
    }

    & $Config.gitExe add .
    if ($LASTEXITCODE -ne 0) {
        throw "Git add failed."
    }

    try {
        & $Config.gitExe commit -m $Message
    } catch {
        Write-Host "No commit created (possibly no diff)." -ForegroundColor Yellow
    }

    & $Config.gitExe push
    if ($LASTEXITCODE -ne 0) {
        throw "Git push failed."
    }
}