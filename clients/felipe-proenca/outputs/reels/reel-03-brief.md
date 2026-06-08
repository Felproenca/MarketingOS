# Creation Brief — Reel 03
> Cliente: felipe-proenca
> Data: 2026-06-08

---

## 1. Identidade

```
Nome:          reel-03-previsivel
Cliente:       felipe-proenca
Data:          2026-06-08
Responsável:   Felipe Proença
```

---

## 2. Output

```
Tipo:
  [x] reel          → MP4 9:16 via Playwright render

Destino:
  [x] Instagram Reels / TikTok   (9:16 — 1080×1920)

Duração:   30s
Interação:
  [x] nenhuma (render estático)
```

---

## 3. Conceito — em linguagem visual, não técnica

**O que o olho vê?**
> Tela preta. Uma frase aparece no centro, letra por letra, e desaparece.
> Outra frase assume o lugar — mesma lógica, ritmo mais tenso.
> A tela escurece completamente por um segundo.
> Uma frase mais curta aparece — pausa.
> Depois: a resposta, em gold.
> Tela preta. Logo surge devagar.

**O que a pessoa sente?**
> Reconhecimento incômodo. A sensação de que alguém está descrevendo a ansiedade dela
> sem ter pedido permissão. Depois: alívio quando a resposta chega — não como promessa,
> como diagnóstico.

**Qual é o movimento central?**
> Revelar — cada frase revela uma camada do medo antes de nomear a causa.

**Esse output serve para:**
```
[x] Construir autoridade    — posicionamento, quem é, o que faz
[x] Gerar desejo            — aspiracional, emocional, sem CTA direto
```

---

## 4. Narrativa — arco obrigatório

```
ABERTURA (primeiros 20% / 0–6s):
"Você sabe quem vai ser seu próximo cliente?"
Pergunta direta. Sem contexto. Força o ICP a pausar.

DESENVOLVIMENTO (60% / 6–22s):
A maioria não sabe. Fica esperando indicação.
Indicação não tem ritmo. Não tem previsão.
É ruído com sorte.
[PAUSA PRETA — silêncio visual obrigatório]

PAYOFF (últimos 20% / 22–30s):
"Isso não é azar."
"É falta de sistema."
Logo.
```

---

## 5. Estrutura visual — cenas

| # | Início | Fim | O que aparece | Como aparece | Tom |
|---|--------|-----|---------------|--------------|-----|
| 1 | 0s | 2.5s | "Você sabe quem vai ser" | fade up, branco, sz-lg | interrogativo |
| 2 | 2.5s | 5s | "seu próximo cliente?" | fade up, gold, sz-lg | provocativo |
| — | 5s | 6s | PAUSA PRETA | — | — |
| 3 | 6s | 8s | "A maioria não sabe." | fade up, branco, sz-md | frio |
| 4 | 8s | 10.5s | "Fica esperando indicação." | fade up, muted, sz-sm | ansioso |
| 5 | 10.5s | 12.5s | "Indicação não tem ritmo." | fade up, branco, sz-md | diagnóstico |
| 6 | 12.5s | 14.5s | "Não tem previsão." | fade up, muted, sz-sm | reforço |
| 7 | 14.5s | 16.5s | "É ruído com sorte." | fade up, branco, sz-md | crítico |
| — | 16.5s | 18s | PAUSA PRETA (longa) | — | — |
| 8 | 18s | 20.5s | "Isso não é azar." | fade up, branco grande, sz-lg | virada |
| 9 | 20.5s | 23.5s | "É falta de sistema." | fade up, gold, sz-xl | insight |
| L | 24s | 30s | Logo + @handle | CSS @keyframes | encerramento |

Fade overlay: 28.5s → 30s

---

## 6. Tipo e Tech

```
Tipo principal:
  [x] text          CSS @keyframes puro — copy é o produto

Biblioteca(s):
  [x] nenhuma (CSS puro)

Usa window.REEL:   sim
Usa assets externos:
  [x] não
```

**Justificativa da escolha de tipo:**
> O Reel é copy-driven. A emoção está nas palavras, no ritmo entre elas,
> e no silêncio entre o problema e a solução. CSS @keyframes garante
> esse ritmo com precisão frame a frame. Qualquer técnica mais complexa
> roubaria atenção do texto.

---

## 7. Tech spec

```
Resolução:         1080×1920
FPS:               30
Duração (ms):      30000
Viewport mobile:   não
Fontes via CDN:    sim (Google Fonts)
Post-processing:   nenhum
```

---

## 8. Brand constraints

```
Background:        #080808
Texto principal:   #fafafa
Acento:            #c9a55c (gold)
Muted:             rgba(250,250,250,0.45)
Fonte display:     Syne 900 (gancho) / Syne 800 (corpo)
Fonte especial:    Playfair Display italic (logo OS)
Letter-spacing:    0.01em
Grain overlay:     sim
```

**NÃO fazer nesse reel:**
```
- Não usar rosto, câmera ou voz
- Não prometer resultado ("você vai ter X clientes")
- Não terminar com CTA direto (ex: "entre em contato") — só logo
```

---

## 9. Assets necessários

| Asset | Tipo | Origem | Status |
|---|---|---|---|
| Syne 900/800/400 | Fonte web | Google Fonts CDN | [x] existe |
| Playfair Display italic | Fonte web | Google Fonts CDN | [x] existe |

---

## 10. Referências visuais

```
Referência 1:   reel-02-decidindo.html (próprio sistema)
O que pegar:    ritmo de entrada/saída por cena, logo CSS, grain overlay
O que evitar:   duplicar o copy — tema diferente, linguagem diferente

Referência 2:   Padrão de pausas pretas do skill-reels.md
O que pegar:    pausa entre problema e solução (obrigatória)
O que evitar:   pausas longas demais que perdem o espectador
```

---

## 11. Checklist — todos marcados

- [x] Conceito respondido em linguagem visual (seção 3)
- [x] Arco narrativo tem abertura + desenvolvimento + payoff (seção 4)
- [x] Cada cena tem descrição visual sem código (seção 5)
- [x] Tipo escolhido e justificado (seção 6)
- [x] Brand-kit conferido (seção 8)
- [x] Todos os assets existem (seção 9)
- [x] Existe pausa preta no meio (duas: 5–6s e 16.5–18s)
- [x] Logo aparece na cena final (24s–30s)
- [x] Alguém leu o brief e entendeu o output sem ver código

---

## 12. Comando de execução

```bash
node scripts/render-reel.js \
  --html clients/felipe-proenca/outputs/reels/reel-03-previsivel.html \
  --out  clients/felipe-proenca/outputs/reels/reel-03-previsivel.mp4 \
  --duration 30000 --mode precise --fps 30
```

---

## 13. Aprendizados pós-entrega

```
O que funcionou:
O que não funcionou:
O conceito sobreviveu à execução?   [ sim | parcialmente | não ]
O que mudar no próximo:
Tipo/tech validado para reuso?      [ sim | não ]
```
