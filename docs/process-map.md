# process-map.md — Mapeamento de Processos do MarketingOS
> Localização: /docs/process-map.md
> Referência visual e operacional de todos os processos do sistema.
> Atualizar sempre que uma nova fase, skill ou workflow for adicionado.
> Última atualização: Fase 1 concluída — Fase 2 iniciada

---

## Visão Comercial — Ciclo Completo de um Cliente

```
0 — PROSPECÇÃO
    Instagram do Felipe · abordagem direta · indicação
    Ferramentas: /prospector · /mercado · /oferta
    ↓
1 — QUALIFICAÇÃO
    Conversa WhatsApp · 3 perguntas:
    → Qual o negócio?
    → Qual a presença digital atual?
    → Qual o objetivo nos próximos 90 dias?
    Ferramenta: /vender (estágio: abertura + diagnóstico)
    ↓
2 — DEMONSTRAÇÃO COMERCIAL
    Comando: /pitch [slug]
    Entrega: apresentação HTML personalizada com diagnóstico + posicionamento
    Output: /clients/[slug]/outputs/demo/
    ↓
3 — ONBOARDING
    Comando: node scripts/create-client.js [slug]
    Preencher: client.md → brand-kit.json → estrategia.md
    Comando: /abrir [slug]
    Workflow: /onboarding (primeiro mês do head implantado)
    ↓
4 — OPERAÇÃO MENSAL RECORRENTE
    ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
    │   /criar         │   /prospectar    │  /relacionar     │    /analisar     │
    │ carrossel        │ oferta           │ retencao         │ relatorio        │
    │ post             │ captacao         │ reativacao       │ funil            │
    │ imagem           │ anuncio          │ head-implantado  │ seo              │
    │ branding         │ prospector       │                  │ investigar       │
    │ site             │ pitch            │                  │ estrategista     │
    └──────────────────┴──────────────────┴──────────────────┴──────────────────┘
    /vender → abordagem de lead quente + fechamento
    Reunião estratégica quinzenal → /reuniao
    Relatório executivo mensal   → /relatorio
    ↓
5 — CROSS-CLIENT INTELLIGENCE
    patterns.md · benchmarks.json · market-opportunities.md
    ↑ (melhora o sistema para todos os clientes futuros)
```

---

## Protocolo de Sessão

```
ABRIR SESSÃO
  Comando: /abrir [slug]
  Executa: workflows/open-client.md → skills/skill-abrir.md
  Carrega: intelligence/ → client.md → notes.md → estrategia.md → runs.md

DURANTE A SESSÃO
  Ler alma.md (uma vez por sessão, antes de qualquer criação)
  Usar comandos slash definidos em workflows/commands.md
  Salvar outputs em /clients/[slug]/outputs/[tipo]/

FECHAR SESSÃO
  Comando: /fechar
  Executa: workflows/close-client.md → skills/skill-salvar.md
  Salva: notes.md → estrategia.md → runs.md → intelligence/ (padrões novos)
  Commita: git
```

---

## Arquitetura de Arquivos

```
/marketing-os
  │
  ├── CLAUDE.md                  → instruções operacionais + hierarquia de skills
  │
  ├── /clients
  │   ├── /_template             → modelo base copiado pelo create-client.js
  │   └── /[slug]
  │       ├── client.md          → levantamento completo (9 blocos)
  │       ├── estrategia.md      → foco atual, prioridades, próximos passos
  │       ├── notes.md           → diário operacional + inteligência acumulada
  │       ├── runs.md            → histórico de sessões
  │       ├── campaigns.md       → campanhas ativas e histórico de decisões
  │       ├── metrics.json       → dados de performance por canal
  │       ├── brand-kit.json     → identidade visual do cliente
  │       └── /outputs
  │           ├── /posts         → feeds PNG + legendas
  │           ├── /carousels     → HTML + slides PNG por pasta
  │           ├── /oferta        → posicionamento de oferta por canal
  │           ├── /branding      → direção criativa e design system
  │           ├── /site          → HTML de site ou landing page
  │           ├── /anuncios      → campanhas Google/Meta + CSV
  │           ├── /seo           → auditoria e plano de SEO
  │           ├── /dashboard     → relatórios de performance
  │           ├── /inteligencia  → análises e diagnósticos
  │           ├── /prospects     → listas qualificadas de prospectos
  │           └── /demo          → apresentações comerciais HTML
  │
  ├── /skills
  │   ├── alma.md                → por que fazemos o que fazemos (ler 1x/sessão)
  │   ├── skill-abrir.md         → sistema: abre sessão com cliente
  │   ├── skill-salvar.md        → sistema: checkpoint + commit
  │   │
  │   ├── /analise               → /analisar
  │   │   ├── _admin.md
  │   │   ├── skill-dashboard.md
  │   │   ├── skill-funnel-analysis.md
  │   │   ├── skill-site-audit.md      → auditoria comercial de site/landing
  │   │   ├── skill-investigar.md
  │   │   ├── skill-seo.md
  │   │   └── skill-estrategista.md
  │   │
  │   ├── /criacao               → /criar
  │   │   ├── _admin.md
  │   │   ├── skill-criatividade.md  ← obrigatória antes de criar
  │   │   ├── skill-carousel.md
  │   │   ├── skill-post.md
  │   │   ├── skill-branding.md
  │   │   ├── skill-site-builder.md
  │   │   ├── skill-image-generation.md
  │   │   └── skill-publicar.md
  │   │
  │   ├── /aquisicao             → /prospectar
  │   │   ├── _admin.md
  │   │   ├── skill-market-analyzer.md
  │   │   ├── skill-prospector.md
  │   │   ├── skill-offer-positioning.md
  │   │   ├── skill-pitch-deck.md
  │   │   ├── skill-lead-capture.md
  │   │   └── skill-anuncio.md
  │   │
  │   ├── /venda                 → /vender
  │   │   ├── _admin.md
  │   │   └── skill-venda.md
  │   │
  │   └── /relacionamento        → /relacionar
  │       ├── _admin.md
  │       ├── skill-retention.md
  │       ├── skill-reactivation.md
  │       └── skill-head-implantado.md
  │
  ├── /workflows
  │   ├── commands.md            → interface completa de comandos slash
  │   ├── open-client.md         → protocolo de abertura de sessão
  │   ├── close-client.md        → protocolo de fechamento de sessão
  │   ├── pipeline-runner.md     → executa pipelines multi-skill
  │   ├── token-economy.md       → regra operacional de economia de tokens
  │   ├── client-demo.md         → demo comercial pré-contratação (9 etapas) — /demo [slug]
  │   ├── relatorio-sistema.md   → relatório operacional do sistema — /relatorio-sistema
  │   ├── onboarding-head.md     → primeiro mês do head implantado
  │   ├── reuniao-estrategica.md → roteiro de reunião quinzenal/mensal
  │   └── relatorio-executivo.md → relatório mensal executivo
  │
  ├── /intelligence
  │   ├── manifesto.md           → documento fundacional — intocável
  │   ├── patterns.md            → padrões confirmados em 2+ clientes
  │   ├── benchmarks.json        → métricas de referência por nicho/canal
  │   ├── market-opportunities.md → oportunidades de nicho identificadas
  │   ├── skill-updates.md       → log de melhorias aplicadas nas skills
  │   ├── experiments.md         → experimentos cross-client em andamento e planejados
  │   ├── checklist-pos-publicacao.md → protocolo dos 30 min pós-post (algoritmo)
  │   ├── system-usage.json      → log de uso de skills por sessão (base do /relatorio-sistema)
  │   ├── repertoire-scan-report.md → relatorio dos repertorios externos
  │   ├── /repertoire-updaters   → updaters gerais, aquisicao e agenda
  │   ├── /update-packages       → pacotes de updates do repertoire aplicados
  │   └── brand-kit-marketingos.md → identidade visual do próprio sistema
  │
  ├── /templates
  │   └── pitch-deck-template.html → base HTML para apresentações comerciais
  │
  ├── /scripts
  │   ├── create-client.js       → instala ambiente de novo cliente
  │   └── command-router.js      → roteador de comandos slash
  │
  └── /docs
      └── process-map.md         → este arquivo
```

---

## Comandos Slash — Referência Rápida

### Grupos (carregam _admin.md → escolhem 1 skill)

| Comando | Grupo | Quando usar |
|---|---|---|
| `/analisar` | Análise | Performance, funil, concorrente, SEO, estratégia |
| `/criar` | Criação | Conteúdo, visual, site — alma.md obrigatório antes |
| `/prospectar` | Aquisição | Mercado, prospectos, oferta, pitch, anúncio |
| `/vender` | Venda | Lead qualificado → fechamento |
| `/relacionar` | Relacionamento | Retenção, reativação, head implantado |

### Sistema

| Comando | O que faz |
|---|---|
| `/abrir [slug]` | Abre sessão com cliente — SEMPRE PRIMEIRO |
| `/fechar` | Encerra sessão e salva aprendizados — SEMPRE AO FINAL |
| `/salvar` | Checkpoint intermediário sem encerrar |
| `/novo [slug]` | Instala ambiente de novo cliente |

### Diretos — Conteúdo

| Comando | Skill |
|---|---|
| `/carrossel --tema [tema]` | skill-carousel.md |
| `/post` | skill-post.md |
| `/imagem` | skill-image-generation.md |
| `/branding` | skill-branding.md |
| `/site` | skill-site-builder.md |
| `/publicar` | skill-publicar.md |

### Diretos — Aquisição

| Comando | Skill |
|---|---|
| `/mercado` | skill-market-analyzer.md |
| `/prospector` | skill-prospector.md |
| `/oferta` | skill-offer-positioning.md |
| `/captacao` | skill-lead-capture.md |
| `/pitch [slug]` | skill-pitch-deck.md |
| `/anuncio` | skill-anuncio.md |

### Diretos — Análise

| Comando | Skill / Workflow |
|---|---|
| `/relatorio` | skill-dashboard.md |
| `/funil` | skills/funnel-strategy/SKILL.md |
| `/analisar site` | skill-site-audit.md |
| `/investigar [@perfil]` | skill-investigar.md |
| `/seo` | skill-seo.md |
| `/relatorio-sistema` | relatorio-sistema.md |

### Demo Comercial

| Comando | Workflow |
|---|---|
| `/demo [slug]` | client-demo.md |

### Diretos — Relacionamento

| Comando | Skill |
|---|---|
| `/retencao` | skill-retention.md |
| `/reativacao` | skill-reactivation.md |

### Head Implantado

| Comando | Workflow |
|---|---|
| `/onboarding` | onboarding-head.md |
| `/reuniao` | reuniao-estrategica.md |
| `/relatorio [MM/AAAA]` | relatorio-executivo.md |

### Pipelines

| Comando | Sequência |
|---|---|
| `/pipeline branding-completo` | branding → site |
| `/pipeline lancamento-conteudo` | oferta → carrossel → post → imagem |
| `/pipeline diagnostico` | relatorio → funil → oferta |
| `/pipeline seo-completo` | investigar → seo → post |
| `/pipeline campanha-paga` | oferta → anuncio → imagem |

---

## Fluxo de Dados

```
manifesto.md + alma.md          → norte criativo e filosófico
intelligence/ (patterns, benchmarks, market-opportunities)
  ↓ lidos por
/abrir → carrega contexto global
  ↓ combinado com
client.md + brand-kit.json + notes.md + runs.md
  ↓ alimenta
Skills (geram outputs)
  ↓ salvos em
/clients/[slug]/outputs/[tipo]/
  ↓ métricas alimentam
metrics.json
  ↓ lido por
skill-dashboard → relatório executivo
  ↓ padrões extraídos por
/fechar → close-client.md
  ↓ salvos em
/intelligence/ (patterns, benchmarks, market-opportunities)
  ↓ lidos na próxima sessão por
/abrir → aplicados a todos os clientes futuros
```

---

## Fluxo de Repertoire Updaters

```
Repositorios externos aprovados
  -> npm run repertoire:update
  -> intelligence/repertoire-updaters/*.md
  -> intelligence/repertoire-updaters/inventory.json
  -> intelligence/repertoire-scan-report.md
  -> npm run repertoire:acquisition
  -> intelligence/repertoire-updaters/acquisition.md
  -> intelligence/skill-updates.md
  -> skills internas atualizadas uma por vez
```

Regra: a etapa de aquisicao nunca substitui a etapa geral. Primeiro preservar repertorio completo; depois filtrar aquisicao.

---

## Regras de Ouro

1. Ler alma.md uma vez por sessão — antes de qualquer criação
2. Nunca operar sem `/abrir` primeiro — sem contexto, sem output
3. Nunca fechar sem `/fechar` — aprendizado não salvo é aprendizado perdido
4. Todo output vai para `/clients/[slug]/outputs/[tipo]/`
5. Nunca misturar contexto entre clientes
6. Padrão só vai para `intelligence/` após confirmação em 2+ clientes
7. Métricas estimadas sempre sinalizadas como tal
8. Para criação: skill-criatividade.md antes de qualquer peça de conteúdo
9. Para venda: nunca apresentar preço antes do diagnóstico
10. Para mais de uma skill em sequência: usar pipeline-runner.md

---

## Status das Fases

```
✅ Fase 1 — Fundação (concluída)
   Estrutura de pastas, CLAUDE.md, templates, scripts de criação de cliente
   Skills essenciais, comandos slash, alma.md, manifesto.md

✅ Fase 1.5 — Hierarquia de Skills (concluída)
   5 grupos com _admin.md, skill-criatividade.md, skill-venda.md
   skill-pitch-deck.md, skill-prospector.md, skill-estrategista.md
   brand-kit-marketingos.md, templates/pitch-deck-template.html

✅ Fase 2.5 — Repertoire Updaters Programados (concluída)
   Etapa geral semanal + filtro de aquisicao semanal
   skill-site-audit.md, aquisicao v1.1, SEO/AEO, captura, proposta, retencao e reativacao

🔄 Fase 2 — Primeiros Clientes (em andamento)
   Felipe Proença: Grade 1 + Grade 2 publicadas, oferta estruturada
   Pontos Cardeais: apresentação enviada — aguardando retorno
   Shana Joias: operação ativa

⬜ Fase 3 — Integrações e Automação
   Integrações com canais por cliente, pipeline de dados e tracking
   Consolidação de aprendizados em intelligence/

⬜ Fase 4 — Escala
   Licenciar o MarketingOS para agências e builders
   Depende do Produto 1 (serviço) validado e documentado
```
