# Storyboard Remotion - Landing Kit Captacao WhatsApp

Objetivo: a landing deve parecer uma composicao de venda em movimento, nao uma pagina estatica simples.

## Linguagem

- Fundo escuro editorial.
- Cards como frames de uma timeline.
- Produto visto como sistema operacional compacto.
- Animacao: entrada sequencial, ticker, phone mockup, score subindo, mensagens aparecendo.
- CTA sempre visivel e repetido com contexto.

## Sequencia de cenas

### Cena 1 - Hook

Problema: posts nao viram orcamento.

Visual: titulo grande, painel lateral com campanha em progresso e mensagens chegando.

### Cena 2 - Inimigo

Nao e falta de IA. E falta de sistema.

Visual: comparacao pack raso vs mini-sistema.

### Cena 3 - Produto

Mostrar stack do kit: scorecard, mapa de oferta, bio builder, campanha, ganchos, cadencia, planilha.

### Cena 4 - Metodo

Timeline 7 dias.

Visual: linha de frames com dias e funcao de cada dia.

### Cena 5 - Conversao

WhatsApp como fluxo: abrir conversa, qualificar, apresentar caminho, follow-up.

### Cena 6 - Oferta

Preco baixo + alto valor percebido + upsell diagnostico.

## Reuso em videos

Cada cena pode virar um Short/Reel:
- Hook da pagina = video 1
- Pack raso vs sistema = video 2
- Campanha 7 dias = video 3
- Cadencia WhatsApp = video 4
- Scorecard = video 5
## Nota para implementacao em Remotion

Se isso virar um video Remotion real, nao usar animacoes CSS. Cada bloco deve ser uma `Sequence` com `premountFor`, usando `useCurrentFrame`, `useVideoConfig` e `interpolate` com easing explicito. A landing HTML pode manter CSS animation porque e uma pagina web estatica, mas os criativos renderizados precisam seguir timeline por frame.

