# Premium Site Production Kit

## Localização no MarketingOS
```
skills/premium-site/
├── SKILL.md                          ← este arquivo
├── choreography-tokens.json          ← padrões de animação e UI elements
├── typography-map.json               ← tipografia, cores, spacing
├── asset-prompt-templates.json       ← prompts de geração de assets
├── skeletons/
│   └── landing-page.html             ← skeleton base
└── PROMPT-EXECUCAO.md                ← templates de prompt pra iniciar builds
```

## Conexão com o ecossistema MarketingOS

### Skills que este kit CONSOME
- `skills/criacao/skill-visual-spec.md` → VisualSpecAgent gera a direção criativa. Este kit ESTENDE o output dele com campos adicionais pra sites (veja "Output do VisualSpecAgent" abaixo).
- `skills/criacao/skill-image-generation.md` → Geração de imagens. Este kit fornece os prompts calibrados; a skill existente executa.
- `skills/criacao/skill-creative-direction.md` → Assinatura perceptiva e perception vectors. O kit herda essa camada.
- `intelligence/visual-references.json` → Referências visuais com tension e transferable_principle. O kit usa como input pra calibrar direção.
- `intelligence/copy-references.json` → Referências de copy. O kit usa pra calibrar tom e vocabulário.

### Skills que este kit NÃO substitui
O kit NÃO muda nada nas skills existentes de criação de posts, reels, carrosséis. Ele é uma skill NOVA pra um deliverable novo (sites premium).

### Onde os sites gerados ficam
- Prospects: `agency/demos/[slug]/site/`
- Clientes ativos: `clients/[slug]/site/`

---

## O que é
Sistema de produção pra gerar sites com qualidade de estúdio criativo (referência: darkroom.engineering, lenis.dev). Transforma o Claude de "escreve código" pra "monta site premium" através de restrição, não capacidade.

## Regra zero
**O Claude APLICA, não INVENTA.** Toda decisão de timing, easing, font pairing, spacing, animação e UI está pré-definida nos arquivos. Se o Claude está criando easing custom, escolhendo fonte fora do mapa, ou inventando layout do zero — está errado.

## Fluxo de produção

### Fase 0: Leitura
OBRIGATÓRIO antes de qualquer geração. Ler NESTA ORDEM:
1. `skills/premium-site/SKILL.md` (este arquivo)
2. `skills/criacao/skill-creative-direction.md` (assinatura perceptiva)
3. `skills/criacao/skill-visual-spec.md` (direção visual existente)
4. `skills/premium-site/choreography-tokens.json`
5. `skills/premium-site/typography-map.json`
6. `skills/premium-site/asset-prompt-templates.json`
7. `skills/premium-site/skeletons/landing-page.html`
8. `intelligence/visual-references.json` (referências do banco)
9. `intelligence/copy-references.json` (referências de copy)

### Fase 1: Interpretação
Input: nome do negócio, nicho, proposta de valor, assets existentes

Rodar o VisualSpecAgent (`skill-visual-spec.md`) com a extensão de campos pra sites.

Output do VisualSpecAgent ESTENDIDO pra sites:

```json
{
  "business": "Nome do negócio",
  "niche": "nicho específico",
  "perceptive_signature": "frase-vetor (vem do skill-creative-direction.md)",
  "perception_vectors": ["vetor 1", "vetor 2", "vetor 3"],
  
  "typography": {
    "combination": "editorial_precision | tech_warmth | raw_elegance | geometric_bold | organic_craft",
    "justification": "por que este par encaixa na assinatura"
  },
  
  "palette": {
    "bg": "#___",
    "text": "#___",
    "muted": "#___",
    "accent": "#___",
    "surface": "#___",
    "border": "#___",
    "derivation": "como as cores derivam da assinatura perceptiva"
  },
  
  "sections": ["hero", "marquee", "statement", "showcase", "features", "cta_final", "footer"],
  "sections_justification": "por que estas seções e não outras",
  
  "hero": {
    "media_type": "image | video_loop | scroll_frame",
    "layout_note": "como o hero comunica a assinatura"
  },
  
  "asset_prompts": {
    "hero": "prompt completo (template de asset-prompt-templates.json)",
    "showcase": "prompt completo",
    "split": "prompt completo",
    "gallery": ["prompt 1", "prompt 2", "..."],
    "video_loop": "prompt se aplicável",
    "og_image": "prompt pra OG image"
  },
  
  "pseudo_3d": {
    "method": "none | multi_angle_sprite | css_3d_layers | floating_elements",
    "prompts": ["prompt por ângulo/camada"],
    "justification": "por que usar ou não 3D"
  },
  
  "copy_direction": {
    "tone": "descrição do tom",
    "vocabulary_yes": ["palavras que cabem"],
    "vocabulary_no": ["palavras proibidas"],
    "headline_style": "curto e impactante | editorial longo | pergunta provocativa",
    "cta_style": "direto | convidativo | urgente-sem-ser-genérico",
    "references_used": ["IDs de copy-references.json que informaram a direção"]
  },
  
  "visual_references_used": ["IDs de visual-references.json que informaram a direção"],
  
  "ui_elements": {
    "preloader": true,
    "custom_cursor": true,
    "grain_overlay": true,
    "grain_opacity": 0.04,
    "marquee": true,
    "marquee_text": "texto do marquee"
  }
}
```

### Fase 2: Assets
Input: direção criativa aprovada + assets curados

1. Avaliar assets existentes do prospect (Instagram, site):
   - `use_as_is`: resolução >= 1080px, composição boa
   - `upscale`: Real-ESRGAN
   - `recolor`: Sharp (ajustar pra paleta)
   - `replace`: gerar novo com prompt de asset-prompt-templates.json

2. Gerar prompts usando skill-image-generation.md + templates deste kit
3. Pós-produção batch com Sharp (resize, WebP, grain)
4. Vídeo: ffmpeg (compress, extract frames)
5. OG image + favicon

### Fase 3: Montagem
1. Copiar skeleton `skeletons/landing-page.html`
2. Inserir CSS vars (tipografia + paleta)
3. Substituir TODOS os `{{placeholders}}`
4. Remover seções não usadas
5. Inserir assets com `<picture>` + srcset
6. Verificar data-anim attributes
7. OG tags + favicon
8. Escrever copy seguindo copy_direction

### Fase 4: Review
Checklist:
- [ ] Preloader funciona e fecha clean?
- [ ] Hero: split text anima? CTA tem hover fill?
- [ ] Marquee: scroll infinito? Acelera com scroll velocity?
- [ ] Statement: layout assimétrico?
- [ ] Showcase: scale-on-scroll funciona?
- [ ] Features: hover state?
- [ ] Counter: anima ao aparecer?
- [ ] Gallery: grid assimétrico? Hover scale?
- [ ] CTA: magnetic hover?
- [ ] Custom cursor: delay? Muda em hovers?
- [ ] Grain: sutil (0.03-0.06)?
- [ ] Mobile: legível? Cursor escondido? Vídeo → poster?
- [ ] Reduced motion: sem animações?
- [ ] Performance: WebP? Lazy loading below-fold?
- [ ] Copy: personalidade? Não parece template?

Salvar site finalizado em:
- Prospect: `agency/demos/[slug]/site/index.html`
- Cliente: `clients/[slug]/site/index.html`

---

## Decisões que o Claude NÃO toma
- Easing fora dos choreography tokens
- Fontes fora do typography map
- Alterar spacing system
- Mais de 7 seções
- Gradientes sem justificativa
- border-radius > 4px sem justificativa
- Remover preloader/cursor/grain sem justificativa
- Layouts simétricos quando assimétricos são possíveis
- `<img>` em vez de `<picture>` com srcset
- Ignorar OG tags e favicon

## Decisões que o Claude TOMA
- Combinação tipográfica (baseada no nicho)
- Paleta (derivada da assinatura perceptiva)
- Quais seções incluir (5-7)
- Layout da gallery
- Todos os textos
- Intensidade do grain (0.03-0.06)
- Imagem ou vídeo no hero
- Pseudo-3D: método e se usa
- Copy: headlines, descrições, CTAs
- Direction do reveal-clip
- Texto do marquee

## Anti-padrões
Se o output tem QUALQUER um destes, está errado:
- "Bem-vindo" / "Welcome" no hero
- Gradiente azul-roxo
- Ícones SVG genéricos
- Shapes geométricas flutuantes sem relação com nicho
- Inter/Poppins/Montserrat/Raleway como display
- Mais de 2 cores vibrantes no viewport
- Pill buttons
- Foto stock genérica
- "soluções inovadoras", "experiência única", "transforme seu negócio"
- 3 cards simétricos
- Sem espaço negativo
- Animações no load sem scroll trigger
- Imagens sem lazy loading
- Vídeo autoplay em mobile sem fallback
- Display font no corpo
- box-shadow genérico
