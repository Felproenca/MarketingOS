# HANDOFF — MarketingOS (próxima sessão)

> Este arquivo preserva o estado completo da sessão anterior (~85% do contexto usado).
> Leia inteiro antes de agir. Docs-chave: `docs/PLANO-BACKEND.md`, `docs/PLANO-FRONTEND.md`,
> `docs/BRIEF-FRONTEND-MVP.md`, `docs/contrato-execucao.md`, `docs/FRONTEND_REFERENCIAS.md`.

## 0. AUDITORIA REAL (24/08 — o que estava travando a operação e o que foi feito)

> A sessão anterior validou o que estava PRONTO, mas não o que estava QUEBRADO. Auditoria direta no Supabase/workers/logs:

| # | Problema encontrado | Correção aplicada | Status |
|---|---|---|---|
| 1 | **Context Gate DEADLOCK**: exigia `outputs/strategy/strategy-decision.json` até para jobs de `strategy`; nada gerava o arquivo; formato legado era `estrategia.md` → 6 jobs blocked | `strategy/funnel` removidos da exigência; `scripts/context/bootstrap-strategy.mjs` converte `estrategia.md`→`strategy-decision.json` (12 clientes validados no schema); `scripts/context/ensure-client-context.mjs` materializa contexto local a partir do `client_references` (Supabase) para clientes criados pelo frontend | ✅ |
| 2 | **Artifacts nascendo `draft` sem preview** → fila de aprovação do front sempre vazia = “nada funciona de verdade” | `executor.js saveArtifact`: artifact com conteúdo nasce `review` + `preview_url` + `assets`; 5 drafts antigos migrados | ✅ (deployado no app.mkos.online) |
| 3 | **Frontend duplicava requests** no “Gerar estratégia” (5x o mesmo) | `unblock()` com idempotência (checa strategy pendente do mesmo pedido) | ✅ (deployado marketingos-frontend.vercel.app) |
| 4 | **20 sync_schedules sem conexão real** (só existe felipe-proenca/meta) → `connection_not_found` a cada 24h | schedules sem conexão desabilitados | ✅ |
| 5 | **Hermes OFF**: gateway não rodava, bot Telegram desconectado | `hermes gateway start` → Telegram conectado (polling, 57 cmds); MCP `marketingos` validado (`hermes mcp test` → 8 tools). ⚠️ token no `.env` = **@systemmkosbot** (não @Hermesmkosbot como o handoff antigo dizia) | ✅ rodando |
| 6 | Worker antigo `marketingos-worker` com `poll error: fetch failed` intermitente (rede/Supabase) | observado; não interfere no fluxo novo (mediaos-worker processa `status=queued`) | ⚠️ monitorar |

**Validação E2E (job real)**: carrossel forca-da-terra → DeepSeek real → SVG no storage → QA (score 7) → artifact `review` com preview + 6 assets. O caminho crítico request→job→executor→artifact→aprovação funciona.

## 0.1 NOVAS CAPACIDADES CONSTRUÍDAS (24/08 — segunda rodada)

| Capacidade | Como funciona | Validado |
|---|---|---|
| **Agenda por cliente** | Operador cria itens (`action=agenda` subAction=create no `/api/admin/operations`; itens = work_requests `agenda_item`, status proposta→aprovado/recusado→gerado). Cliente aprova/recusa no portal (`POST /api/client/:slug` com `action: approve_agenda/reject_agenda`). `generate` converte aprovados em solicitações reais de produção | ✅ criar 3 → aprovar 2 → gerar → 2 solicitações na fila |
| **Upload de vídeo para o editor** | Frontend (intent Editar vídeo) envia arquivo → `/api/admin/ai/upload` (aceita mp4/mov/webm; grava storage + `input.source_url` no job) → worker baixa → EditorOS (whisper/cortes/legendas) → artifact `video_edit` review com MP4 | ✅ mp4 real ponta a ponta |
| **Link de acesso do cliente** | Botão no ClienteDetail → `POST /api/admin/clients?action=access_link` → Supabase `generate_link` (magic link) com redirect p/ `/login/cliente?slug=` → copia o link | ✅ endpoint + UI |
| **EditorOS no worker local** | `video_edit` NÃO vai mais ao mailbox morto: rota `local:editoros` (executor.js LOCAL_EXECUTOR_TARGETS); worker claima e roda com ffmpeg+EditorOS (venvs whisper/vision). `MEDIAOS_EXECUTOR_TIMEOUT_MS=600000` no `.env` | ✅ 2 vídeos reais editados |
| **DesingOS no front** | Intents novos: Construir site/página (design), Criar imagem | ✅ build |

## 1. Estado do sistema (verdade, sem exagero)

### Backend — ORQUESTRAÇÃO 100% funcional ✅
- Vercel (app.mkos.online) + Supabase (upqvhnifgzhmhwvsuock) + worker pm2 (`marketingos-worker`).
- Registry: 75 skills (18 canonical, 12+ operational). Resolução canônica (canonical→operational→available).
- Endpoints: missions, admin/operations (+report, +run_sync, +create_mission por secret), clients (+reference), artifacts (+publish action), integrations/meta, integrations/google, client/[slug].
- Quota: tokens E custo R$ (plano 500, teto 50). Metering em ai_usage_events + ai_runs.
- Relatório: `?report=client:<slug>` (tokens, R$, margem, aprovação, desperdício).
- MCP Hermes: `marketingos-mcp/server.mjs` (8 tools) — registrado no Hermes (8/8).
- Testes: 21/21 passam · `npm run registry:validate` OK.

### Backend — PRODUÇÃO DE MÍDIA (parcial — honesto)
| Output | Estado |
|---|---|
| Texto/estratégia/dados/auditoria/funil/tráfego/design | ✅ artifact real |
| **Carrossel/Post** | ✅ **SVG renderizado + URL no storage `media`** (recém-feito) |
| **Imagem (image_generate)** | ⚠️ arquitetura por cliente pronta; `needs_fal_connection` honesto sem chave. FAL por cliente via provider_connections (o operador NÃO cede a chave para outros clientes) |
| **Vídeo extração (coletor)** | ✅ **local funciona** (download yt-dlp + whisper EditorOS → transcrição real → skill/insights). YouTube bloqueia download (403) |
| **Vídeo produção (video_edit)** | ⏳ requer EditorOS (ffmpeg) |
| Publicação | ⏳ artifact aprovado + conexão Meta real |

### Frontend (Codex) — LIMITADO, FUNÇÕES FALHANDO ⚠️
- Codex adicionou: `Operacao.tsx`, `PortalCliente.tsx`, `RequestDetail.tsx`, estendeu `api.ts` (getOperations, getReport, getClientOverview, createRequest, approveArtifact, retryJob).
- API client OK; build sem erros TS.
- **Problemas relatados**: funções falhando, operação pouco usual, reutilizou a UI antiga. **REVISAR**: wiring das páginas novas (endpoints corretos?), estados honestos, separação por cliente, tela de login do cliente + conexão Meta/Google. Requisitos no `docs/BRIEF-FRONTEND-MVP.md` §11.

## 2. POT (YouTube bypass) — instalado, handshake pendente
- `yt-dlp-get-pot` (0.3.0) + `bgutil-ytdlp-pot-provider` (1.3.2) instalados no venv do Hermes.
- Servidor POT rodando: `node build/main.js` em `bgutil-ytdlp-pot-provider/server/` (porta 4416, ping OK).
- Download ainda 403: handshake `subs/android_vr` → "No request handlers configured". **Opções**: (a) continuar tuning do player_client/POT; (b) **cookies.txt do YouTube** (mais confiável); (c) cobalt self-host.

## 3. Conexão PI ↔ Hermes
- **PI** (este agente) = constrói/mantém o sistema (código, deploy, auditoria).
- **Hermes** = agente de OPERAÇÃO (Telegram **@systemmkosbot** — gateway UP desde 24/08 — + MCP 8 tools: status, clients, skills, create_mission, list_missions, artifacts, report, run_sync).
- A ponte é o MCP (`marketingos-mcp/server.mjs`) — Hermes chama o backend com secret (MEDIAOS_EXECUTION_INGEST_SECRET), nunca vê as chaves.
- Comandos: `hermes mcp list` · `hermes mcp test marketingos` · worker via pm2.

## 4. PRÓXIMA FASE: OPERAÇÃO MULTI-AGENTE (planejada, não implementada)
Visão: múltiplos agentes especializados operando em paralelo no sistema:
- **Hermes** (operador geral, Telegram) — já conectado via MCP.
- **PI** (ou Codex) como agente de implementação/manutenção.
- Agentes por função: agente de conteúdo, agente de tráfego, agente de design, agente de dados — cada um usando o MCP com subset de tools.
- **Como viabilizar**: o MCP já permite tools por agente (`hermes mcp configure` seleciona tools). Criar **perfis de agente** (system prompt + subset de tools + franquia/quota própria).
- **Operação multi-agente**: fila de trabalho compartilhada (jobs no Supabase já é a fila) — cada agente consome jobs da sua capability. Falta: definir os agentes, seus prompts, e a atribuição de cotas (o metering já existe).

## 5. Pendências (ordem)
1. ~~**Frontend**~~ ✅ MVP completo: fluxo crítico, Command Center, portal do cliente, login separado, conexões Meta/Google, seletor de cliente e redesign das telas legadas (`Missoes`, `MissaoDetail`, `Aquisicao`, `Conteudo`, `Biblioteca`, `Logs`) — `npm run build` passa.
2. ~~**Operação real**~~ ✅ destravada: context gate (bootstrap estratégia + auto-contexto), artifacts `review` com preview, idempotência no front, sync honesto, Hermes UP. E2E validado (carrossel forca-da-terra → artifact review com preview).
3. **Vídeo produção**: decidir EditorOS vs escopo menor (executor video existe; requer ffmpeg/EditorOS).
4. **POT/YouTube**: cookies ou continuar tuning (bloqueio 403 no download).
5. **Multi-agente**: definir agentes + perfis MCP + cotas por agente.
6. **Imagem**: quando um cliente fornecer conexão fal → o executor já usa.
7. **Imagem/vídeo com preview**: artifacts de `image`/`image_generate` ficam com preview "texto" — quando fal conectado, vira URL real.
3. **POT/YouTube**: cookies ou continuar tuning.
4. **Multi-agente**: definir agentes + perfis MCP + cotas por agente.
5. **Imagem**: quando um cliente fornecer conexão fal → o executor já usa.

### Frontend — COCKPIT (legado dark) ✅ mantido

### Frontend — NOVO `MarketingOS/frontend/` ✅ VIVO EM PRODUÇÃO (o MVP real)
- App separado do cockpit: tema light premium (verde/creme, DM Sans + Space Grotesk), React 19 + Vite + TS.
- **Workspace do operador** (Hoje / Clientes / Produzir / Fila de trabalho) + **Portal do cliente** `/dados/:slug` + **login `/login/cliente`** (Supabase auth) + **chat Hermes** (modo operador e cliente) + **wizard de cliente** (cria espaço + contexto em 3 passos) + **conexões Meta/Google** + **provedores de IA por cliente** (inclui fal) + **insights de aquisição** (data_now_normalized, sem estimativa sem amostra).
- Backend real: `app.mkos.online` (CORS aberto — ecoa origin), Supabase `upqvhnifgzhmhwvsuock`. Todos os endpoints conferidos contra as rotas reais (ai/connections, ai/upload, PUT clients, client/:slug POST, action hermes, action publish em artifacts).
- Deploy: projeto Vercel `marketingos-frontend` → **https://marketingos-frontend.vercel.app** (200). Env vars no Vercel (Production) ✓. URLs com hash exigem SSO; a canônica é pública.
- Rodar: `cd MarketingOS/frontend && npm run build` ✓ · deploy: `npx vercel --prod`.
- Última sessão: corrigido `publishArtifact` → `POST /api/admin/artifacts { action: 'publish' }`; adicionado **“Pedir ajuste”** (`changes_requested`) na fila do operador e no portal do cliente.

## 6. Como continuar
- Rodar: `npm run build` (cockpit) · `npm test` (21) · `vercel --prod` · `npm run registry:validate` · worker pm2 (restart após mudanças).
- Migrações pendentes de rodar no Supabase SQL Editor (se não rodaram): `009` (has_assets), `010` (cota custo).
- Arquivos-chave: `cockpit/api/_lib/executor.js` (núcleo), `intake.js`, `quota.js`, `reporting.js`, `render.js`, `marketingos-mcp/server.mjs`, `scripts/worker.mjs`, `docs/PLANO-BACKEND.md`.

## 7. Notas de infra
- Supabase FREE (sem plano pago — clientes não justificam ainda).
- Vercel Hobby: **limite 12 funções** — estamos em 12. Consolidar antes de adicionar.
- Credenciais Google (YouTube/Ads) + Customer ID configuradas. Meta configurada. FLUX_PUBLISH_SECRET falta.
- Contrato congelado: `docs/contrato-execucao.md` — nenhuma mudança sem mapeamento.
