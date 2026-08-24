-- MediaOS core: jobs, artifacts, approvals and AI execution records.
-- Apply after data-now.sql. This migration is additive and keeps work_requests compatible.

create table if not exists public.media_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.work_requests(id) on delete set null,
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  job_type text not null,
  capability text not null,
  status text not null default 'queued',
  priority text not null default 'normal',
  executor text,
  input jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,
  error text,
  retry_count integer not null default 0,
  requires_approval boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.media_job_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.media_jobs(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  job_id uuid references public.media_jobs(id) on delete set null,
  artifact_type text not null,
  title text not null,
  status text not null default 'draft',
  current_version integer not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.artifact_versions (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  version integer not null,
  kind text not null,
  storage_path text,
  preview_url text,
  manifest jsonb not null default '{}'::jsonb,
  qa jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  unique (artifact_id, version)
);

create table if not exists public.artifact_approvals (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references public.artifacts(id) on delete cascade,
  version integer not null,
  actor_id uuid,
  actor_role text not null,
  decision text not null,
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_runs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.media_jobs(id) on delete set null,
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  capability text not null,
  provider text not null,
  model text,
  credential_source text not null default 'marketingos',
  input_tokens integer,
  output_tokens integer,
  estimated_cost numeric(12,6),
  status text not null default 'started',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  client_id text not null references public.client_profiles(client_id) on delete cascade,
  provider text not null,
  connection_type text not null,
  secret_ref text not null,
  scopes text[] not null default '{}',
  status text not null default 'active',
  billing_owner text not null default 'marketingos',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, provider, connection_type)
);

create index if not exists media_jobs_client_status_idx on public.media_jobs(client_id, status, created_at desc);
create index if not exists media_job_events_job_idx on public.media_job_events(job_id, created_at desc);
create index if not exists artifacts_client_status_idx on public.artifacts(client_id, status, updated_at desc);
create index if not exists ai_runs_client_idx on public.ai_runs(client_id, created_at desc);

alter table public.media_jobs enable row level security;
alter table public.media_job_events enable row level security;
alter table public.artifacts enable row level security;
alter table public.artifact_versions enable row level security;
alter table public.artifact_approvals enable row level security;
alter table public.ai_runs enable row level security;
alter table public.provider_connections enable row level security;

revoke all on public.media_jobs from anon, authenticated;
revoke all on public.media_job_events from anon, authenticated;
revoke all on public.artifacts from anon, authenticated;
revoke all on public.artifact_versions from anon, authenticated;
revoke all on public.artifact_approvals from anon, authenticated;
revoke all on public.ai_runs from anon, authenticated;
revoke all on public.provider_connections from anon, authenticated;

grant all on public.media_jobs to service_role;
grant all on public.media_job_events to service_role;
grant all on public.artifacts to service_role;
grant all on public.artifact_versions to service_role;
grant all on public.artifact_approvals to service_role;
grant all on public.ai_runs to service_role;
grant all on public.provider_connections to service_role;
