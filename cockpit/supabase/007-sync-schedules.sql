-- 007-sync-schedules.sql — agenda de extração de dados (aditivo)
-- Permite que o worker rode o scheduler com default + override por cliente/fonte.
create table if not exists public.sync_schedules (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  source text not null check (source in ('instagram', 'meta_ads', 'youtube', 'google_ads')),
  interval_hours integer not null default 24,
  enabled boolean not null default true,
  last_run_at timestamptz,
  next_run_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, source)
);

alter table public.sync_schedules enable row level security;
revoke all on public.sync_schedules from anon, authenticated;
grant all on public.sync_schedules to service_role;

create index if not exists sync_schedules_next_run_idx on public.sync_schedules(enabled, next_run_at);

-- Seed: default diário (madrugada) para clientes que já têm conexão de dados.
insert into public.sync_schedules (client_id, source, interval_hours, next_run_at)
select c.client_id, s.source, 24, now()
from public.client_profiles c
cross join (values ('instagram'), ('meta_ads'), ('youtube'), ('google_ads')) as s(source)
where c.status = 'active'
on conflict (client_id, source) do nothing;
