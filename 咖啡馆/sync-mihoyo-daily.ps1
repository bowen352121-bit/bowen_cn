# 咖啡馆 · 米游社每日同步（10 条最新回复帖 + 每条下的评论/子回复）
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDir = Join-Path $Root "logs"
$Python = Get-Command python -ErrorAction SilentlyContinue

if (-not $Python) {
    Write-Error "未找到 python，请先安装 Python 并加入 PATH。"
    exit 1
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir ("sync-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".log")

Push-Location $Root
try {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] 开始同步米游社咖啡馆…" | Tee-Object -FilePath $LogFile -Append
    & $Python.Source "fetch_bbs.py" 2>&1 | Tee-Object -FilePath $LogFile -Append
    $code = $LASTEXITCODE
    if ($code -eq 0) {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] 同步完成。" | Tee-Object -FilePath $LogFile -Append
    } else {
        Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] 同步失败，退出码 $code" | Tee-Object -FilePath $LogFile -Append
    }
    exit $code
} finally {
    Pop-Location
}
