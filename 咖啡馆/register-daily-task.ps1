# Register Windows task: daily sync at 12:00 local time (Beijing TZ recommended)
# Usage: powershell -ExecutionPolicy Bypass -File register-daily-task.ps1

$TaskName = "BOWEN-Kafei-MihoyoSync"
$SyncScript = Join-Path $PSScriptRoot "sync-mihoyo-daily.ps1"

if (-not (Test-Path $SyncScript)) {
    Write-Error "Missing sync script: $SyncScript"
    exit 1
}

$Action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$SyncScript`""

$Trigger = New-ScheduledTaskTrigger -Daily -At "12:00"

$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2)

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "BOWEN kafei: sync 10 MiHoYo posts with replies daily at 12:00" `
    -Force | Out-Null

Write-Host "Registered scheduled task: $TaskName"
Write-Host "  Schedule: daily at 12:00 (local timezone)"
Write-Host "  Script: $SyncScript"
Write-Host "  Manage: taskschd.msc"
