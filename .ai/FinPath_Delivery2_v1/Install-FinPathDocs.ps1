# FinPath documentation import helper for PowerShell on Windows.
# Safe by default: refuses to overwrite a different existing file; never touches .git or existing AGENTS.md.
param(
    [string]$RepoRoot = 'D:\myWORK\project\finpath',
    [switch]$WhatIfOnly
)
$ErrorActionPreference = 'Stop'
$package = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path -LiteralPath $RepoRoot -PathType Container)) { throw "Repository folder not found: $RepoRoot" }
$gitCheck = & git -C $RepoRoot rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or $gitCheck -ne 'true') { throw "Not a valid Git worktree: $RepoRoot" }
$copyPaths = @('docs', 'tasks', 'START-HERE.md', 'AGENTS.ADDENDUM.md', 'README-CODEX.md')
$plan = New-Object System.Collections.Generic.List[object]
foreach ($rel in $copyPaths) {
    $src = Join-Path $package $rel
    if (Test-Path $src -PathType Container) {
        $files = @(Get-ChildItem -LiteralPath $src -Recurse -File)
    } else { $files = @(Get-Item -LiteralPath $src) }
    foreach ($file in $files) {
        $relFile = $file.FullName.Substring($package.Length).TrimStart('\')
        $dest = Join-Path $RepoRoot $relFile
        if (Test-Path -LiteralPath $dest -PathType Container) { throw "Destination is a directory: $dest" }
        if (Test-Path -LiteralPath $dest -PathType Leaf) {
            $srcHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
            $destHash = (Get-FileHash -LiteralPath $dest -Algorithm SHA256).Hash
            if ($srcHash -ne $destHash) { throw "Conflict: existing file differs. No files copied. Review manually: $dest" }
            $action = 'Skip identical'
        } else { $action = 'Copy' }
        $plan.Add([PSCustomObject]@{Action=$action; From=$file.FullName; To=$dest})
    }
}
$plan | Group-Object Action | ForEach-Object { Write-Host "$($_.Name): $($_.Count) file(s)" }
if ($WhatIfOnly) { Write-Host 'Dry run only. No files changed.'; return }
foreach ($entry in $plan) {
    if ($entry.Action -ne 'Copy') { continue }
    $folder = Split-Path -Parent $entry.To
    if (-not (Test-Path -LiteralPath $folder)) { New-Item -ItemType Directory -Path $folder -Force | Out-Null }
    Copy-Item -LiteralPath $entry.From -Destination $entry.To -ErrorAction Stop
}
Write-Host "Documentation imported into $RepoRoot."
Write-Host 'Review AGENTS.ADDENDUM.md and merge into existing AGENTS.md manually; never overwrite AGENTS.md.'
Write-Host 'Review: git status and git diff --stat; then authorize a SINGLE Step in Codex.'
