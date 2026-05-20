# commands.md - Interface de Comandos do MarketingOS
> Localizacao: /workflows/commands.md
> Mapa de comandos curtos para skills e workflows.
> O operador digita o comando e o sistema resolve qual skill ou workflow executar.

---

## Comandos - Cliente

| Comando | O que faz | Executa |
|---|---|---|
| `/novo [slug]` | Instala ambiente de novo cliente | `scripts/create-client.js` |
| `/demo` | Gera apresentacao comercial completa | `workflows/client-demo.md` |
| `/cliente [slug]` | Define cliente ativo | Estado interno (`.marketingos/state.json`) |

---

## Comandos - Conteudo

| Comando | O que faz | Executa |
|---|---|---|
| `/carrossel --tema [tema]` | Gera pipeline completo de carrossel | `scripts/generate-carousel.js` + `scripts/render-carousel.js` |
| `/post` | Gera post (Feed, Reels ou Story) | `skills/skill-post.md` |
| `/imagem` | Gera prompts e imagens | `skills/skill-image-generation.md` |

---

## Comandos - Site e Oferta

| Comando | O que faz | Executa |
|---|---|---|
| `/branding` | Cria camada de direcao criativa e design system | `skills/skill-branding.md` |
| `/site` | Desenvolve site ou landing page | `skills/skill-site-builder.md` |
| `/oferta` | Posiciona e adapta oferta por canal | `skills/skill-offer-positioning.md` |
| `/captacao` | Estrutura fluxo de captura de leads | `skills/skill-lead-capture.md` |

---

## Comandos - Inteligencia e Crescimento

| Comando | O que faz | Executa |
|---|---|---|
| `/investigar [@perfil ou URL]` | Analisa concorrente ou referência e extrai padrões | `skills/skill-investigar.md` |
| `/seo` | Workflow SEO completo — pesquisa, auditoria e plano | `skills/skill-seo.md` |
| `/anuncio` | Campanha Google/Meta com copy + estrutura + CSV | `skills/skill-anuncio.md` |
| `/publicar` | Revisão final + checklist técnico + registro em campaigns.md | `skills/skill-publicar.md` |

## Comandos - Analise

| Comando | O que faz | Executa |
|---|---|---|
| `/relatorio` | Gera relatorio de performance | `skills/skill-dashboard.md` |
| `/funil` | Diagnostico de funil ponta a ponta | `skills/skill-funnel-analysis.md` |

---

## Comandos - Relacionamento

| Comando | O que faz | Executa |
|---|---|---|
| `/retencao` | Plano de retencao pos-venda | `skills/skill-retention.md` |
| `/reativacao` | Sequencia de reativacao de inativos | `skills/skill-reactivation.md` |

---

## Comandos - Sistema

| Comando | O que faz | Executa |
|---|---|---|
| `/abrir` | Carrega contexto completo do cliente ativo no início da sessão | `skills/skill-abrir.md` |
| `/salvar` | Resume sessão, atualiza runs.md e faz commit git | `skills/skill-salvar.md` + `scripts/save.js` |
| `/atualizar` | Varre arquivos do cliente ativo e lista pendencias | `scripts/command-router.js` |
| `/status` | Mostra estado atual do cliente ativo | `scripts/command-router.js` |

## Comandos - Pipeline

| Comando | O que faz | Executa |
|---|---|---|
| `/pipeline [nome]` | Executa pipeline pré-definido com checkpoints | `workflows/pipeline-runner.md` |
| `/pipeline custom` | Declara e executa pipeline ad hoc | `workflows/pipeline-runner.md` |
| `/pipeline retomar [run-id]` | Retoma pipeline pausado num checkpoint | `workflows/pipeline-runner.md` |

Pipelines disponíveis: `branding-completo` · `lancamento-conteudo` · `diagnostico`

---

## Comportamento padrao

1. Identificar comando digitado
2. Se sessão não foi aberta: executar `/abrir` primeiro
3. Verificar se cliente ativo esta definido
4. Carregar `client.md` do cliente ativo
5. Verificar inputs obrigatorios
6. Executar skill ou workflow correspondente
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
