# skill-dashboard.md — Análise de Métricas e Dashboard
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer análise.
> Input obrigatório: `metrics.json` do cliente + `client.md` para contexto de metas.

---

## Contexto mínimo necessário
→ metrics.json — completo (canais ativos, goals, dados do período)
→ client.md — Bloco 7 (metas) + canais ativos declarados
→ campaigns.md — campanhas ativas apenas
→ NÃO carregar: brand-kit.json, alma.md, notes.md, estrategia.md, intelligence/

---

## Objetivo da Skill

Gerar análise completa de performance com:
- Leitura e interpretação do `metrics.json`
- Consolidação de dados de todos os canais ativos
- Identificação de padrões, quedas e oportunidades
- Relatório executivo com linguagem clara (para o cliente)
- Relatório técnico com dados brutos (para operação interna)
- Sugestões de ação prioritárias para o próximo período

---

## Input Esperado

```
1. metrics.json         → dados do período atual
2. metrics.json anterior → dados do período anterior (para comparação — opcional)
3. client.md            → metas, canais ativos, persona
4. Tipo de relatório    → [ Executivo / Técnico / Completo ]
5. Período              → [ Semanal / Mensal / Trimestral ]
```

---

## Lógica de Análise

Antes de gerar qualquer relatório, execute internamente esta sequência:

```
1. Quais canais estão com enabled: true no metrics.json?
   → Analise apenas esses. Ignore os desativados.

2. As metas em goals foram atingidas?
   → Calcule gap e percentual de atingimento.

3. Qual canal gerou mais leads com menor CPL?
   → Este é o canal a escalar.

4. Qual canal gerou mais gasto com menor retorno?
   → Este é o canal a revisar ou pausar.

5. Existe queda de performance vs. período anterior?
   → Se sim, identifique em qual canal e a partir de quando.

6. O tráfego do site está convertendo?
   → Compare sessões vs. CTAs clicados vs. leads gerados.

7. O WhatsApp está qualificando ou apenas recebendo volume?
   → Compare conversas vs. leads qualificados vs. conversões.

8. O conteúdo orgânico está gerando alcance ou apenas engajamento interno?
   → Verifique se seguidores cresceram e se há origem de leads via orgânico.
```

---

## Formato de Output — Relatório Executivo

> Linguagem simples. Para o cliente ler e entender sem ser de marketing.

---

### RELATÓRIO EXECUTIVO — [Nome do Cliente]
**Período:** [MÊS / ANO]
**Gerado em:** [DATA]

---

#### Resumo do Período

```
Em [X palavras ou menos]:
- O que foi feito
- O que funcionou
- O que não funcionou
- O que vem a seguir
```

---

#### Resultado vs. Meta

| Indicador | Meta | Realizado | Variação |
|---|---|---|---|
| Leads gerados | [ ] | [ ] | [ +/- % ] |
| CPL médio | R$ [ ] | R$ [ ] | [ +/- % ] |
| Conversões | [ ] | [ ] | [ +/- % ] |
| Receita gerada | R$ [ ] | R$ [ ] | [ +/- % ] |
| Investimento total | R$ [ ] | R$ [ ] | [ +/- % ] |

**Meta geral atingida?** [ Sim / Não / Parcialmente ]

---

#### Performance por Canal

**Meta Ads**
```
Investido: R$ [ ]
Leads: [ ]
CPL: R$ [ ]
ROAS: [ ]
Avaliação: [ Acima da meta / Na meta / Abaixo da meta ]
```

**Instagram Orgânico**
```
Posts publicados: [ ]
Alcance total: [ ]
Engajamento médio: [ ]%
Seguidores ganhos: [ ]
Avaliação: [ ]
```

**WhatsApp**
```
Conversas iniciadas: [ ]
Leads qualificados: [ ]
Taxa de conversão: [ ]%
Canal de origem predominante: [ ]
Avaliação: [ ]
```

**Site**
```
Sessões: [ ]
CTA clicados (WhatsApp + formulário): [ ]
Taxa de conversão do site: [ ]%
Principal origem de tráfego: [ ]
Avaliação: [ ]
```

---

#### Top 3 Insights do Período

```
1. [Insight mais importante — dado + interpretação]

2. [Segundo insight — oportunidade ou alerta]

3. [Terceiro insight — tendência ou padrão identificado]
```

---

#### Próximas Ações Recomendadas

```
Prioridade 1 (fazer esta semana):
→ [Ação específica + canal + motivo]

Prioridade 2 (fazer este mês):
→ [Ação específica + canal + motivo]

Prioridade 3 (planejar para o próximo período):
→ [Ação específica + canal + motivo]
```

---

## Formato de Output — Relatório Técnico

> Para uso interno. Dados brutos + análise aprofundada.

---

### RELATÓRIO TÉCNICO — [Nome do Cliente]
**Período:** [MÊS / ANO]

---

#### Meta Ads — Detalhamento por Campanha

| Campanha | Status | Gasto | Leads | CPL | CTR | ROAS |
|---|---|---|---|---|---|---|
| [ ] | [ ] | R$ [ ] | [ ] | R$ [ ] | [ ]% | [ ] |

**Campanhas para escalar:** [ lista ]
**Campanhas para pausar ou revisar:** [ lista ]
**Testes A/B ativos e resultados:** [ descrever ]

---

#### Site — Funil de Conversão

```
Sessões totais:               [ ]
  ↓ visualizaram CTA:         [ ] ([ ]%)
  ↓ clicaram no CTA:          [ ] ([ ]%)
  ↓ chegaram ao WhatsApp/form: [ ] ([ ]%)
  ↓ viraram lead:             [ ] ([ ]%)
  ↓ viraram cliente:          [ ] ([ ]%)

Maior ponto de queda no funil: [ etapa ]
Ação recomendada: [ ]
```

---

#### WhatsApp — Análise de Fluxos

| Fluxo | Disparos | Respostas | Taxa | Conversões |
|---|---|---|---|---|
| [ ] | [ ] | [ ] | [ ]% | [ ] |

**Fluxo com melhor performance:** [ ]
**Fluxo para otimizar:** [ ]

---

#### Orgânico — Posts com Melhor Desempenho

| Post | Tipo | Alcance | Engajamento | Salvamentos | Observação |
|---|---|---|---|---|---|
| [ ] | [ ] | [ ] | [ ]% | [ ] | [ ] |

**Padrão identificado nos top posts:** [ descrever ]
**Recomendação para próximos conteúdos:** [ ]

---

#### Comparação com Período Anterior

| Indicador | Período Anterior | Período Atual | Variação |
|---|---|---|---|
| Total de leads | [ ] | [ ] | [ +/- % ] |
| CPL médio | R$ [ ] | R$ [ ] | [ +/- % ] |
| Investimento | R$ [ ] | R$ [ ] | [ +/- % ] |
| Sessões no site | [ ] | [ ] | [ +/- % ] |
| Engajamento médio | [ ]% | [ ]% | [ +/- % ] |

---

#### Log de Decisões do Período

```
[ Data ] → [ Ação tomada ] → [ Resultado observado ]
[ Data ] → [ Ação tomada ] → [ Resultado observado ]
```

---

## Regras de Qualidade

1. **Nunca analise canal com `enabled: false`** — dado ausente não é dado zero
2. **Compare sempre com o período anterior quando disponível** — número absoluto sem contexto engana
3. **CPL isolado não decide nada** — sempre cruzar com taxa de conversão e ticket médio
4. **Insight sem ação recomendada é dado, não análise** — cada insight termina com "portanto, fazer X"
5. **Relatório executivo em linguagem do cliente** — sem jargão técnico, sem siglas sem explicação
6. **Priorizar ações de impacto imediato** — o cliente precisa saber o que fazer amanhã, não só no trimestre
7. **Registrar no log de alterações do `campaigns.md`** toda decisão tomada com base neste relatório

---

## Checklist antes de entregar

- [ ] Apenas canais com `enabled: true` foram analisados?
- [ ] As metas do `client.md` foram usadas como referência?
- [ ] Cada insight tem uma ação recomendada associada?
- [ ] O relatório executivo está em linguagem compreensível para o cliente?
- [ ] A comparação com período anterior foi feita (se dados disponíveis)?
- [ ] O funil de conversão do site foi mapeado ponta a ponta?
- [ ] As decisões deste relatório foram registradas no `campaigns.md`?

---

## Exemplo de Ativação no Cursor

```
Use a skill-dashboard.md.

Cliente: [slug do cliente]
Período: [mês/ano]
Tipo de relatório: [Executivo / Técnico / Completo]
Arquivos: metrics.json (atual) + metrics.json (anterior, se disponível)
```

---

*Skill v1.0 — MarketingOS*
*Atualize esta skill sempre que identificar métricas ou cruzamentos de dados relevantes para a operação.*
