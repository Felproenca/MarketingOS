---
name: skill-reel-builder
version: "1.0"
group: criacao
command: /criar reel
inputs:
  required: [brief preenchido, brand-kit.json]
  optional: [client.md, notes.md]
env: []
---

# skill-reel-builder — Construtor de Reels Multi-Tipo
> Orquestrador que lê um creation-brief preenchido e gera HTML renderizável
> para qualquer tipo visual de Reel: text, motion, particles, 3d-abstrato, shader, physics.
>
> Diferença de skill-reels.md: aquela é exclusiva para texto revelado.
> Esta habilita qualquer tipo do mapa de tipos — driven pelo brief.

**Comando:** `/criar reel [--tipo text|motion|particles|3d-abstrato|shader|physics]`

---

## Contexto mínimo necessário

**Carregar SEMPRE:**
- O arquivo de brief indicado pelo usuário (path completo)
- `clients/[slug]/brand-kit.json` — paleta, tipografia, identidade

**Carregar sob demanda (por tipo):**
- `text`:        ler `clients/felipe-proenca/outputs/reels/reel-02-decidindo.html` como referência
- `particles`:   ler `clients/felipe-proenca/outputs/reels/reel-2d-particles.html` como referência
- `motion`:      ler `templates/reels/boilerplate-gsap-motion.html` como ponto de partida
- `3d-abstrato`: ler `templates/reels/boilerplate-three-abstract.html` como ponto de partida
- `shader`:      sem boilerplate validado — descrever padrão GLSL inline
- `physics`:     sem boilerplate validado — exigir brief visual completo

**NÃO carregar:**
- Outros reels além do tipo escolhido como referência
- intelligence/ completo
- skills de outros grupos

---

## Processo em 6 etapas

### Etapa 1 — Localizar e ler o brief

Se o usuário indicou path: ler o arquivo.
Se não: verificar `clients/[slug]/outputs/reels/[qualquer]-brief.md`.
Se não encontrar nenhum brief: **PARAR** e instruir:

> "Preencha o brief antes de buildar. Copie `templates/creation-brief.md` para
> `clients/[slug]/outputs/reels/[nome-do-reel]-brief.md` e responda as seções 2–9.
> Só avance após o checklist da seção 11 estar completo."

---

### Etapa 2 — Validar o checklist

Verificar os 9 itens do checklist (seção 11 do creation-brief.md).
Se qualquer item estiver desmarcado: listar os itens e não avançar.

Atenção especial:
- "O conceito foi respondido em linguagem visual" — deve descrever o que o olho vê, sem mencionar tecnologia
- "Alguém leu e entendeu o conceito sem ver o código" — se for o próprio operador, confirmar verbalmente

---

### Etapa 3 — Determinar tipo

Ler seção 6 do brief (Tipo e Tech).
Se `--tipo` foi passado no comando: esse valor sobrescreve o brief.

**Mapa de decisão:**

| Tipo no brief | O que fazer |
|---|---|
| `text` | CSS @keyframes puro — copy é o produto. Sem biblioteca. |
| `particles` | Canvas 2D, typed arrays, noise field senoidal, phase system. |
| `motion` | GSAP paused timeline + `master.seek(t/1000)` no loop RAF. |
| `3d-abstrato` | Three.js + geometria procedural. Sem GLB. Loop lê `window.REEL.currentTime`. |
| `shader` | GLSL fragment shader via raw WebGL ou Three.js ShaderMaterial. |
| `physics` | Matter.js. Só avançar se seção 3 do brief tiver conceito estético detalhado. |

**Sinal de parada para `physics`:**
Se o brief não descrever claramente o que acontece visualmente frame a frame
(ex: "pílulas caem e formam palavra X em Y segundos"), retornar para o brief.

---

### Etapa 4 — Ler brand constraints

Da seção 8 do brief OU do `brand-kit.json` do cliente:
- Background, texto principal, acento
- Fontes e pesos
- Grain overlay (padrão: sim)
- Letter-spacing (nunca negativo)

---

### Etapa 5 — Gerar o HTML

#### Estrutura universal obrigatória

Todo HTML de reel, independente do tipo, deve ter:

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080">
  <title>Reel — [nome do brief]</title>
  <!-- Fontes via Google Fonts CDN -->
  <!-- CSS @keyframes do logo (sempre presente, em toda duração) -->
  <!-- CSS do tipo específico -->
</head>
<body>
  <!-- Canvas ou SVG ou divs do tipo -->
  <!-- #grain se grain=sim no brief -->
  <!-- #logo-wrap com CSS @keyframes — SEMPRE na última cena -->
  <!-- #fade-overlay — SEMPRE -->
  <script>
    // Loop principal lê window.REEL.currentTime
    // window.__REEL_READY = true após qualquer init assíncrono
  </script>
</body>
</html>
```

#### Contrato com o renderer

**Obrigatório em todos os tipos:**

1. CSS animations: `animation-duration: [duração]s; animation-play-state: paused; animation-fill-mode: forwards`
2. Loop Canvas/Three.js/GSAP: ler `(window.REEL && window.REEL.currentTime || 0)` como fonte de tempo
3. `window.__REEL_READY = true` após qualquer init assíncrono (fonts, textures, pixel sampling)
4. Logo: sempre em CSS @keyframes, nunca em JS transitions

**Cálculo de percentuais do logo CSS:**

```
pct(t_ms) = (t_ms / durationMs) * 100

Logo começa em tLogoMs:
  rule:      tLogoMs → tLogoMs+600   → pct(tLogoMs)%    → pct(tLogoMs+600)%
  marketing: tLogoMs+350 → +850      → ...
  slash:     tLogoMs+650 → +950
  os:        tLogoMs+800 → +1300
  handle:    tLogoMs+1150 → +1650

Fade overlay: tFadeMs → tFadeMs+1500
```

---

#### Padrões por tipo

---

**TIPO: text — CSS @keyframes**

Referência: `clients/felipe-proenca/outputs/reels/reel-02-decidindo.html`

Padrão de cada cena:
```css
/* pct(t) = t / durationMs * 100 */
@keyframes a-s1-l0 {
  0%, [pct_in_start]%   { opacity:0; transform:translateY(16px); animation-timing-function:ease }
  [pct_in_end]%         { opacity:1; transform:translateY(0) }
  [pct_out_start]%      { opacity:1; transform:translateY(0); animation-timing-function:ease }
  [pct_out_end]%, 100%  { opacity:0; transform:translateY(-10px) }
}
```

Cada elemento: `animation-duration: [dur]s; animation-timing-function: linear; animation-fill-mode: forwards; animation-play-state: paused;` com `animation-name` inline.

**NÃO usar `setTimeout` ou `setInterval` para controlar timing** — o renderer captura frames mais rápido que o relógio real e os timeouts dispararão todos de uma vez.

---

**TIPO: particles — Canvas 2D + noise field**

Referência: `clients/felipe-proenca/outputs/reels/reel-2d-particles.html`

Padrão:
```javascript
// Typed arrays para performance com N > 2000
const px = new Float32Array(N), py = new Float32Array(N);
const pvx = new Float32Array(N), pvy = new Float32Array(N);

// Campo senoidal sem biblioteca
function flowAngle(x, y, t) {
  const s=0.0024, ts=0.00042;
  return (Math.sin(x*s+t*ts)*Math.cos(y*s*0.72-t*ts*0.85)
         +Math.sin((x-y)*s*0.58+t*ts*1.28)*0.5
         +Math.cos(y*s*0.4+x*s*0.3-t*ts*0.6)*0.3)*Math.PI*1.6;
}

// Fase system: [{ name, s, e }] — s e e em ms
// Pixel sampling de texto: canvas offscreen + step=6
// Batch draw: 2 ctx.fill() calls (branco + gold) — nunca N calls individuais
// Trail decay: ctx.fillStyle = rgba(bg,decay) por fase
// window.__REEL_READY = true após document.fonts.load + sampling

function loop() {
  const t = (window.REEL && window.REEL.currentTime || 0);
  // ... render baseado em t
  requestAnimationFrame(loop);
}
document.fonts.load('900 240px Syne').then(() => {
  targets = sampleText();
  window.__REEL_READY = true;
  requestAnimationFrame(loop);
});
```

---

**TIPO: motion — GSAP**

Referência/ponto de partida: `templates/reels/boilerplate-gsap-motion.html`

Padrão crítico:
```javascript
// 1. Timeline em modo paused
const master = gsap.timeline({ paused: true });
// 2. Adicionar todos os tweens ao master (tempo em segundos)
master.to(el, { ... }, tInSeconds);
// 3. Loop RAF chama seek() a cada frame
function tick() {
  const t = (window.REEL && window.REEL.currentTime || 0) / 1000;
  master.seek(t, false); // false = não suprimir eventos de callback
  requestAnimationFrame(tick);
}
// 4. Sinalizar ready após fonts
document.fonts.ready.then(() => {
  window.__REEL_READY = true;
  tick();
});
```

Para SVG lines: animar `attr: { x2, y2 }` — mais simples que stroke-dashoffset.
Para texto: split em spans inline-block + `gsap.set(chars, { opacity:0, y:28 })` + `master.to(chars, { stagger: 0.04 })`.
Para CSS @keyframes (logo): sincronizadas automaticamente pelo renderer, não precisam de GSAP.

---

**TIPO: 3d-abstrato — Three.js**

Referência/ponto de partida: `templates/reels/boilerplate-three-abstract.html`

Padrão crítico:
```javascript
// Three.js usa requestAnimationFrame (substituído pelo clock virtual)
// Dentro de animate(), ler window.REEL.currentTime — nunca Date.now()
function animate() {
  const t = (window.REEL && window.REEL.currentTime || 0) / 1000;
  // Calcular estados baseado em t
  // remap(v, a, b, c, d) e easeInOut(x) como helpers
  renderer.render(scene, camera);
  requestAnimationFrame(animate); // virtual RAF — controlado pelo renderer
}
window.__REEL_READY = true; // Three.js não tem async init padrão
animate();
```

CDN: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
Vertex colors: `Float32Array(count * 3)` + `geo.setAttribute('color', ...)` + `PointsMaterial({ vertexColors: true })`
Sem GLB, sem GLTF, sem assets externos — geometria procedural apenas.

---

**TIPO: shader — GLSL fragment**

Sem boilerplate validado. Padrão a seguir:
```javascript
// Via Three.js ShaderMaterial ou raw WebGL
// Passar `uTime` como uniform atualizado com window.REEL.currentTime
material.uniforms.uTime.value = (window.REEL && window.REEL.currentTime || 0) / 1000;
```
Ou via raw WebGL:
```javascript
gl.uniform1f(uTimeLoc, t);
```
Renderizar para um `<canvas>` que cobre 1080×1920.

---

**TIPO: physics — Matter.js**

Sem boilerplate validado. Requer brief visual completo (seção 3 detalhada com timing por objeto).

Padrão básico:
```javascript
const { Engine, Runner, Bodies, Body, World, Events } = Matter;
const engine = Engine.create({ gravity: { y: 1 } });
// NÃO usar Runner.run(engine) — controlado manualmente
function tick() {
  const t = (window.REEL && window.REEL.currentTime || 0);
  Engine.update(engine, 1000/30); // step fixo por frame
  // Render: ler engine.world.bodies e desenhar no canvas
  requestAnimationFrame(tick);
}
```

---

### Etapa 6 — Salvar e entregar

**Salvar:** `clients/[slug]/outputs/reels/[nome-do-brief].html`

**Entregar:**
1. Path do arquivo gerado
2. Comando de render:
```bash
node scripts/render-reel.js \
  --html clients/[slug]/outputs/reels/[nome].html \
  --out  clients/[slug]/outputs/reels/[nome].mp4 \
  --duration [durationMs] --mode precise --fps 30
```
3. Próximo passo: CapCut para áudio se for Reel de publicação

---

## Cálculo de duração

```
durationMs = soma de todas as cenas (ms) + logo (ms) + fade overlay (500ms)

Para type=text com 10 cenas de ~2.2s + 2 pausas de 1.2s + logo 5s + fade 1.5s:
≈ (10 × 2200) + (2 × 1200) + 5000 + 1500 = 32100ms → arredondar para 32000ms
```

---

## Checklist antes de entregar o HTML

- [ ] HTML abre no browser sem erros de console?
- [ ] Fontes Google carregam (Syne + Playfair Display)?
- [ ] Logo aparece na cena final?
- [ ] Logo usa CSS @keyframes (não JS transitions)?
- [ ] `window.__REEL_READY = true` está presente se há init async?
- [ ] Loop de animação lê `window.REEL.currentTime`, não `Date.now()`?
- [ ] Nenhum `setTimeout`/`setInterval` no controle de timing do conteúdo?
- [ ] Brief salvo junto ao HTML em `outputs/reels/`?

---

## Arquivos de output

```
clients/[slug]/outputs/reels/
  [nome]-brief.md       ← brief preenchido (salvo antes)
  [nome].html           ← HTML gerado por esta skill
  [nome].mp4            ← entrega final (após render-reel.js)
```

---

*Skill v1.0 — MarketingOS*
*Tipos validados: text, particles (Canvas 2D), motion (GSAP), 3d-abstrato (Three.js)*
*Tipos com boilerplate mas sem render validado: motion, 3d-abstrato*
*Tipos sem boilerplate: shader, physics*
