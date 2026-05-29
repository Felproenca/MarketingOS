---
name: skill-funnel-analysis
version: "1.0"
group: analise
command: /analisar funil
inputs:
  required: [metrics.json, client.md, campaigns.md]
  optional: []
env: []
---

# skill-funnel-analysis.md — Análise de Funil
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: `metrics.json` + `client.md` + `campaigns.md`.

---

## Contexto mínimo necessário
→ metrics.json — completo (tráfego, leads, conversões por canal)
→ client.md — Bloco 1 (ticket médio, canais) + Bloco 7 (metas)
→ campaigns.md — campanhas ativas e histórico recente
→ NÃO carregar: brand-kit.json, alma.md, notes.md, estrategia.md, intelligence/

---

## Objetivo da Skill

Mapear e analisar o funil completo de aquisição do cliente, identificando:
- Onde os leads entram e por qual canal
- Em qual etapa o funil quebra (maior ponto de queda)
- Qual etapa tem maior potencial de melhoria
- Ações concretas para aumentar conversão em cada etapa

---

## Input Esperado

```
1. metrics.json         → dados de tráfego, leads e conversões por canal
2. campaigns.md         → campanhas ativas e histórico
3. client.md            → metas, canais ativos, ticket médio
4. Período de análise   → [ últimos 30 / 60 / 90 dias ]
```

---

## Etapas do Funil Analisadas

```
TOPO — Atração
  → Impressões / Alcance / Sessões no site / Seguidores

MEIO — Engajamento
  → Cliques / CTR / Tempo na página / Interações / Salvamentos

FUNDO — Conversão
  → Leads capturados / CPL / Taxa de conversão / Contatos no WhatsApp

PÓS-FUNIL — Fechamento
  → Leads qualificados / Propostas enviadas / Conversões / Ticket médio / ROAS
```

---

## Lógica de Análise Interna

Antes de gerar o relatório, execute esta sequência:

```
1. Qual canal traz mais volume no topo?
2. Qual canal tem melhor CTR (topo → meio)?
3. Qual etapa tem maior queda percentual?
4. O CPL está acima ou abaixo do benchmark do setor?
5. A taxa de conversão do site está acima de 2%?
   → Se não: problema no meio ou fundo do funil
6. Leads chegam no WhatsApp mas não convertem?
   → Problema no script de atendimento ou qualificação
7. Leads não chegam suficiente?
   → Problema no topo — tráfego ou oferta de entrada
8. Leads chegam mas não são qualificados?
   → Problema na segmentação ou no ativo de captura
```

---

## Formato de Output

---

### ANÁLISE DE FUNIL — [Nome do Cliente]
**Período:** [ ]
**Canais analisados:** [ ]

---

#### Mapa do Funil

```
TOPO
  Impressões totais:        [ ]
  Alcance total:            [ ]
  Sessões no site:          [ ]
  Taxa de clique (CTR):     [ ]%

        ↓ [ ]% avançam para o meio

MEIO
  Engajamentos:             [ ]
  Cliques em CTA:           [ ]
  Tempo médio na página:    [ ]s
  Taxa de rejeição:         [ ]%

        ↓ [ ]% avançam para o fundo

FUNDO
  Leads capturados:         [ ]
  CPL médio:                R$ [ ]
  Taxa de conversão:        [ ]%
  Contatos WhatsApp:        [ ]

        ↓ [ ]% avançam para fechamento

PÓS-FUNIL
  Leads qualificados:       [ ]
  Propostas enviadas:       [ ]
  Conversões (vendas):      [ ]
  Ticket médio:             R$ [ ]
  Receita gerada:           R$ [ ]
```

---

#### Diagnóstico por Etapa

**Topo**
```
Status:       [ Saudável / Atenção / Crítico ]
Análise:      [ o que os dados indicam ]
Ação:         [ o que fazer para melhorar ]
```

**Meio**
```
Status:       [ Saudável / Atenção / Crítico ]
Análise:      [ o que os dados indicam ]
Ação:         [ o que fazer para melhorar ]
```

**Fundo**
```
Status:       [ Saudável / Atenção / Crítico ]
Análise:      [ o que os dados indicam ]
Ação:         [ o que fazer para melhorar ]
```

**Pós-funil**
```
Status:       [ Saudável / Atenção / Crítico ]
Análise:      [ o que os dados indicam ]
Ação:         [ o que fazer para melhorar ]
```

---

#### Principal Ponto de Quebra

```
Etapa com maior queda:    [ ]
Percentual de queda:      [ ]%
Causa provável:           [ ]
Impacto estimado se corrigido: [ ] leads/mês adicionais
```

---

#### Comparativo por Canal

| Canal | Leads | CPL | Taxa Conv. | Status |
|---|---|---|---|---|
| Meta Ads | [ ] | R$ [ ] | [ ]% | [ ] |
| Instagram Orgânico | [ ] | — | [ ]% | [ ] |
| WhatsApp Orgânico | [ ] | — | [ ]% | [ ] |
| Site (formulário) | [ ] | — | [ ]% | [ ] |

**Canal mais eficiente:** [ ] — motivo: [ ]
**Canal para revisar:** [ ] — motivo: [ ]

---

#### Plano de Ação Prioritário

```
Prioridade 1 — impacto imediato (esta semana):
→ Etapa: [ ]
→ Ação: [ ]
→ Resultado esperado: [ ]

Prioridade 2 — impacto médio prazo (este mês):
→ Etapa: [ ]
→ Ação: [ ]
→ Resultado esperado: [ ]

Prioridade 3 — otimização contínua:
→ Etapa: [ ]
→ Ação: [ ]
→ Resultado esperado: [ ]
```

---

## Regras de Qualidade

1. **Nunca analisar canal com dados ausentes** — sinalizar como "sem dados suficientes"
2. **Diagnóstico sem ação é inútil** — cada status tem uma ação correspondente
3. **CPL isolado não decide nada** — cruzar sempre com ticket médio e taxa de fechamento
4. **Identificar o gargalo principal antes de sugerir ações** — atacar o maior problema primeiro
5. **Taxa de conversão abaixo de 1% no site é sinal crítico** — priorizar antes de escalar tráfego

---

## Checkpoints

⏸ **CP1 — Diagnóstico aprovado**
Mapa do funil com gargalos identificados → apresentar diagnóstico antes de gerar recomendações.
Permite ao operador corrigir dados ou prioridades antes de receber o plano de ação.

---

## Checklist antes de entregar

- [ ] O funil foi mapeado ponta a ponta com dados reais do `metrics.json`?
- [ ] O principal ponto de quebra foi identificado?
- [ ] Cada etapa tem diagnóstico + ação associada?
- [ ] O comparativo por canal está preenchido?
- [ ] O plano de ação tem priorização clara?
- [ ] Dados estimados foram sinalizados como tal?

---

## Exemplo de Ativação no Cursor

```
Use a skill-funnel-analysis.md.

Cliente: [slug]
Período: [30 / 60 / 90 dias]
Arquivos: metrics.json + campaigns.md + client.md
```

---

*Skill v1.0 — MarketingOS*
