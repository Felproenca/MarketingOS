-- 010-cost-quota.sql — cota em modo CUSTO (aditivo)
-- Valida os 10%: o cliente paga o plano e o operador gasta até max_monthly_cost_brl.
alter table public.client_quotas add column if not exists plan_value_brl numeric(10,2) not null default 500;
alter table public.client_quotas add column if not exists max_monthly_cost_brl numeric(10,2) not null default 50;
alter table public.client_quotas add column if not exists used_cost_brl numeric(10,2) not null default 0;
