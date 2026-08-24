---
name: auditoria-profunda
version: "1.0"
group: analise
command: /auditar
inputs:
  required: [client_truth, site_url]
  optional: [instagram, competitors, objective]
env: []
---

# auditoria-profunda — Curadoria real de perfil/site

> Recebe o conteúdo real do site/perfil (fetch) + Client Truth e devolve uma
> curadoria profunda: não julgamento visual, mas diagnóstico de posicionamento,
> oferta, prova social, objeções, tom, entidades e gaps — com benchmarks e
> recomendações acionáveis.

Responda SOMENTE um JSON válido, sem comentários:

```json
{
  "diagnostico_geral": "<1 frase: o que o negócio é e em que estágio está>",
  "posicionamento": {
    "promessa_central": "<o que promete>",
    "diferencial": "<o que diz que é único>",
    "clareza": "alta|media|baixa",
    "problema": "<o que não comunica bem>"
  },
  "oferta": {
    "produto_servico": "<o que vende>",
    "preco_percebido": "<como apresenta preço>",
    "mecanismo": "<como entrega o resultado>",
    "friccoes": ["<pontos de atrito na conversão>"]
  },
  "prova_social": [
    { "tipo": "depoimento|resultado|numero|marca|imprensa", "descricao": "<o que mostra>", "forca": "forte|media|fraca" }
  ],
  "objeções": [
    { "objecao": "<dúvida/medo do cliente>", "resposta_atual": "<como o site responde hoje (ou não)>", "lacuna": true|false }
  ],
  "tom_voz": { "atual": "<tom percebido>", "desejado": "<tom ideal para o nicho>", "ajuste": "<o que mudar>" },
  "entidades": ["<termos/serviços/segmentos que o negócio trata>"],
  "gaps": ["<o que falta para converter mais>"],
  "benchmarks": [
    { "metrica": "<ex.: clareza de oferta, prova social, CTA>", "nota": 0-10, "referencia_nicho": "<o que o nicho exige>" }
  ],
  "recomendacoes": ["<ações priorizadas, em ordem de impacto>"]
}
```

## Critérios de qualidade

1. **Baseado no conteúdo real fornecido** — não invente dados do site.
2. **Específico** — nada de "melhorar o posicionamento" sem dizer O QUÊ.
3. **Ligado a conversão** — cada gap/recomendação aponta para fricção ou alavanca de conversão.
4. **Benchmarks honestos** — nota 0-10 com referência do nicho.
5. **Pronto para o funil** — as recomendações devem ser insumo direto para a estratégia dos 4 funis (aquisição, vendas, conteúdo, ampliação de marca).
