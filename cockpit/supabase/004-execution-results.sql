-- Technical execution receipts from EcosystemCore/MediaOS.
-- Additive: keeps artifacts and media_jobs as the operational source of truth.
create table if not exists public.execution_results (
  id uuid primary key default gen_random_uuid(),
  correlation_id text not null,
  executor text not null,
  result text not null check (result in ('completed', 'blocked', 'failed')),
  job_id uuid references public.media_jobs(id) on delete set null,
  client_id text references public.client_profiles(client_id) on delete cascade,
  artifact_refs jsonb not null default '[]'::jsonb,
  quality_refs jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  next_action text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (correlation_id, executor)
);

create index if not exists execution_results_job_idx on public.execution_results(job_id, created_at desc);
create index if not exists execution_results_client_idx on public.execution_results(client_id, created_at desc);
alter table public.execution_results enable row level security;
revoke all on public.execution_results from anon, authenticated;
grant all on public.execution_results to service_role;
