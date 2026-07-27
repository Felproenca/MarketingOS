# README-SETUP - Funnel Strategy

Este modulo implanta a camada de funil como arquitetura transversal do MarketingOS.

Ele nao substitui `skill-funnel-analysis.md`.

- `skills/analise/skill-funnel-analysis.md` diagnostica performance e vazamentos com dados.
- `skills/funnel-strategy/` define a arquitetura comercial antes de criar ativos.

---

## Como Usar

1. Abrir o cliente com `/abrir [slug]`.
2. Ler `client.md` e, se houver, `metrics.json`, `campaigns.md` e `acquisition-diagnosis.json`.
3. Acionar `/funil` antes de criar site, campanha, conteudo, formulario, outbound ou proposta.
4. Preencher `templates/funnel-brief.md`.
5. Validar com `funnel-gate.md`.
6. Inserir `## Funnel Metadata` no output final.
7. Salvar artefatos em `clients/[slug]/outputs/acquisition/` ou na pasta do ativo produzido.

---

## Ordem Recomendada Em Projetos

```text
/inteligencia aquisicao
  -> /funil
  -> /perceber ou /branding, se necessario
  -> /direcao-criativa
  -> /criar site | /criar post | /prospectar captacao | /prospectar oferta
  -> /analisar funil
```

---

## Integracoes Obrigatorias

Toda skill que gere output comercial deve consultar ao menos:

- `SKILL.md`
- `funnel-gate.md`
- `friction-map.md`
- `templates/funnel-metadata.md`

Se o output envolver captacao, tambem consultar:

- `qualification-engine.md`
- `schemas/lead-scoring.schema.json`
- `schemas/routing-rules.schema.json`

Se envolver canal especifico, consultar o playbook correspondente em `platform-playbooks/`.

Se envolver mercado/cultura especifica, consultar `FUNNEL-INTELLIGENCE-ATLAS.md` e o playbook em `cultural-playbooks/`.

---

## Contrato Minimo Para Outras Skills

Qualquer skill integrada deve adicionar:

```md
## Funnel Metadata

- Funnel stage:
- Intent level:
- Friction level:
- Expected lead signal:
- Qualification goal:
- Primary CTA:
- Secondary CTA:
- Routing destination:
- Next best action:
```

Sem esse bloco, a entrega esta incompleta.

---

## Saidas Recomendadas

- `clients/[slug]/outputs/acquisition/funnel-brief.md`
- `clients/[slug]/outputs/acquisition/funnel-audit.md`
- `clients/[slug]/outputs/acquisition/funnel-health-score.md`
- `clients/[slug]/outputs/acquisition/lead-routing-map.md`
- `clients/[slug]/outputs/acquisition/content-funnel-plan.md`
- `clients/[slug]/outputs/acquisition/outbound-sequence.md`

---

## Validacao Tecnica

Schemas JSON:

```bash
node -e "for (const f of ['funnel-metadata','lead-scoring','smart-form','routing-rules']) JSON.parse(require('fs').readFileSync(`skills/funnel-strategy/schemas/${f}.schema.json`, 'utf8'))"
```

Checklist manual:

- Todos os arquivos da estrutura existem.
- Schemas sao JSON valido.
- Markdown e aplicavel sem depender de teoria externa.
- Funnel Metadata aparece nos outputs comerciais.
- Hipoteses nao sao apresentadas como fatos.
