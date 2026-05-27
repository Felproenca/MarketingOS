# relatorio-sistema.md — Relatório Operacional do Sistema
> Localização: /workflows/relatorio-sistema.md
> Executado mensalmente ou quando solicitado via /relatorio-sistema
> Lê /intelligence/system-usage.json e gera análise de uso das skills

---

## Objetivo

Mostrar o que o sistema está realmente usando — e o que existe só no papel.
Base para decisões de otimização, aposentadoria de skills e priorização de melhorias.

---

## Quando executar

Mensalmente ou quando:
→ O sistema parecer lento ou confuso
→ Antes de criar uma skill nova (verificar se já existe algo similar)
→ Após fechar um cliente (avaliar quais skills entregaram valor)

Comando: /relatorio-sistema

---

## Input

/intelligence/system-usage.json — obrigatório

---

## Output

### RELATÓRIO OPERACIONAL — MarketingOS
**Período:** [MÊS/ANO]
**Sessões analisadas:** [N]
**Clientes ativos no período:** [N]

---

#### Ranking de skills por uso

| # | Skill | Grupo | Usos | % do total | Outcome aprovado |
|---|---|---|---|---|---|
| 1 | | | | | |

---

#### Skills nunca usadas — candidatas a aposentar

| Skill | Grupo | Última vez usada | Recomendação |
|---|---|---|---|
| | | nunca | Aposentar / Manter / Revisar |

---

#### Distribuição por grupo

| Grupo | Usos | % |
|---|---|---|
| Criação | | |
| Análise | | |
| Aquisição | | |
| Venda | | |
| Relacionamento | | |

---

#### Insights operacionais
Skill mais usada:        [ ]
Skill menos usada:       [ ]
Grupo dominante:         [ ]
Grupo negligenciado:     [ ]
Cliente com maior uso:   [ ]

---

#### Recomendações
Aposentar:   [ skills com 0 usos em 60+ dias ]
Otimizar:    [ skills com uso alto mas outcome baixo ]
Criar:       [ lacunas identificadas no fluxo ]

---

## Regras

1. Nunca recomendar aposentadoria de skill com menos de 30 dias de sistema ativo
2. Outcome "descartado" repetido na mesma skill → revisar a skill, não o operador
3. Grupo com 0% de uso por 60 dias → investigar antes de aposentar

---

*Workflow v1.0 — MarketingOS*
