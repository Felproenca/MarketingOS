---
name: skill-seo
version: "1.0"
group: analise
command: /analisar seo
inputs:
  required: [client.md]
  optional: [intelligence/benchmarks.json]
env: []
---

# skill-seo.md — Estratégia e Otimização SEO
> Skill isolada do MarketingOS.
> Workflow completo de 8 passos: pesquisa de palavras-chave até plano de ação.
> Output: estratégia SEO + checklist de otimização salvo em `outputs/seo/`.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2 e 3 (negócio, persona, concorrência e posicionamento)
→ intelligence/benchmarks.json — benchmarks de tráfego orgânico do nicho (se disponível)
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, alma.md, notes.md, estrategia.md

---

## Objetivo

Desenvolver uma estratégia de SEO baseada no negócio real do cliente — não templates genéricos.
Foco em: tráfego orgânico qualificado, autoridade de nicho e conversão.

---

## Input Esperado

```
1. URL do site        → [endereço do site do cliente — se existir]
2. Produto/serviço    → [o que o cliente vende — extraído do client.md]
3. Localização        → [cidade / região / nacional / internacional]
4. Concorrentes       → [1 a 3 concorrentes conhecidos — opcional]
5. Objetivo do SEO    → [ Tráfego geral / Produto específico / Blog / Local ]
```

---

## Workflow de 8 Passos

### Passo 1 — Entender o negócio no contexto de busca

Com base no `client.md`, identifique:

```
Como o público busca o que o cliente vende?
  - Busca por problema: "[problema que resolve]"
  - Busca por solução: "[produto/serviço específico]"
  - Busca por comparação: "melhor [categoria] para [situação]"
  - Busca local: "[serviço] em [cidade]"

Intenção de compra predominante: [ Informacional / Navegacional / Transacional / Local ]
```

---

### Passo 2 — Pesquisa de palavras-chave primárias

Gere 10 a 15 palavras-chave relevantes organizadas por tipo:

| Palavra-chave | Tipo | Volume estimado | Dificuldade | Intenção |
|---|---|---|---|---|
| [kw 1] | Head term | Alto | Alta | Transacional |
| [kw 2] | Long tail | Médio | Baixa | Informacional |
| ... | | | | |

**Head terms** (1-2 palavras): alta competição, volume alto, entrada de funil
**Long tails** (3-5 palavras): menor competição, intenção mais clara, maior conversão

---

### Passo 3 — Análise de concorrentes no Google

Para cada concorrente identificado:

```
Domínio: [url]
Páginas bem posicionadas: [temas que rankeiam]
Palavras-chave dominadas: [kws que eles aparecem e o cliente não]
Gap identificado: [o que eles não cobrem que o cliente poderia]
```

---

### Passo 4 — Auditoria de SEO técnico básico

Se o cliente já tem site, verifique:

- [ ] Title tag presente e com palavra-chave?
- [ ] Meta description com CTA?
- [ ] H1 único por página?
- [ ] Imagens com alt text?
- [ ] URL amigável (sem parâmetros ou números aleatórios)?
- [ ] Site mobile-friendly?
- [ ] Velocidade de carregamento aceitável?
- [ ] Sitemap e robots.txt configurados?

Se não tem site: registrar como prioridade e vincular com `/site`.

---

### Passo 5 — Estratégia de conteúdo SEO

Com base nas palavras-chave e gaps, monte um plano de conteúdo:

```
Página de produto/serviço principal:
  Palavra-chave: [kw]
  Título sugerido: [título otimizado]
  Meta description: [texto até 155 caracteres]

Artigos de blog (se aplicável):
  1. [título — long tail] → intenção: [informacional/transacional]
  2. [título — long tail] → intenção: [informacional/transacional]
  3. [título — long tail] → intenção: [informacional/transacional]

Páginas locais (se negócio local):
  "[serviço] em [cidade]" → criar página dedicada
```

---

### Passo 6 — Plano de link building

```
Links internos prioritários:
  - [página A] deve linkar para [página B] com âncora "[texto]"

Oportunidades de link externo:
  - Diretórios do nicho: [listar relevantes]
  - Parcerias locais: [possibilidades]
  - Guest posts: [sites do nicho que aceitam]
  - Google Meu Negócio: [se local — prioridade máxima]
```

---

### Passo 7 — Quick wins (ações de alto impacto, baixo esforço)

Liste 5 ações que podem ser executadas esta semana:

```
1. [ação concreta — ex: "adicionar alt text nas 10 imagens da home"]
2. [ação concreta]
3. [ação concreta]
4. [ação concreta]
5. [ação concreta]
```

---

### Passo 8 — Plano de acompanhamento

```
Métricas a monitorar mensalmente:
  - Posição para [palavra-chave principal]
  - Tráfego orgânico total
  - Taxa de conversão orgânica
  - Páginas de entrada (top 5)

Ferramentas gratuitas recomendadas:
  - Google Search Console (obrigatório)
  - Google Analytics 4
  - Ubersuggest (pesquisa de kw)

Prazo para resultados visíveis: 3 a 6 meses (expectativa realista)
```

---

## Formato de Output

Salve em `clients/[slug]/outputs/seo/[YYYY-MM-DD]-estrategia-seo.md`:

```markdown
# Estratégia SEO — [Nome do Cliente]
Data: [YYYY-MM-DD]
Objetivo: [definido no input]

## Palavras-chave Prioritárias
[tabela do Passo 2]

## Análise de Concorrentes
[Passo 3]

## Auditoria Técnica
[checklist do Passo 4]

## Plano de Conteúdo
[Passo 5]

## Link Building
[Passo 6]

## Quick Wins — Esta Semana
[Passo 7]

## Acompanhamento
[Passo 8]
```

---

## Checkpoints

⏸ **CP1 — Palavras-chave aprovadas**
Pesquisa de palavras-chave concluída → aprovar lista de termos alvo antes de gerar plano de ação.
Palavras-chave erradas aqui contaminam toda a estratégia de conteúdo.

⏸ **CP2 — Plano de ação aprovado**
Estratégia SEO completa gerada → confirmar prioridades antes de salvar e iniciar execução.

---

## Regras

1. Nunca invente volumes de busca — diga "estimado" e baseie em lógica de nicho.
2. Priorize long tails para clientes novos no SEO — ranquear head terms leva anos.
3. SEO local é quick win para negócios físicos — priorizá-lo sempre.
4. Conecte o plano de conteúdo SEO com `skill-post.md` ou `skill-site-builder.md` para execução.
5. Se o cliente não tem site, sinalize que o SEO começa pelo site — execute `/site` primeiro.

---

## Exemplo de Ativação

```
/seo
URL: shanafinejoias.com.br
Produto: joias em ouro 18k
Localização: Brasil (nacional)
Objetivo: Tráfego para produto + blog de autoridade
```

---

*Skill v1.0 — MarketingOS*
