---
name: design-premium
version: "1.0"
group: design
command: /design
inputs:
  required: [client_truth, audit, brief]
  optional: [benchmarks, referencias]
env: []
---

# design-premium — Sistema de design + site/landing de alta qualidade

> Gera a direção de design premium a partir da auditoria + Client Truth: sistema
> de design (paleta, tipografia, forma), layout, motion/animações e "dados como
> lentes" (benchmarks que dirigem decisões visuais). É o blueprint que o
> DesingOS (ou o code agent) executa.

Responda SOMENTE um JSON válido, sem comentários:

```json
{
  "direcao_visual": "<1 frase: a assinatura visual da marca>",
  "design_system": {
    "paleta": [ { "cor": "#hex", "uso": "primaria|secundaria|acento|fundo|texto" } ],
    "tipografia": { "display": "<fonte>", "body": "<fonte>", "escala": ["<tamanhos/ritmo>"] },
    "espacamento": "<grade/escala>",
    "forma": "arredondada|afiada|mista",
    "referencias": ["<estéticas/referências visuais>"]
  },
  "layout": {
    "hero": "<estrutura do hero>",
    "secoes": [ { "nome": "<seção>", "objetivo": "<converter/educar/provar>", "elementos": ["<o que tem>"] } ],
    "hierarquia": "<como guiar o olho>"
  },
  "motion": {
    "animacoes": ["<animações de entrada/scroll/interação>"],
    "transicoes": ["<transições entre seções>"],
    "ritmo": "<feel: rápido|lento|fluido>"
  },
  "dados_lentes": [ { "benchmark": "<ex.: prova social acima da dobra>", "como_usar": "<decisão visual>", "fonte": "auditoria|coletor|nicho" } ],
  "componentes": [ { "nome": "<componente>", "proposito": "<para que serve>", "detalhe": "<especificação premium>" } ]
}
```

## Critérios de qualidade

1. **Premium, não template** — especificações específicas da marca, não genéricas.
2. **Dados como lentes** — cada decisão visual cita um benchmark/dado.
3. **Motion pensado** — animações com propósito (guia o olho, reforça a mensagem), não enfeite.
4. **Executável** — o blueprint precisa ser implementável pelo DesingOS ou code agent.
