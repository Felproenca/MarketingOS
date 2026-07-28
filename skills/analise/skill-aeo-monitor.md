---
name: skill-aeo-monitor
version: "1.0"
group: analise
command: /analisar aeo
inputs:
  required: [client.md]
  optional: [brand-intelligence.json, intelligence/benchmarks.json]
env: []
---

# skill-aeo-monitor.md — Monitor de Presença em AI-Generated Answers
> Skill isolada do MarketingOS.
> Rastreia e otimiza como a marca aparece em respostas de IA (ChatGPT, Gemini, Perplexity, AI Overviews).
> O "novo SEO" — Answer Engine Optimization (AEO) + Generative Engine Optimization (GEO).

---

## Por que esta skill existe

Compradores estão migrando de Google para IAs conversacionais. Estudos mostram que:
- 68.7% das empresas já têm workflows com LLM
- 20.8% usam LLMs para decisão real
- AEO/GEO é a nova fronteira de marketing

Marcas que não aparecem em respostas de IA perdem visibilidade
para concorrentes que otimizam para este canal.

---

## Contexto mínimo necessário

```
→ client.md — blocos 1, 2 e 3 (negócio, persona, posicionamento)
→ brand-intelligence.json — se existir (conhecimento da marca)
→ NÃO carregar: metrics.json, campaigns.md, notes.md
```

---

## Objetivo

1. **Mapear** como a marca aparece (ou deveria aparecer) em AI-generated answers
2. **Diagnosticar** gaps de presença vs concorrentes
3. **Otimizar** conteúdo para ser citado/recomendado por IAs
4. **Monitorar** mudanças na presença ao longo do tempo

---

## Input Esperado

```
1. Marca/produto     → [nome da marca ou produto a monitorar]
2. Queries-alvo      → [perguntas que a audiência faz às IAs — ou gerar automaticamente]
3. Concorrentes      → [1-3 concorrentes para comparar presença]
4. Mercado-alvo      → [pt-BR / en / es / etc.]
```

---

## Workflow de 6 Passos

### Passo 1 — Geração de Queries

Gerar queries organizadas por intenção:

```json
{
  "queries_por_intencao": {
    "descoberta": [
      "O que é [marca]?",
      "Como funciona [produto]?",
      "[categoria] no Brasil — quais opções?"
    ],
    "comparacao": [
      "[marca] vs [concorrente]",
      "Melhor [categoria] — comparação",
      "[marca] vale a pena?"
    ],
    "decisao": [
      "[marca] preço",
      "[marca] review / avaliação",
      "Como contratar [marca]"
    ],
    "pos_compra": [
      "[marca] suporte",
      "[marca] como usar",
      "[marca] problemas comuns"
    ]
  }
}
```

**Fontes de queries:**
- Google Autocomplete
- Perguntas reais de clientes (client.md bloco 8)
- Variações de concorrentes
- Trends do nicho

---

### Passo 2 — Teste de Presença (Run Queries)

Para cada query, testar em múltiplas IAs:

```text
Plataformas a testar:
1. ChatGPT (GPT-4o) — mais usado globalmente
2. Google AI Overview — impacta SEO direto
3. Perplexity — motor de busca AI-native
4. Gemini — Google ecosystem
5. Claude — mercado técnico/enterprise
```

**Para cada query, registrar:**
```json
{
  "query": "",
  "plataforma": "",
  "marca_mencionada": true/false,
  "posicao": "primeira_mencao | segunda_mencao | nao_mencionada",
  "contexto": "como a marca foi descrita",
  "concorrentes_mencionados": [],
  "citacao_fonte": "URL citada pela IA (se houver)",
  "sentimento": "positivo | neutro | negativo"
}
```

---

### Passo 3 — Análise de Presença

Calcular métricas:

```json
{
  "score_presenca": {
    "total_queries": 0,
    "marcas_mencionadas": 0,
    "taxa_presenca": "0%",
    "posicao_media": "",
    "sentimento_geral": ""
  },
  "gaps_criticos": [
    {
      "query": "",
      "problema": "não mencionada / mencionada negativamente / incorreta",
      "concorrente_que_aparece": "",
      "acao_recomendada": ""
    }
  ],
  "oportunidades": [
    {
      "query": "",
      "potencial": "alto | medio | baixo",
      "dificuldade": "facil | media | dificil",
      "acao": ""
    }
  ]
}
```

---

### Passo 4 — Análise de Concorrentes

Para cada concorrente:
- Taxa de presença vs sua marca
- Sentimento das menções
- Fontes que as IAs citam (URLs)
- Gaps onde concorrente aparece e você não

---

### Passo 5 — Plano de Otimização AEO/GEO

Estratégias para aumentar presença em AI answers:

**1. Schema & Structured Data**
```
- FAQ schema no site
- HowTo schema para tutoriais
- Organization schema para dados da marca
- Product schema para produtos
```

**2. Conteúdo Otimizado para Citação**
```
- Artigos que respondem diretamente queries específicas
- Listas comparativas honestas (incluir concorrentes)
- Dados concretos (números, preços, especificações)
- Quotes de especialistas da marca
```

**3. Autoridade & Citability**
```
- Presença em fontes que IAs citam (Wikipedia, LinkedIn, reviews)
- Publicações em nicho técnico
- Depoimentos e cases com dados
- Parcerias com autoridades do setor
```

**4. Technical SEO para AI**
```
- Conteúdo acessível por crawlers (sem paywall pesado)
- Robots.txt permitindo AI crawlers
- Sitemap atualizado
- Cache e performance adequados
```

---

### Passo 6 — Monitoramento Contínuo

Frequência recomendada:
- **Queries críticas (marca):** semanal
- **Queries de comparação:** quinzenal
- **Queries de descoberta:** mensal

Output: `clients/[slug]/outputs/aeo-monitor/`

---

## Output Structure

```
clients/[slug]/outputs/aeo-monitor/
├── queries.json           → queries mapeadas
├── presenca.json          → resultados dos testes
├── analise.json           → análise de presença + gaps
├── concorrentes.json      → benchmark vs concorrentes
├── plano-otimizacao.md    → plano de ação AEO/GEO
└── historico/             → registros de monitoramento
    └── YYYY-MM-DD.json
```

---

## Integração com outras skills

| Skill | Relação |
|---|---|
| skill-seo | AEO complementa SEO tradicional (mesmo workflow 8 passos) |
| brand-intelligence | Fornece conhecimento da marca para queries |
| skill-trend-research | Alimenta queries com tendências do nicho |
| skill-estrategista | Usa dados AEO para decisões estratégicas |

---

## Comando

```
/analisar aeo              → análise completa de presença AI
/analisar aeo [marca]      → análise para marca específica
/analisar aeo monitor      → monitoramento contínuo (agendado)
/analisar aeo plano        → gera plano de otimização
```

---

## Anti-padrões

- **NUNCA** assumir presença sem testar (rodar as queries)
- **NUNCA** ignorar sentimento negativo nas menções
- **NUNCA** focar apenas em uma plataforma de IA
- **SEMPRE** comparar com concorrentes
- **SEMPRE** incluir fontes que IAs citam no plano de otimização
- **SEMPRE** atualizar queries com novas tendências do nicho

---

*A marca que não existe nas respostas de IA não existe para o comprador moderno.*
