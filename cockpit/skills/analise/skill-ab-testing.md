---
name: skill-ab-testing
version: "1.0"
group: analise
command: /analisar ab
inputs:
  required: [client.md]
  optional: [metrics.json, brand-intelligence.json, intelligence/benchmarks.json]
env: []
---

# skill-ab-testing.md — Testes A/B com IA
> Skill isolada do MarketingOS.
> Gera variações de conteúdo, define métricas, e analisa vencedores com IA.
> Decisões baseadas em dados, não em intuição.

---

## Por que esta skill existe

A maioria das equipes de marketing decide por intuição:
- "Eu acho que esse gancho funciona melhor"
- "Essa cor converte mais"
- "Esse CTA é mais forte"

Testes A/B automatizados transformam essas suposições em dados.
Esta skill gera as variações, define as métricas, e analisa os resultados.

---

## Contexto mínimo necessário

```
→ client.md — blocos 1, 2 e 3 (negócio, persona, posicionamento)
→ brand-intelligence.json — voz + restrições (se existir)
→ metrics.json — dados de performance anteriores (se existir)
→ NÃO carregar: campaigns.md, notes.md, estrategia.md
```

---

## Objetivo

1. **Gerar** variações de conteúdo para teste
2. **Definir** métricas e hipóteses claras
3. **Estruturar** o teste com grupo controle e variante
4. **Analisar** resultados com significância estatística
5. **Recomendar** vencedor com confiança

---

## Input Esperado

```
1. Elemento a testar    → [gancho, CTA, visual, copy, formato, horário]
2. Variações            → [quantas variações criar — ou gerar automaticamente]
3. Métrica primária     → [alcance, engajamento, conversão, clique]
4. Canal                → [Instagram, Email, Ads, Site]
5. Período              → [quanto tempo rodar o teste]
```

---

## Workflow de 5 Passos

### Passo 1 — Definição do Teste

```json
{
  "teste": {
    "nome": "",
    "elemento_testado": "",
    "hipotese": "Se [elemento] mudar para [variação], então [métrica] vai [melhorar/piorar] porque [razão]",
    "metrica_primaria": "",
    "metrica_secundaria": "",
    "periodo_recomendado": "",
    "tamanho_amostra_minimo": 0,
    "nivel_confianca": "95%"
  }
}
```

**Tipos de teste suportados:**

| Tipo | O que testa | Exemplo |
|---|---|---|
| **Gancho** | Primeira frase / headline | "Você sabia que..." vs "O problema é..." |
| **CTA** | Chamada para ação | "Saiba mais" vs "Comece agora" vs "Fale comigo" |
| **Visual** | Imagem, cores, layout | Fundo escuro vs claro, pessoa vs produto |
| **Copy** | Extensão, tom, estrutura | Longo vs curto, formal vs informal |
| **Formato** | Tipo de conteúdo | Carrossel vs Reel vs Post único |
| **Horário** | Horário de publicação | 12h vs 19h vs 22h |
| **Preço/Oferta** | Posicionamento de preço | Parcelamento vs desconto à vista |

---

### Passo 2 — Geração de Variações

Para cada elemento, gerar variações estratégicas:

#### Exemplo: Teste de Gancho

```
CONTROLE (A):
"Descubra como aumentar suas vendas com conteúdo"

VARIANTE B (Curiosidade):
"O erro que 90% dos negócios cometem no Instagram"

VARIANTE C (Prova Social):
"Como este cliente aumentou 3x o faturamento em 90 dias"

VARIANTE D (Medo/Perda):
"Você está perdendo clientes sem saber por quê"
```

#### Exemplo: Teste de CTA

```
CONTROLE (A):
"Saiba mais"

VARIANTE B (Ação):
"Comece agora — é grátis"

VARIANTE C (Urgência):
"Garanta sua vaga antes que acabe"

VARIANTE D (Suave):
"Quero entender melhor"
```

**Regras para variações:**
- Cada variante testa UMA mudança (não múltiplas)
- Variante B+ deve ser significativamente diferente de A
- Manter coerência com brand-intelligence.json
- Não criar variações que violem restrições da marca

---

### Passo 3 — Estrutura do Teste

```json
{
  "estrutura": {
    "controle": {
      "id": "A",
      "descricao": "",
      "elemento": ""
    },
    "variantes": [
      {
        "id": "B",
        "descricao": "",
        "elemento": "",
        "diferenca_vs_controle": ""
      }
    ],
    "distribuicao": {
      "metodo": "random | time-split | audience-split",
      "proporcao": "50/50 ou 33/33/33",
      "criterio": ""
    },
    "parametros": {
      "periodo": "",
      "minimo_por_variante": 0,
      "confidence_level": "95%",
      "power": "80%"
    }
  }
}
```

**Métodos de distribuição:**

| Método | Quando usar | Como |
|---|---|---|
| **Random** | Mesma audiência, mesmo momento | Dividir audiência aleatoriamente |
| **Time-split** | Testar horários | Manter conteúdo, mudar horário |
| **Audience-split** | Segmentos diferentes | Testar em públicos similares |
| **Sequential** | Pouca audiência | Rodar A 1 semana, depois B 1 semana |

---

### Passo 4 — Análise de Resultados

Quando os dados estiverem disponíveis (metrics.json ou input manual):

```json
{
  "resultados": {
    "controle_A": {
      "impressoes": 0,
      "cliques": 0,
      "conversoes": 0,
      "taxa_conversao": "0%",
      "ctr": "0%",
      "custo_por_resultado": 0
    },
    "variante_B": {
      "impressoes": 0,
      "cliques": 0,
      "conversoes": 0,
      "taxa_conversao": "0%",
      "ctr": "0%",
      "custo_por_resultado": 0
    },
    "vencedor": "",
    "confianca": "",
    "diferenca_relativa": "",
    "significancia_estatistica": ""
  }
}
```

**Critérios de decisão:**

```text
Se confiança >= 95% e diferença > 5%:
  → Adotar vencedor como novo controle

Se confiança >= 90% e diferença > 10%:
  → Tendência forte — considerar adotar

Se confiança < 90% ou diferença < 5%:
  → Sem vencedor claro — continuar teste ou testar variação mais agressiva
```

---

### Passo 5 — Recomendações

```json
{
  "recomendacoes": {
    "vencedor": "",
    "proxima_acao": "adotar | continuar_teste | criar_variante_mais_agressiva",
    "aprendizados": [],
    "proximos_testes": [],
    "impacto_estimado": ""
  }
}
```

**Próximos testes sugeridos:**
- Se gancho B venceu → testar CTA com novo gancho
- Se CTA B venceu → testar visual com novo CTA
- Se ambos venceram → combinar e testar juntos

---

## Output Structure

```
clients/[slug]/outputs/ab-tests/
├── [nome-teste]/
│   ├── definicao.json      → hipótese, métricas, estrutura
│   ├── variacoes.json      → todas as variações geradas
│   ├── resultados.json     → dados de performance
│   ├── analise.json        → análise estatística
│   └── recomendacoes.md    → próximos passos
└── historico/
    └── resumo-testes.md    → todos os testes realizados
```

---

## Integração com outras skills

| Skill | Relação |
|---|---|
| brand-intelligence | Garante que variações respeitam voz/estilo |
| skill-social-copy | Gera copy para variações |
| skill-visual-spec | Gera specs visuais para variações |
| skill-dashboard | Fornece métricas para análise |
| skill-performance-learning | Alimenta aprendizado com resultados |

---

## Comando

```
/analisar ab                    → listar testes ativos
/analisar ab criar [elemento]   → criar novo teste
/analisar ab analise [teste]    → analisar resultados
/analisar ab historico          → histórico de testes
```

---

## Anti-padrões

- **NUNCA** testar mais de 1 variável por vez
- **NUNCA** parar o teste antes do período mínimo
- **NUNCA** ignorar significância estatística
- **NUNCA** adotar vencedor com confiança < 90%
- **SEMPRE** documentar hipótese antes do teste
- **SEMPRE** manter grupo controle idêntico ao original
- **SEMPRE** registrar aprendizados para próximos testes

---

*O que não é testado é chute. O que é testado é vantagem.*
