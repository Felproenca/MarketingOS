# Repertoire scan report - MarketingOS

Atualizado em: 2026-06-07T01:23:27.740Z

## Sumario executivo
Os quatro repositorios nao devem ser copiados em bloco. Eles formam quatro camadas de atualizacao:

- `marketingskills`: repertorio granular de marketing/GTM e integracoes.
- `ai-marketing-claude`: suite operacional para auditoria, proposta e relatorio.
- `claude-skills`: governanca, padrao de autoria, multiagentes e business operations.
- `ai-marketing-claude-code-skills`: voz, autoridade, pesquisa, social proof e outreach.

Filtro MarketingOS: importar metodo e prova; rejeitar linguagem generica. Tudo precisa passar por desejo antes de necessidade, medo antes de tecnologia, conversao antes de volume.

## Mapa por fonte
### coreyhaines31/marketingskills
- Fonte: https://github.com/coreyhaines31/marketingskills
- Commit: 7f4af1e
- Arquivos: 365
- Skills: 43
- Referencias/templates/assets: 98
- Scripts/tools: 162
- Agents: 0
- Updater: `intelligence/repertoire-updaters/marketingskills.md`
- Melhor uso: CRO, copywriting, paid ads, SEO/AEO, analytics, prospecting, RevOps, retention
- Alvos internos: skills/analise, skills/criacao, skills/aquisicao, skills/relacionamento, intelligence, scripts/integration

### zubair-trabzada/ai-marketing-claude
- Fonte: https://github.com/zubair-trabzada/ai-marketing-claude
- Commit: e5aa0ea
- Arquivos: 37
- Skills: 15
- Referencias/templates/assets: 6
- Scripts/tools: 4
- Agents: 5
- Updater: `intelligence/repertoire-updaters/ai-marketing-claude.md`
- Melhor uso: website audit, proposal, landing CRO, competitor scan, PDF/Markdown report, content calendar
- Alvos internos: skills/analise, skills/aquisicao, workflows, templates, scripts/demo-pipeline

### alirezarezvani/claude-skills
- Fonte: https://github.com/alirezarezvani/claude-skills
- Commit: fcd4fa1
- Arquivos: 4461
- Skills: 757
- Referencias/templates/assets: 954
- Scripts/tools: 576
- Agents: 190
- Updater: `intelligence/repertoire-updaters/claude-skills.md`
- Melhor uso: skill authoring, multi-agent governance, C-level review, RevOps, customer success, business operations
- Alvos internos: CLAUDE.md, workflows, skills/relacionamento, skills/venda, skills/aquisicao, docs

### BrianRWagner/ai-marketing-claude-code-skills
- Fonte: https://github.com/BrianRWagner/ai-marketing-claude-code-skills
- Commit: f36b34f
- Arquivos: 89
- Skills: 23
- Referencias/templates/assets: 8
- Scripts/tools: 3
- Agents: 0
- Updater: `intelligence/repertoire-updaters/ai-marketing-claude-code-skills.md`
- Melhor uso: voice extraction, de-AI-ify, LinkedIn authority, AI discoverability, cold outreach, case studies
- Alvos internos: skills/criacao, skills/aquisicao, skills/venda, intelligence/patterns.md, templates


## O que nao deixar passar
- Scoring e pesos: transformar auditorias em diagnosticos de decisao, nao em notas decorativas.
- Context loading gates: adotar leitura minima por skill para economizar tokens.
- Dual files e modos: quick/standard/deep podem virar leve/padrao/profundo no MarketingOS.
- Referencias de plataforma: limites, benchmarks, compliance e specs devem alimentar intelligence, nao ficar presos em skills.
- Scripts utilitarios: so entram quando fecham loop operacional real.
- Agents paralelos: usar apenas para analise com dimensoes independentes.
- Templates: converter para outputs/clientes com alma; nunca usar como copia final.

## Proximas atualizacoes sugeridas
1. Criar uma skill `analise/skill-auditoria-site.md` usando o melhor de market-audit, homepage-audit, cro, copywriting e seo-audit.
2. Evoluir `aquisicao/skill-prospecting-agent.md` com sinais de pesquisa, compliance e cold outreach dos repositorios.
3. Evoluir `criacao/skill-social-copy.md` com voice-extractor, de-ai-ify, social e content-idea-generator.
4. Evoluir `relacionamento/skill-retention.md` com churn-prevention e customer-success-manager.

## Como rodar
```bash
npm run repertoire:update
npm run repertoire:update -- --source marketingskills
npm run repertoire:update -- --dry-run
```
