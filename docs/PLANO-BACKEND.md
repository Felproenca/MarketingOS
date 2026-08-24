# Plano Completo do Backend — MarketingOS Cockpit

> Documento definitivo de referência (2026-08). Contrato congelado: `docs/contrato-execucao.md`.

## 1. Arquitetura

```
┌────────────────────────────────────────────────────────────────┐
│  OPERADOR: Dashboard (app.mkos.online) + Hermes (Telegram/MCP)   │
│  CLIENTE:  Portal (rota /dados/[slug]) + chat assistente         │
├────────────────────────────────────────────────────────────────┤
│  VERCEL (serverless API + frontend)      app.mkos.online         │
│  SUPABASE (Postgres + REST + Auth + RLS) upqvhnifgzhmhwvsuock    │
│  WORKER (pm2, local)  → scheduler + dispatch + code agent        │
│  MCP (marketingos-mcp) → tools para o Hermes                     │
│  MAILBOX (EcosystemCore) → ponte com OSs (EditorOS/DesingOS/…)   │
└────────────────────────────────────────────────────────────────┘
```

## 2. Endpoints

| Endpoint | Métodos | Auth |
|---|---|---|
| `/api/health` | GET | — |
| `/api/missions` · `/api/missions/:id` | GET/POST/DELETE | JWT |
| `/api/admin/operations` | GET (painel/report) · POST (create/run_sync/create_mission/ingest) | Admin + secret |
| `/api/admin/clients` (+ `?action=reference`) | GET/POST/PUT | JWT |
| `/api/admin/artifacts` | GET/POST/PATCH | JWT |
| `/api/admin/ai/[action]` | GET/POST | JWT |
| `/api/integrations/meta/client?action=` | connect/callback/status/insights/ads | JWT |
| `/api/integrations/meta/callback` · `/publish` | GET/POST | secret |
| `/api/integrations/google?action=` | connect/callback/status/youtube/ads | JWT |
| `/api/client/[slug]` | GET (overview do cliente) | JWT + membro |

## 3. Modelo de dados

- **Clientes**: `client_profiles` (incl. `has_assets`) · `client_references` · `client_truth_versions` · `client_memberships` · `client_quotas` (plano, tokens, `plan_value_brl`, `max_monthly_cost_brl`, `used_cost_brl`)
- **Trabalho**: `work_requests` · `work_request_events` · `media_jobs` · `media_job_events`
- **Resultado**: `artifacts` · `artifact_versions` · `artifact_approvals` · `execution_results`
- **IA**: `ai_runs` (metering) · `ai_usage_events` (custo) · `ai_client_policies` · `ai_optimization_loops` · `provider_connections` · `output_costs`
- **Conexões**: `connections` (Meta/Google OAuth, token criptografado) · `oauth_sessions`
- **Dados**: `data_now_raw` · `data_now_normalized` · `data_now_sync_runs` · `sync_schedules`

## 4. Capabilities (75 skills no registry; 68 selecionáveis)

- **Texto (LLM + QA + calibração):** strategy · research · analysis · audit · funnel_strategy · traffic · design · carousel · post · coletar_referencia
- **Geração:** image_generate · video_generate (Fal, ou assets do cliente)
- **Dispatch OS:** video_edit (EditorOS) · publish (MediaOS) · data_sync (GrowthOS)
- **Code:** agentic_code (code mode — worker roda programa Node)
- Resolução canônica: `canonical` → `operational` → `available` (`skill-registry.js`)

## 5. Fluxo de execução

```
POST /api/missions (ou MCP mkos_create_mission)
→ quota check (tokens E custo R$) → 402 se exceder
→ work_request + media_job + ai_run (idempotência/cache por hash)
→ executeJob:
   texto → fallback de providers (deepseek→anthropic→openai)
         → SKILL.md real + client_truth + calibração (benchmarks/evitar) + QA
   OS   → dispatch mailbox → worker → OS → ingest
   code → code agent (escreve/roda programa)
→ artifact + execution_result + metering (tokens/custo) + dedução de cota
```

## 6. Custo e margem (modelo R$500/mês)

- `output_costs` (tokens por capability) + `client_quotas` (plano R$500, teto R$50 = 10%).
- Custo real metrificado em `ai_usage_events` + `used_cost_brl`.
- Relatório: `GET /api/admin/operations?report=client:<slug>` → tokens, R$, margem %, aprovação, desperdício (rejeitados).
- **Otimização:** code mode (2k tokens) · cache de outputs · `has_assets` (não gera mídia) · fallback · loop de otimização.

## 7. Hermes (agente de operação) — MCP

- MCP server stdio: `marketingos-mcp/server.mjs` (sem dependências).
- 8 tools: status · clients · skills · create_mission · list_missions · artifacts · report · run_sync.
- Registrado: `hermes mcp add marketingos` (8/8 habilitadas). Segredos ficam no server, nunca no agente.
- Frente do cliente (chat assistente) consumirá a franquia dele (metering pronto).

## 8. Qualidade de código

- **Testes: 21/21 passando** (`npm test`): ai-router (10) · skill-registry (7) · instagram-carousel (4).
- Os 3 testes de roteamento do registry que falhavam (antes da resolução canônica) **foram corrigidos**: `skillForCapability`/`skillForRequestType` agora priorizam `canonical → operational → available`.
- **Validação do registry:** `npm run registry:validate` → `registry OK: 75 skills | 18 operational`.

## 9. Estado

| Bloco | Status |
|---|---|
| Fases 1–4 + A, B, C, D (backend) | ✅ |
| Worker pm2 · agenda · code agent | ✅ |
| Conexões Meta/Google | ✅ backend (Portal conecta) |
| Migrações 001–010 | ✅ aplicadas |
| **Hermes MCP** | ✅ |
| **Frontend (operador + cliente + Google no Portal + chat)** | ⏳ a construir |

## 10. Contrato congelado

`docs/contrato-execucao.md` — registry v3, capabilities, roteamento, `execution_result`, mailbox, quota, code mode. Nenhuma alteração sem mapeamento prévio.
