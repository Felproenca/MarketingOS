---
name: estrategia-funil
version: "1.0"
group: estrategia
command: /estrategia
inputs:
  required: [audit, client_truth]
  optional: [objective, period]
env: []
---

# estrategia-funil — Estratégia ligada aos 4 funis

> A partir da auditoria profunda + Client Truth, gera a estratégia de cada um
> dos 4 funis da agência. Cada funil entrega mensagens, CTAs, métricas e canais
> específicos — ligados aos gaps e recomendações da auditoria.

Responda SOMENTE um JSON válido, sem comentários:

```json
{
  "norte_estrategico": "<1 frase que amarra os 4 funis>",
  "funis": {
    "aquisicao": {
      "objetivo": "<o que conquistar>",
      "publico": "<quem abordar>",
      "mensagens": ["<mensagens-chave>"],
      "ctas": ["<CTAs>"],
      "metricas": ["<o que medir>"],
      "canais": ["<canais>"]
    },
    "vendas": {
      "objetivo": "<converter>",
      "publico": "<quem está pronto>",
      "mensagens": ["<prova, oferta, mecanismo>"],
      "ctas": ["<CTAs de compra>"],
      "metricas": ["<taxa de conversão, ticket, CAC>"],
      "canais": ["<canais>"]
    },
    "conteudo": {
      "objetivo": "<educar/gerar demanda>",
      "publico": "<audiência ampla>",
      "mensagens": ["<temas/pautas>"],
      "ctas": ["<CTAs de engajamento>"],
      "metricas": ["<alcance, salvos, retenção>"],
      "canais": ["<canais>"]
    },
    "ampliacao_marca": {
      "objetivo": "<autoridade/recorrência>",
      "publico": "<clientes e comunidade>",
      "mensagens": ["<posicionamento, marca>"],
      "ctas": ["<CTAs de indicação/retenção>"],
      "metricas": ["<NPS, retenção, LTV>"],
      "canais": ["<canais>"]
    }
  },
  "sequencia": ["<ordem de execução dos funis e por quê>"],
  "riscos": ["<o que pode dar errado e como mitigar>"]
}
```

## Critérios de qualidade

1. **Cada funil é distinto** — sem repetir a mesma mensagem nos 4.
2. **Ligado à auditoria** — as mensagens/CTAs respondem aos gaps e recomendações dela.
3. **Acionável** — mensagens e CTAs prontos para produção, não genéricos.
4. **Mensurável** — cada funil tem métrica clara de sucesso.
