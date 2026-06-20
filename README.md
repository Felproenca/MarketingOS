# MarketingOS

Sistema operacional de marketing orientado por IA para operação multi-cliente.
Combina skills isoladas, workflows operacionais e inteligência acumulada para gerar aquisição, posicionamento e conversão com alma.

---

## Requisitos

- Node.js 18+
- Git
- Claude Code (CLI) ou Cursor

---

## Instalação

```bash
git clone https://github.com/Felproenca/MarketingOS.git
cd MarketingOS
npm install
```

Manual completo:

```text
docs/manual-de-uso.md
```

Referência rápida de comandos:

```text
workflows/commands.md
```

---

## Fundação — leia antes de operar

```
manifesto.md   → o porquê de tudo — intocável
alma.md        → missão, visão, filtros de criação
AGENTS.md      → hierarquia de operação e grupos de skills
CLAUDE.md      → instruções operacionais completas
.cursorrules   → contexto para o Cursor
```

---

## Fluxo básico

```bash
# 1. Criar novo cliente
node scripts/create-client.js meu-cliente

# 2. Abrir sessão (sempre primeiro)
/abrir meu-cliente

# 3. Executar skills por grupo
/analisar      → relatório, funil, site audit, SEO, estratégia
/criar         → carrossel, post, site, branding, imagem
/prospectar    → mercado, prospector, oferta, pitch, anúncio
/vender        → abordagem e fechamento de lead
/relacionar    → retenção, reativação, head implantado

# 4. Fechar sessão (sempre ao final)
/fechar
```

---

## Estado operacional atual

### Cockpit

```bash
npm run scraper:panel
```

Abre o painel local com Pipeline, Agenda, Metricas e Config.

### Agenda de conteudo

```bash
npm run agenda:plan -- --slug felipe-proenca
```

Fluxo:

```text
Agenda -> Planejar semana -> Preparar -> Validar envio -> PUBLICAR
```

Nada publica sozinho. Publicacao real exige confirmacao `PUBLICAR`.

### Motor de DM

```bash
npm run dm-engine
npm run dm:test -- --port 4280
```

Fluxo:

```text
comentario DIAGNOSTICO
-> DM com link
-> lead magnet
-> captura com nome, WhatsApp, e-mail, site/Instagram e negocio
```

Guia de deploy:

```text
scripts/dm-engine/DEPLOY.md
```

### Metricas de aquisicao

```bash
npm run insights:aquisicao -- --slug felipe-proenca
```

Grava:

```text
clients/[slug]/acquisition-metrics.json
```

O Cockpit le esse arquivo na aba Metricas.

### Creative OS e construcao

Antes de gerar site, reel, carrossel, imagem, motion ou `/construir`, consultar:

```text
intelligence/creative-os.md
intelligence/creative-direction-engine.md
intelligence/motion-pattern-library.md
intelligence/doctrine-direcao-de-arte.md
```

Fluxo recomendado para video/animacao:

```text
Creative OS -> Creative Direction Engine -> Motion Pattern Library -> escolha do engine -> render -> critica frame a frame
```

Matriz de engine:

```text
render-reel.js = teste rapido/local
HyperFrames    = peca autoral, motion web, GSAP, Canvas, UI, direcao visual
Remotion       = escala, templates, dados, series, componentes React
Manim          = diagramas e explicacoes tecnicas
```

Runtime dentro do HyperFrames:

```text
GSAP        = timeline densa, sequenciamento e easing cinematografico
Anime.js    = stagger, SVG draw/morph/path, motion leve e modular
Three.js    = 3D, particulas, camera e profundidade real
Lottie      = asset pronto de motion/design
CSS/WAAPI   = microinteracao simples
```

Repositorio HyperFrames:

```text
external/hyperframes -> https://github.com/heygen-com/hyperframes
```

Ao clonar o MarketingOS em outra maquina:

```bash
git submodule update --init --recursive
```

Requisitos do HyperFrames: Node.js 22+ e FFmpeg.

Skills HyperFrames para agentes:

```bash
npx.cmd skills add heygen-com/hyperframes --agent codex --skill '*' -y
```

O lock fica em:

```text
skills-lock.json
```

Gerar blueprint:

```bash
node scripts/construir.mjs --objetivo "site de aquisicao" --brand felipe-proenca --query "site marketing dark conversao"
```

---

## Estrutura

```
/marketing-os
  manifesto.md          → documento fundacional
  alma.md               → constituição operacional
  AGENTS.md             → hierarquia de operação
  CLAUDE.md             → instruções para o sistema
  .cursorrules          → contexto para o Cursor
  /clients
    /_template          → modelo base
    /[slug]             → ambiente por cliente
      client.md · notes.md · estrategia.md · runs.md
      campaigns.md · metrics.json · brand-kit.json
      /outputs          → posts, carousels, site, branding...
  /skills
    /analise            → /analisar
    /criacao            → /criar
    /aquisicao          → /prospectar
    /venda              → /vender
    /relacionamento     → /relacionar
  /workflows            → open, close, pipeline, onboarding...
  /intelligence         → patterns, benchmarks, system-usage, repertoire-updaters
  /templates            → pitch-deck-template.html
  /scripts              → create-client.js, command-router.js
```

---

## Regras operacionais

- Nunca operar sem `/abrir` primeiro
- Nunca fechar sem `/fechar` — aprendizado não salvo é perdido
- Todo output vai para `clients/[slug]/outputs/`
- Nunca misturar contexto entre clientes
- O que não é verdadeiro não sai

---

## Scripts principais

```bash
npm run novo -- [slug]
npm run cmd -- /status
npm run cmd -- /creative-os
npm run cmd -- /direcao-peca
npm run cmd -- /construir
npm run carousel:generate -- --slug [slug] --tema "tema"
npm run carousel:render
npm run agenda:plan -- --slug [slug]
npm run dm-engine
npm run dm:test -- --port 4280
npm run insights:aquisicao -- --slug [slug]
npm run prospector -- --slug [slug] --query "busca" --city "cidade" --dry-run
npm run scraper -- "busca cidade" --dry-run
npm run scraper:dry -- "busca cidade"
npm run criar-conteudo -- [slug] --tema "tema"
npm run upload-image -- --content [id] --slide 1 --file imagem.png --slug [slug]
npm run aprender -- --slug [slug]
npm run demo -- --query "busca" --city "cidade" --segment clinica --dry-run
npm run publicar -- --slug [slug] --file img.png --caption "legenda" --dry-run
npm run repertoire:update
npm run repertoire:acquisition
```

### Intelligence externa

```bash
# Etapa 1: atualiza os 4 repertorios gerais
npm run repertoire:update

# Etapa 2: filtra apenas o que fortalece aquisicao de clientes
npm run repertoire:acquisition
```

Agenda e outputs:

```text
intelligence/repertoire-updaters/schedule.md
intelligence/repertoire-scan-report.md
intelligence/repertoire-updaters/acquisition.md
```
