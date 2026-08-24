# Aplicar a ponte de execução

Execute no SQL Editor do mesmo projeto Supabase, depois de `001`, `002` e `003`:

```sql
-- conteúdo de 004-execution-results.sql
```

Valide localmente:

```powershell
npm run live:schema:audit
```

O resultado esperado inclui:

```json
"executionBridgeApplied": true
```

## Segredo interno

Configure o mesmo valor em:

- Vercel do Cockpit: `MEDIAOS_EXECUTION_INGEST_SECRET`
- ambiente do executor/EcosystemCore: `MEDIAOS_EXECUTION_INGEST_SECRET`
- EcosystemCore: `MARKETINGOS_COCKPIT_URL=https://app.mkos.online`

Esse segredo é somente para a ponte máquina-a-máquina. Não deve ser usado no frontend nem compartilhado com clientes.

## Enviar um retorno

```powershell
node EcosystemCore/src/cli.js ingest-execution-result <execution-result.json> `
  --job-id <uuid-do-media-job> `
  --client-id <client-id>
```

O endpoint atualiza `execution_results`, `media_jobs.result`, o status do job e registra `media_job_events`. Para execução concluída, o job entra em `review`; aprovação continua passando pelo artifact gate.
