# Auditoria do schema live

Comando:

```powershell
npm run live:schema:audit
```

A auditoria verifica:

- tabelas MediaOS do `001-mediaos-core.sql`;
- colunas de onboarding e hardening do `002-production-hardening.sql`;
- função atômica `public.claim_media_job`.

Estado verificado em 18/08/2026:

- `001-mediaos-core.sql`: presente;
- parte de onboarding em `client_profiles`: presente;
- colunas de lease/tentativas em `media_jobs`: presentes;
- `claim_media_job`: presente;
- `execution_results`, `ai_client_policies`, `ai_usage_events`, `ai_optimization_loops`: presentes;
- colunas `skill_id` em `media_jobs`/`ai_runs`: presentes (migração 006);
- resultado: `hardeningApplied: true`, `executionBridgeApplied: true`, `aiRoutingApplied: true`, `ok: true`.

O worker roda em fail-closed sem `MEDIAOS_ALLOW_SCHEMA_FALLBACK`, com claim atômico disponível.
