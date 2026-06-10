---
name: skill-reels
version: "1.1"
group: criacao
command: /criar reel
inputs:
  required: [client.md, brand-kit.json]
  optional: [intelligence/benchmarks.json]
env: []
---

# skill-reels.md — Gerador de Reels (Texto Revelado)
> Skill isolada do MarketingOS. Versão 1.0.
> Produz Reels de texto revelado sem exigir edição de vídeo do operador.
> Pipeline: pesquisa → roteiro → HTML animado → Playwright grava → MP4 → CapCut (só áudio)

---

## Contexto mínimo necessário

→ client.md — Blocos 2, 3 e 4 (ICP, posicionamento, tom)
→ brand-kit.json — palette, typography (para cores e fontes do HTML)
→ NÃO carregar: metrics.json, campaigns.md, notes.md, estrategia.md

---

## DNA Visual + Referências — herança obrigatória

Antes de gerar qualquer roteiro ou HTML animado:

1. Verificar se existe `clients/[slug]/outputs/branding/visual-dna.json`
2. Se NÃO existir → interromper e instruir: "Execute /direcao-criativa antes de criar reel para este cliente."
3. Se existir → carregar APENAS:
   - `visual_dna.tempo`
   - `visual_dna.movimento`
   - `motion_principles` (array completo)
   - `anti_dna.never_use.motion`
4. Verificar se existe `clients/[slug]/outputs/branding/reference-context.json`
5. Se NÃO existir → interromper: "Execute /direcao-criativa para gerar o contexto de referências antes de criar reel."
6. Se existir → carregar:
   - `principles_applied` — princípios que definem o comportamento do movimento
   - `what_to_steal` — o que aplicar dos precedentes no timing e nas transições
   - `translation_for_this_brand` — como os princípios se traduzem para esta marca

O tempo e os motion_principles definem o ritmo de entrada, duração dos frames e tipo de transição.
Nunca usar motion que contradiga o anti_dna.

**Declaração obrigatória antes de gerar o HTML:**
Declarar qual princípio de `principles_applied` guia as decisões de timing, entrada e transição do reel.

**Gate de profundidade:**
Se o HTML final não demonstrar influência explícita de ao menos 1 princípio transferível da referência no motion — o output é raso. Revisar antes de entregar.

---

## Objetivo

Gerar um Reel completo em **uma única operação**:
- Pesquisa de tema atual (IA + cotidiano do ICP)
- Roteiro cena a cena com timing
- HTML animado com identidade visual do brand-kit
- Script Playwright que grava e entrega MP4 pronto
- Operador só adiciona áudio no CapCut

**Zero edição de vídeo. Um comando.**

---

## Formato obrigatório: Texto Revelado

Único formato validado para o posicionamento do Felipe.
Outros formatos só se o cliente pedir explicitamente.

Por quê:
- Inteligente + instagramável ao mesmo tempo
- Força rewatch (sinal mais forte no algoritmo)
- Não depende de rosto, câmera ou voz
- A identidade dark + gold + Syne é cinematográfica nesse formato
- Copy forte carrega o Reel sozinho

---

## Passo 1 — Pesquisa de tema

Fazer WebSearch com dois ângulos simultâneos:
```
query A: "trending AI topics viral [ano] Instagram Reels"
query B: "inteligência artificial cotidiano tendências [ano] Brasil"
```

Para cada resultado, extrair:
- O que está acontecendo no mundo de IA agora
- O que o ICP do cliente vive no cotidiano

Gerar 4 temas no formato:

```
Tema N — [Título curto]
→ Cotidiano: [situação que o ICP reconhece na própria vida]
→ IA: [o que está mudando ou já mudou]
→ Interseção: [a frase que une os dois — esta vira o gancho]
```

Critério de seleção do tema final:
```
✓ O ICP lê e pensa "isso é sobre mim"
✓ A interseção é provocadora, não óbvia
✓ Cabe em 25–30s de texto revelado
✓ Alinhado ao posicionamento do cliente
✗ Rejeitar temas genéricos que qualquer marca poderia assinar
```

---

## Passo 2 — Roteiro

Estrutura obrigatória em 10–12 cenas:

```
Cena 1  → GANCHO      → para o scroll. Máx 2 linhas. Apresenta o tema.
Cena 2  → IMPACTO     → uma palavra ou número grande. Corte seco.
Cena 3  → DOR 1       → detalhe do problema. Tom frio/muted.
Cena 4  → DOR 2       → aprofunda. Deixa o ICP desconfortável.
Cena 5  → VIRADA      → "E depois de tudo isso—" ou equivalente.
Cena 6  → CONSEQUÊNCIA→ o resultado do problema sem solução.
Pausa   → TELA PRETA  → 1.2–1.5s. Silêncio visual. Cria impacto.
Cena 7  → CONTRASTE 1 → a alternativa. Tom gold/destaque.
Cena 8  → CONTRASTE 2 → aprofunda o contraste.
Cena 9  → INSIGHT     → a frase mais forte. Digna de salvar.
Cena 10 → CONEXÃO     → liga ao cliente/produto. Tom menor.
Logo    → ANIMAÇÃO    → Marketing/OS ou marca do cliente. 5s.
```

Timing por cena: 1.4s–2.8s. Total antes do logo: 20–22s. Logo: 5s. Total: 25–28s.

Regras de copy:
1. Nunca começa com "Você sabia que"
2. 1–2 linhas por cena — nunca 3
3. Palavras-chave em gold — máx 2 por Reel
4. A pausa preta é obrigatória — é o que separa problema de solução
5. O insight (cena 9) deve ser salvável por si só

---

## Passo 3 — HTML animado

Gerar arquivo em `clients/[slug]/outputs/reels/reel-[NN]-[tema].html`.

### Especificações técnicas obrigatórias

```
Dimensão:         1080×1920px (9:16 vertical)
Background:       brand-kit.palette.background (geralmente #080808)
Fontes:           Syne 200/400/800/900 + Playfair Display italic
Acento:           brand-kit.palette.gold (#c9a55c)
Letter-spacing:   0.01em (nunca negativo — achata as letras)
Line-height:      1.25
```

### Tamanhos de texto (1080px canvas)

```
sz-xl → 108px Syne 900   — impacto máximo (CLT., uma palavra)
sz-lg →  86px Syne 900   — destaque forte
sz-md →  66px Syne 800   — corpo principal
sz-sm →  50px Syne 800   — secundário
sz-xs →  38px Syne 400   — muted/contextual
```

### Animação de texto

Usar JS com `transition: opacity + transform`:
```js
.line.show { opacity: 1; transform: translateY(0); }
// stagger: i * 120ms entre linhas
// saída: remove .show, adiciona .hide com translateY(-10px)
```

### Logo final — obrigatório

CSS `@keyframes` — não usar JS transitions (não confiável no Playwright):

```css
@keyframes grow-w  { from { width: 0 }                        to { width: 72px } }
@keyframes slide-r { from { opacity: 0; transform: translateX(-24px) } to { opacity: 1; transform: translateX(0) } }
@keyframes fade-in { from { opacity: 0 }                      to { opacity: 1 } }
@keyframes slide-l { from { opacity: 0; transform: translateX(24px) }  to { opacity: 1; transform: translateX(0) } }
@keyframes fade-up { from { opacity: 0; transform: translateY(12px) }  to { opacity: 1; transform: translateY(0) } }

/* Disparadas ao adicionar classe .go ao wrapper */
#logo-wrap.go #logo-rule      { animation: grow-w  0.6s ease         forwards; }
#logo-wrap.go #logo-marketing { animation: slide-r  0.5s ease  0.35s forwards; }
#logo-wrap.go #logo-slash     { animation: fade-in  0.3s ease  0.65s forwards; }
#logo-wrap.go #logo-os        { animation: slide-l  0.5s ease  0.80s forwards; }
#logo-wrap.go #logo-handle    { animation: fade-up  0.5s ease  1.15s forwards; }
```

Logo construction (do brand-kit):
```
Marketing  → Syne 800, #fafafa, 88px
/          → Syne 200, rgba(250,250,250,0.22), 88px
OS         → Playfair Display italic 400, #c9a55c, 88px
handle     → Syne 400, rgba(201,165,92,0.55), 34px
```

---

## Passo 4 — Gravar e exportar

```bash
# Gravar (Playwright)
node scripts/render-reel.js \
  --html clients/[slug]/outputs/reels/reel-[NN]-[tema].html \
  --out  clients/[slug]/outputs/reels/reel-[NN]-[tema].webm \
  --duration [ms — tempo_animacao + 2000 de buffer]

# Converter para MP4
ffmpeg -i [arquivo.webm] -c:v libx264 -pix_fmt yuv420p [arquivo.mp4] -y
```

Ou via npm:
```bash
npm run reel:render -- --html [...] --out [...] --duration [ms]
```

### Cálculo do --duration

```
duration = tempo_total_animacao_ms + 2000ms (buffer)
```

Calcular somando todas as cenas + pausa + 300ms inicial + 5000ms logo.
Arredondar para cima. Errar para mais — nunca cortar a logo.

---

## Passo 5 — Finalização (operador)

O operador faz apenas:
1. Abre o MP4 no CapCut
2. Adiciona trilha: dark instrumental com build (sem letra)
   - Buscar: "dark corporate tension" ou "dramatic build instrumental"
3. Exporta 1080×1920
4. Publica via `npm run publicar` ou manualmente

Tempo estimado do operador: < 5 minutos.

---

## Benchmarks de Reels (texto revelado)

```
Duração ideal:       25–30s
Tempo antes do logo: 20–22s
Tempo do logo:       5s
Cenas:               10–12
Palavras por cena:   máx 8 (2 linhas de 4 palavras)
Pausa preta:         1.2–1.5s (obrigatória)
Rewatch esperado:    alto (copy denso, ritmo rápido)
Save esperado:       alto (insight salvável)
```

---

## Checklist antes de entregar

**Teste Supremo (gate obrigatório):**
- [ ] Se removermos logo, nome e cores desta marca do reel — alguém ainda reconheceria quem está se comunicando? Se não → revisar antes de entregar.

**Checklist técnico:**
- [ ] HTML abre no browser sem erros?
- [ ] Fontes carregam (Syne + Playfair)?
- [ ] Letter-spacing positivo (sem achatamento)?
- [ ] Logo aparece nos últimos 5s?
- [ ] Logo usa CSS keyframes (não JS transitions)?
- [ ] `--duration` inclui buffer de 2000ms além da animação?
- [ ] MP4 gerado e abre corretamente?
- [ ] Roteiro salvo em `outputs/reels/reel-[NN]-roteiro.md`?

---

## Arquivos de output

```
clients/[slug]/outputs/reels/
  reel-[NN]-[tema].html      ← animação fonte
  reel-[NN]-[tema].webm      ← gravação Playwright (intermediário)
  reel-[NN]-[tema].mp4       ← entrega final
  reel-[NN]-roteiro.md       ← roteiro + timing documentado
```

---

*Skill v1.0 — MarketingOS*
*Pipeline: HTML animado → Playwright video → MP4 → CapCut (só áudio)*
*Validado em: 2026-06-06 — felipe-proenca, Reel 01*
