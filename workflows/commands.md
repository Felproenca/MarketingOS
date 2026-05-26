# commands.md — Interface de Comandos do MarketingOS
> Localização: /workflows/commands.md
> Mapa de comandos curtos para skills e workflows.
> O operador digita o comando e o sistema resolve qual skill ou workflow executar.

---

## Comandos de Grupo (nova hierarquia)

Comandos de grupo carregam o `_admin.md` correspondente, que escolhe a skill certa.
Reduzem contexto: em vez de carregar 16 skills, o sistema carrega 30 linhas e escolhe 1.

| Comando | O que faz | Executa |
|---|---|---|
| `/analisar` | Diagnóstico, performance, concorrente, SEO, estratégia | `skills/analise/_admin.md` |
| `/criar` | Conteúdo, visual, site — precedido de alma.md + criatividade | `skills/criacao/_admin.md` |
| `/prospectar` | Mercado, prospectos, oferta, pitch, captura, anúncio | `skills/aquisicao/_admin.md` |
| `/vender` | Abordagem de lead qualificado e fechamento | `skills/venda/_admin.md` |
| `/relacionar` | Retenção, reativação, head implantado | `skills/relacionamento/_admin.md` |

---

## Comandos Diretos — Sistema

| Comando | O que faz | Executa |
|---|---|---|
| `/abrir [slug]` | Carrega alma.md + intelligence global + contexto do cliente | `workflows/open-client.md` → `skills/skill-abrir.md` |
| `/fechar` | Extrai aprendizados, atualiza intelligence/, faz commit | `workflows/close-client.md` → `skills/skill-salvar.md` |
| `/salvar` | Checkpoint intermediário — commit git + atualiza runs.md | `skills/skill-salvar.md` |
| `/novo [slug]` | Instala ambiente de novo cliente | `scripts/create-client.js` |
| `/atualizar` | Varre arquivos do cliente ativo e lista pendências | `scripts/command-router.js` |
| `/status` | Mostra estado atual do cliente ativo | `scripts/command-router.js` |

---

## Comandos Diretos — Conteúdo

Atalhos para skills do grupo `/criar` sem passar pelo _admin.

| Comando | O que faz | Executa |
|---|---|---|
| `/carrossel --tema [tema]` | Gera carrossel completo para Instagram | `skills/criacao/skill-carousel.md` |
| `/post` | Gera post (Feed, Reels ou Story) | `skills/criacao/skill-post.md` |
| `/imagem` | Gera prompts e imagens de apoio | `skills/criacao/skill-image-generation.md` |
| `/branding` | Direção criativa e design system | `skills/criacao/skill-branding.md` |
| `/site` | Desenvolve site ou landing page | `skills/criacao/skill-site-builder.md` |
| `/publicar` | Revisão final + checklist + registro em campaigns.md | `skills/criacao/skill-publicar.md` |

---

## Comandos Diretos — Aquisição

Atalhos para skills do grupo `/prospectar` sem passar pelo _admin.

| Comando | O que faz | Executa |
|---|---|---|
| `/mercado` | Analisa nichos em crescimento e rankeia por oportunidade | `skills/aquisicao/skill-market-analyzer.md` |
| `/mercado nicho: [nicho]` | Analisa profundamente um nicho específico | `skills/aquisicao/skill-market-analyzer.md` |
| `/mercado nicho: [nicho] região: [local]` | Análise regional de nicho | `skills/aquisicao/skill-market-analyzer.md` |
| `/prospector` | Qualifica e prioriza prospectos com mensagem de abertura | `skills/aquisicao/skill-prospector.md` |
| `/prospector nicho: [nicho]` | Prospecta num nicho específico | `skills/aquisicao/skill-prospector.md` |
| `/prospector lista: [perfis]` | Qualifica lista manual de prospectos | `skills/aquisicao/skill-prospector.md` |
| `/oferta` | Posiciona e adapta oferta por canal | `skills/aquisicao/skill-offer-positioning.md` |
| `/captacao` | Estrutura fluxo de captura de leads | `skills/aquisicao/skill-lead-capture.md` |
| `/pitch [slug]` | Gera apresentação comercial HTML personalizada | `skills/aquisicao/skill-pitch-deck.md` |
| `/anuncio` | Campanha Google/Meta com copy + estrutura + CSV | `skills/aquisicao/skill-anuncio.md` |

---

## Comandos Diretos — Análise

Atalhos para skills do grupo `/analisar` sem passar pelo _admin.

| Comando | O que faz | Executa |
|---|---|---|
| `/relatorio` | Gera relatório de performance | `skills/analise/skill-dashboard.md` |
| `/funil` | Diagnóstico de funil ponta a ponta | `skills/analise/skill-funnel-analysis.md` |
| `/investigar [@perfil ou URL]` | Analisa concorrente ou referência | `skills/analise/skill-investigar.md` |
| `/seo` | Workflow SEO completo — pesquisa, auditoria e plano | `skills/analise/skill-seo.md` |

---

## Comandos Diretos — Relacionamento

| Comando | O que faz | Executa |
|---|---|---|
| `/retencao` | Plano de retenção pós-venda | `skills/relacionamento/skill-retention.md` |
| `/reativacao` | Sequência de reativação de inativos | `skills/relacionamento/skill-reactivation.md` |

---

## Comandos — Head Implantado

| Comando | O que faz | Executa |
|---|---|---|
| `/onboarding` | Primeiro mês do head — diagnóstico ao ritmo mensal | `workflows/onboarding-head.md` |
| `/reuniao` | Conduz reunião quinzenal ou mensal — pauta, métricas, decisões | `workflows/reuniao-estrategica.md` |
| `/relatorio [MM/AAAA]` | Relatório executivo mensal — narrativa, KPIs, causas, próximo mês | `workflows/relatorio-executivo.md` |

---

## Comandos — Pipeline

| Comando | O que faz | Executa |
|---|---|---|
| `/pipeline [nome]` | Executa pipeline pré-definido com checkpoints | `workflows/pipeline-runner.md` |
| `/pipeline custom` | Declara e executa pipeline ad hoc | `workflows/pipeline-runner.md` |
| `/pipeline retomar [run-id]` | Retoma pipeline pausado num checkpoint | `workflows/pipeline-runner.md` |

Pipelines disponíveis: `branding-completo` · `lancamento-conteudo` · `diagnostico` · `seo-completo` · `campanha-paga`

---

## Comportamento padrão

1. Identificar comando digitado
2. Se sessão não foi aberta: executar `/abrir` primeiro
3. Verificar se cliente ativo está definido
4. Se comando de grupo (`/analisar`, `/criar`, `/prospectar`, `/vender`, `/relacionar`):
   → Carregar `_admin.md` do grupo → escolher skill → carregar só ela
5. Se comando direto: carregar a skill correspondente
6. Ler `client.md` do cliente ativo antes de qualquer output
7. Ao final, oferecer registrar aprendizado e executar `/salvar`

---

## Pipelines recomendados

| Pipeline | Sequência | Quando usar |
|---|---|---|
| `/pipeline branding-completo` | branding → brand-kit → site | Novo cliente ou rebrand |
| `/pipeline lancamento-conteudo` | oferta → carrossel → post → imagem | Lançamento de produto/promoção |
| `/pipeline diagnostico` | relatorio → funil → oferta | Queda de resultado ou revisão mensal |
| `/pipeline seo-completo` | investigar → seo → post | Crescimento orgânico |
| `/pipeline campanha-paga` | oferta → anuncio → imagem | Campanha Google/Meta |
