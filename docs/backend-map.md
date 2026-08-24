# Backend Map

This file is the quick reference for the backend layers already in the repo.

## Migration order

1. [`cockpit/supabase/data-now.sql`](../cockpit/supabase/data-now.sql)
2. [`cockpit/supabase/001-mediaos-core.sql`](../cockpit/supabase/001-mediaos-core.sql)
3. [`cockpit/supabase/002-production-hardening.sql`](../cockpit/supabase/002-production-hardening.sql)

## What each script does

| File | Role | Replaces anything? |
|---|---|---|
| `data-now.sql` | Base operational schema: client profiles, memberships, references, requests, events, connections, sync tables. | No |
| `001-mediaos-core.sql` | Adds the MediaOS control plane: jobs, job events, artifacts, versions, approvals, AI runs, provider connections. | No |
| `002-production-hardening.sql` | Adds onboarding integrity, truth versioning, job retry fields, locking, idempotency, and audit tables. | No |

## Current execution chain

> Importante: a cadeia de codigo suporta esses controles e a auditoria live confirma `hardeningApplied: true`. `claim_media_job` e os campos de lease estao presentes no Supabase; o worker opera em fail-closed sem fallback.

Request flow:

`work_requests` -> `media_jobs` -> `ai_runs` -> `artifacts` -> `artifact_versions` -> `artifact_approvals`

Runtime flow:

`cockpit/api/admin/operations.js` -> `media_jobs` creation -> `scripts/mediaos/worker.mjs` -> `scripts/operations/cockpit-worker.mjs` -> `scripts/operations/execute-carousel-from-operation.mjs`

Video flow:

`cockpit/api/admin/operations.js` -> `media_jobs(job_type=video|generative_video)` -> `scripts/mediaos/video-executor.mjs` -> Supabase Storage -> `artifacts` / `artifact_versions`.

Production controls now present:

- retry with exponential backoff and timeout-aware AI adapters
- atomic job claim through `claim_media_job`, leases and stale-job recovery
- idempotency key per request/job
- blocked state for invalid Client Truth, missing video input and unconfigured generative providers
- operator artifact decision endpoint at `/api/admin/artifacts`
- audit trail in `audit_events` and execution trail in `media_job_events`

## What is safe to remove

Do not remove these yet:

- `scripts/mediaos/worker.mjs`
- `scripts/operations/cockpit-worker.mjs`
- `scripts/operations/execute-carousel-from-operation.mjs`

They are not dead code. Each one is used by the next layer in the chain.

Safe removal only applies to scripts that are:

- not referenced by any command, worker, or API route
- not needed for local validation
- not the only implementation of a live path

## What still needs to be applied in Supabase

Nada pendente no schema de producao. `001`, `002`/`003`, `004`, `005` e `006` estao aplicados; `npm run live:schema:audit` retorna `ok: true`. Mantenha a auditoria como gate de readiness em qualquer deploy.

## Notes

- `data-now.sql` stays in place.
- `001-mediaos-core.sql` does not replace `data-now.sql`.
- `002-production-hardening.sql` does not replace either file. It only hardens them.
## Worker de produção

O worker MediaOS é um processo contínuo separado do Vercel:

```powershell
$env:MEDIAOS_WORKER_ID = "mediaos-prod-01"
$env:MEDIAOS_WORKER_LOOP = "1"
$env:MEDIAOS_POLL_INTERVAL_MS = "15000"
npm run mediaos:worker:loop
```

O Cockpit/Vercel cria pedidos e jobs; esse processo consulta a fila, executa os OS locais, registra artifacts no Storage e atualiza `ai_runs`. Não se deve executar o worker longo dentro de uma função serverless.
