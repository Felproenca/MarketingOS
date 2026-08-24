# Inicia o worker do Cockpit em segundo plano (watch), se ainda não estiver rodando.
# Usado pelo Scheduled Task "MarketingOS_Worker" (a cada 5 min) para auto-restart.
$ErrorActionPreference = 'SilentlyContinue'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path   # scripts/
$root = Split-Path -Parent $scriptDir                            # cockpit/
$worker = Join-Path $scriptDir 'worker.mjs'
$pidFile = Join-Path $root '.worker.pid'
$outLog = Join-Path $root '.worker.out.log'
$errLog = Join-Path $root '.worker.err.log'
$node = 'C:\Program Files\nodejs\node.exe'

# Já está rodando?
if (Test-Path $pidFile) {
  $existing = Get-Content $pidFile -ErrorAction SilentlyContinue
  $proc = Get-Process -Id $existing -ErrorAction SilentlyContinue
  if ($proc) { exit 0 }
}

# Inicia em watch (sem --once), em segundo plano, com log
$proc = Start-Process -FilePath $node -ArgumentList @($worker) -WorkingDirectory $root -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
if ($proc) { $proc.Id | Set-Content $pidFile } else { Write-Error 'Start-Process falhou.' }
