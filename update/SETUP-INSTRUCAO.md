# SETUP: Instalar Premium Site Kit no MarketingOS

## O que este prompt faz
Cola este prompt no Claude Code dentro do repo MarketingOS.
Ele vai:
1. Criar a pasta skills/premium-site/ com todos os arquivos
2. Atualizar o CLAUDE.md do repo pra referenciar o kit
3. Verificar que tudo está conectado

---

## PROMPT (copiar daqui pra baixo)

```
Preciso instalar um novo módulo no MarketingOS: o Premium Site Production Kit.

### PASSO 1: Criar estrutura

Crie a pasta skills/premium-site/ e copie os seguintes arquivos que vou fornecer. Cada arquivo está entre marcadores --- ARQUIVO: [nome] --- e --- FIM ARQUIVO ---. Crie todos exatamente como estão.

Os arquivos são:
- skills/premium-site/SKILL.md
- skills/premium-site/choreography-tokens.json
- skills/premium-site/typography-map.json
- skills/premium-site/asset-prompt-templates.json
- skills/premium-site/skeletons/landing-page.html
- skills/premium-site/PROMPT-EXECUCAO.md

### PASSO 2: Atualizar CLAUDE.md

Adicione ao final do CLAUDE.md existente (NÃO substitua, ADICIONE):

```markdown

## Premium Site Production Kit

Skill de produção de sites premium com qualidade de estúdio criativo.
Localização: `skills/premium-site/`

### Quando ativar
- Pedidos de criação de site pra prospect ou cliente
- Pedidos de landing page, site institucional, one-page
- Referências a "site premium", "site de prospecção", "low-ticket site"

### Como usar
1. Ler `skills/premium-site/SKILL.md` (que referencia os demais arquivos)
2. Seguir o fluxo de 5 fases (Leitura → Interpretação → Assets → Montagem → Review)
3. O VisualSpecAgent (`skill-visual-spec.md`) é ESTENDIDO com campos adicionais pra sites
4. Sites de prospects vão em `agency/demos/[slug]/site/`
5. Sites de clientes vão em `clients/[slug]/site/`

### Conexões com skills existentes
- Herda assinatura perceptiva de `skill-creative-direction.md`
- Usa `skill-visual-spec.md` como motor de direção (estendido)
- Usa `skill-image-generation.md` pra gerar assets
- Consulta `intelligence/visual-references.json` e `copy-references.json`
```

### PASSO 3: Atualizar AGENTS.md

Adicione ao AGENTS.md (se existir) uma entrada pro PremiumSiteAgent:

```markdown

### PremiumSiteAgent
- **Função:** Produz sites premium pra prospecção e clientes
- **Skill:** `skills/premium-site/SKILL.md`
- **Input:** Briefing do negócio (nome, nicho, proposta, assets)
- **Output:** Site HTML completo com animações, responsive, OG tags
- **Depende de:** VisualSpecAgent, skill-creative-direction, skill-image-generation
- **Salva em:** `agency/demos/[slug]/site/` ou `clients/[slug]/site/`
```

### PASSO 4: Verificar

Confirme que:
- [ ] skills/premium-site/ existe com 6 arquivos
- [ ] CLAUDE.md referencia o kit
- [ ] AGENTS.md tem a entrada do PremiumSiteAgent
- [ ] O fluxo do SKILL.md referencia os caminhos corretos das skills existentes

Me confirme quando estiver tudo pronto.
```

---

## IMPORTANTE

Depois de colar o prompt acima, o Claude Code vai pedir os arquivos.
Você tem duas opções:

**Opção A (recomendada):** Baixe a pasta premium-site-kit/ que eu gerei, coloque manualmente em skills/premium-site/ no repo, e depois cole apenas os passos 2-4 no Claude Code pra atualizar CLAUDE.md e AGENTS.md.

**Opção B:** Cole o prompt acima e depois cole o conteúdo de cada arquivo quando o Claude pedir. Mais demorado mas funciona.
