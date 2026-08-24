---
name: skill-trend-research
version: "1.0"
group: analise
command: /analisar tendencias
inputs:
  required: [client.md]
  optional: [intelligence/patterns.md, intelligence/benchmarks.json]
env: []
---

# skill-trend-research.md - Trend/Research Agents como Skill
> Converte `ResearchAgent` e `TrendAgent` em uma skill leve de pesquisa.
> Use para entender contexto, tendencia, saturacao e oportunidades antes de criar.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - nicho, publico, posicionamento
- `intelligence/patterns.md` - somente trechos aplicaveis ao nicho
- `intelligence/benchmarks.json` - somente canal/formato relevante

Nao carregar:
- `brand-kit.json`
- `campaigns.md`
- `metrics.json`, exceto se a pergunta for sobre performance historica

---

## Saida obrigatoria

```text
Tema:
Maturidade: emergente | ascendendo | mainstream | saturado
O que o mercado esta repetindo:
O que ainda esta pouco explorado:
Risco de cliche:
Oportunidade editorial:
Fontes/dados usados:
Confianca: baixa | media | alta
```

---

## Regras

- Separar fato, inferencia e opiniao.
- Nao inventar tendencia.
- Se a informacao for recente ou depender do mercado atual, pesquisar antes.
- Fechar com uma recomendacao de angulo para `skill-niche-intelligence.md`.

