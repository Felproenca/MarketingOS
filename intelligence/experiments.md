# experiments.md — Experimentos Cross-Client
> Localização: /intelligence/experiments.md
> Testes sendo rodados em paralelo em múltiplos clientes.
> Quando um experimento fecha, o resultado vai para patterns.md ou skill-updates.md.

---

## Por que este arquivo existe

Algumas hipóteses precisam ser testadas em mais de um cliente antes de virar padrão. Este arquivo controla esses testes — quem está rodando, o que está sendo comparado, quando encerra e o que foi concluído.

```
Ciclo de vida de um experimento:

Hipótese identificada (notes.md de um cliente)
  → Experimento criado aqui com status "Planejado"
  → Ativado em 2+ clientes compatíveis → status "Em andamento"
  → Período encerra → resultado analisado → status "Encerrado"
  → Se confirmado: patterns.md + skill-updates.md
  → Se refutado: seção "Experimentos Encerrados" com motivo
```

---

## Formato de entrada

```
### [EXP-ID] — [Título do experimento]

Hipótese:
→ O que se acredita que vai acontecer e por quê

Variável testada:
→ O que muda entre as versões (apenas 1 variável por experimento)

Versão A (controle):
→ O que é feito atualmente

Versão B (teste):
→ O que está sendo testado

Clientes participantes:
→ [ slug-cliente-a, slug-cliente-b ]

Nicho dos clientes:
→ [ nicho ]

Canal:
→ [ Meta Ads / Instagram / WhatsApp / Site ]

Métrica de vitória:
→ [ o que define o vencedor — ex: maior taxa de conversão em 14 dias ]

Período:
→ Início: [ data ] | Encerramento previsto: [ data ]

Status:
→ [ Planejado / Em andamento / Encerrado ]

Resultado:
→ [ preencher ao encerrar ]

Conclusão:
→ [ padrão confirmado / refutado / inconclusivo — e o que fazer com isso ]
```

---

## Experimentos em Andamento

> Nenhum experimento ativo ainda.

---

## Experimentos Planejados

> Hipóteses identificadas aguardando clientes compatíveis para rodar.

---

### [EXP-001] — Gancho emocional vs. informativo em carrossel

```
Hipótese:
→ Carrosséis com gancho emocional (identificação / medo / aspiração) geram
  maior engajamento e salvamentos do que ganchos informativos ("X dicas de Y")
  em nichos onde a decisão é baseada em confiança.

Variável testada:
→ Tipo de gancho no Slide 1

Versão A (controle):
→ Gancho informativo: "5 erros que X pessoas cometem com Y"

Versão B (teste):
→ Gancho emocional: frase de identificação ou aspiração sem número

Clientes participantes:
→ [ aguardando 2 clientes de nicho de confiança ]

Nicho dos clientes:
→ Joalheria, Segurança, Saúde ou similar

Canal:
→ Instagram Orgânico

Métrica de vitória:
→ Maior taxa de salvamentos + engajamento em 21 dias

Período:
→ Início: [ a definir ] | Encerramento: [ 21 dias após início ]

Status:
→ Planejado
```

---

### [EXP-002] — CTA WhatsApp vs. formulário em landing page

```
Hipótese:
→ CTA direto para WhatsApp converte mais leads do que formulário tradicional
  em nichos de serviço local com ticket médio até R$ 500.

Variável testada:
→ Tipo de CTA principal na landing page

Versão A (controle):
→ Formulário com campos: nome + WhatsApp + mensagem

Versão B (teste):
→ Botão direto para WhatsApp com mensagem pré-preenchida

Clientes participantes:
→ [ aguardando 2 clientes com landing page ativa ]

Nicho dos clientes:
→ Qualquer serviço local

Canal:
→ Site / Landing Page

Métrica de vitória:
→ Maior taxa de conversão (visitante → lead) em 30 dias

Período:
→ Início: [ a definir ] | Encerramento: [ 30 dias após início ]

Status:
→ Planejado
```

---

## Experimentos Encerrados

> Histórico de experimentos finalizados com conclusão documentada.

---

*Nenhum experimento encerrado ainda.*

---

## Índice Geral

| ID | Título | Canal | Status | Clientes | Resultado |
|---|---|---|---|---|---|
| EXP-001 | Gancho emocional vs. informativo | Instagram | Planejado | — | — |
| EXP-002 | CTA WhatsApp vs. formulário | Site | Planejado | — | — |

---

## Regras de Experimento

1. **Uma variável por experimento** — testar mais de uma coisa ao mesmo tempo torna o resultado inconclusivo
2. **Mínimo 2 clientes por experimento** — resultado em 1 cliente é anedota, não padrão
3. **Período mínimo de 14 dias** — dados de menos de 2 semanas são voláteis demais
4. **Métrica de vitória definida antes de começar** — nunca decidir o critério depois de ver os números
5. **Experimento inconclusivo é válido** — registrar o que não funcionou tem o mesmo valor que o que funcionou

---

*Última atualização: ___________*
*Experimentos ativos: 0*
*Experimentos encerrados: 0*
*Responsável: ___________*
