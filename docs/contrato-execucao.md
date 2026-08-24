# Contrato de Execução — MarketingOS (CONGELADO)

> **REGRA DE OURO:** nenhuma atualização pode alterar este contrato, salvo
> necessidade real. Qualquer alteração precisa ser **mapeada antes de modificar**
> — listar todos os consumidores e emissores impactados (Cockpit, AI Router,
> executor, FluxOS, MediaOS, EditorOS, DesingOS, GrowthOS) e ser aprovada, para
> **não quebrar a função do sistema**.
>
> Mudanças permitidas: **aditivas** (adicionar campos novos, nunca remover ou
> renomear campos em uso) e/ou **nova versão do contrato** (com período de
> compatibilidade). Quebra só com justificativa mapeada e aprovada.

---

## 1. Registry de skills (`skills/registry.json` — v3, contrato v1)

Top-level: `version` (registry), `contract_version: "1"` (contrato de execução),
`policy`, `skills[]`. Fonte declarativa única do catálogo. Campos por skill:

| Campo | Valores |
|---|---|
| `skill_id` | string — identificador canônico |
| `label`, `description`, `category`, `owner` | exibição + dono |
| `selectable` | boolean — false = sistema |
| `path` | caminho do SKILL.md ou `null` (executor-defined) |
| `status` | `operational` \| `available` \| `archived` |
| `capability` | token de capability (ver §2) ou `null` |
| `request_types` | string[] |
| `requires` | string[] — pré-condições |
| `executor` | string — executor dono |
| `output` | string[] |
| `qa` | string[] |
| `approval_required` | boolean |
| `providers_allowed` | string[] |
| `fallback` | `blocked` \| `prompt_and_upload` |

## 2. Famílias de execução (convenção do executor)

O executor é **registry-driven** para texto: qualquer capability que não esteja
na lista abaixo cai automaticamente na família `text` (LLM via provider do
registry) — ou seja, **nova capability de texto = zero mudança de código**.

| Capability | Família | Backend |
|---|---|---|
| `image_generate` | `generate_image` | Fal (provider) |
| `video_generate` | `generate_video` | Fal (provider) |
| `publish` | `publish` | Meta (plataforma) |
| `data_sync` | `data_sync` | GrowthOS (data-now) |
| `video_edit` | `video_edit` | EditorOS |
| **qualquer outra** | `text` | DeepSeek/Anthropic/OpenAI (provider do registry) |

## 3. Capabilities (tokens do AI Router)

`strategy`, `copy`, `carousel`, `post`, `research`, `ads`, `automation`,
`video_edit`, `video_generate`, `publish`, `analysis`, `image_generate`.

> Adicionar capability nova é aditivo (ok). Remover/renomear exige mapeamento.

## 4. Roteamento (`work_request`)

`request_type → target_system`:
carousel→fluxos · video/creative→editoros · image→desingos · post→mediaos ·
research/analysis→growthos · ads/automation/publish→mediaos ·
strategy/funnel/prospecting/acquisition/relationship→marketingos · data_sync→data_now.

Campos do `work_request`: `client_id`, `title`, `request_type`, `objective`,
`priority`, `source_system`, `target_system`, `status`, `requires_approval`,
`reference_snapshot`, `payload`.

`reference_snapshot` = `{ client, brand_profile, voice_profile, offers,
constraints, approved_examples, notes, captured_at }`.

## 5. Job (`media_jobs`)

`id` (uuid) · `request_id` · `client_id` · `job_type` · `capability` · `status` ·
`priority` · `executor` · `input` (jsonb) · `result` (jsonb) · `error` ·
`requires_approval` · `created_by` · timestamps · `skill_id` (006).

**Status do job:** `queued → routed → running → review → approved → published →
done` (e `error` / `blocked`).

## 6. Contrato de retorno (`execution_result`) — MAIS SENSÍVEL

POST com segredo (`x-mediaos-execution-secret` / `MEDIAOS_EXECUTION_INGEST_SECRET`)
para `ingest_execution_result`:

```json
{
  "jobId": "<uuid>",
  "clientId": "<slug>",
  "executionResult": {
    "correlation_id": "<uuid>",
    "contract_type": "execution_result",
    "result": "completed | blocked | failed",
    "executor": "<nome>",
    "artifact_refs": [],
    "quality_refs": [],
    "blockers": [],
    "next_action": "<texto|null>"
  },
  "manifest": {},
  "quality": {}
}
```

> ❌ **Nunca** remover/renomear `correlation_id`, `contract_type`, `result`,
> `job_id`/`jobId`, `client_id`/`clientId`. Adições são bem-vindas; renomeações
> quebram a ingestão.

## 7. Dispatcher de mailbox (Cockpit → OS)

Capabilities de OS não executam inline no Cockpit; o executor marca o job como
`routed` com `executor=ecosystem:<OS>` e um `dispatch` no `result`. O **worker
local** (`node cockpit/scripts/worker.mjs`, ou `--once`) faz a ponte:

```text
media_jobs (routed, ecosystem:*) → request-*.json no mailbox/<OS>/<correlation>/
→ OS executa → execution-<correlation>.json → execution_results + media_jobs(review)
```

**Request** (escrito pelo worker) — `mailbox/<OS>/<correlation>/request-marketingos-<correlation>.json`:
`schema_version`, `contract_type: "production_request"`, `contract_id`,
`correlation_id`, `source_system: "marketingos"`, `target_system`, `client_id`,
`job_id`, `capability`, `objective`, `format`, `deliverables`, `input`, `created_at`.

**Return** (escrito pelo OS) — `execution-<correlation>.json`:
`contract_type: "execution_result"`, `correlation_id`, `result`
(`completed|failed|blocked`), `executor`, `artifact_refs`, `quality_refs`,
`blockers`, `next_action`, `manifest`.

> ❌ `correlation_id` é a chave de rastreio ponta-a-ponta: nunca alterar seu
> formato/uso. Adições ao request/return são permitidas (aditivas).

## 8. API de missões (Cockpit)

- `GET /api/missions` → `{ capabilities, skills, jobs, artifacts, clients, executionResults }`
- `POST /api/missions` → cria + executa → `{ request, job, route, execution }`
- `GET /api/missions/:id` → `{ job, artifacts }`
- `POST /api/missions/:id` → re-executa → `{ execution, job }`
- `DELETE /api/missions/:id` → `{ ok: true }`

## 9. Processo para ALTERAR o contrato

1. **Mapear** todos os consumidores/emissores impactados (quem lê, quem escreve).
2. **Propor** como aditivo (campo novo) ou como contrato v2 com compatibilidade.
3. **Aprovar** antes de implementar.
4. **Atualizar este documento** na mesma mudança.
5. **Migrar** os emissores primeiro, depois os consumidores (janela de convivência).

## 10. Extensões aditivas (2026-08-19)

### 10.1 Coletor de referência (motor de qualidade)

Capability `coletar_referencia`. Entrada: vídeo ou carrossel de referência.
Saída: análise reversa (hook, narrativa, visual, CTA, ritmo) + proposta de
**skill nova / aprimoramento de SKILL.md / benchmark** (inteligência).
O coletor alimenta as 4 frentes: criação, funil, tráfego e design.

### 10.2 Contas de IA — dois modos por provider

`provider_connections` ganha `mode` aditivo: `api_key` | `subscription`.

| Provider | API | Assinatura mensal (OAuth/headless, como o PI) |
|---|---|---|
| Anthropic (Claude) | ✅ | ✅ acessa **e executa** (agentes) |
| OpenAI (GPT) | ✅ | ✅ acessa **e executa** (agentes) |
| DeepSeek | ✅ | — |
| Fal / Kie | ✅ | — |

Segredo sempre criptografado (`secret_ref`), refresh automático, nunca logado.

`provider_connections.mode` (aditivo): `api_key` | `subscription` — define se o
provider usa chave de API ou conta mensal (OAuth/headless, como o PI). O executor
já tem **fallback de providers** (preferido → deepseek → anthropic → openai) e
**metering** (input/output tokens + custo estimado por `ai_run`).

### 10.3 Conexões de dados

| Fonte | Status | Alimenta |
|---|---|---|
| Meta (Instagram) | ✅ implementado | conteúdo, insights |
| Google YouTube | ➕ aditivo (OAuth, padrão Meta) | pesquisa, conteúdo, concorrência |
| Google Ads | ➕ aditivo (OAuth, padrão Meta) | tráfego, dashboard, data_sync |
| GrowthOS (data-now) | ✅ | dados normalizados |

### 10.4 Agenda de sincronização (`sync_schedules`)

Tabela aditiva (migração `007-sync-schedules.sql`): `client_id`, `source`
(`instagram|meta_ads|youtube|google_ads`), `interval_hours`, `enabled`,
`last_run_at`, `next_run_at`. Default: **24h (madrugada)** + override por
cliente/fonte. O worker roda o scheduler a cada ciclo e atualiza `next_run_at`.

### 10.5 Endpoint Google (aditivo)

`api/integrations/google?action=connect|callback|status|youtube|ads`
(uma única função; callback usa redirect URI com query). Credenciais via env:
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`,
`GOOGLE_ADS_DEVELOPER_TOKEN`.

### 10.6 Calibração pelo coletor (aditivo)

Na execução de `carousel`/`post`, o executor busca os últimos artifacts de
`coletar_referencia` do cliente e injeta `benchmark_updates` + `winning_patterns`
no prompt — a criação passa a ser calibrada pelos dados coletados.

### 10.7 DeepSeek Harness (code mode) — CANDIDATO

Terceiro modo de execução: `harness_code` (agente de código — planejar, editar,
executar, testar, iterar). Aplicação: `agent-builder`, site premium (código real),
pipelines dos OSs, manutenção do próprio sistema. Exige sandbox (`local|docker|ssh`)
+ aprovação humana antes de aplicar em produção. Não altera o contrato atual — é
um novo provider/família, aditivo.

### 10.8 Cota por plano (modelo de negócio) — ADITIVO

Cada cliente pode ter **todas ou apenas uma** das IAs. O uso é controlado por
**cota mensal de tokens** (`client_quotas`): o plano dá Y tokens, e cada output
tem um custo fixo (`output_costs` por capability). Ex.: Y tokens → X carrosséis,
Y análises, Z gerações.

- `client_quotas` (client_id, plan, monthly_token_quota, used_tokens, reset_at).
- `output_costs` (capability, tokens_per_output).
- Bloqueio: `402 quota_exceeded` antes de executar sem cota.
- Dedução: por output executado + evento em `ai_usage_events`.
- Otimização: o code mode reduz custo (código em vez de texto por unidade).

### 10.9 Conexão de providers por aquisição (FUTURO)

Quando houver checkout: plano → quota → conexão/geração de tokens de provider.
Estrutura pronta (`provider_connections` + `client_quotas`); o fluxo de compra
entra depois.

*Criado em: 2026-08-19 — congelado por decisão do operador.*
