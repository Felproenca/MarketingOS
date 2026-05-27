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
/analisar      → relatório, funil, SEO, estratégia
/criar         → carrossel, post, site, branding, imagem
/prospectar    → mercado, prospector, oferta, pitch, anúncio
/vender        → abordagem e fechamento de lead
/relacionar    → retenção, reativação, head implantado

# 4. Fechar sessão (sempre ao final)
/fechar
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
  /intelligence         → patterns, benchmarks, system-usage
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
