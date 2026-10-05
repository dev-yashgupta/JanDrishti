# ============================================================
# auto_commit.ps1
# Auto-commits with a smart, descriptive message based on
# what files actually changed — no timestamps, no manual input.
#
# Usage:
#   One-shot:   .\auto_commit.ps1
#   Watch mode: .\auto_commit.ps1 -Watch [-IntervalMinutes 5]
# ============================================================

param(
    [switch]$Watch,
    [int]$IntervalMinutes = 2
)

$RepoDir = $PSScriptRoot
Set-Location $RepoDir

# ------------------------------------------------------------------
# Build a meaningful commit message from git status output
# ------------------------------------------------------------------
function Get-SmartMessage {
    $statusLines = git status --porcelain 2>$null
    if (-not $statusLines) { return $null }

    $added    = @()
    $modified = @()
    $deleted  = @()
    $renamed  = @()

    foreach ($line in $statusLines) {
        $code = $line.Substring(0, 2).Trim()
        $file = $line.Substring(3).Trim()

        # Strip leading path noise, keep filename
        $name = Split-Path $file -Leaf

        switch -Regex ($code) {
            "^A$|^\?\?$"  { $added    += $name }
            "^M$|^ M$"    { $modified += $name }
            "^D$|^ D$"    { $deleted  += $name }
            "^R$"         { $renamed  += $name }
        }
    }

    # Pick a conventional prefix based on dominant change type
    $prefix = "chore"
    if ($added.Count -gt 0 -and $modified.Count -eq 0 -and $deleted.Count -eq 0) {
        $prefix = "feat"
    } elseif ($deleted.Count -gt 0 -and $added.Count -eq 0) {
        $prefix = "remove"
    } elseif ($modified.Count -gt 0 -and $added.Count -eq 0) {
        $prefix = "fix"
    } elseif ($added.Count -gt 0 -and $modified.Count -gt 0) {
        $prefix = "feat"
    }

    # Build scope from folder structure of changed files
    $allFiles = git diff --cached --name-only 2>$null
    if (-not $allFiles) {
        $allFiles = git status --porcelain | ForEach-Object { $_.Substring(3).Trim() }
    }

    $scopes = $allFiles | ForEach-Object {
        $parts = $_ -split "/"
        if ($parts.Count -ge 3 -and $parts[0] -eq "lib") { $parts[2] }
        elseif ($parts.Count -ge 2) { $parts[0] }
        else { $_ }
    } | Sort-Object -Unique | Where-Object { $_ -ne "" }

    $scope = if ($scopes.Count -eq 1) { $scopes[0] }
             elseif ($scopes.Count -le 3) { $scopes -join ", " }
             else { "multiple modules" }

    # Build the body summary
    $parts = @()
    if ($added.Count -gt 0) {
        $sample = ($added | Select-Object -First 3) -join ", "
        $extra  = if ($added.Count -gt 3) { " +$($added.Count - 3) more" } else { "" }
        $parts += "add $sample$extra"
    }
    if ($modified.Count -gt 0) {
        $sample = ($modified | Select-Object -First 3) -join ", "
        $extra  = if ($modified.Count -gt 3) { " +$($modified.Count - 3) more" } else { "" }
        $parts += "update $sample$extra"
    }
    if ($deleted.Count -gt 0) {
        $sample = ($deleted | Select-Object -First 2) -join ", "
        $parts += "remove $sample"
    }
    if ($renamed.Count -gt 0) {
        $parts += "rename $($renamed -join ', ')"
    }

    $body = $parts -join "; "

    return "${prefix}(${scope}): ${body}"
}

# ------------------------------------------------------------------
# Core commit function
# ------------------------------------------------------------------
function Invoke-Commit {
    Write-Host "[auto_commit] Staging all changes..." -ForegroundColor Cyan
    git add -A

    $status = git status --porcelain
    if (-not $status) {
        Write-Host "[auto_commit] Nothing to commit. Working tree clean." -ForegroundColor Yellow
        return
    }

    $msg = Get-SmartMessage
    if ([string]::IsNullOrWhiteSpace($msg)) {
        $msg = "chore: miscellaneous changes"
    }

    Write-Host "[auto_commit] Committing: $msg" -ForegroundColor Green
    git commit -m $msg

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[auto_commit] Done." -ForegroundColor Green
    } else {
        Write-Host "[auto_commit] ERROR: commit failed." -ForegroundColor Red
    }
}

# ------------------------------------------------------------------
# Entry point
# ------------------------------------------------------------------
if ($Watch) {
    Write-Host "[auto_commit] Watch mode ON - committing every $IntervalMinutes minute(s). Ctrl+C to stop." -ForegroundColor Magenta
    while ($true) {
        Invoke-Commit
        Start-Sleep -Seconds ($IntervalMinutes * 60)
    }
} else {
    Invoke-Commit
}
