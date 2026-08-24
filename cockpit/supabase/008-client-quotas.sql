-- 008-client-quotas.sql — cota por plano (aditivo)
-- Controle de uso: cada output de cada capability tem um custo fixo em tokens.
create table if not exists public.client_quotas (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  plan text not null default 'basico',
  monthly_token_quota bigint not null default 100000,
  used_tokens bigint not null default 0,
  reset_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id)
);

alter table public.client_quotas enable row level security;
revoke all on public.client_quotas from anon, authenticated;
grant all on public.client_quotas to service_role;

create table if not exists public.output_costs (
  id uuid primary key default gen_random_uuid(),
  capability text not null unique,
  tokens_per_output integer not null,
  description text
);

insert into public.output_costs (capability, tokens_per_output, description) values
  ('carousel', 6000, 'Geração estruturada + QA de carrossel'),
  ('post', 4000, 'Geração estruturada + QA de post'),
  ('audit', 8000, 'Auditoria profunda de site/perfil'),
  ('funnel_strategy', 6000, 'Estratégia dos 4 funis'),
  ('traffic', 7000, 'Plano de mídia + matemática'),
  ('design', 7000, 'Blueprint de design premium'),
  ('strategy', 4000, 'Estratégia/brand'),
  ('research', 5000, 'Pesquisa de tema'),
  ('analysis', 4000, 'Análise de dados'),
  ('coletar_referencia', 5000, 'Coletor de referência'),
  ('agentic_code', 2000, 'Code agent (código, não texto)'),
  ('data_sync', 500, 'Sincronização de dados'),
  ('publish', 1500, 'Publicação')
on conflict (capability) do nothing;

-- Seed: cota default para clientes ativos (ajustável por plano depois)
insert into public.client_quotas (client_id, plan, monthly_token_quota, used_tokens, reset_at)
select client_id, 'basico', 100000, 0, date_trunc('month', now()) + interval '1 month'
from public.client_profiles
where status = 'active'
on conflict (client_id) do nothing;
