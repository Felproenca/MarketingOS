# Aplicar a migração 008 — client_quotas + output_costs

Aditiva. Execute no **SQL Editor** do Supabase:

1. `008-client-quotas.sql`

Validação:

```sql
select * from public.output_costs order by capability;
select client_id, plan, monthly_token_quota, used_tokens from public.client_quotas;
```

O fluxo já está ligado no backend:
- **Bloqueio**: `POST /api/missions` → se a cota do cliente está esgotada → `402 quota_exceeded`.
- **Dedução**: após output executado → `used_tokens += tokens_per_output` + evento em `ai_usage_events`.

Para ajustar planos/custos por cliente, basta atualizar `client_quotas` (quota)
ou `output_costs` (custo por capability).
