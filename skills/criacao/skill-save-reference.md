---
name: skill-save-reference
version: "1.0"
group: criacao
command: /salvar-referencia
inputs:
  required: [url | screenshot | video | notes]
  optional: [client, category, tags]
env: []
---

# skill-save-reference.md — Captura e Interpretação de Referências
> Skill de alimentação do banco de repertório visual do MarketingOS.
> Referência não entra crua. Entra interpretada.
> O crawler coleta. A skill julga. O banco armazena. As outras skills consultam.
> Output: entrada em `intelligence/visual-references.json`

---

## Regra central

> Sem `tension` e `transferable_principle` preenchidos, a referência não entra no banco.
> Beleza sem tensão identificada não serve ao sistema.

---

## Inputs aceitos (qualquer combinação)

```
url:          [link da referência]
screenshot:   [arquivo de imagem — PNG, JPG, WebP]
video:        [arquivo de vídeo curto — MP4, WebM, GIF]
notes:        [observações livres do operador]
client:       [slug do cliente — se for referência específica]
category:     [categoria — opcional, a skill infere se não informado]
```

Mínimo obrigatório: url OU screenshot OU video. Pelo menos um.

---

## Pipeline de execução

### Passo 1 — Coleta

Se `url` fornecida:
- Tentar captura automática via `scripts/capture-reference.js`
- Se falhar (bloqueio, login, JS pesado): marcar `capture_status: "failed"` e continuar com o que foi fornecido
- Se suceder: salvar screenshot em `intelligence/visual-references/screenshots/`

Se apenas screenshot/video fornecidos:
- Marcar `capture_status: "manual"`
- Usar os arquivos como input de análise

### Passo 2 — Detecção de stack

Se url acessível:
- Analisar headers, scripts carregados, meta tags
- Inferir stack provável

Se não acessível:
- Inferir stack a partir do visual (motion, 3D, shaders visíveis)
- Marcar como `stack_confidence: "inferred"`

### Passo 3 — Análise visual

Com screenshot ou video em mãos, analisar:

**Dimensões obrigatórias:**
- Tempo: lento | médio | rápido
- Densidade: mínima | média | alta
- Contraste: baixo | médio | alto
- Movimento: mínimo | preciso | expressivo | ausente
- Profundidade: plana | média | imersiva
- Temperatura: fria | neutra | quente
- Ornamentação: mínima | moderada | rica

**Tags a extrair:**
- `visual_tags`: dark, minimal, editorial, colorful, cinematic, geometric, organic, glassmorphism, brutalist, luxury, playful
- `motion_tags`: slow, fast, parallax, scroll-driven, hover, physics, generative, looping
- `interaction_tags`: scroll, cursor, click, keyboard, touch, passive

### Passo 4 — Interpretação (o mais importante)

Responder sequencialmente:

**Tensão:**
Qual é a contradição interna que torna essa obra memorável?
Formato: "[qualidade] que parece [qualidade inesperada]"
Exemplos: "precisão que parece espontânea", "luxo que parece minimalismo", "energia que parece controle"

Se a tensão não puder ser identificada — a referência não entra.

**Why it matches:**
Por que essa referência serve ao banco? O que ela demonstra que outras não demonstram?

**What to steal:**
Quais padrões comportamentais e visuais são transferíveis para outros contextos?
Máximo 5 itens. Específicos — não genéricos.

**What not to copy:**
Paleta, layout, copy e composição literal nunca são transferíveis.
Adicionar outros elementos específicos dessa obra.

**Transferable principle:**
O princípio abstrato por trás do que funciona.
Uma frase. O padrão que pode ser reutilizado sem copiar a obra.
Exemplos:
- "usar movimento mínimo para aumentar percepção de controle"
- "silêncio visual como sinal de confiança"
- "densidade baixa como declaração de valor"
- "transições lentas que fazem o tempo parecer um privilégio"

### Passo 5 — Taxonomia semântica

Classificar nos eixos do banco:

```json
{
  "tension_tags": [],
  "tempo": "lento | médio | rápido",
  "densidade": "mínima | média | alta",
  "movimento": "fluido | mecânico | orgânico | cinematográfico",
  "profundidade": "plana | média | imersiva",
  "emoção": ["confiança", "curiosidade", "desejo", "segurança", "admiração"]
}
```

### Passo 6 — Geração do JSON

Montar o objeto completo para inserção no banco:

```json
{
  "reference_id": "ref-[NNN]",
  "title": "",
  "source": "awwwards | gsap | codrops | threejs-resources | landing-love | lapa-ninja | onepagelove | codepen | github | internal | client | competitor",
  "category": "cinematic_webgl | motion_design_premium | 3d_product_experience | particle_systems | generative_art | interactive_video | typographic_motion | 2d_3d_hybrid",
  "url": "",
  "screenshot": "intelligence/visual-references/screenshots/ref-[NNN].png",
  "video_capture": "",
  "stack": [],
  "stack_confidence": "detected | inferred",
  "visual_tags": [],
  "motion_tags": [],
  "interaction_tags": [],
  "industry": [],
  "best_for": [],
  "taxonomy": {
    "tension_tags": [],
    "tempo": "",
    "densidade": "",
    "movimento": "",
    "profundidade": "",
    "emoção": []
  },
  "tension": "",
  "why_it_matches": [],
  "what_to_steal": [],
  "what_not_to_copy": [],
  "components": {
    "motion": "",
    "3d": "",
    "scroll": "",
    "interaction": "",
    "typography": "",
    "color_behavior": ""
  },
  "transferable_principle": "",
  "capture_status": "auto | manual | failed",
  "added_by": "operator | system",
  "added_at": "",
  "client": "",
  "used_in": [],
  "performance_notes": ""
}
```

### Passo 7 — Inserção no banco

Inserir o objeto em `intelligence/visual-references.json` dentro do array `references`.
Incrementar `reference_id` automaticamente.
Confirmar inserção ao operador com resumo de 3 linhas.

---

## Checklist antes de inserir

- [ ] `tension` preenchida e específica — não descreve outra obra sem ajuste?
- [ ] `transferable_principle` é um padrão abstrato — não uma descrição visual?
- [ ] `what_not_to_copy` inclui paleta, layout, copy e composição?
- [ ] `what_to_steal` tem itens específicos — não genéricos como "tipografia boa"?
- [ ] `best_for` está preenchido com pelo menos um tipo de entrega?
- [ ] `category` foi identificada ou inferida?

---

## Exemplo de ativação

```
Use a skill-save-reference.md.

url: https://stripe.com
notes: estudar como usam motion para transmitir confiança técnica sem parecer frio
```

Ou com screenshot:
```
Use a skill-save-reference.md.

screenshot: [arquivo anexado]
notes: capturado do Awwwards — estúdio português, visual editorial escuro
category: motion_design_premium
```

---

## Fontes prioritárias para alimentar o banco

**Galerias de sites premiados** — direção criativa completa:
- awwwards.com | cssdesignawards.com | thefwa.com | siteinspire.com | onepagelove.com | lapa.ninja

**WebGL e Three.js** — experiências imersivas:
- threejsresources.com/showcase | threejs.org/examples | bruno-simon.com | activetheory.net

**Motion Design** — ritmo e movimento:
- gsap.com/showcase | codepen.io/collection/DkvGzg | tympanus.net/codrops

**Shaders e Arte Generativa** — linguagem visual avançada:
- shadertoy.com | openprocessing.org

**SaaS Premium** — precisão e clareza:
- linear.app | stripe.com | vercel.com | raycast.com

**Luxo e marca premium** — sofisticação:
- apple.com | bang-olufsen.com | porsche.com | aesop.com

**Estúdios criativos** — resolução de problemas de nível alto:
- activetheory.net | resn.co.nz | locomotive.ca | basicagency.com

---

*Skill v1.0 — MarketingOS*
*Curadoria é o motor. Crawler só acelera.*
