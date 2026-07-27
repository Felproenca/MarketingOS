---
name: skill-site-builder
version: "2.0"
group: criacao
command: /criar site
inputs:
  required: [client.md, brand-kit.json, outputs/branding/visual-direction.md, outputs/branding/design-system.json]
  optional: [alma.md, outputs/branding/references.md]
env: []
---

# skill-site-builder.md — Desenvolvedor de Sites
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer geração.
> Input obrigatório: contexto do cliente via `client.md`.
> Escalonamento: se houver motion guiado por scroll, Three.js/WebGL, agentes paralelos
> ou documentação para vídeo, usar `motion-site-factory/SKILL.md`.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2, 3 e 4 (negócio, persona, posicionamento, tom)
→ brand-kit.json — palette, typography, style
→ outputs/branding/visual-direction.md — direção criativa aprovada
→ outputs/branding/design-system.json — sistema de design
→ outputs/branding/references.md — referências visuais
→ alma.md — filtros de criação
→ skills/funnel-strategy/SKILL.md — Funnel Metadata, fricção, qualificação e roteamento
→ skills/funnel-strategy/friction-map.md — CTA proporcional ao estágio do lead
→ skills/funnel-strategy/templates/funnel-metadata.md — bloco obrigatório do output
→ intelligence/experience-continuity.md — continuidade entre hero, copy, assets, motion e CTA
→ NÃO carregar: metrics.json, campaigns.md, notes.md, estrategia.md, intelligence/

---

## Funnel Strategy — gate comercial obrigatório

Antes de definir estrutura, copy ou CTA do site, declarar:

```text
Funnel stage:
Intent level:
Friction level:
Expected lead signal:
Qualification goal:
Routing destination:
Next best action:
```

Site premium não é vitrine. É ambiente de conversão.
Se o site não captura sinal, não qualifica e não roteia, ele está incompleto.

---

## DNA Visual + Referências — herança obrigatória

Antes de qualquer layout ou decisão de UX:

1. Verificar se existe `clients/[slug]/outputs/branding/visual-dna.json`
2. Se NÃO existir → interromper e instruir: "Execute /direcao-criativa antes de criar site para este cliente."
3. Se existir → carregar:
   - `visual_dna.spatial_logic` — como o espaço vazio é tratado (luxo, respiro, silêncio)
   - `visual_dna.densidade` — densidade de elementos por seção
   - `visual_dna.ritmo_tipográfico` — comportamento da tipografia no layout
   - `color_behavior` — como a cor opera (não quais cores)
   - `anti_dna.never_use.visual` e `anti_dna.never_use.interaction`
4. Verificar se existe `clients/[slug]/outputs/branding/reference-context.json`
5. Se NÃO existir → interromper: "Execute /direcao-criativa para gerar o contexto de referências antes de criar site."
6. Se existir → carregar:
   - `principles_applied` — princípios que devem guiar layout, motion e copy
   - `what_to_steal` — o que aplicar dos precedentes por seção
   - `translation_for_this_brand` — como os princípios se traduzem para esta marca

O spatial_logic define a arquitetura de cada seção antes de qualquer código.

**Declaração obrigatória antes de gerar cada seção:**
Ao descrever o briefing visual de cada seção, indicar qual princípio de `principles_applied` está sendo aplicado e como ele se manifesta no layout ou na interação.

**Gate de profundidade:**
Se o output final não demonstrar influência explícita de ao menos 1 princípio transferível da referência — o output é raso. Revisar antes de entregar.

**Reference Library (código e benchmarks):**
Consultar `../social-content-agents/index.json` — `sites/` para benchmark de layout
(Stripe, Vercel, Linear, Aesop, Lusion), `motion/` para código de scroll/reveal/interação,
`visual/` para sistemas e paletas. Adaptar ao visual-dna — protocolo em
`workflows/reference-library.md`. Máx. 3 refs.

---

## Objetivo da Skill

Gerar um site completo orientado a conversão com:
- Estrutura de seções definida e justificada
- Copy completa por seção (headline, subtítulo, corpo, CTA)
- Contrato de reação e curva de intensidade do primeiro ao último scroll
- SEO básico (title tag, meta description, estrutura de H1/H2)
- Briefing visual por seção (para desenvolvimento no Cursor/Next.js ou Figma)
- Inventário de assets com função narrativa, origem e variante mobile
- Integração com WhatsApp e formulário de captura

## Pre-Requisito Obrigatorio

Antes de gerar qualquer homepage, validar a existencia dos arquivos:

1. `clients/[slug]/client.md`
2. `clients/[slug]/brand-kit.json`
3. `clients/[slug]/outputs/branding/visual-direction.md`
4. `clients/[slug]/outputs/branding/design-system.json`
5. `clients/[slug]/outputs/branding/references.md`

Se algum arquivo estiver ausente, interromper e executar `skills/skill-branding.md`.

---

## Taste Configuration — Calibração Estética

> Executar ANTES de qualquer geração visual ou de código.
> Baseado no taste-skill (Leonxlnx/taste-skill) — adaptado para HTML/CSS e contexto de marca.

### Os 3 Dials

Defina os valores com base no `brand-kit.json` e no `visual-direction.md` do cliente.
Se não especificado, use os defaults abaixo.

| Dial | Escala | Default joias | O que controla |
|---|---|---|---|
| `DESIGN_VARIANCE` | 1 (simétrico) → 10 (assimétrico) | **7** | Composição, margens, grade, ritmo de layout |
| `MOTION_INTENSITY` | 1 (estático) → 10 (cinemático) | **5** | Transições, hovers, animações de entrada |
| `VISUAL_DENSITY` | 1 (galeria arejada) → 10 (cockpit denso) | **2** | Espaçamento, whitespace, respiração da página |

> Joias premium = espaço generoso (density 2), composição com personalidade (variance 7), movimento elegante mas não excessivo (motion 5).

---

### Tipografia — Regras Obrigatórias

**Fontes permitidas (via Google Fonts ou similar):**
- Serifa editorial: `Playfair Display`, `Fraunces`, `Cormorant Garamond`, `Newsreader`
- Sans premium: `Outfit`, `DM Sans`, `Cabinet Grotesk`, `Plus Jakarta Sans`
- Mono (preços, metadados): `DM Mono`, `Geist Mono`, `JetBrains Mono`

**Fontes proibidas:**
- `Inter`, `Roboto`, `Arial`, `Open Sans`, `Helvetica`, `Lato` — fontes de template genérico

**Regras de escala:**
- Display (H1): `font-size: clamp(2.5rem, 5vw, 5rem)` — tracking negativo (`letter-spacing: -0.03em`)
- Subtítulo: `font-size: 1.125rem`, `line-height: 1.7`, `max-width: 65ch`
- Labels e micro-copy: Maiúsculas com tracking largo (`letter-spacing: 0.12em`)
- Preços e numerais: Fonte mono com números tabulares

**Pairing para joias:** Serifa editorial (headlines) + Sans premium (corpo) — nunca dois sans, nunca dois serifados.

---

### Cor — Disciplina de Paleta

**Regras:**
- Máximo **1 cor de destaque** (accent) — saturação máxima: 75%
- Base neutra: off-white/creme (`#FDFBF7`, `#F8F5F0`) ou carvão profundo (`#1A1A1A`)
- Proibido: roxo/azul gradiente "estilo IA", dourado saturado (`#FFD700`), múltiplos metálicos
- Accent para joias: ouro acinzentado (`#C9A96E`), rosé-gold (`#B76E79`), platina (`#E8E8E8`), não usar puro
- Sombras tintadas com a cor de fundo — nunca `box-shadow: 0 4px 6px rgba(0,0,0,0.3)` puro

**Verificar `brand-kit.json`** — se accent estiver saturado demais, dessature 20% antes de aplicar.

---

### Layout — Composição por Nível de Variance

**Variance 1–3** (não usar para joias premium):
Layout centrado, grid simétrico de colunas iguais, padding uniforme.

**Variance 5–7** (default joias):
- Margens assimétricas: texto alinhado à esquerda com padding-left `8vw` enquanto imagem sangra à direita
- Grid com colunas proporcionais: `2fr 1fr` em vez de `1fr 1fr`
- Seções alternadas: texto-esquerda/imagem-direita NUNCA repetido 3x seguido
- Whitespace generoso entre seções: `padding: 6rem 0` a `10rem 0`

**Variance 8–10** (campanhas especiais):
Masonry, elementos sobrepostos, tipografia gigante como elemento gráfico.

**Proibido:**
- Grid de 3 cards iguais como seção de destaque principal
- Hero com texto à esquerda e imagem à direita (padrão mais batido — usar full-bleed ou centrado editorial)
- Botões padrão verde/azul sem relação com a marca

---

### Componentes — Padrões de Qualidade

**Produto card (joias):**
```css
/* Double-bezel: cria profundidade tátil sem sombra genérica */
.product-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(200,170,120,0.15);   /* accent tintado */
  border-radius: 1.5rem;
  padding: 0.375rem;
}
.product-card-inner {
  background: var(--color-surface);
  border-radius: calc(1.5rem - 0.375rem);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
  overflow: hidden;
}
```

**Botão CTA:**
- Hover: `transform: translateY(-1px)` + `box-shadow` suave — simula toque físico
- Active: `transform: scale(0.98)` — feedback tátil
- Proibido: efeito de brilho neon ou border-radius 50px padrão

**Estados obrigatórios em todo componente interativo:**
- `:hover` — sempre declarado
- `:active` — sempre declarado com feedback visual
- Imagem ausente — placeholder coerente com a marca (não `broken image icon`)

---

### Motion — Regras de Transição

**Animar apenas:** `transform` e `opacity` — GPU-accelerated, sem layout shift.

**Proibido animar:** `top`, `left`, `width`, `height`, `margin`, `padding`.

**Easing premium:**
```css
/* Spring-like para elementos de entrada */
transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            opacity 0.3s ease-out;

/* Suave para hovers */
transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

**Sem easing linear** — `transition: all 0.3s linear` é sinal de template genérico.

**Revelação de seções (entrada no viewport):**
```css
.reveal {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.reveal.visible { opacity: 1; transform: translateY(0); }
```

---

### Anti-Padrões Proibidos (AI Slop)

Antes de gerar qualquer seção, verifique mentalmente:

- [ ] Há grid de 3 colunas iguais como seção principal? → **Recomponha**
- [ ] Hero usa layout texto-esquerda / imagem-direita padrão? → **Use full-bleed ou centrado**
- [ ] Alguma fonte da lista proibida? → **Substitua**
- [ ] Copy tem "Eleve seu estilo", "Sofisticação que transforma", "Timeless Elegance"? → **Reescreva com copy específica do client.md**
- [ ] Dourado saturado (`#FFD700`, `#FFCC00`)? → **Dessature**
- [ ] Gradiente roxo-azul em qualquer lugar? → **Remova**
- [ ] `box-shadow: 0 4px 6px rgba(0,0,0,0.1)` genérico em todo card? → **Tinte com a paleta**
- [ ] Foto de stock óbvia (mãos perfeitas, fundo branco puro)? → **Use assets reais ou descreva contexto específico**
- [ ] `transition: all 0.3s linear`? → **Substitua pelo easing premium acima**

---

## Input Esperado

```
1. Dados do cliente     → extraídos do client.md (obrigatório)
2. Objetivo do site     → [ Geração de leads / Institucional / E-commerce / Landing page ]
3. Páginas necessárias  → [ Home / Sobre / Serviços / Portfólio / Contato / Blog ]
4. CTA principal        → [ WhatsApp / Formulário / Ligação / Compra ]
5. Referências visuais  → [ se o cliente forneceu ]
6. Domínio              → [ se já definido ]
7. Dials de taste       → [ VARIANCE / MOTION / DENSITY — ou usar defaults ]
```

Se algum estiver ausente, consulte o `client.md` antes de perguntar.

---

## Tipos de Entrega

### Modo 1 — Copy + Estrutura (padrão)
Gera o conteúdo completo de cada seção com briefing visual.
Usado para passar para o Cursor desenvolver o código.

### Modo 2 — HTML/Next.js Completo
Gera o código da página diretamente.
Usado quando o cliente precisa de entrega rápida.

Defina o modo no momento da ativação.

---

## Estrutura de Seções — Home (Lead Gen)

> Repertório funcional para site focado em geração de leads; não é uma ordem
> automática. A ordem nasce da curva em `intelligence/experience-continuity.md`.

```
1. HERO
2. PROBLEMA / DOR
3. SOLUÇÃO / PROPOSTA DE VALOR
4. SERVIÇOS / PRODUTOS
5. PROVA SOCIAL (depoimentos / números / cases)
6. SOBRE / AUTORIDADE
7. FAQ
8. CTA FINAL
9. RODAPÉ
```

## Experience Continuity — contrato obrigatório

Antes de escrever a primeira seção, declarar:

```text
Reação em 3s:
Reação em 15s:
Crença necessária antes do CTA:
Tensão aberta no hero:
Como o CTA resolve essa tensão:
Curva: impacto -> tensão -> respiração -> prova -> recompensa -> decisão
```

Para cada seção, declarar no briefing:

```text
Função narrativa:
Crença antes -> crença depois:
Intensidade (1-10):
Orçamento de copy:
Âncora visual:
Papel do asset:
Papel do motion:
Recompensa:
Ponte para a próxima seção:
```

Regras:

- o hero é o pico inicial, não a única seção dirigida;
- duas seções consecutivas não podem ser blocos de texto sem progressão;
- ao menos uma recompensa intermediária deve anteceder o CTA final;
- copy, arte, assets e motion devem sustentar a mesma tese;
- mobile preserva a narrativa, não apenas empilha componentes;
- no modo premium/motion, exigir ao menos um asset exclusivo e documentado;
- “hero memorável + restante genérico” reprova a entrega.

---

## Formato de Output — Modo 1 (Copy + Estrutura)

---

### SITE — [Nome do Cliente]

**Objetivo:** [ ]
**CTA principal:** [ ]
**Página:** [ Home / Landing Page / Outra ]

---

#### Funnel Metadata

```
Funnel stage:
Intent level:
Friction level:
Expected lead signal:
Qualification goal:
Primary CTA:
Secondary CTA:
Routing destination:
Next best action:
```

---

#### SEO

```
Title tag (máx. 60 caracteres):
[TEXTO]

Meta description (máx. 155 caracteres):
[TEXTO]

H1 principal:
[TEXTO — deve coincidir ou complementar o headline do Hero]

Palavras-chave principais:
[3 a 5 termos]
```

---

#### SEÇÃO 1 — HERO

```
Headline (H1):
[FRASE PRINCIPAL — promessa clara, máx. 10 palavras]

Subtítulo:
[1 a 2 frases que expandem a promessa e qualificam o público]

CTA primário:
[texto do botão — ex: "Falar com especialista", "Quero meu orçamento"]

CTA secundário (opcional):
[ex: "Ver nossos casos" / "Como funciona"]

Briefing visual:
- Layout: [hero com imagem à direita / fundo com overlay / vídeo de fundo]
- Imagem/vídeo sugerido: [descrição do conteúdo visual ideal]
- Paleta: [cor de fundo, cor do texto, cor do botão]
- Elemento de credibilidade: [ex: "Mais de 200 clientes atendidos" abaixo do CTA]
```

---

#### SEÇÃO 2 — PROBLEMA / DOR

```
Headline da seção:
[pergunta ou afirmação que cria identificação]

Corpo:
[2 a 4 parágrafos ou lista de dores — baseado no client.md]

Transição para a próxima seção:
[frase de ponte que leva naturalmente para a solução]

Briefing visual:
- Layout: [texto centralizado / 2 colunas / cards de dor]
- Tom visual: [mais sóbrio, contraste com a seção de solução]
```

---

#### SEÇÃO 3 — SOLUÇÃO / PROPOSTA DE VALOR

```
Headline da seção:
[como a empresa resolve o que foi apresentado na seção anterior]

Subtítulo:
[1 frase de reforço]

Diferenciais (3 a 5):
- [Diferencial 1]: [descrição curta]
- [Diferencial 2]: [descrição curta]
- [Diferencial 3]: [descrição curta]

Briefing visual:
- Layout: [ícones com texto / 3 colunas / lista visual]
- Elemento de destaque: [cor de fundo diferente para destacar seção]
```

---

#### SEÇÃO 4 — SERVIÇOS / PRODUTOS

```
Headline da seção:
[ex: "O que oferecemos" / "Nossas soluções"]

Para cada serviço/produto:
  Nome: [ ]
  Descrição curta: [2 a 3 linhas — foco no benefício, não na feature]
  CTA do card: [ex: "Saiba mais" / "Quero esse"]

Briefing visual:
- Layout: [cards em grid / accordion / tabs]
- Número de itens: [ ]
```

---

#### SEÇÃO 5 — PROVA SOCIAL

```
Headline da seção:
[ex: "O que dizem nossos clientes" / "Resultados reais"]

Números de credibilidade (se houver):
- [ ] clientes atendidos
- [ ] anos de experiência
- [ ] projetos entregues

Depoimentos (estrutura por depoimento):
  Texto: [citação do cliente]
  Nome: [ ]
  Cargo / Empresa: [ ]
  Foto: [ disponível? ]

Briefing visual:
- Layout: [carrossel / grid 3 colunas / destaque único]
```

---

#### SEÇÃO 6 — SOBRE / AUTORIDADE

```
Headline da seção:
[ex: "Quem está por trás disso"]

Corpo:
[história da empresa ou fundador — humaniza, gera conexão]

Credenciais ou formações relevantes:
[ lista se houver ]

Briefing visual:
- Foto: [pessoa / equipe / ambiente de trabalho]
- Layout: [imagem à esquerda, texto à direita]
```

---

#### SEÇÃO 7 — FAQ

```
Headline da seção:
[ex: "Perguntas frequentes"]

Perguntas (baseadas nas objeções do client.md):
P: [ ]
R: [ ]

P: [ ]
R: [ ]

P: [ ]
R: [ ]

Briefing visual:
- Layout: [accordion expansível]
```

---

#### SEÇÃO 8 — CTA FINAL

```
Headline:
[última chance de converter — frase de urgência ou valor]

Subtítulo:
[1 linha de reforço]

CTA:
[texto do botão — igual ou variação do CTA do Hero]

Elemento de redução de risco (opcional):
[ex: "Sem compromisso", "Resposta em até 2h", "Atendimento gratuito"]

Briefing visual:
- Fundo: [cor de destaque da marca]
- Layout: [centralizado, botão grande, sem distrações]
```

---

#### RODAPÉ

```
Itens:
- Logo
- Links de navegação
- Contato (WhatsApp, e-mail, telefone)
- Redes sociais
- Endereço (se local)
- Copyright

Briefing visual:
- Fundo: [escuro / cor da marca]
```

---

## Regras de Qualidade

**Conversão:**
1. **Headline de cada seção deve funcionar sozinha** — o usuário que apenas escaneia deve entender o valor
2. **CTA principal repete no mínimo 3x na página** — Hero, meio e final
3. **Copy baseada no client.md** — nunca inventar diferenciais, dores ou depoimentos
4. **Cada seção tem 1 objetivo** — não sobrecarregar com múltiplas mensagens
5. **FAQ responde objeções reais** — extraídas do client.md, não genéricas
6. **WhatsApp integrado em pelo menos 2 pontos** — botão flutuante + CTA principal
7. **Mobile-first no briefing visual** — descrever como a seção se comporta em tela pequena

**Taste (anti-slop):**
8. **Rodar checklist de anti-padrões** antes de entregar qualquer seção
9. **Nenhuma fonte proibida** — verificar lista da Taste Configuration
10. **1 accent color máximo** — saturação ≤ 75%
11. **Double-bezel em product cards** — profundidade tátil sem sombra genérica
12. **Easing premium em todas as transições** — nenhum `linear` ou `ease` padrão
13. **Hero nunca no formato texto-esquerda/imagem-direita padrão** — usar composição editorial
14. **Copy sem clichês de IA** — "Eleve", "Sofisticação", "Timeless", "Seamless" são proibidos

---

## Checkpoints

⏸ **CP1 — Estrutura aprovada**
Contrato de reação + curva de intensidade + SEO + lista de seções + objetivos
definidos → apresentar estrutura antes de gerar copy de cada seção.
Mudança de estrutura após copy gerado requer reescrita completa.

⏸ **CP2 — Copy aprovado**
Copy completo de todas as seções gerado → aprovação obrigatória antes de gerar código HTML (se Modo 2).

⏸ **CP3 — Anti-padrões limpos**
Rodar mentalmente o checklist de anti-padrões antes de entregar → sinalizar qualquer item reprovado antes de prosseguir.

---

## Checklist antes de entregar

**Conteúdo:**
- [ ] SEO preenchido (title, meta, H1)?
- [ ] Hero tem promessa clara + CTA visível?
- [ ] As dores descritas na seção 2 estão no client.md?
- [ ] Os diferenciais da seção 3 são reais e verificáveis?
- [ ] FAQ responde as objeções mapeadas no client.md?
- [ ] CTA aparece no mínimo 3 vezes na página?
- [ ] Briefing visual de cada seção é acionável no Cursor/Figma?

**Gate de referência (obrigatório):**
- [ ] Ao menos 1 princípio de `reference-context.json` é rastreável no output (layout, motion ou copy)? Se não → o site é raso. Revisar.

**Gate de continuidade (obrigatório):**
- [ ] A reação de 3s, 15s e pré-CTA está declarada?
- [ ] Cada seção muda uma crença, entrega prova ou recompensa?
- [ ] Existe respiração sem queda de qualidade após o hero?
- [ ] Copy, arte, assets e motion contam a mesma história?
- [ ] O CTA final resolve a tensão aberta no hero?
- [ ] Mobile preserva a curva narrativa?

**Gate de funil (obrigatório):**
- [ ] O site declara Funnel Metadata?
- [ ] O CTA é proporcional ao estágio e fricção do lead?
- [ ] Existe captura de sinal, não apenas botão de contato?
- [ ] Formulário/WhatsApp qualifica antes de jogar o lead para venda?
- [ ] O destino e a próxima melhor ação estão claros?

**Taste:**
- [ ] Dials declarados (VARIANCE / MOTION / DENSITY)?
- [ ] Nenhuma fonte da lista proibida?
- [ ] Paleta com máximo 1 accent ≤ 75% saturação?
- [ ] Hero com composição editorial (não template padrão)?
- [ ] Checklist de anti-padrões rodado e limpo?
- [ ] Product cards com double-bezel (se e-commerce)?
- [ ] Transições com easing premium (sem linear)?
- [ ] Copy sem clichês de IA?

---

## Exemplo de Ativação no Cursor

```
Use a skill-site-builder.md.

Cliente: [slug do cliente]
Objetivo: [geração de leads / institucional / landing page]
Páginas: [Home / Sobre / Serviços / Contato]
CTA principal: [WhatsApp / Formulário]
Modo: [Copy + Estrutura / HTML Completo]
```

---

*Skill v2.1 — MarketingOS*
*v2.0: Taste Configuration integrada — tipografia, dials, anti-slop, double-bezel, motion.*
*v2.1: reference-context.json integrado — gate de profundidade obrigatório antes de entregar.*
