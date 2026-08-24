# Auditoria de Skills do MarketingOS

## Estado

O acervo de instruções vive em `skills/` (121 arquivos `.md` + `.json`, incluindo templates e benchmarks). O **catálogo operacional** é `skills/registry.json` — a fonte declarativa única que o Cockpit, o AI Router e o executor leem. Skill fora do registry não aparece no Cockpit e não roda pelo fluxo de missões.

## Números (2026-08-19)

- **66** skills com `SKILL.md`/`skill-*.md` (playbooks).
- **69** registradas no `registry.json`.
  - **12** `operational` (sistema + as 8 de texto/criação operacionalizadas via DeepSeek).
  - **57** `available` (registradas e acionáveis, aguardando validação de QA/executor específico).
- **0** `archived`.

## Como uma skill é ACIONADA (não apenas registrada)

```text
missão (POST /api/missions)
→ createMission(): work_request + media_job + ai_run
→ resolveAI(capability): capability → skill → executor/provider
→ executeJob(): lê o SKILL.md da skill (skills-content.js) e injeta como system prompt
   + injeta reference_snapshot do cliente (client_truth) no briefing
   + injeta arquivos referenciados pequenos (templates/benchmarks) quando citados
   + executa via DeepSeek (texto) ou Fal (imagem/vídeo)
→ grava artifact + artifact_versions + execution_results
→ status: queued → running → review
```

Isso significa: **registrar uma skill no registry = ela passa a ser executada com o próprio playbook**, não com um prompt genérico.

## Estrutura canônica (registry v3)

Cada entry declara: `skill_id`, `label`, `description`, `category`, `owner`, `selectable`, `path`, `status`, `capability`, `request_types`, `requires`, `executor`, `output`, `qa`, `approval_required`, `providers_allowed`, `fallback`.

| Campo | Função |
|---|---|
| `status` | `operational` \| `available` \| `archived` |
| `capability` | token resolvido pelo AI Router (strategy, research, analysis, carousel, post, ads, automation, image_generate, video_generate, video_edit, publish, data_sync) |
| `path` | caminho do SKILL.md (o executor carrega este arquivo); `null` = definida por executor |
| `fallback` | `blocked` \| `prompt_and_upload` |

## Regra de integração

```text
request_type → skill_id → Client Truth → executor/provider → QA → artifact/version → approval
```

Uma skill sem executor e sem QA é somente orientação; não pode ser apresentada como serviço concluído.

## Integração em runtime

- `skills/registry.json` é a fonte declarativa (validado por `skill-registry.js`).
- `cockpit/api/_lib/skill-registry.js` expõe `skillForCapability`, `skillForRequestType`, `skillForId`, `skillsForSelection`, `loadSkillRegistry`, `validateSkillRegistry`.
- `cockpit/api/_lib/capability-catalog.js` deriva o catálogo integralmente do registry (skill nova aparece no Cockpit sem redeploy de código).
- `cockpit/api/_lib/executor.js` é o worker: carrega o `SKILL.md`, o `client_truth` e os arquivos referenciados, e executa.
- `cockpit/api/_lib/skills-content.js` é o bundle gerado dos playbooks (regenerar com `node cockpit/scripts/build-skills-content.mjs`).
- `cockpit/api/missions.js` + `cockpit/api/missions/[id].js` são o fluxo de missões (listar, criar, executar, detalhar, apagar).
- `media_jobs`/`ai_runs` registram `skill_id` (migração `006-skill-registry.sql`).

## Comandos de manutenção

```bash
node cockpit/scripts/register-all-skills.mjs   # registra skills novas no registry
node cockpit/scripts/build-skills-content.mjs  # reembute os SKILL.md no executor
```
