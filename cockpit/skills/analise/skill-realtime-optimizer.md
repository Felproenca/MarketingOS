---
name: skill-realtime-optimizer
version: "1.0"
group: analise
command: /analisar realtime
inputs:
  required: [metrics.json, campaigns.md]
  optional: [brand-intelligence.json, intelligence/benchmarks.json]
env:
  optional: [INSTAGRAM_ACCESS_TOKEN, META_AD_TOKEN, GOOGLE_ADS_REFRESH_TOKEN]
env: []
---

# skill-realtime-optimizer.md — Otimização em Tempo Real
> Skill isolada do MarketingOS.
> Fecha o loop: métricas → diagnóstico → ajuste automático → re-medir.
> Não substitui decisão humana — accelera o ciclo de aprendizado.

---

## Por que esta skill existe

O loop atual funciona assim:
1. Criar conteúdo → publicar → medir → aprender
2. O aprendizado alimenta `notes.md` e `intelligence/patterns.md`
3. Mas o ajuste é **manual** — alguém precisa ler, interpretar e agir

Esta skill automatiza o passo 3:
- Detecta underperformance em tempo real
- Sugere (ou executa) ajustes automáticos
- Fecha o loop de aprendizado

---

## Contexto mínimo necessário

```
→ metrics.json — dados de performance recentes (últimas 24-72h)
→ campaigns.md — campanhas ativas e agendadas
→ brand-intelligence.json — se existir (para ajustes de voz)
→ NÃO carregar: notes.md, estrategia.md, templates
```

---

## Workflow de 4 Passos

### Passo 1 — Coleta de Sinais

Monitorar sinais de performance em tempo real:

```json
{
  "sinais": {
    "urgentes": [
      "Engajamento > 50% abaixo da média nas primeiras 2h",
      "Reclamações ou comentários negativos (>3 em 1h)",
      "Link quebrado detectado (cliques = 0 com impressões altas)",
      "Suspensão de anúncio por violação de política"
    ],
    "oportunidades": [
      "Post com engajamento 2x acima da média → boost orgânico",
      "Horário com pico de atividade não explorado",
      "Formato que performa melhor que outros → aumentar frequência",
      "CTA com taxa de clique acima do benchmark"
    ],
    "aprendizados": [
      "Padrão de horário que consistently performa",
      "Tipo de conteúdo que gera mais saves que likes",
      "Comprimento de copy com melhor retenção"
    ]
  }
}
```

---

### Passo 2 — Diagnóstico Automático

```json
{
  "diagnostico": {
    "post_analisado": "",
    "metricas_chave": {
      "alcance": 0,
      "engajamento": 0,
      "taxa_engajamento": "0%",
      "cliques": 0,
      "salvamentos": 0,
      "compartilhamentos": 0,
      "comentarios": 0,
      "leads_gerados": 0
    },
    "vs_benchmark": {
      "alcance": "+/- 0%",
      "engajamento": "+/- 0%",
      "conversao": "+/- 0%"
    },
    "classificacao": "overperformer | average | underperformer",
    "causa_provavel": "",
    "acao_recomendada": ""
  }
}
```

**Regras de classificação:**

```text
Overperformer (>150% do benchmark):
  → Oportunidade de boost: aumentar distribuição, re-postar, criar variação

Average (80-150% do benchmark):
  → Manter, testar variação leve

Underperformer (<80% do benchmark):
  → Diagnosticar causa: gancho? formato? horário? CTA?
  → Ajustar ou pausar

Critical (<50% do benchmark OU sinais urgentes):
  → Ação imediata: pausar, corrigir, ou remover
```

---

### Passo 3 — Ações de Otimização

#### Ações Automáticas (sem necessidade de aprovação)

```text
1. AJUSTE DE HORÁRIO
   - Se post agendado para horário com histórico ruim → sugerir novo horário
   - Base: padrões de engajamento do mesmo cliente

2. REFORÇO DE CONTEÚDO OVERPERFORMER
   - Se post orgânico performa >2x → sugerir re-post em Stories
   - Se carrossel performa >2x → sugerir versão Reel

3. PAUSA DE UNDERPERFORMER
   - Se anúncio com CTR < 0.5% após 48h → sugerir pausa
   - Se post com 0 leads após 72h → marcar para revisão

4. AJUSTE DE COPY
   - Se taxa de retenção < 30% no Stories → sugerir copy mais curta
   - Se CTA com < 2% clique → sugerir CTA mais direto
```

#### Ações que Exigem Aprovação

```text
1. MUDANÇA DE ORÇAMENTO
   - Aumentar budget em campanha overperformer
   - Reduzir budget em campanha underperformer

2. MUDANÇA DE SEGMENTAÇÃO
   - Ajustar público baseado em performance por demografia
   - Expandir para públicos similares ao que converte

3. CRIAÇÃO DE VARIAÇÃO
   - Gerar nova versão de post underperformer
   - Testar formato diferente com mesmo conteúdo

4. PAUSA DE CAMPANHA
   - Pausar campanha que não entrega ROI mínimo
```

---

### Passo 4 — Fechamento do Loop

Após cada ação, registrar:

```json
{
  "ciclo": {
    "data": "",
    "post_campanha": "",
    "acao_tomada": "",
    "resultado_esperado": "",
    "resultado_real": "",
    "aprendizado": "",
    "regra_gerada": "",
    "aplicavel_a": "cliente_atual | todos_clientes | nicho_especifico"
  }
}
```

**Regras aprendidas são salvas em:**
- `clients/[slug]/notes.md` — para cliente específico
- `intelligence/patterns.md` — para padrões reutilizáveis
- `intelligence/experiments.md` — para experimentos cross-cliente

---

## Output Structure

```
clients/[slug]/outputs/realtime/
├── sinais.json           → sinais detectados
├── diagnostico.json      → diagnóstico automático
├── acoes.json            → ações tomadas/sugeridas
├── ciclos/               → histórico de ciclos de otimização
│   └── YYYY-MM-DD.json
└── regras-aprendidas.md  → regras extraídas dos ciclos
```

---

## Integração com outras skills

| Skill | Relação |
|---|---|
| skill-performance-learning | Alimenta com dados para análise |
| skill-dashboard | Fornece métricas de entrada |
| skill-ab-testing | Usa resultados de testes para ajustes |
| skill-publicar | Ajusta horários e formatos de publicação |
| skill-anuncio | Otimiza campanhas pagas |

---

## Comando

```
/analisar realtime              → diagnóstico de performance atual
/analisar realtime [post]       → análise de post específico
/analisar realtime acoes        → listar ações sugeridas
/analisar realtime historico    → histórico de otimizações
```

---

## Anti-padrões

- **NUNCA** pausar campanha sem diagnóstico documentado
- **NUNCA** aumentar budget sem evidência de overperformance
- **NUNCA** ajustar mais de 1 variável por vez
- **SEMPRE** registrar ação e resultado para aprendizado
- **SEMPRE** comparar com benchmark do mesmo cliente (não mercado)
- **SEMPRE** respeitar orçamento total do cliente

---

*Otimização não é chute frecuente. É ciclo curto de aprendizado.*
