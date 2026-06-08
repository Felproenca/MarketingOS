# Reel Brief — MarketingOS
> Preencher antes de qualquer linha de código.
> Um brief incompleto = output sem alma. Não pule seções.

---

## 1. Identidade do Reel

```
Nome:          [slug — ex: reel-03-decisao]
Cliente:       [slug do cliente — ex: felipe-proenca]
Data:          [YYYY-MM-DD]
Objetivo:      [ Awareness / Autoridade / Conversão / Relacionamento ]
Plataforma:    [ Instagram Reels / TikTok / LinkedIn / Feed ]
Duração alvo:  [ex: 20s | 30s | 45s]
```

---

## 2. Conceito — responder antes de qualquer decisão técnica

**O que o olho vê?**
> [Descreva como se estivesse contando para alguém que nunca viu o vídeo.
> Não mencione tecnologia. Descreva o visual puro.]

```
Ex: "Um texto aparece no centro. Desaparece. Outro texto, menor,
aparece em ouro. A tela escurece. O logo surge devagar."
```

**O que a pessoa sente?**
> [Uma emoção. Uma sensação. O que fica depois que o vídeo acabou.]

```
Ex: "Urgência. A sensação de que já perdeu tempo demais."
```

**Qual é o movimento central?**
> [Um verbo que descreve o gesto visual dominante do reel.]

```
Exemplos: revelar / cair / montar / explodir / pulsar / girar / surgir
```

**O reel serve para fechar cliente ou construir quem o Felipe é?**
```
[ ] Fechar — tem CTA claro, direciona ação imediata
[ ] Construir — posicionamento, autoridade, memória de marca
```

---

## 3. Narrativa — arco em 3 batidas

```
GANCHO    (primeiros 3s):
[O que prende. Sem contexto, sem introdução. Direto.]

DESENVOLVIMENTO:
[O que acontece no meio. Pode ser dado, contraste, dor, revelação.]

PAYOFF    (últimos 5s):
[O que fica. Insight, logo, CTA, silêncio.]
```

---

## 4. Cenas — storyboard em texto

> Uma linha por cena. Sem código. Só o que o olho vê.
> Timing é estimativa — o motor vai ajustar.

| # | Início | Fim | O que aparece | Como aparece | Tom |
|---|--------|-----|---------------|--------------|-----|
| 1 | 0s | 2s | | | |
| 2 | 2s | 4s | | | |
| 3 | 4s | 6s | | | |
| — | — | — | PAUSA PRETA | — | — |
| 4 | 7s | 9s | | | |
| L | Xs | fim | Logo + handle | revelar CSS | — |

> **Regras de cena:**
> - Máximo 2 linhas de texto por cena
> - Pausa preta entre problema e solução (obrigatório)
> - Logo sempre na cena final
> - Última cena com texto antes do logo: o insight mais forte

---

## 5. Tipo e Tech

> Escolher **um** tipo. Não misturar na mesma seção sem justificativa.

```
Tipo:        [ text | motion | 3d | shader | physics | character | dataviz ]
Biblioteca:  [ nenhuma | gsap | three.js | matter.js | canvas2d | glsl | outra ]
Usa REEL.*:  [ sim | não ]
```

**Justificativa da escolha:**
> [Por que esse tipo serve ao conceito? Se não souber responder, volte ao item 2.]

### Mapa de tipos → quando usar

| Tipo | Usa quando | Evitar quando |
|---|---|---|
| `text` | copy é o produto, ritmo é a emoção | precisa de movimento não-tipográfico |
| `motion` | formas, transições, logo em movimento | física ou profundidade 3D |
| `3d` | produto, objeto, espaço, profundidade | conceito é puro texto |
| `shader` | abstrato, glitch, ruído, ondas | precisa de legibilidade clara |
| `physics` | caos controlado, impacto, gravidade como metáfora | marca exige controle total |
| `character` | personagem com emoção, narrativa encarnada | sem personagem definido |
| `dataviz` | número vira visual, dado é o argumento | dado não existe ou é fraco |

---

## 6. Brand constraints

> Ler `clients/[slug]/brand-kit.json` antes de preencher.

```
Cores principais:   [ex: #080808 fundo / #fafafa texto / #c9a55c gold]
Fontes:             [ex: Syne 800/900 + Playfair Display italic]
Grain overlay:      [ sim | não ]  — padrão: sim
Letter-spacing:     [ex: 0.01em padrão / 0.08em em uppercase]
Tom visual:         [ minimal | maximal | editorial | energético ]
```

**O que NÃO fazer nesse reel:**
```
-
-
-
```

---

## 7. Referência visual

> Opcional mas recomendado. Descreve estética, não plataforma.

```
Referência:    [nome, link ou descrição livre]
O que pegar:   [ritmo / cor / tipografia / movimento — nunca copiar tudo]
O que evitar:  [o que não serve ao posicionamento]
```

---

## 8. Checklist antes de buildar

Só avança para código quando todos estiverem marcados:

- [ ] O conceito foi respondido em linguagem visual (item 2)
- [ ] O arco narrativo tem gancho + desenvolvimento + payoff (item 3)
- [ ] Cada cena tem timing estimado e descrição visual (item 4)
- [ ] O tipo foi escolhido e justificado (item 5)
- [ ] Brand constraints conferidos com brand-kit.json (item 6)
- [ ] Existe pelo menos uma cena com pausa preta ou silêncio visual
- [ ] O logo aparece na cena final
- [ ] Alguém leu e entendeu o conceito sem ver o código

---

## 9. Comando de render (preencher ao buildar)

```bash
node scripts/render-reel.js \
  --html clients/[slug]/outputs/reels/[nome].html \
  --out  clients/[slug]/outputs/reels/[nome].mp4 \
  --duration [ms] \
  --mode precise \
  --fps 30
```

---

## 10. Aprendizados pós-render

> Preencher depois de ver o vídeo. Alimenta o próximo brief.

```
O que funcionou:
O que não funcionou:
O que mudar no próximo:
O conceito sobreviveu ao render? [ sim | parcialmente | não ]
```

---

*MarketingOS — Reel Brief v1.0*
*Brief sem código. Código sem brief não existe.*
