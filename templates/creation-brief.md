# Creation Brief — MarketingOS
> Para qualquer criação visual: Reel, site, landing page, experiência 3D, carrossel, screenshot.
> Preencher antes de qualquer linha de código. Brief incompleto = output sem alma.

---

## 1. Identidade

```
Nome:          [slug — ex: site-relogios-prime | reel-04-sistema | lp-captacao]
Cliente:       [slug — ex: felipe-proenca | relogios-prime]
Data:          [YYYY-MM-DD]
Responsável:   [quem aprova]
```

---

## 2. Output

```
Tipo:
  [ ] reel          → MP4 9:16 via Playwright render
  [ ] screenshot    → PNG via Playwright screenshot
  [ ] site          → HTML aberto em browser / servido
  [ ] landing       → HTML single-page com CTA
  [ ] experience    → HTML imersivo, scroll ou interação
  [ ] carousel      → slides PNG via Playwright

Destino:
  [ ] Instagram Reels / TikTok   (9:16 — 1080×1920)
  [ ] Instagram Feed / LinkedIn  (1:1 — 1080×1080 | 4:5 — 1080×1350)
  [ ] Web — desktop              (16:9 ou fullscreen)
  [ ] Web — mobile               (375px base)
  [ ] Apresentação               (16:9 — 1920×1080)

Duração (se vídeo):   [ex: 20s | 30s | 45s]
Interação:
  [ ] nenhuma (render estático)
  [ ] scroll-driven
  [ ] mouse/cursor
  [ ] clique / navegação
  [ ] audio-reactive
```

---

## 3. Conceito — responder em linguagem visual, não técnica

**O que o olho vê?**
> [Descreva frame a frame como se contasse para alguém que nunca vai ver o arquivo.
> Sem mencionar tecnologia. Só o visual.]

```
Ex: "Tela preta. Um ponto de luz surge no centro e expande lentamente
até revelar o contorno de um relógio. O produto gira devagar no espaço.
O logo aparece abaixo."
```

**O que a pessoa sente?**
> [Uma emoção. Uma sensação física. O que fica depois que acabou.]

```
Ex: "Desejo. A sensação de que esse produto é raro e foi feito pra ela."
```

**Qual é o movimento central?**
> [O gesto visual dominante. Um verbo.]

```
Exemplos: revelar / girar / explodir / pulsar / surgir / cair / montar /
          deslizar / dissolver / escalar / aproximar / afastar
```

**Esse output serve para:**
```
[ ] Fechar cliente agora    — tem CTA, urgência, próxima ação clara
[ ] Construir autoridade    — posicionamento, quem é, o que faz
[ ] Apresentar produto      — o objeto / serviço como protagonista
[ ] Gerar desejo            — aspiracional, emocional, sem CTA direto
[ ] Educar / demonstrar     — ensina algo, mostra o processo
```

---

## 4. Narrativa — arco obrigatório

> Todo output tem começo, meio e fim — mesmo uma imagem estática tem hierarquia.

```
ABERTURA   (primeiros 20% do tempo / primeira dobra da página):
[O que prende. O gancho. Sem apresentação. Direto no conflito ou no desejo.]


DESENVOLVIMENTO   (60% do meio):
[O que acontece. Pode ser: dado, contraste, dor nomeada, revelação, jornada.]


PAYOFF   (últimos 20% / última dobra):
[O que fica. Insight, produto revelado, logo, CTA, silêncio.]
```

---

## 5. Estrutura visual — cenas ou seções

> Para vídeo: tabela de cenas com timing.
> Para site/landing: lista de seções em ordem.
> Uma linha por cena/seção. Descreva só o visual — sem código.

### Para vídeo (Reel / render)

| # | Início | Fim | O que aparece | Como aparece | Tom |
|---|--------|-----|---------------|--------------|-----|
| 1 | 0s | — | | | |
| 2 | — | — | | | |
| — | — | — | PAUSA PRETA / CORTE | — | — |
| L | Xs | fim | Logo + handle | — | — |

> Regras:
> - Máximo 2 elementos por cena
> - Pausa preta entre tensão e resolução (obrigatório em Reels)
> - Logo sempre na cena final
> - O insight mais forte é sempre a penúltima cena

### Para site / landing / experience

```
Seção 1 — Hero:       [o que aparece acima da dobra]
Seção 2 — Corpo:      [...]
Seção 3 — Prova:      [depoimento / dado / demo]
Seção 4 — CTA:        [ação, fricção mínima]
Seção 5 — Footer:     [logo, contato]
```

---

## 6. Tipo e Tech

> Escolher um tipo principal. Justificar antes de escrever código.
> Sem limitações — o pipeline suporta tudo que roda em browser.

```
── TIPOGRAFIA ──────────────────────────────────────────────────────────────
  [ ] text            CSS @keyframes — copy é o produto, ritmo é a emoção
  [ ] kinetic-type    GSAP + física — tipografia em movimento orgânico
  [ ] path-morph      opentype.js + SVG — letra que vira forma geométrica
  [ ] 3d-text         Three.js TextGeometry — volume, luz, sombra na tipografia
  [ ] variable-font   CSS + JS animando eixos wght/wdth de fonte variável

── MOTION E COMPOSIÇÃO ─────────────────────────────────────────────────────
  [ ] motion          GSAP timeline — formas, SVG, composição controlada
  [ ] mask-reveal     GSAP clip-path — revelar via máscara (editorial de luxo)
  [ ] editorial       grid CSS + GSAP — composição tipográfica arquitetônica
  [ ] glitch          Canvas/GSAP — distorção digital, chromatic aberration

── PARTÍCULAS E CAMPO ──────────────────────────────────────────────────────
  [ ] particles       Canvas 2D + noise senoidal + pixel sampling de texto
  [ ] gpu-particles   Three.js InstancedMesh + ShaderMaterial — 100k+ objetos
  [ ] fluid-sph       SPH — simulação de fluido partícula a partícula
  [ ] curl-noise      Campo vetorial 3D (curl de Perlin) — mais rico que senoidal

── 3D ──────────────────────────────────────────────────────────────────────
  [ ] 3d-abstrato     Three.js + geometria procedural — sem asset externo
  [ ] 3d-objeto       Three.js + GLB/GLTF — produto físico, PBR, reflexão
  [ ] 3d-world        Three.js + sky + fog + ground — ambiente completo
  [ ] 3d-bloom        Qualquer cena 3D + EffectComposer (bloom, DOF, aberração)
  [ ] 3d-shader       Three.js + ShaderMaterial — superfície com GLSL próprio

── SHADERS / GLSL PURO ─────────────────────────────────────────────────────
  [ ] shader-sdf      Ray marching + SDFs — formas 3D via matemática pura, zero mesh
  [ ] shader-noise    Perlin/Simplex no fragment — texturas vivas, nuvens, plasma
  [ ] shader-fluid    Simulação de fluido no GPU via ping-pong de framebuffers
  [ ] shader-reaction Reaction-diffusion (Gray-Scott) — padrão orgânico emergente
  [ ] shader-glitch   Pixel displacement + chromatic aberration via GLSL

── ORGÂNICO E PROCEDURAL ───────────────────────────────────────────────────
  [ ] lsystem         Fractais botânicos (L-systems) — crescimento orgânico
  [ ] voronoi         Células de Voronoi animadas — mapa, cristal, território
  [ ] cloth           Simulação de tecido (verlet integration) — suavidade física
  [ ] reaction-diff   Canvas 2D — padrão de pele, coral, manchas emergentes

── DADOS E NARRATIVA ───────────────────────────────────────────────────────
  [ ] dataviz         D3 ou Canvas — dado que vira visual, número é argumento
  [ ] typewriter      Texto que se digita em tempo real simulado
  [ ] dashboard       Métricas que sobem/caem dramaticamente (Canvas animado)

── EXPERIMENTAL ────────────────────────────────────────────────────────────
  [ ] ascii           Rasterização em ASCII animada (Canvas + fonte mono)
  [ ] plotter         Estilo pen plotter — linhas finas, vetorial, sem fill
  [ ] dithering       Forma ou imagem em pixels dispersos (Floyd-Steinberg)
  [ ] audio-reactive  Waveform pré-analisada → visual sincronizado (sem runtime audio)

  [ ] hybrid          [descrever combinação]

Biblioteca(s):
  [ ] nenhuma (CSS puro / raw WebGL)
  [ ] GSAP
  [ ] Three.js
  [ ] Three.js + EffectComposer
  [ ] Matter.js
  [ ] D3.js
  [ ] opentype.js
  [ ] outra: ___________

Usa window.REEL:   [ sim | não ]
Usa assets externos:
  [ ] não
  [ ] modelo 3D (GLB/GLTF)     → origem: ___________
  [ ] HDR environment map      → origem: ___________
  [ ] imagem/textura           → origem: ___________
  [ ] fonte local              → origem: ___________
  [ ] áudio (pré-analisado)    → origem: ___________
```

**Justificativa da escolha de tipo:**
> [Por que esse tipo serve ao conceito do item 3? Se não souber, volte ao item 3.]

### Mapa de tipos — O que o olho sente

| Tipo | Sensação visual | Usar quando | Evitar quando |
|---|---|---|---|
| `text` | ritmo, urgência, foco | copy é o produto | precisa de imagem |
| `kinetic-type` | energia, momentum | marca tem personalidade forte | tipografia fraca |
| `path-morph` | transformação, fluidez | conceito é metamorfose | marca precisa de legibilidade |
| `3d-text` | peso, autoridade, volume | marca quer presença física | conceito é abstrato |
| `motion` | controle, precisão, elegância | design system forte | física ou 3D real |
| `mask-reveal` | suspense, luxo, editorial | revelação é o conceito | tudo precisa visível de início |
| `editorial` | sofisticação, regra, ordem | marca high-end | conceito é caótico |
| `glitch` | ruptura, urgência, digital | contraste técnico é a mensagem | marca pede suavidade |
| `particles` | orgânico, emergência, escala | abstrato + texto | legibilidade imediata |
| `gpu-particles` | cosmos, escala impossível | quer impressionar com volume | recursos são limitados |
| `fluid-sph` | suavidade, viscosidade | líquido é metáfora | precisa de precisão geométrica |
| `3d-abstrato` | profundidade, espaço | quer 3D sem produto físico | objeto precisa ser reconhecível |
| `3d-objeto` | desejo, tangibilidade | produto físico como protagonista | não tem modelo |
| `3d-bloom` | luz, energia, premium | qualquer cena 3D que quer brilho | minimalismo extremo |
| `shader-sdf` | impossível, matemático, líquido | forma sem asset, máxima impressão | precisa de texto legível no frame |
| `shader-noise` | névoa, profundidade, atmosfera | fundo vivo, textura que respira | movimento preciso e geométrico |
| `shader-fluid` | caos controlado, simulação | física como poesia | brand exige controle visual total |
| `shader-reaction` | biológico, emergente, vivo | natureza como conceito | resultado imprevisível assusta |
| `lsystem` | crescimento, ramificação | natureza, expansão, processo | resultado muito orgânico |
| `voronoi` | território, fragmentação | dado espacial, mapa, divisão | harmonia e fluidez |
| `cloth` | suavidade, física, presença | produto têxtil ou metáfora de flexibilidade | marca rígida/técnica |
| `dataviz` | lógica, prova, autoridade | dado existe e é forte | dado fraco ou inexistente |
| `typewriter` | processo, tempo real, humano | jornada do pensamento | impacto precisa ser imediato |
| `ascii` | nostalgia digital, contraste | conceito tech + humano | brand é premium visual |
| `plotter` | artesanal, preciso, único | conceito editorial handmade | brand é digital-first |

---

## 7. Tech spec — preencher ao buildar

```
Resolução:         [ex: 1080×1920 | 1080×1080 | 1920×1080 | fullscreen]
FPS (se vídeo):    [30 | 60]
Duração (ms):      [ex: 20000]
Viewport mobile:   [ sim | não ]
Fontes via CDN:    [ sim | não ] — se não, caminho local: ___
Post-processing:   [ nenhum | bloom | FXAA | DOF | chromatic-aberration ]
Scroll library:    [ nenhuma | GSAP ScrollTrigger | Locomotive | Lenis ]
```

---

## 8. Brand constraints

> Ler brand-kit.json do cliente antes de preencher.

```
Background:        [ex: #080808]
Texto principal:   [ex: #fafafa]
Acento:            [ex: #c9a55c gold]
Fonte display:     [ex: Syne 800/900]
Fonte corpo:       [ex: Syne 400]
Fonte especial:    [ex: Playfair Display italic]
Letter-spacing:    [ex: 0.01em padrão / 0.08em uppercase]
Grain overlay:     [ sim | não ]
Border-radius:     [ex: 0 | 4px | 56px | livre]
Tom visual:        [ minimal | editorial | maximal | orgânico | técnico ]
```

**NÃO fazer nesse output:**
```
-
-
-
```

---

## 9. Assets necessários

> Listar tudo que precisa existir antes de buildar.
> Se algum item não existe, o build não começa.

| Asset | Tipo | Origem | Status |
|---|---|---|---|
| | | | [ ] existe / [ ] pendente |
| | | | [ ] existe / [ ] pendente |

**Fontes de asset 3D:**
- Cliente fornece (produto físico digitalizado)
- Sketchfab — acervo livre e pago, filtro por licença
- Meshy.ai / Luma AI — geração via IA a partir de foto
- Geometria procedural — Three.js gera sem arquivo externo

---

## 10. Referências visuais

> Opcional mas recomendado. O que inspira — não o que copiar.

```
Referência 1:   [URL ou descrição]
O que pegar:    [ritmo / cor / câmera / tipografia / movimento]
O que evitar:   [o que não serve ao posicionamento]

Referência 2:   [URL ou descrição]
O que pegar:
O que evitar:
```

---

## 11. Checklist — só avança pro código com todos marcados

- [ ] Conceito respondido em linguagem visual (seção 3)
- [ ] Arco narrativo tem abertura + desenvolvimento + payoff (seção 4)
- [ ] Cada cena/seção tem descrição visual sem código (seção 5)
- [ ] Tipo escolhido e justificado (seção 6)
- [ ] Brand-kit.json conferido (seção 8)
- [ ] Todos os assets existem ou há plano para obtê-los (seção 9)
- [ ] Existe pausa, silêncio ou corte no meio (para vídeos)
- [ ] Logo aparece na cena/seção final
- [ ] Alguém leu o brief e entendeu o output sem ver código

---

## 12. Comando de execução

```bash
# Reel / render
node scripts/render-reel.js \
  --html clients/[slug]/outputs/reels/[nome].html \
  --out  clients/[slug]/outputs/reels/[nome].mp4 \
  --duration [ms] --mode precise --fps 30

# Screenshot
node scripts/render-reel.js \
  --html clients/[slug]/outputs/[nome].html \
  --out  clients/[slug]/outputs/[nome].png \
  --mode screenshot

# Site — abrir direto
start clients/[slug]/outputs/site/index.html

# Site — servir local (requer assets externos)
npx serve clients/[slug]/outputs/site/
```

---

## 13. Aprendizados pós-entrega

> Preencher depois de ver o output final. Alimenta o próximo brief.

```
O que funcionou:
O que não funcionou:
O conceito sobreviveu à execução?   [ sim | parcialmente | não ]
O que mudar no próximo:
Tipo/tech validado para reuso?      [ sim | não ]
```

---

*MarketingOS — Creation Brief v1.0*
*Aplica-se a: Reels, sites, landings, experiences, carrosseis, screenshots.*
*Brief sem código. Código sem brief não existe.*
