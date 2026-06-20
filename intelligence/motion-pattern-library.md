# Motion Pattern Library — física expressiva do MarketingOS

> Status: biblioteca inicial.
> Função: transformar "animação bonita" em linguagem de percepção.
> Regra: motion não decora. Motion mostra uma transformação.

---

## Como escolher um padrão

Escolha pelo que a pessoa precisa sentir/entender:

```text
caos → sistema
tensão → clareza
peso → decisão
dispersão → foco
ruído → diagnóstico
potencial → ação
```

Cada padrão informa:

- quando usar
- sensação primária
- física
- técnica
- onde aplica
- o que evitar

---

## Padrões

### 1. Caos → Sistema

Uso:
Mostrar aquisição imprevisível virando método.

Sensação:
Alívio cognitivo. O que era solto ganha ordem.

Física:
Partículas ou palavras dispersas convergem para grid.
Movimento com desaceleração forte no final.

Técnica:
Canvas/Three.js para partículas; GSAP para UI.
Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.

Aplica em:
Hero de site, reel de manifesto, abertura de diagnóstico.

Evitar:
Partículas decorativas sem formar significado.

---

### 2. Peso de Decisão

Uso:
Quando uma escolha muda o sistema inteiro.

Sensação:
Gravidade. Decisão pequena, consequência grande.

Física:
Spring com massa alta e baixo amortecimento.
Overshoot pequeno.

Técnica:
GSAP spring/custom ease; transform/opacity.
Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`.

Aplica em:
CTA, cards de decisão, build in public, cockpit.

Evitar:
Bounce lúdico. Não pode parecer brinquedo.

---

### 3. Diagnóstico em Camadas

Uso:
Revelar que o problema visível é sintoma de algo abaixo.

Sensação:
Profundidade e descoberta.

Física:
Camadas com parallax leve e opacidade progressiva.
Nada salta; tudo emerge.

Técnica:
CSS transform + GSAP timeline.
Profundidade por opacidade, nunca sombra pesada.

Aplica em:
Carrossel educativo, landing, diagnóstico interativo.

Evitar:
Cards empilhados genéricos.

---

### 4. Tensão Elástica

Uso:
Abrir uma tese forte sem agressividade.

Sensação:
Incômodo elegante, retorno controlado.

Física:
Overshoot curto; elemento "passa do ponto" e volta.

Técnica:
GSAP/custom cubic-bezier.
Easing: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` com parcimônia.

Aplica em:
H1, palavra destacada, virada "não é X, é Y".

Evitar:
Uso repetido em toda a tela.

---

### 5. Fluxo Vivo

Uso:
Mostrar sistema operando sem parecer dashboard morto.

Sensação:
Vida controlada.

Física:
Ruído contínuo de baixa amplitude.
Movimento orgânico quase imperceptível.

Técnica:
Simplex/Perlin noise em Canvas/p5.js/GLSL.

Aplica em:
Background generativo, hero abstrato, reel motion.

Evitar:
Blob decorativo, gradiente aurora, excesso de cor.

---

### 6. Corte Cirúrgico

Uso:
Mostrar diagnóstico, separação de causa/sintoma, remoção de gargalo.

Sensação:
Precisão.

Física:
Linha ou máscara atravessa a composição e reorganiza o conteúdo.

Técnica:
Clip-path, SVG mask, GSAP.
Movimento rápido com motion blur sutil.

Aplica em:
Antes/depois, site de aquisição, carrossel de diagnóstico.

Evitar:
Transição wipe genérica.

---

### 7. Construção por Evidência

Uso:
Mostrar processo real em vez de promessa.

Sensação:
Confiança por rastro.

Física:
Elementos aparecem como camadas verificáveis: dado, hipótese, decisão, ação.

Técnica:
Stagger em cascata, progressão vertical, timestamps/mono.

Aplica em:
Cockpit, estudos de caso, relatório, build in public.

Evitar:
Depoimento genérico ou prova sem fonte.

---

## Gate de Motion

Antes de entregar qualquer motion:

1. O movimento mostra uma transformação?
2. Existe uma animação-herói clara?
3. A física foi escolhida pelo sentido, não pelo gosto?
4. O easing default foi evitado?
5. A técnica é adequada: CSS, GSAP, Canvas, Three.js ou GLSL?
6. A performance é GPU-first?
7. A marca ainda é reconhecível sem logo/cor/nome?

Se falhar, refazer.

