# Creative OS — camada de orquestração da criação

> Status: regra operacional do MarketingOS.
> Função: impedir que site, reel, carrossel, animação e imagem virem motores soltos.
> Pergunta-mãe: dado este objetivo de aquisição, qual forma expressiva constrói melhor esta percepção?

---

## Princípio

O MarketingOS não cria "peças".
Ele cria uma transformação perceptiva com forma adequada.

Todo output visual nasce da mesma cadeia:

```text
objetivo de aquisição
→ percepção desejada
→ marca/alma
→ repertório/catálogo
→ padrão de física/motion
→ motor certo
→ asset
→ métrica
→ aprendizado
```

Sem esta cadeia, a IA volta ao default.

---

## Contrato obrigatório de entrada

Antes de acionar qualquer motor visual, montar um **Creative OS Brief**:

```json
{
  "objective": "qual gargalo de aquisição este output remove ou torna observável",
  "audience_state": "estado emocional/cognitivo antes de encontrar a peça",
  "perception_shift": "de qual percepção para qual percepção a pessoa deve ir",
  "brand": {
    "slug": "felipe-proenca",
    "must_load": [
      "perception.json",
      "visual-dna.json",
      "design-system.json",
      "brand-brief.md"
    ],
    "anti_dna": []
  },
  "references": {
    "case_catalog_query": "",
    "case_studies": [],
    "external_reference_ids": [],
    "nunca_copiar": []
  },
  "expressive_form": {
    "recommended_motor": "site | reel | carousel | post | image | animation | diagnosis | cockpit",
    "reason": "",
    "motion_pattern": "",
    "primary_sensation": "clareza | tensão | urgência real | domínio | alívio | desejo | confiança",
    "hero_animation": ""
  },
  "constraints": {
    "one_hero_animation": true,
    "no_default_ease": true,
    "gpu_first": true,
    "no_extra_accent_color": true,
    "no_stock_marketing_photo": true
  },
  "expected_output": {
    "format": "",
    "files": [],
    "acceptance_gate": [
      "Teste Supremo",
      "Gate de Direção de Arte",
      "Gate de Referências",
      "Gate de Aquisição"
    ]
  }
}
```

Este brief pode viver em:

```text
clients/[slug]/outputs/creative-os/[asset-id].json
```

---

## Escolha do motor

O motor é consequência da percepção desejada:

| Percepção a construir | Melhor forma | Motor |
|---|---|---|
| "Eu tenho um gargalo que não sei nomear" | diagnóstico interativo | lead magnet / site |
| "Esse sistema pensa diferente" | site/landing com tese forte | site-builder + /construir |
| "Isso é vivo, não template" | motion/reel | reel-builder / animation |
| "Entendi o problema em 30s" | carrossel | skill-carousel |
| "Quero ver o processo real" | build in public | reel/post |
| "Confio porque vi prova" | prova/processo verificável | site/post/carrossel |

Regra: se a forma escolhida não fortalece a percepção, escolher outra.

---

## Relação com o Banco de Referências

Referência não é inspiração estética.
Referência é matéria-prima estrutural.

O Creative OS consulta:

```text
intelligence/reference-library/case-studies/_catalog.json
intelligence/visual-references.json
../social-content-agents/index.json
```

E extrai apenas:

- estrutura
- mecânica de motion
- física
- ritmo
- tensão
- princípio transferível

Nunca extrair:

- paleta literal
- fonte literal
- copy literal
- layout exato
- assets proprietários

---

## Relação com /construir

`/construir` é o consumidor de estrutura para site/sistema.
Creative OS é anterior e mais amplo.

```text
Creative OS decide a forma expressiva
→ se a forma for site/sistema: chama /construir
→ /construir gera blueprint
→ site-builder executa
```

Para reels/carrosséis/animações, o Creative OS ainda usa o mesmo contrato, mas escolhe outro motor.

---

## Gate de orquestração

Antes de executar:

1. O objetivo de aquisição está explícito?
2. A mudança de percepção está clara?
3. O motor escolhido é a forma mais forte para essa percepção?
4. Existe referência/catálogo consultado ou lacuna registrada?
5. Existe padrão de motion/física escolhido?
6. As restrições da alma bloqueiam o que não pode entrar?
7. A saída esperada tem arquivo/estado verificável?

Qualquer "não" interrompe a execução.

---

## Handoff para motores

Todo motor recebe:

```text
creative_os_brief
brand_tokens
reference_sources
motion_pattern
acceptance_gate
```

E devolve:

```text
asset_files
source_files
decisions_log
metrics_to_watch
```

Isso transforma site, reels, carrossel e animação em manifestações do mesmo sistema.

