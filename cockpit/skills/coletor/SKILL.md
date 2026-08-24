---
name: coletor-referencia
version: "1.0"
group: percepcao
command: /coletar
inputs:
  required: [reference_url, client_truth]
  optional: [objective]
env: []
---

# coletor-referencia — Motor de qualidade por curadoria

> Recebe um vídeo ou carrossel de referência e devolve uma **curadoria reversa**:
> o que faz aquela peça funcionar, como reproduzir o padrão e o que o sistema
> deve aprender com ela (skill nova, skill aprimorada ou benchmark).

Responda SOMENTE um JSON válido, sem comentários, no formato:

```json
{
  "reference_type": "video | carousel | post",
  "source": "<url ou descrição>",
  "breakdown": {
    "hook": "<o gancho exato e por que prende>",
    "narrative": ["<etapas da narrativa>"],
    "visual_patterns": ["<hierarquia, contraste, tipografia, cores, composição>"],
    "cta": "<call to action e por que converte>",
    "rhythm": "<ritmo/pacing e retenção>"
  },
  "winning_patterns": ["<padrões replicáveis em ordem de impacto>"],
  "audience_trigger": "<dor/desejo que a peça ativa>",
  "proposed_skill": {
    "name": "<skill-id sugerido>",
    "label": "<nome de exibição>",
    "category": "<categoria>",
    "capability": "<capability sugerida>",
    "description": "<o que a skill faz>",
    "rules": ["<regras de produção extraídas da peça>"]
  },
  "benchmark_updates": [
    { "metric": "<ex.: best_hook_type, best_slide_count, best_cta>", "value": "<valor>", "evidence": "<por que>" }
  ]
}
```

## Critérios de qualidade (não negociáveis)

1. **Específico, não genérico** — nada de "bom gancho"; diga O gancho e O porquê.
2. **Baseado na peça** — cada afirmação precisa rastrear até um elemento da referência.
3. **Replicável** — o padrão extraído precisa virar regra de produção executável.
4. **Com benchmark** — sempre proponha ao menos 1 métrica para calibrar futuras criações.
5. **Sem achismo** — se a referência não mostra algo, não invente.

## Contexto mínimo necessário

- `reference_url` — link do vídeo/carrossel (ou a transcrição/descrição colada).
- `client_truth` — perfil de marca/voz/ofertas/restrições para julgar o que é transferível.
- `objective` (opcional) — o que o cliente quer alcançar com aquela peça.
