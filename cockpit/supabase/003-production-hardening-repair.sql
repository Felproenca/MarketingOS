-- Repair for a partially applied 002-production-hardening.sql.
-- Run this only after data-now.sql and 001-mediaos-core.sql, in the live
-- Supabase SQL editor. Every statement is additive/idempotent.

alter table public.media_jobs
  add column if not exists context_hash text,
  add column if not exists context_status text not null default 'pending',
  add column if not exists attempt_count integer not null default 0,
  add column if not exists max_attempts integer not null default 3,
  add column if not exists next_attempt_at timestamptz,
  add column if not exists locked_at timestamptz,
  add column if not exists locked_by text,
  add column if not exists idempotency_key text,
  add column if not exists lease_expires_at timestamptz,
  add column if not exists heartbeat_at timestamptz,
  add column if not exists last_error text;

create unique index if not exists media_jobs_idempotency_idx
  on public.media_jobs(idempotency_key)
  where idempotency_key is not null;

create index if not exists media_jobs_queue_idx
  on public.media_jobs(status, next_attempt_at, created_at);

create index if not exists media_jobs_lease_idx
  on public.media_jobs(status, lease_expires_at)
  where status = 'running';

create or replace function public.claim_media_job(
  p_worker_id text,
  p_job_id uuid default null,
  p_lease_seconds integer default 900
)
returns setof public.media_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed public.media_jobs;
begin
  update public.media_jobs
     set status = 'queued', locked_at = null, locked_by = null,
         lease_expires_at = null, heartbeat_at = null, updated_at = now()
   where status = 'running'
     and lease_expires_at is not null
     and lease_expires_at < now();

  select * into claimed
    from public.media_jobs
   where status = 'queued'
     and (next_attempt_at is null or next_attempt_at <= now())
     and (p_job_id is null or id = p_job_id)
     and attempt_count < max_attempts
   order by case priority when 'urgent' then 0 when 'high' then 1 else 2 end,
            created_at asc
   limit 1
   for update skip locked;

  if claimed.id is null then return; end if;

  update public.media_jobs
     set status = 'running',
         attempt_count = attempt_count + 1,
         retry_count = greatest(retry_count, attempt_count + 1),
         started_at = coalesce(started_at, now()),
         locked_at = now(), locked_by = p_worker_id,
         heartbeat_at = now(),
         lease_expires_at = now() + make_interval(secs => greatest(60, p_lease_seconds)),
         updated_at = now()
   where id = claimed.id
   returning * into claimed;
  return next claimed;
end;
$$;

revoke all on function public.claim_media_job(text, uuid, integer) from public, anon, authenticated;
grant execute on function public.claim_media_job(text, uuid, integer) to service_role;
