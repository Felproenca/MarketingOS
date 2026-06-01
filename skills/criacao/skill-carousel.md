---
name: skill-carousel
version: "2.0"
group: criacao
command: /criar carousel
inputs:
  required: [client.md, brand-kit.json]
  optional: [alma.md]
env: []
---

# skill-carousel.md — Gerador de Carrossel Instagram
> Skill isolada do MarketingOS. Versão 2.0.
> Leia este arquivo completo antes de executar.
> Input obrigatório: `client.md` + `brand-kit.json`.
> Output: HTML completo e funcional — sem etapa intermediária em .md ou Python.

---

## Contexto mínimo necessário
→ client.md — Blocos 2, 3 e 4 (persona, posicionamento, tom)
→ brand-kit.json — palette, typography
→ alma.md — filtros de criação (5 perguntas)
→ intelligence/benchmarks.json — APENAS `content_performance.carousel` (best_hook_type, best_slide_count, avg_saves_rate) para calibrar gancho e nº de slides com o que já performou
→ NÃO carregar: metrics.json, campaigns.md, notes.md, estrategia.md, system-usage.json, experiments.md, patterns.md

> Se `content_performance.carousel` tiver dados reais (≠ 0/vazio), usar como
> default de gancho e contagem de slides. Se estiver zerado, seguir o julgamento
> da skill normalmente — não inventar número.

---

## Objetivo

Gerar um carrossel completo para Instagram em **uma única operação**:
- Copy de cada slide baseado no `client.md`
- HTML renderizado com identidade visual do `brand-kit.json`
- Navegação entre slides funcional no browser
- Legenda de publicação incluída como comentário no final do HTML

**Zero etapas intermediárias. Zero conversão Python. Um arquivo HTML.**

---

## Input Esperado

```
1. brand-kit.json     → paleta, tipografia, estilo visual
2. client.md          → tom, persona, posicionamento
3. Tema               → fornecido no comando
4. Objetivo           → [ Educação / Autoridade / Venda / Engajamento ]
5. Slides             → padrão: 7 (mínimo 5, máximo 12)
6. CTA                → [ WhatsApp / Link na bio / Salvar / Comentar ]
```

Se `brand-kit.json` estiver ausente: executar `/branding` antes de prosseguir.

---

## Estrutura Narrativa

```
Slide 1      → GANCHO    → para o scroll, máx. 8 palavras, sem ponto final
Slide 2      → DOR       → identificação com o problema da persona
Slides 3–N-2 → CONTEÚDO  → 1 ideia por slide, progressão lógica
Slide N-1    → VIRADA    → insight mais valioso, digno de salvar
Slide N      → CTA       → ação clara, tom da marca
```

---

## Regras de Qualidade de Copy

1. **Nunca comece slide com "Você sabia que"** — é a abertura mais batida do Instagram
2. **Nunca termine slide com reticências** — corta o fluxo, parece incompleto
3. **1 ideia por slide** — jamais dois conceitos no mesmo frame
4. **O gancho do slide 1 deve funcionar sem o restante** — precisa parar o scroll sozinho
5. **O CTA deve ser específico** — "Comenta aqui" é fraco; "Comenta qual dessas te pegou" é forte
6. **Tom da marca acima de tudo** — extrair de `client.md` antes de escrever qualquer linha
7. **O slide N-1 deve ser digno de salvar** — se não for, reescreva

---

## Output: HTML Completo

Gerar diretamente o arquivo com slides preenchidos, usando os valores do `brand-kit.json`.
Salvar em: `clients/[slug]/outputs/carousels/carousel-[NN].html`

### Estrutura HTML obrigatória

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carrossel [NN] — [TEMA] | [CLIENTE]</title>
  <link href="https://fonts.googleapis.com/css2?family=[FONTE_HEADLINE]&family=[FONTE_BODY]&display=swap" rel="stylesheet">
  <style>
    /* Reset + variáveis extraídas do brand-kit.json */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      [brand-kit.palette.background];
      --surface: [brand-kit.palette.surface];
      --text:    [brand-kit.palette.text];
      --text-2:  [brand-kit.palette.text_secondary];
      --accent:  [brand-kit.palette.accent];
      --cta:     [brand-kit.palette.cta];
      --dark:    [brand-kit.palette.dark];
      --ff-h:    '[brand-kit.typography.headline_font]', Georgia, serif;
      --ff-b:    '[brand-kit.typography.body_font]', system-ui, sans-serif;
    }

    body {
      font-family: var(--ff-b);
      background: #E0D8D0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      padding: 2rem 1rem;
      gap: 1.5rem;
    }

    h1.page-title {
      font-family: var(--ff-h);
      color: var(--text);
      font-size: 1.1rem;
      font-weight: 600;
      opacity: .7;
      text-align: center;
    }

    /* Wrapper e frame */
    .carousel-wrapper { width: 100%; max-width: 420px; position: relative; }
    .carousel-frame {
      width: 100%; aspect-ratio: 4/5;
      border-radius: 1.5rem; overflow: hidden;
      box-shadow: 0 24px 64px rgba(0,0,0,.18);
      position: relative; touch-action: pan-y;
    }

    /* Slides */
    .slides {
      display: flex; height: 100%;
      transition: transform .45s cubic-bezier(0.25,0.46,0.45,0.94);
      will-change: transform;
    }
    .slide {
      min-width: 100%; height: 100%;
      display: flex; flex-direction: column;
      justify-content: center; align-items: center;
      padding: 2.5rem 2rem; text-align: center;
      position: relative; overflow: hidden;
    }

    /* Temas de slide — adaptar às cores do brand-kit */
    .slide-dark    { background: var(--dark);    color: #FDFAF6; }
    .slide-warm    { background: var(--bg); }
    .slide-surface { background: var(--surface); }
    .slide-cta     { background: var(--cta);     color: #FDFAF6; }

    /* Número de slide (badge decorativo) */
    .slide-num {
      position: absolute; top: 1.5rem; right: 1.75rem;
      font-family: var(--ff-h); font-size: 3.5rem;
      font-weight: 700; line-height: 1; opacity: .08; color: var(--text);
    }
    .slide-dark .slide-num, .slide-cta .slide-num { color: #fff; opacity: .1; }

    /* Eyebrow */
    .slide-eye {
      font-size: .65rem; font-weight: 600;
      letter-spacing: .16em; text-transform: uppercase;
      color: var(--accent); margin-bottom: .875rem;
    }
    .slide-dark .slide-eye, .slide-cta .slide-eye { color: rgba(253,250,246,.6); }

    /* Headline */
    .slide h2 {
      font-family: var(--ff-h); font-weight: 600;
      letter-spacing: -.02em; line-height: 1.25;
      margin-bottom: 1rem;
      font-size: clamp(1.4rem, 6vw, 1.85rem);
    }
    .slide h2 em { font-style: italic; color: var(--accent); }
    .slide-dark h2, .slide-cta h2 { color: #FDFAF6; }
    .slide-dark h2 em { color: rgba(253,250,246,.8); }

    /* Body */
    .slide p { font-size: .875rem; line-height: 1.65; color: var(--text-2); max-width: 28ch; }
    .slide-dark p, .slide-cta p { color: rgba(253,250,246,.7); }

    /* Ícone */
    .slide-icon {
      width: 3.5rem; height: 3.5rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 1.5rem;
      background: rgba(168,112,95,.12);
    }
    .slide-dark .slide-icon { background: rgba(255,255,255,.1); }

    /* Linha divisória */
    .slide-rule {
      width: 2.5rem; height: 2px;
      background: var(--accent); border-radius: 99px;
      margin: .875rem auto 1.125rem;
    }
    .slide-dark .slide-rule, .slide-cta .slide-rule { background: rgba(255,255,255,.3); }

    /* Botão CTA */
    .slide-btn {
      display: inline-flex; align-items: center; gap: .5rem;
      background: #FDFAF6; color: var(--cta);
      padding: .75rem 1.5rem; border-radius: .5rem;
      font-size: .85rem; font-weight: 700;
      margin-top: 1.25rem; text-decoration: none;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .slide-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.2); }

    /* Logo no slide final */
    .slide-logo {
      display: flex; align-items: center; gap: .6rem;
      position: absolute; bottom: 1.75rem; left: 50%; transform: translateX(-50%);
      white-space: nowrap;
    }
    .slide-logo-name { font-family: var(--ff-h); font-size: .85rem; font-weight: 600; color: var(--text); }
    .slide-logo-sep  { color: var(--accent); font-size: .7rem; }
    .slide-logo-tag  { font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); }

    /* Barra de progresso */
    .progress-bar { width: 100%; max-width: 420px; display: flex; gap: .375rem; align-items: center; }
    .progress-dot {
      flex: 1; height: 3px; border-radius: 99px;
      background: rgba(168,112,95,.22);
      transition: background .35s ease, transform .35s ease;
    }
    .progress-dot.active { background: var(--cta); transform: scaleY(1.5); }

    /* Controles */
    .controls { display: flex; gap: 1rem; align-items: center; }
    .ctrl-btn {
      width: 2.75rem; height: 2.75rem; border-radius: 50%;
      border: none; background: #FDFAF6; color: var(--cta);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; box-shadow: 0 2px 12px rgba(0,0,0,.1);
      transition: transform .2s ease, box-shadow .2s ease;
    }
    .ctrl-btn:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(0,0,0,.15); }
    .ctrl-btn:disabled { opacity: .3; cursor: default; transform: none; }
    .slide-counter { font-size: .8rem; color: var(--text-2); font-weight: 500; min-width: 3.5rem; text-align: center; }
  </style>
</head>
<body>

<h1 class="page-title">Carrossel [NN] — [CLIENTE]</h1>

<div class="carousel-wrapper">
  <div class="carousel-frame" id="frame">
    <div class="slides" id="slides">

      <!-- SLIDE 1: GANCHO — fundo escuro, sem corpo, só headline -->
      <div class="slide slide-dark">
        <span class="slide-num">01</span>
        <p class="slide-eye">[EYEBROW]</p>
        <h2>[GANCHO — máx. 8 palavras, sem ponto final]</h2>
        <div class="slide-rule"></div>
        <p>[Subtexto opcional — 1 linha]</p>
      </div>

      <!-- SLIDE 2: DOR / CONTEXTO -->
      <div class="slide slide-surface">
        <span class="slide-num">02</span>
        <p class="slide-eye">[EYEBROW]</p>
        <h2>[HEADLINE]</h2>
        <div class="slide-rule"></div>
        <p>[CORPO — 2 a 3 linhas]</p>
      </div>

      <!-- SLIDES DE CONTEÚDO (repetir com slide-warm ou slide-surface alternando) -->
      <div class="slide slide-warm">
        <span class="slide-num">03</span>
        <div class="slide-icon"><!-- SVG inline do brand-kit ou omitir --></div>
        <p class="slide-eye">[EYEBROW]</p>
        <h2>[HEADLINE]</h2>
        <div class="slide-rule"></div>
        <p>[CORPO]</p>
      </div>

      <!-- SLIDE N-1: VIRADA / INSIGHT — fundo escuro para dar peso -->
      <div class="slide slide-dark">
        <span class="slide-num">[N-1]</span>
        <p class="slide-eye">O insight</p>
        <h2>[INSIGHT MAIS VALIOSO — digno de salvar]</h2>
        <div class="slide-rule"></div>
        <p>[CORPO]</p>
      </div>

      <!-- SLIDE N: CTA FINAL -->
      <div class="slide slide-warm">
        <p class="slide-eye">[EYEBROW]</p>
        <h2>[HEADLINE DO CTA]</h2>
        <div class="slide-rule"></div>
        <p>[CORPO]</p>
        <a href="[LINK_CTA]" class="slide-btn" target="_blank">[TEXTO DO BOTÃO]</a>
        <div class="slide-logo">
          <span class="slide-logo-name">[NOME DO CLIENTE]</span>
          <span class="slide-logo-sep">·</span>
          <span class="slide-logo-tag">[TAGLINE]</span>
        </div>
      </div>

    </div><!-- /slides -->
  </div><!-- /carousel-frame -->
</div><!-- /carousel-wrapper -->

<div class="progress-bar" id="progress"></div>

<div class="controls">
  <button class="ctrl-btn" id="prev" aria-label="Anterior">&#8592;</button>
  <span class="slide-counter" id="counter">1 / [N]</span>
  <button class="ctrl-btn" id="next" aria-label="Próximo">&#8594;</button>
</div>

<script>
const total = [N];
let cur = 0;
const slidesEl = document.getElementById('slides');
const prevBtn  = document.getElementById('prev');
const nextBtn  = document.getElementById('next');
const counterEl = document.getElementById('counter');
const progressEl = document.getElementById('progress');

function buildDots() {
  progressEl.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'progress-dot' + (i === cur ? ' active' : '');
    progressEl.appendChild(d);
  }
}

function goTo(n) {
  cur = Math.max(0, Math.min(total - 1, n));
  slidesEl.style.transform = `translateX(-${cur * 100}%)`;
  counterEl.textContent = `${cur + 1} / ${total}`;
  prevBtn.disabled = cur === 0;
  nextBtn.disabled = cur === total - 1;
  buildDots();
}

prevBtn.addEventListener('click', () => goTo(cur - 1));
nextBtn.addEventListener('click', () => goTo(cur + 1));
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goTo(cur + 1);
  if (e.key === 'ArrowLeft')  goTo(cur - 1);
});

let tx = 0;
const frame = document.getElementById('frame');
frame.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
frame.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 40) { dx < 0 ? goTo(cur + 1) : goTo(cur - 1); }
}, { passive: true });

goTo(0);
</script>

</body>
</html>

<!--
=== LEGENDA PARA PUBLICAÇÃO ===

[LINHA 1 — gancho da legenda, repete ou complementa o slide 1]

[DESENVOLVIMENTO — 3 a 5 linhas com valor real, tom da marca]

[CTA FINAL — específico, alinhado ao CTA do último slide]

.
.
.

[HASHTAGS — 10 a 15, mix de nicho + específicas]
#tag1 #tag2 #tag3 #tag4 #tag5 #tag6 #tag7 #tag8 #tag9 #tag10

=== FIM DA LEGENDA ===
-->
```

---

## Checkpoints

⏸ **CP1 — Copy dos slides**
Copy de todos os slides gerado → apresentar para aprovação antes de gerar o HTML.
Não avançar sem confirmação explícita de cada slide.

⏸ **CP2 — Entrega**
HTML gerado → confirmar slug do cliente e número do carrossel antes de salvar.

---

## Checklist antes de entregar

- [ ] HTML abre e funciona no browser sem erros?
- [ ] Cores e fontes extraídas do `brand-kit.json`?
- [ ] Gancho para no scroll sem contexto adicional?
- [ ] Cada slide tem apenas 1 ideia central?
- [ ] Tom alinhado ao `client.md`?
- [ ] Legenda incluída como comentário no final do HTML?
- [ ] Arquivo salvo em `clients/[slug]/outputs/carousels/`?

---

## Diferença v1.0 → v2.0

| | v1.0 | v2.0 |
|---|---|---|
| Output | Markdown com briefing visual | HTML funcional completo |
| Etapas | Copy → Python → HTML | Copy + HTML em uma operação |
| Visual | Briefing para Canva | Renderizado direto no browser |
| Legenda | Seção separada | Comentário no final do HTML |

---

*Skill v2.0 — MarketingOS*
*Atualização principal: HTML direto eliminando etapa intermediária de conversão.*
