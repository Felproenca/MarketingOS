# Aplicar a migração 010 — cota em modo custo

Aditiva. Execute no **SQL Editor** do Supabase:

1. `010-cost-quota.sql`

Validação:

```sql
select client_id, plan, plan_value_brl, max_monthly_cost_brl, used_tokens, used_cost_brl
from public.client_quotas order by client_id;
```

Efeito: além da cota em tokens, o sistema bloqueia quando o **custo real** do
cliente atinge `max_monthly_cost_brl` (default R$50 = 10% do plano R$500).
Ajuste por cliente/plano quando necessário:

```sql
update public.client_quotas set max_monthly_cost_brl = 100 where client_id = 'cliente-premium';
```
