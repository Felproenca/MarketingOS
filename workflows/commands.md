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
| `/site` | Desenvolve site ou landing page | `skills/skill-site-builder.md` |
| `/oferta` | Posiciona e adapta oferta por canal | `skills/skill-offer-positioning.md` |
| `/captacao` | Estrutura fluxo de captura de leads | `skills/skill-lead-capture.md` |

---

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
| `/salvar` | Commit de todos os arquivos alterados na sessao | `scripts/save.js` |
| `/atualizar` | Varre arquivos do cliente ativo e lista pendencias | `scripts/command-router.js` |
| `/status` | Mostra estado atual do cliente ativo | `scripts/command-router.js` |

---

## Comportamento padrao

1. Identificar comando digitado
2. Verificar se cliente ativo esta definido
3. Carregar `client.md` do cliente ativo
4. Verificar inputs obrigatorios
5. Executar skill ou workflow correspondente
6. Ao final, oferecer salvar aprendizado no `notes.md`
