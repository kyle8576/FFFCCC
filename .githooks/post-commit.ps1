# Kenaz Cortex - Git Post-Commit Hook (PowerShell)
#
# 在每次 commit 後自動觸發 RAG 增量索引更新。
# 支援非同步執行，不阻塞 commit 流程。
#
# 安裝方式：
#   .\dev\scripts\hooks\Install-GitHooks.ps1
#
# 注意：Windows 上使用此腳本需要將 Git 配置為使用 PowerShell。
#       建議使用 Bash 版本的 hook（需安裝 Git Bash）。

param(
    [switch]$Sync,        # 同步模式（等待完成）
    [int]$Timeout = 30    # 超時秒數
)

# 配置
$ErrorActionPreference = "SilentlyContinue"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

# 顏色函數
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 檢查是否在 CI 環境中
function Test-CIEnvironment {
    return $env:CI -or $env:GITHUB_ACTIONS
}

# 檢查配置文件中是否啟用 git_hooks
function Test-HooksEnabled {
    $configFile = Join-Path $ProjectRoot ".cortex.yaml"

    if (Test-Path $configFile) {
        $content = Get-Content $configFile -Raw
        if ($content -match "git_hooks:" -and $content -match "enabled:\s*true") {
            return $true
        }
    }

    # 預設啟用
    return $true
}

# 檢查 Python 環境
function Get-PythonCommand {
    if (Get-Command python3 -ErrorAction SilentlyContinue) {
        return "python3"
    }
    elseif (Get-Command python -ErrorAction SilentlyContinue) {
        return "python"
    }
    return $null
}

# 檢查 Cortex 模組是否可用
function Test-CortexAvailable {
    param([string]$PythonCmd)

    try {
        $result = & $PythonCmd -c "import cortex" 2>&1
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# 執行增量同步
function Invoke-CortexSync {
    param(
        [string]$PythonCmd,
        [bool]$AsyncMode = $true
    )

    Push-Location $ProjectRoot

    try {
        if ($AsyncMode) {
            # 非同步模式：背景執行
            Start-Job -ScriptBlock {
                param($python, $projectRoot)
                Set-Location $projectRoot
                & $python -m cortex.sync.git_sync --incremental
            } -ArgumentList $PythonCmd, $ProjectRoot | Out-Null

            Write-ColorOutput "Kenaz Cortex: Index update started (background)" "Cyan"
        }
        else {
            # 同步模式：等待完成
            Write-ColorOutput "Kenaz Cortex: Updating index..." "Cyan"

            $job = Start-Job -ScriptBlock {
                param($python, $projectRoot)
                Set-Location $projectRoot
                & $python -m cortex.sync.git_sync --incremental
            } -ArgumentList $PythonCmd, $ProjectRoot

            $completed = Wait-Job -Job $job -Timeout $Timeout

            if ($completed) {
                $result = Receive-Job -Job $job
                if ($LASTEXITCODE -eq 0) {
                    Write-ColorOutput "Kenaz Cortex: Index updated successfully" "Green"
                }
                else {
                    Write-ColorOutput "Kenaz Cortex: Index update failed (non-blocking)" "Yellow"
                }
            }
            else {
                Stop-Job -Job $job
                Write-ColorOutput "Kenaz Cortex: Index update timed out (non-blocking)" "Yellow"
            }

            Remove-Job -Job $job -Force
        }
    }
    finally {
        Pop-Location
    }
}

# 主程式
function Main {
    # 檢查是否在 CI 環境中
    if (Test-CIEnvironment) {
        Write-Host "CI environment detected, skipping Cortex sync"
        exit 0
    }

    # 檢查是否啟用
    if (-not (Test-HooksEnabled)) {
        exit 0
    }

    # 檢查 Python
    $pythonCmd = Get-PythonCommand
    if (-not $pythonCmd) {
        Write-ColorOutput "Kenaz Cortex: Python not found, skipping index update" "Yellow"
        exit 0
    }

    # 檢查 Cortex 模組
    if (-not (Test-CortexAvailable -PythonCmd $pythonCmd)) {
        # Cortex 未安裝，靜默跳過
        exit 0
    }

    # 執行同步
    $asyncMode = -not $Sync
    Invoke-CortexSync -PythonCmd $pythonCmd -AsyncMode $asyncMode

    exit 0
}

Main
