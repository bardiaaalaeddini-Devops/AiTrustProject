param([ValidateSet('start','stop','status')][string]$Action = 'start')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$pgBin = Join-Path $projectRoot '.local/pgsql/bin'
$pgData = Join-Path $projectRoot '.local/pgdata'
if (!(Test-Path (Join-Path $pgData 'PG_VERSION'))) { throw 'Local PostgreSQL has not been initialized.' }
if ($Action -eq 'start') {
 & "$pgBin/pg_ctl.exe" status -D $pgData *> $null
 if ($LASTEXITCODE -eq 0) { Write-Output 'PostgreSQL is already running.'; exit 0 }
 & "$pgBin/pg_ctl.exe" start -D $pgData -l (Join-Path $projectRoot '.local/postgres.log') -w
} elseif ($Action -eq 'stop') { & "$pgBin/pg_ctl.exe" stop -D $pgData -m fast -w }
else { & "$pgBin/pg_ctl.exe" status -D $pgData }
exit $LASTEXITCODE
