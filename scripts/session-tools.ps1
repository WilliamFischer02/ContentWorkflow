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
    & $Config.gitExe add .
    try {
        & $Config.gitExe commit -m $Message
    } catch {
        Write-Host "No commit created (possibly no diff)." -ForegroundColor Yellow
    }
    & $Config.gitExe push
}