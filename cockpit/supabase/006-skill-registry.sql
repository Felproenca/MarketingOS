-- Skill registry linkage: which skill (registry.json) produced each job and AI run.
-- Additive migration. Safe to apply at any time; application code falls back when
-- the columns are not present yet.
alter table public.media_jobs add column if not exists skill_id text;
alter table public.ai_runs add column if not exists skill_id text;
create index if not exists media_jobs_skill_idx on public.media_jobs(skill_id);
create index if not exists ai_runs_skill_idx on public.ai_runs(skill_id);
