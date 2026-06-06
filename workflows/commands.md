# commands.md — Referência de Comandos do MarketingOS
> Todos os comandos do sistema em um lugar só.
> Atualizado em: 2026-06-02

---

## Índice

1. [Comandos de Sessão](#1-sessão)
2. [Slash Commands — Grupos](#2-grupos)
3. [Slash Commands — Conteúdo](#3-conteúdo)
4. [Slash Commands — Análise](#4-análise)
5. [Slash Commands — Aquisição](#5-aquisição)
6. [Slash Commands — Relacionamento](#6-relacionamento)
7. [Slash Commands — Head Implantado](#7-head-implantado)
8. [CLI — Scripts npm](#8-cli-npm)
9. [Pipelines](#9-pipelines)

---

## 1. Sessão

> Executar sempre em ordem: `/abrir` → trabalho → `/fechar`

| Comando | O que faz |
|---|---|
| `/abrir [slug]` | Abre sessão do cliente — carrega intelligence + contexto |
| `/fechar` | Encerra sessão — extrai aprendizados e faz commit |
| `/salvar` | Checkpoint intermediário — commit sem encerrar sessão |

---

## 2. Grupos

> Carregam o `_admin.md` do grupo → escolhem a skill certa → carregam só ela.

| Comando | O que faz |
|---|---|
| `/analisar` | Diagnóstico, performance, concorrente, SEO, estratégia |
| `/criar` | Conteúdo, visual, site — carrega alma.md + criatividade |
| `/prospectar` | Mercado, prospectos, oferta, pitch, captura, anúncio |
| `/vender` | Abordagem de lead qualificado e fechamento |
| `/relacionar` | Retenção, reativação, head implantado |

---

## 3. Conteúdo

| Comando | O que faz | Skill |
|---|---|---|
| `/criar carousel` | Carrossel para Instagram (HTML direto) | `criacao/skill-carousel.md` |
| `/criar post` | Post — Feed, Reels ou Story | `criacao/skill-post.md` |
| `/criar imagem` | Prompts e imagens de apoio | `criacao/skill-image-generation.md` |
| `/criar branding` | Direção criativa e design system | `criacao/skill-branding.md` |
| `/criar site` | Site ou landing page | `criacao/skill-site-builder.md` |
| `/criar com-motor` | Conteúdo via motor social/API local | `criacao/skill-content-engine.md` |
| `/criar copy-agent` | Copy por plataforma com contrato de agent | `criacao/skill-social-copy.md` |
| `/criar visual-spec` | Direção visual por slide/frame | `criacao/skill-visual-spec.md` |
| `/criar prompt-engineer` | Decide HTML puro vs imagem externa | `criacao/skill-prompt-engineer.md` |
| `/criar lancamento` | Sequência de lançamento para perfil zero — objetivos algorítmicos por peça | `criacao/skill-lancamento.md` |
| `/publicar` | Revisão + checklist + publicação via Meta Graph API | `criacao/skill-publicar.md` |

---

## 4. Análise

| Comando | O que faz | Skill |
|---|---|---|
| `/analisar dashboard` | Relatório de performance e métricas | `analise/skill-dashboard.md` |
| `/analisar funil` | Diagnóstico de funil ponta a ponta | `analise/skill-funnel-analysis.md` |
| `/analisar investigar [@perfil\|URL]` | Concorrente ou referência de mercado | `analise/skill-investigar.md` |
| `/analisar seo` | Auditoria e estratégia SEO | `analise/skill-seo.md` |
| `/analisar estrategia` | Decisão estratégica e priorização | `analise/skill-estrategista.md` |
| `/analisar tendencias` | Tendências, saturação e oportunidades editoriais | `analise/skill-trend-research.md` |
| `/analisar aprendizado` | Transforma métricas em aprendizado reutilizável | `analise/skill-performance-learning.md` |

---

## 5. Aquisição

| Comando | O que faz | Skill |
|---|---|---|
| `/prospectar mercado` | Analisa nichos com potencial | `aquisicao/skill-market-analyzer.md` |
| `/prospectar prospector` | Qualifica e prioriza prospectos | `aquisicao/skill-prospector.md` |
| `/prospectar agent` | Sinais de compra e abordagem via contrato de agent | `aquisicao/skill-prospecting-agent.md` |
| `/prospectar oferta` | Posicionamento e copy de oferta | `aquisicao/skill-offer-positioning.md` |
| `/prospectar pitch` | Apresentação comercial HTML | `aquisicao/skill-pitch-deck.md` |
| `/prospectar captacao` | Estrutura de captura de leads | `aquisicao/skill-lead-capture.md` |
| `/prospectar anuncio` | Campanha Google/Meta com copy e CSV | `aquisicao/skill-anuncio.md` |

---

## 6. Relacionamento

| Comando | O que faz | Skill |
|---|---|---|
| `/relacionar retencao` | Plano de retenção pós-venda | `relacionamento/skill-retention.md` |
| `/relacionar reativacao` | Sequência de reativação de inativos | `relacionamento/skill-reactivation.md` |
| `/relacionar head` | Operação de head de marketing implantado | `relacionamento/skill-head-implantado.md` |

---

## 7. Head Implantado

| Comando | O que faz | Workflow |
|---|---|---|
| `/onboarding` | Primeiro mês — diagnóstico ao ritmo mensal | `workflows/onboarding-head.md` |
| `/reuniao` | Reunião quinzenal/mensal — pauta, métricas, decisões | `workflows/reuniao-estrategica.md` |
| `/relatorio [MM/AAAA]` | Relatório executivo mensal | `workflows/relatorio-executivo.md` |

---

## 8. CLI — Scripts npm

> Executados no terminal. Independentes do contexto de sessão Claude.

### Clientes

```bash
npm run novo -- [slug]          # Cria estrutura de novo cliente
```

### Prospecção

```bash
npm run prospector -- \
  --slug <slug> \               # Cliente alvo
  --query "clínica estética" \  # Busca Google Maps
  --city "São Paulo" \
  --max 20 \                    # Máximo de leads (padrão: 10)
  --channels whatsapp,email \   # Canais de outreach
  --sources maps,search \       # Fontes de scraping
  --dry-run                     # Testa sem enviar
```

### Scraper Inteligente v2

```bash
# Diagnóstico + score + mensagem personalizada, sem enviar
npm run scraper:dry -- "clínica estética Rio de Janeiro" --max=10 --score=6

# Rodar com opções explícitas
npm run scraper -- \
  "clínica estética Rio de Janeiro" \
  --max=10 \                    # Máximo de leads qualificados
  --score=6 \                   # Score mínimo para abordar
  --channel=email \             # email | whatsapp | both
  --dry-run                     # Gera mensagem sem enviar
```

**Pipeline:** Discovery → Analysis → Qualification → Message → Outreach  
**Output:** `scripts/scraper/leads.json`

### Integração social-content-agents

```bash
# Envia brief do MarketingOS para o motor de conteúdo
npm run criar-conteudo -- <slug> \
  --objetivo=autoridade \
  --plataforma=instagram \
  --tema="o que o cliente precisa sentir antes de comprar" \
  --format=1:1 \
  --dry-run

# Quando o motor pedir imagens externas
npm run upload-image -- \
  --content <content_id> \
  --slide 1 \
  --file caminho/da/imagem.png

# Depois de rodar insights e ter métricas no published.json
npm run aprender -- --slug <slug> --min-age-hours 48
```

**Fluxo:** MarketingOS monta brief → social-content-agents gera conteúdo → MarketingOS publica e mede → MarketingOS envia métricas de volta.  
**Módulos:** `scripts/integration/brief-builder.js`, `content-client.js`, `learn-sender.js`.

### Intelligence Externa — Repertoire Updaters

```bash
# Atualiza e inventaria os 4 repertórios externos aprovados
npm run repertoire:update

# Atualiza uma fonte específica
npm run repertoire:update -- --source marketingskills
npm run repertoire:update -- --source ai-marketing-claude
npm run repertoire:update -- --source claude-skills
npm run repertoire:update -- --source ai-marketing-claude-code-skills

# Testa sem gravar
npm run repertoire:update -- --dry-run

# Depois da etapa geral, gera o filtro so de aquisicao
npm run repertoire:acquisition
```

**Fontes:** coreyhaines31/marketingskills, zubair-trabzada/ai-marketing-claude, alirezarezvani/claude-skills, BrianRWagner/ai-marketing-claude-code-skills  
**Agenda:** `intelligence/repertoire-updaters/schedule.md`  
**Output geral:** `intelligence/repertoire-updaters/*.md`, `intelligence/repertoire-updaters/inventory.json`, `intelligence/repertoire-scan-report.md`  
**Output aquisicao:** `intelligence/repertoire-updaters/acquisition.md`

### Demo Pipeline (agency → leads → demo personalizado → outreach)

```bash
# Operação da agência (escreve em agency/)
npm run demo -- \
  --query "clínica estética" \
  --city "São Paulo" \
  --segment clinica \           # clinica | b2b
  --max 10 \
  --channels whatsapp \
  --dry-run                     # Gera demos, não envia
  --only-demo                   # Só salva localmente

# Para um cliente específico (escreve em clients/[slug]/)
npm run demo -- --slug <slug> --query "..." --city "..." --segment clinica
```

**Segmentos disponíveis:** `clinica` | `b2b`

### Site Prospect (URL direta → demo personalizado → outreach)

```bash
# Prospecção cirúrgica: entra com URL de um site específico
npm run site-prospect -- \
  --url https://clinica.com.br \
  --segment clinica \           # clinica | b2b | diagnostico
  --channels whatsapp \         # whatsapp | email | whatsapp,email
  --dry-run                     # Visualiza sem enviar

# Forçar contato se não foi detectado automaticamente
npm run site-prospect -- \
  --url https://exemplo.com.br \
  --segment b2b \
  --phone 5511999999999 \
  --email contato@exemplo.com.br \
  --channels whatsapp,email

# Apenas gerar o demo, sem enviar
npm run site-prospect -- --url https://exemplo.com.br --only-demo

# Dry-run (atalho)
npm run site-prospect:dry -- --url https://exemplo.com.br --segment clinica
```

**Pipeline:** URL → extrai marca (cor, logo, nome) → extrai contatos (WhatsApp, email, Instagram) → gera demo PNG personalizado → envia outreach  
**Output:** `agency/demos/[slug]/` ou `clients/[slug]/outputs/demos/` se `--slug` informado

### Sherlock — Investigação de Perfis

```bash
# Instagram (login persistente — primeira vez abre navegador)
npm run sherlock -- --slug <slug> --target @handle --platform instagram

# YouTube (sem login)
npm run sherlock -- --slug <slug> --target https://youtube.com/@canal

# LinkedIn (login persistente)
npm run sherlock -- --slug <slug> --target @empresa --platform linkedin

# Testar sem salvar
npm run sherlock -- --slug <slug> --target @handle --dry-run
```

**Plataformas:** `instagram` | `youtube` | `linkedin`
**Output:** `clients/[slug]/outputs/inteligencia/YYYY-MM-DD-sherlock-[alvo].md`

### Publisher — Publicação Instagram via Meta Graph API

```bash
# Feed (imagem única)
npm run publicar -- \
  --slug <slug> \
  --file "url_ou_path" \
  --caption "legenda"

# Carrossel (múltiplos --file)
npm run publicar -- \
  --slug <slug> \
  --file slide1.png \
  --file slide2.png \
  --file slide3.png \
  --caption "legenda" \
  --format carousel

# Reel
npm run publicar -- --slug <slug> --file video.mp4 --caption "legenda" --format reel

# Testar sem publicar
npm run publicar -- --slug <slug> --file img.png --caption "teste" --dry-run
```

**Pré-requisito:** `clients/[slug]/instagram-config.json` com `accessToken` e `igUserId`

### Carrossel — Geração e Renderização

```bash
npm run carousel:generate       # Gera HTML do carrossel
npm run carousel:render         # Renderiza HTML → PNG
```

---

## 9. Pipelines

### Economia de Tokens

```bash
# Regra operacional
workflows/token-economy.md
```

**Fluxo:** fundacao minima → `_admin.md` do grupo → uma skill → contexto minimo da skill.  
**Regra:** agents executam, skills decidem, MarketingOS governa.

```bash
/pipeline branding-completo     # branding → brand-kit → site
/pipeline lancamento-conteudo   # oferta → carrossel → post → imagem
/pipeline diagnostico           # relatorio → funil → oferta
/pipeline seo-completo          # investigar → seo → post
/pipeline campanha-paga         # oferta → anuncio → imagem
```

---

## Configurações por Cliente

| Arquivo | Função |
|---|---|
| `clients/[slug]/client.md` | Identidade, tom, ICP, metas |
| `clients/[slug]/estrategia.md` | Foco atual e próximas ações |
| `clients/[slug]/campaigns.md` | Histórico de campanhas e publicações |
| `clients/[slug]/notes.md` | Alertas e inteligência acumulada |
| `clients/[slug]/runs.md` | Histórico de sessões |
| `clients/[slug]/metrics.json` | Performance por canal |
| `clients/[slug]/brand-kit.json` | Identidade visual |
| `clients/[slug]/instagram-config.json` | Token Meta Graph API + imgbb |

## Configurações da Agência

| Arquivo | Função |
|---|---|
| `agency/icp.md` | ICP da agência — segmentos e posicionamento |
| `agency/strategy.md` | Estratégia e metas da agência |
| `agency/instagram-config.json` | Token para publisher e imgbb da agência |
| `agency/leads/` | Leads prospectados (gitignored) |
| `agency/demos/` | Demos gerados (gitignored) |
| `agency/contacted/` | Log de outreach (gitignored) |
