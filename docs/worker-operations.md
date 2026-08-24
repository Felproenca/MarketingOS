# Operação contínua do MediaOS

O worker que usa EditorOS, FluxOS e GrowthOS roda como processo Node persistente via PM2 no Windows.

## Estado instalado

- processo: `mediaos-worker`
- comando: `scripts/mediaos/worker.mjs --loop`
- reinício automático do processo: PM2
- persistência após logon: tarefa agendada `MarketingOS MediaOS Worker`
- bootstrap: `scripts/mediaos/start-worker-pm2.cmd`
- logs PM2: `%USERPROFILE%\.pm2\logs\mediaos-worker-out.log` e `mediaos-worker-error.log`

## Verificação

```powershell
pm2.cmd list
pm2.cmd logs mediaos-worker --lines 50 --nostream
Get-ScheduledTask -TaskName 'MarketingOS MediaOS Worker'
```

O teste de recuperação executado em 2026-08-17 matou o daemon PM2, iniciou a tarefa agendada manualmente e confirmou o processo `mediaos-worker` online com `LastTaskResult = 0`.

## Limite

Esta é uma implantação persistente no ambiente Windows do operador, não um worker cloud multi-instância. Para alta disponibilidade real, o mesmo processo deve ser movido para um host persistente com volume/ffmpeg e secrets gerenciados; a fila Supabase e o claim idempotente já suportam essa migração.

O pacote reproduzível está em [`deploy/mediaos/README.md`](../deploy/mediaos/README.md), com Dockerfile e Compose para um host persistente. Ele ainda não foi publicado em cloud porque não há provedor/credenciais cloud configurados.
