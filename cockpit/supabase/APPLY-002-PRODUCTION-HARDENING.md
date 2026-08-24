# Aplicacao do hardening de producao

Execute no Supabase SQL Editor, nesta ordem:

O hardening e aditivo. Ele nao substitui `data-now.sql` nem `001-mediaos-core.sql`.

## Projeto ainda sem hardening

Execute no Supabase SQL Editor, nesta ordem:

1. `data-now.sql` (somente se o projeto ainda nao tiver a base)
2. `001-mediaos-core.sql`
3. `002-production-hardening.sql`

## Projeto com aplicacao parcial

No projeto live auditado, o core e parte do hardening ja existem, mas faltam
`media_jobs.lease_expires_at` e `public.claim_media_job`. Nesse caso, execute
somente `003-production-hardening-repair.sql`. Ela e idempotente e foi criada
especificamente para completar a aplicacao parcial sem duplicar dados.

A 002 e aditiva. Nao apaga nem substitui as migrations anteriores.

## Verificacao

```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'media_jobs'
  and column_name in ('attempt_count', 'max_attempts', 'next_attempt_at', 'lease_expires_at', 'idempotency_key')
order by column_name;

select to_regprocedure('public.claim_media_job(text,uuid,integer)');

select indexname
from pg_indexes
where schemaname = 'public'
  and indexname = 'media_jobs_idempotency_idx';
```

Resultado esperado: as colunas listadas, a procedure
`claim_media_job(text,uuid,integer)` e o indice
`media_jobs_idempotency_idx`.

Depois disso, na raiz do repositorio, execute:

```powershell
npm run live:schema:audit
```

O resultado esperado e `"ok": true` e `"hardeningApplied": true`.
