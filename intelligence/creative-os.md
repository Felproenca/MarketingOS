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
→ direção criativa de cena
→ continuidade narrativa (para site/landing)
→ padrão de física/motion
→ motor certo
→ asset
→ métrica
→ aprendizado
```

Sem esta cadeia, a IA volta ao default.

Para vídeo, animação, landing visual, carrossel ou imagem, o Creative OS não entrega direto para o motor.
Ele entrega primeiro para `intelligence/creative-direction-engine.md`, que transforma percepção em metáfora,
cena, beats, linguagem visual e gate frame a frame.

Para sites e landings, a direção passa também por
`intelligence/experience-continuity.md`: reação-alvo, curva de intensidade,
mudança de crença por seção, orçamento de copy, recompensas distribuídas e
coerência entre arte, assets, motion e CTA.

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
    "render_engine": "render-reel | hyperframes | remotion | manim | site-builder | carousel-render | image-model",
    "reason": "",
    "motion_pattern": "",
    "primary_sensation": "clareza | tensão | urgência real | domínio | alívio | desejo | confiança",
    "hero_animation": ""
  },
  "creative_direction": {
    "brief_path": "",
    "central_metaphor": "",
    "creative_tension": "",
    "storyboard_beats": [],
    "must_not_feel_like": []
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

## Escolha do render engine

Regra-mãe:

```text
Primeiro direção.
Depois motor.
Nunca o contrário.
```

O Creative OS escolhe o motor pela natureza expressiva da peça:

| Caso | Engine | Quando usar | Evitar quando |
|---|---|---|---|
| Teste rápido/local | `render-reel.js` | Prototipar uma ideia em HTML/CSS/Canvas com render simples e verificável | A peça precisa virar motor de produção autoral |
| Motion autoral/web | `HyperFrames` | Vídeos com HTML, CSS, GSAP, Canvas, layout web, produto, UI, Three.js leve e direção visual refinada | A peça é série parametrizada ou template em lote |
| Série/template/dados | `Remotion` | Conteúdo com React, componentes reutilizáveis, props, dados dinâmicos, variações em escala | A peça é única e depende mais de direção de arte do que escala |
| Diagrama/explicação formal | `Manim` | Sistemas, fluxos, matemática, arquitetura, estado, causa/efeito técnico | A peça precisa de estética editorial/web ou UI motion |
| Site/landing | `site-builder + /construir` | A percepção depende de experiência navegável, copy, conversão e estrutura | A entrega é vídeo ou peça social |
| Carrossel | `carousel-render` | A ideia precisa ser lida slide a slide, com ritmo editorial | A ideia depende de transformação contínua |

Decisão operacional:

```text
se peça autoral/motion/web/GSAP/Canvas -> HyperFrames
se série/template/dados/componentes -> Remotion
se diagrama técnico/explicação formal -> Manim
se prova rápida/local -> render-reel.js
```

`render-reel.js` continua válido como bancada de teste. HyperFrames vira o motor premium de motion dirigido. Remotion vira o motor de escala.

---

## Escolha do runtime de animação

Dentro do HyperFrames, o runtime também é consequência da cena:

| Runtime | Quando usar | Papel |
|---|---|---|
| `GSAP` | Timelines densas, sequenciamento preciso, cenas com muitos beats e controle fino de easing | runtime principal de direção cinematográfica |
| `Anime.js` | Stagger expressivo, SVG morph/draw/path, motion leve, timelines menores e efeitos web-native rápidos | runtime leve e modular para peças elegantes sem excesso |
| `Anime.js WAAPI` | Transform/opacity, texto quebrado em caracteres, loops simples, stagger leve e animações que podem rodar sobre `Element.animate()` | alternativa ultraleve quando o toolkit completo não é necessário |
| `Three.js` | 3D, partículas espaciais, câmeras, luz, profundidade real | runtime de cena espacial |
| `Lottie` | Asset pronto vindo de design/motion externo | runtime de asset importado |
| `CSS/WAAPI` | Microinterações simples, transform/opacity, baixo custo | runtime mínimo |

Regra: runtime não decide conceito. A metáfora, os beats e a física escolhem o runtime.

Anime.js entra especialmente quando a peça pede:

- `stagger` visual claro;
- SVG line drawing, morphing ou motion path;
- spring/draggable leve;
- composição modular menor que GSAP;
- efeitos rápidos em HTML/CSS sem cara de template.

`animejs/waapi` entra quando a peça precisa da simplicidade do Anime.js, mas quer delegar a execução para a Web Animation API nativa:

- transform/opacity com custo baixo;
- texto em caracteres/palavras com `stagger`;
- loops curtos e alternados;
- micro-motion em UI;
- animações seek-safe simples dentro de HyperFrames.

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
creative_direction_brief
brand_tokens
reference_sources
motion_pattern
render_engine
animation_runtime
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
