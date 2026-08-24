# Aplicar a migração 007 — sync_schedules

Aditiva. Execute no **SQL Editor** do Supabase:

1. `007-sync-schedules.sql`

Validação:

```sql
select client_id, source, interval_hours, enabled, next_run_at
from public.sync_schedules
order by client_id, source;
```

O worker (`node cockpit/scripts/worker.mjs`) já lê essa tabela no scheduler: fontes
com `next_run_at <= now()` e `enabled=true` são marcadas como devidas e têm o
`next_run_at` atualizado (+ interval_hours). A extração real (pull da API Google/Meta)
é disparada quando as credenciais estiverem configuradas.
