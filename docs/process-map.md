# process-map.md — Mapeamento de Processos do MarketingOS
> Localização: /docs/process-map.md
> Referência visual e operacional de todos os processos do sistema.
> Atualizar sempre que uma nova fase, skill ou workflow for adicionado.

---

## Visão Comercial — Ciclo Completo de um Cliente

```
0 — PROSPECÇÃO
    Instagram do Felipe · abordagem direta · indicação
    ↓
1 — QUALIFICAÇÃO
    Conversa WhatsApp · 3 perguntas:
    → Qual o negócio?
    → Qual a presença digital atual?
    → Qual o objetivo nos próximos 90 dias?
    ↓
2 — DEMONSTRAÇÃO COMERCIAL
    Comando: /demo
    Workflow: client-demo.md
    Entrega: diagnóstico + posicionamento + site + carrossel + dashboard
    Output: /clients/[slug]/outputs/demo/demo.md
    ↓
3 — ONBOARDING
    Comando: node scripts/create-client.js [slug]
    Preencher: client.md → brand-kit.json → estrategia.md
    Comando: /abrir [slug]
    ↓
4 — OPERAÇÃO MENSAL RECORRENTE
    ┌─────────────────┬──────────────────┬──────────────────┬─────────────────┐
    │   Conteúdo      │   Aquisição      │  Relacionamento  │    Análise      │
    │ /post           │ /captacao        │ /retencao        │ /relatorio      │
    │ /carrossel      │ /oferta          │ /reativacao      │ /funil          │
    │ /imagem         │ /funil           │                  │                 │
    └─────────────────┴──────────────────┴──────────────────┴─────────────────┘
    Reunião estratégica quinzenal → reuniao-estrategica.md
    Relatório executivo mensal   → relatorio-executivo.md
    ↓
5 — CROSS-CLIENT INTELLIGENCE
    patterns.md · benchmarks.json · skill-updates.md · experiments.md
    ↑ (melhora o sistema para todos os clientes futuros)
```

---

## Protocolo de Sessão

```
ABRIR SESSÃO
  Comando: /abrir [slug]
  Executa: workflows/open-client.md
  Carrega: intelligence/ → client.md → estrategia.md → notes.md → brand-kit.json

DURANTE A SESSÃO
  Usar comandos slash definidos em workflows/commands.md
  Salvar outputs em /clients/[slug]/outputs/[tipo]/

FECHAR SESSÃO
  Comando: /fechar
  Executa: workflows/close-client.md
  Salva: notes.md → estrategia.md → intelligence/ (se houver padrão novo)
  Commita: node scripts/save.js
```

---

## Visão Técnica — Arquitetura de Arquivos

```
/marketing-os
  │
  ├── AGENTS.md                → instruções operacionais do agente
  ├── CODEX.md                 → contexto global e regras de desenvolvimento
  ├── .cursorrules             → contexto automático para o Cursor/Claude Code
  │
  ├── /clients
  │   ├── /_template           → modelo base copiado pelo create-client.js
  │   └── /[slug]
  │       ├── client.md        → levantamento completo (10 blocos)
  │       ├── estrategia.md    → foco atual, prioridades, próximos passos
  │       ├── notes.md         → diário operacional + inteligência acumulada
  │       ├── metrics.json     → dados de performance por canal
  │       ├── campaigns.md     → campanhas ativas e histórico
  │       ├── brand-kit.json   → identidade visual
  │       ├── /outputs
  │       │   ├── /site
  │       │   ├── /posts
  │       │   ├── /carousels
  │       │   ├── /dashboard
  │       │   └── /demo
  │       └── /assets
  │           ├── /generated/images
  │           ├── /reference
  │           └── /approved
  │
  ├── /skills
  │   ├── skill-carousel.md
  │   ├── skill-post.md
  │   ├── skill-site-builder.md
  │   ├── skill-dashboard.md
  │   ├── skill-lead-capture.md
  │   ├── skill-funnel-analysis.md
  │   ├── skill-retention.md
  │   ├── skill-reactivation.md
  │   ├── skill-offer-positioning.md
  │   ├── skill-image-generation.md
  │   └── skill-head-implantado.md
  │
  ├── /workflows
  │   ├── commands.md          → interface de comandos slash
  │   ├── client-demo.md       → demonstração comercial (9 etapas)
  │   ├── open-client.md       → protocolo de abertura de sessão
  │   ├── close-client.md      → protocolo de fechamento de sessão
  │   ├── onboarding-head.md   → primeiro mês do head implantado
  │   ├── reuniao-estrategica.md → roteiro de reunião quinzenal
  │   └── relatorio-executivo.md → relatório mensal executivo
  │
  ├── /intelligence
  │   ├── patterns.md          → padrões confirmados em 2+ clientes
  │   ├── benchmarks.json      → métricas de referência por nicho e canal
  │   ├── skill-updates.md     → melhorias aplicadas nas skills
  │   └── experiments.md       → testes rodando em múltiplos clientes
  │
  ├── /scripts
  │   ├── create-client.js     → instala ambiente de novo cliente
  │   ├── generate-image.js    → baixa imagens do Pollinations AI
  │   └── save.js              → commit + push de encerramento de sessão
  │
  └── /docs
      └── process-map.md       → este arquivo
```

---

## Comandos Slash — Referência Rápida

| Comando | O que faz | Arquivo |
|---|---|---|
| `/abrir [slug]` | Abre sessão com cliente | `workflows/open-client.md` |
| `/fechar` | Encerra sessão e salva aprendizado | `workflows/close-client.md` |
| `/novo [slug]` | Instala novo cliente | `scripts/create-client.js` |
| `/demo` | Gera demonstração comercial | `workflows/client-demo.md` |
| `/carrossel` | Gera carrossel Instagram | `skills/skill-carousel.md` |
| `/post` | Gera post Feed/Reels/Story | `skills/skill-post.md` |
| `/site` | Gera site ou landing page | `skills/skill-site-builder.md` |
| `/imagem` | Gera imagens via Pollinations | `skills/skill-image-generation.md` |
| `/oferta` | Posiciona oferta por canal | `skills/skill-offer-positioning.md` |
| `/captacao` | Estrutura captura de leads | `skills/skill-lead-capture.md` |
| `/funil` | Diagnóstico de funil | `skills/skill-funnel-analysis.md` |
| `/retencao` | Plano de retenção | `skills/skill-retention.md` |
| `/reativacao` | Sequência de reativação | `skills/skill-reactivation.md` |
| `/relatorio` | Relatório de performance | `skills/skill-dashboard.md` |
| `/status` | Estado atual do cliente ativo | `workflows/commands.md` |
| `/atualizar` | Atualiza memória do cliente | `workflows/commands.md` |

---

## Fluxo de Dados

```
client.md + brand-kit.json
  ↓ lidos por
Skills (geram outputs)
  ↓ salvos em
/clients/[slug]/outputs/
  ↓ métricas alimentam
metrics.json
  ↓ lido por
skill-dashboard → relatório executivo
  ↓ padrões extraídos por
/fechar → close-client.md
  ↓ salvos em
/intelligence/ (patterns, benchmarks, skill-updates)
  ↓ lidos na próxima sessão por
/abrir → open-client.md
  ↓ aplicados a
Todos os clientes futuros
```

---

## Regras de Ouro

1. Nunca criar cliente manualmente — sempre via `create-client.js`
2. Nunca operar sem rodar `/abrir` primeiro
3. Nunca fechar sem rodar `/fechar`
4. Todo output vai para `/clients/[slug]/outputs/[tipo]/`
5. Nunca misturar contexto entre clientes
6. Padrão só vai para `intelligence/` após confirmação em 2+ clientes
7. Métricas estimadas sempre sinalizadas como tal

---

*Última atualização: Fase 1 — Fundação*
*Atualizar a cada nova skill, workflow ou fase concluída*
