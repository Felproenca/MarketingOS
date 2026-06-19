# Doutrina de Direção de Arte — régua anti-engessamento

> **Origem:** direção do Felipe (2026-06-18), a partir do diagnóstico de que outputs de IA saem "engessados" (boilerplate). Filtrada pela alma do MarketingOS e pelo brand-kit.
> **Status:** régua operacional. Toda skill de criação visual **consulta isto antes de gerar** — é gate, não sugestão.
> **Princípio raiz:** a IA é espelho. Briefing de funcionalidade → output genérico. Briefing de **direção de arte + física** → output extraordinário. O default é o inimigo. Não pedimos "o que faz", pedimos "como se move e por quê".

---

## Os 5 pilares (concretos, não vagos)

### 1. Fuja do default — engenharia da elegância
Código engessado é linear. Código elegante é orgânico.
- **Nunca** `linear` nem `ease-in-out` como padrão. Easing é decisão de arte.
- Paleta de curvas aprovadas:
  - Premium suave (o "expo-out" de Awwwards): `cubic-bezier(0.16, 1, 0.3, 1)`
  - Overshoot gentil (peso com retorno): `cubic-bezier(0.34, 1.56, 0.64, 1)`
  - Elástico (impacto, usar com parcimônia): `cubic-bezier(0.68, -0.55, 0.265, 1.55)`
- **Física, não interpolação:** spring com baixo amortecimento → o elemento tem peso/inércia. Massa e atrito antes de keyframe.

### 2. Generative design — formas que respiram
Para "vivo", não keyframe fixo: **Simplex/Perlin noise** governa movimento, forma e cor.
- Formas orgânicas que mudam fluida e imprevisivelmente, **dentro da paleta da marca**.
- Ruído > aleatório puro (aleatório treme; ruído flui). p5.js/canvas/GLSL.

### 3. Less is more — elegância pela restrição
A IA empilha elemento, cor, transição. Elegância é tirar.
- **Profundidade por opacidade**, não por sombra pesada. (Já é a alma da marca: dark + gold.)
- Grid suíço, whitespace generoso, hierarquia clara.
- **UMA animação-herói por tela.** O resto serve a ela ou some.
- Motion blur sutil pra suavizar movimento rápido — nunca saltos bruscos.

### 4. Framework de briefing (como pedir nível agência)
Todo brief de motion segue: **Conceito → Tecnicidade → Estética → Otimização.**
> "Atue como Diretor de Arte sênior de Motion Graphics. Conceito: [ex. fluidez líquida]. Tecnicidade: staggering em cascata entre elementos. Estética: sutil, sofisticado, sem saltos. Otimização: `transform`/`will-change` (nunca top/left), GPU-first, zero layout shift."

### 5. Saia do DOM — Canvas / WebGL / Shaders
Para o que CSS não faz (distorção, fluido, luz, partículas, reflexo): **Three.js / GLSL**, não `div`+CSS forçado.
- Shaders rodam na GPU → distorção de textura, transição líquida, partículas impossíveis no DOM.
- Já provado no nosso pipeline (Three.js + UnrealBloom → MP4). Ver [[project-futuro-video]].

---

## Filtro de marca (inegociável)
Tudo acima passa pelo `brand-kit.json`. Gold `#c9a55c` é o **único** acento — nunca violet, nunca azul, nunca degradê berrante. Syne / Playfair italic / JetBrains Mono. A restrição do Pilar 3 **já é** a alma minimalista da marca: direção de arte aqui é *elevar com intenção*, não florear. Elegância pela contenção, não pelo excesso.

## Honestidade técnica ("tudo é verdade")
Código nosso entrega muito bem o **abstrato glowing** (partículas, fluido, bloom, shader). **Fotorrealismo extremo** (ex.: uma íris/objeto realista) provavelmente exige asset/render externo (Blender/stock) — não fingir que código resolve tudo. Três rotas: A (código Three.js/shader), B (compositing stock/Blender), C (híbrido).

---

## O GATE de Direção de Arte (irmão do Teste Supremo)
Antes de qualquer entrega visual sair, responder. Qualquer "não" → **não sai**:

1. Isto **quebra o default** ou um dev mediano geraria igual? (se geraria igual → refaz)
2. Tem **uma animação-herói** clara, ou é ruído de movimento competindo?
3. O movimento tem **peso/física**, ou é linear/mecânico?
4. A restrição é **intencional** (profundidade por opacidade/whitespace), ou é "limpo por preguiça"?
5. Usei a **ferramenta certa** pro efeito (CSS vs Canvas/shader)?
6. Passa no **Teste Supremo** (reconhecível sem logo, nome e cores)?

## Como aplicar
Skills que consultam esta doutrina antes de gerar: `skill-reel-builder`, `skill-reels`, `skill-site-builder`, `skill-creative-direction`, `skill-carousel`, `skill-image-generation`, `skill-visual-spec`. Se nenhuma técnica daqui servir pro brief → registrar a lacuna em `intelligence/skill-updates.md`. Ver [[project-futuro-video]] e a Reference Library externa (motion com código real: GSAP, Three.js).
