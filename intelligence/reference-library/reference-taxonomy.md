# Reference Taxonomy — MarketingOS Perception Engine

Vocabulário controlado para classificação e consulta da Biblioteca Viva.

A taxonomia existe para uma única finalidade: **tornar obras reais consultáveis por tensão**, não por categoria técnica.

---

## Regra de uso

Toda referência obrigatoriamente possui:
- 1 `tension` (campo único — a contradição principal)
- 1 `principio_transferivel` (campo único — o padrão abstrato)
- Valores preenchidos em todas as `dimensoes`

Os demais campos são enriquecimento. Sem tension e principio, a referência não entra.

---

## 1. Tensões — vocabulário de contradições perceptivas

Tensão é a contradição interna que torna uma obra memorável.
Formato: `[qualidade A] que parece [qualidade B inesperada]`

### Vocabulário validado

| Tensão | Descrição breve |
|---|---|
| `precisão que parece espontânea` | Rigor técnico com aparência orgânica |
| `precisão que desaparece` | Sofisticação que não se anuncia |
| `luxo sem ostentação` | Valor percebido sem sinais óbvios de riqueza |
| `tecnologia invisível` | Complexidade que parece simples |
| `tecnologia que parece humanidade` | Produto frio com percepção quente |
| `autoridade silenciosa` | Presença que não precisa se afirmar |
| `controle sem agressividade` | Precisão que não intimida |
| `energia controlada` | Intensidade com estrutura rígida |
| `complexidade que parece brincadeira` | Alto nível técnico com leveza |
| `confiança sem ostentação` | Credibilidade que não se vende |
| `lentidão como privilégio` | Ausência de urgência como sinal de valor |
| `caos com estrutura` | Fragmentação aparente sobre ordem oculta |
| `simplicidade obsessiva` | Redução que exige mais esforço que adição |
| `proximidade sofisticada` | Calor humano sem perder elegância |
| `escassez como abundância` | Menos que comunica mais |

Tensões novas podem ser criadas. Formato obrigatório: substantivo/adjetivo + "que parece" + contraste.

---

## 2. Dimensões visuais — escalas de medição

Cada obra é medida em 8 dimensões. Valores são escalas, não categorias.

### tempo
Velocidade de percepção geral da obra.
`lento` | `moderado` | `acelerado`

### ritmo
Padrão de variação visual ao longo do tempo ou scroll.
`estático` | `pulsante` | `contínuo` | `errático`

### densidade
Quantidade de informação por área visual.
`esparso` | `equilibrado` | `denso`

### profundidade
Percepção de camadas e dimensão.
`plano` | `camadas` | `imersivo`

### contraste
Diferencial entre elementos em destaque e fundo.
`suave` | `médio` | `extremo`

### temperatura
Percepção cromática e emocional da paleta.
`fria` | `neutra` | `quente`

### movimento
Intensidade e tipo de animação.
`ausente` | `sutil` | `expressivo` | `explosivo`

### ornamentacao
Quantidade de elementos decorativos não-funcionais.
`minimalista` | `funcional` | `ornamental` | `maximalista`

---

## 3. Emoções — o que a obra provoca

Máximo 3 por referência. Priorizar a mais forte.

`confiança` | `curiosidade` | `desejo` | `admiração` | `calma` | `urgência` | `reverência` | `pertencimento` | `exclusividade` | `alegria`

---

## 4. Tags visuais — elementos observáveis

`dark` | `light` | `editorial` | `colorful` | `cinematic` | `geometric` | `organic` | `brutalist` | `luxury` | `playful` | `typographic` | `minimal` | `textured` | `gradient`

---

## 5. Tags de movimento

`scroll-driven` | `parallax` | `hover` | `physics` | `generative` | `looping` | `cursor-reactive` | `enter-animation` | `page-transition` | `particle` | `morphing`

---

## 6. Tags de interação

`passive` | `scroll` | `click` | `cursor` | `keyboard` | `touch` | `drag` | `audio-reactive` | `game`

---

## 7. Stack técnica — vocabulário detectável

`html-css` | `javascript` | `threejs` | `webgl` | `gsap` | `canvas-2d` | `lottie` | `shader` | `svelte` | `react` | `vue` | `vanilla` | `framer-motion` | `matter-js` | `p5js` | `pixijs`

---

## 8. Contexto de uso — quando referenciar

`luxo` | `tecnologia` | `saas` | `editorial` | `produto` | `servico` | `portfolio` | `institucional` | `e-commerce` | `experiencia-interativa` | `branding` | `lancamento`

---

## Consultas válidas — exemplos

```
"Quais referências comunicam autoridade silenciosa?"
→ filtrar: tension contains "autoridade silenciosa"
→ retornar: obras reais com screenshots

"Referências de temperatura fria + movimento expressivo para marca de tecnologia"
→ filtrar: dimensoes.temperatura = "fria" AND dimensoes.movimento = "expressivo" AND contexto includes "tecnologia"
→ retornar: obras reais

"O que o sistema sabe sobre lentidão como linguagem de luxo?"
→ filtrar: tension contains "lentidão" OR tension contains "luxo"
→ retornar: obras + principios_transferiveis agrupados
```

O sistema retorna **obras reais**, não conceitos. A semântica é o índice. A obra é o acervo.
