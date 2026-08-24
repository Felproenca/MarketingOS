# Aplicar a migração MediaOS

A migração é aditiva. Ela não substitui o Supabase: cria as tabelas do MediaOS dentro do mesmo projeto e mantém `work_requests` compatível.

## Aplicação

1. Abra o projeto Supabase correto.
2. Vá em **SQL Editor**.
3. Cole e execute o conteúdo de [`001-mediaos-core.sql`](./001-mediaos-core.sql).
4. Confirme que não houve erro de permissão ou de schema.

## Verificação

Execute:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'media_jobs',
    'media_job_events',
    'artifacts',
    'artifact_versions',
    'artifact_approvals',
    'ai_runs',
    'provider_connections'
  )
order by table_name;
```

O resultado deve conter as sete tabelas.

## Depois da aplicação

O fluxo de criação de pedido no Cockpit passará a criar também:

```text
work_request → media_job → ai_run
```

A geração efetiva do artifact continua sendo responsabilidade do executor conectado ao MediaOS; a migração apenas cria o estado persistente e auditável para isso.
