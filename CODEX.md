# CODEX.md - MarketingOS
> Contexto global de desenvolvimento do projeto.

## Visao do Projeto
MarketingOS e um sistema operacional de marketing para aquisicao, posicionamento e conversao.
Ele combina `skills` (capacidade isolada), `workflows` (sequencia operacional), contexto por cliente e scripts de execucao.

## Estrutura de Pastas
```txt
/marketing-os
  /clients
    /_template
    /[slug]
      client.md
      notes.md
      campaigns.md
      metrics.json
      brand-kit.json
      estrategia.md
      /outputs
  /skills
  /workflows
  /scripts
  /intelligence
  /templates
  AGENTS.md
  CODEX.md
```

## Skills Ativas

### Sistema (executar sempre)
- `skill-abrir.md` — abre sessão e carrega contexto do cliente ativo
- `skill-salvar.md` — fecha sessão com commit git + atualiza runs.md

### Conteudo
- `skill-carousel.md`
- `skill-post.md`
- `skill-image-generation.md`

### Marca e Site
- `skill-branding.md`
- `skill-site-builder.md`
- `skill-offer-positioning.md`

### Inteligencia e Crescimento
- `skill-investigar.md`
- `skill-seo.md`
- `skill-anuncio.md`
- `skill-publicar.md`

### Analise
- `skill-dashboard.md`
- `skill-funnel-analysis.md`

### Relacionamento
- `skill-lead-capture.md`
- `skill-retention.md`
- `skill-reactivation.md`

## Regras de Implementacao
1. Executar `/abrir` antes de qualquer operacao — sem contexto, sem output.
2. Ler sempre o cliente ativo antes de gerar output.
3. Salvar todo output em `clients/[slug]/outputs/...`.
4. Nunca misturar contexto entre clientes.
5. Priorizar scripts para execucao e skills para decisao.
6. Documentar novos comandos em `workflows/commands.md`.
7. Para gerar site, executar branding antes (`/branding` -> `/site`).
8. Executar `/salvar` ao final de toda sessao com entregavel — atualiza runs.md e faz commit.
9. Para workflows de mais de uma skill, usar `workflows/pipeline-runner.md`.

## Fases
### Fase 1 - Fundacao
- Estrutura de projeto e templates por cliente
- Skills essenciais de conteudo e analise
- Comandos slash operacionais

### Fase 2 - Integracoes
- Integracao com canais usados por cliente (quando aplicavel)
- Pipeline de dados e tracking

### Fase 3 - Memoria e Otimizacao
- Consolidacao de aprendizados em `intelligence/`
- Feedback de performance para evolucao de skills
