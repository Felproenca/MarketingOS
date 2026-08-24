$ErrorActionPreference = 'Stop'
$taskName = 'MarketingOS MediaOS Worker'
$scriptPath = Join-Path $PSScriptRoot 'start-worker-pm2.cmd'
$action = New-ScheduledTaskAction -Execute "$env:WINDIR\System32\cmd.exe" -Argument "/d /c `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Days 3650) -MultipleInstances IgnoreNew
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Output "REGISTERED $taskName"
