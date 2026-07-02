---
name: skill-post
version: "1.0"
group: criacao
command: /criar post
inputs:
  required: [client.md]
  optional: [brand-kit.json, alma.md]
env: []
---

# skill-post.md — Gerador de Post Instagram
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer geração.
> Input obrigatório: contexto do cliente via `client.md`.

---

## Contexto mínimo necessário
→ client.md — Blocos 2 e 4 (persona e tom da marca)
→ brand-kit.json — palette, typography (para briefing visual)
→ alma.md — filtros de criação (5 perguntas)
→ intelligence/benchmarks.json — APENAS `content_performance` do formato em jogo (feed_image / reels / stories): best_hook_type e métricas para calibrar gancho e formato
→ NÃO carregar: metrics.json, campaigns.md, notes.md, estrategia.md, system-usage.json, experiments.md, patterns.md

---

## DNA Visual + Referências — herança obrigatória

Antes de gerar qualquer post:

0. Verificar se o tema ja possui dossie em
   `clients/[slug]/outputs/inteligencia/topic-dossiers/`.
   Se for tema novo e o dossie nao existir, interromper e executar
   `skills/inteligencia/topic-intelligence/SKILL.md`. Conteudo avulso sem
   pesquisa direta em YouTube, TikTok, LinkedIn, Instagram e Google Trends nao sai.

1. Verificar se existe `clients/[slug]/outputs/branding/visual-dna.json`
2. Se NÃO existir → interromper e instruir: "Execute /direcao-criativa antes de criar post para este cliente."
3. Se existir → carregar:
   - `visual_dna` (completo — post é entrega unificada)
   - `anti_dna.never_use`
4. Verificar se existe `clients/[slug]/outputs/branding/reference-context.json`
5. Se NÃO existir → interromper: "Execute /direcao-criativa para gerar o contexto de referências antes de criar post."
6. Se existir → carregar:
   - `principles_applied` — princípios que devem guiar cada decisão visual e de copy
   - `what_to_steal` — o que aplicar dos precedentes
   - `translation_for_this_brand` — como os princípios se traduzem para esta marca

**Declaração obrigatória antes de gerar o post:**
Antes de escrever copy ou briefing visual, declarar qual princípio de `principles_applied` será aplicado e como.

**Gate de profundidade:**
Se o output final não demonstrar influência explícita de ao menos 1 princípio transferível da referência — o output é raso. Revisar antes de entregar.

> Se o bloco do formato tiver dados reais (≠ 0/vazio), usar como default de
> gancho. Se estiver zerado, seguir o julgamento da skill — não inventar número.

---

## Objetivo da Skill

Gerar um post completo para Instagram com:
- Copy do visual (texto que aparece na imagem)
- Legenda completa com gancho, desenvolvimento e CTA
- Briefing visual acionável (reproduzível no Canva ou Figma)
- Hashtags segmentadas por nicho
- Sugestão de horário e frequência de publicação

Formatos cobertos: **Feed (imagem estática)**, **Reels (roteiro)**, **Story (sequência)**

---

## Input Esperado

```
1. Tom da marca         → extraído do client.md
2. Persona              → extraído do client.md
3. Formato              → [ Feed / Reels / Story ]
4. Objetivo             → [ Autoridade / Engajamento / Venda / Awareness / Relacionamento ]
5. Tema / Assunto       → fornecido na solicitação
6. CTA                  → [ WhatsApp / Link na bio / Salvar / Comentar / Seguir / DM ]
```

Se algum estiver ausente, pergunte antes de gerar.

---

## Estrutura por Formato

---

### FEED — Imagem Estática

```
Visual (texto na imagem):
  → Frase principal: máx. 10 palavras, impacto imediato
  → Subtexto (opcional): 1 linha de apoio

Legenda:
  → Linha 1: gancho (replica ou complementa o visual)
  → Linhas 2–5: desenvolvimento (contexto, valor, história)
  → Linha final: CTA direto e específico

Briefing visual:
  → Fundo, tipografia, elementos, paleta
```

---

### REELS — Roteiro

```
Duração alvo: 30–60 segundos

Estrutura:
  → 0–3s    GANCHO: frase ou ação que prende nos primeiros frames
  → 3–10s   CONTEXTO: apresenta o problema ou premissa
  → 10–45s  DESENVOLVIMENTO: entrega o valor (dicas, passos, revelação)
  → 45–55s  VIRADA: o insight mais poderoso
  → 55–60s  CTA: ação clara

Legenda:
  → Gancho: Linha 1-2, replicando ou complementando o visual/fala inicial do Reels.
  → Desenvolvimento: 3-5 linhas, aprofundando o valor ou a dor.
  → CTA: Direto e específico para a ação do Reels.
  → Emojis: Uso estratégico para guiar a leitura.
```

**Opções de Execução (Sem Câmera):**
  → Estética Codex: Simulação de IDE/VSCode com código real do MarketingOS subindo.
  → Tipografia Cinética: Foco em fontes premium e ritmo.
  → Screencast Técnico: Gravação de tela do terminal ou arquivos .md.
  → Igual ao Feed, adaptada para vídeo
```

---

### STORY — Sequência

```
Número de frames: 3 a 5

Frame 1: Gancho / Pergunta
Frame 2–3: Desenvolvimento / Valor
Frame 4: CTA ou link

Cada frame:
  → Texto curto (máx. 6 palavras em destaque)
  → Elemento interativo sugerido (enquete, pergunta, link, contagem)
```

---

## Formato de Output

---

### POST — [Tema] | [Formato]

**Objetivo:** [ ]
**Persona:** [ ]
**Tom:** [ ]
**Formato:** [ Feed / Reels / Story ]

---

#### VISUAL / ROTEIRO

**[Para Feed]**
```
Texto principal (na imagem):
[FRASE PRINCIPAL — máx. 10 palavras]

Subtexto (opcional):
[linha de apoio]

Briefing visual:
- Fundo: [cor / gradiente / foto / textura]
- Tipografia: [tamanho, peso, fonte sugerida]
- Elemento de destaque: [ícone / número / citação]
- Paleta: [cores principais]
- Estilo: [minimalista / vibrante / corporativo / orgânico]
- Composição: [texto centralizado / à esquerda / sobreposto à foto]
```

**[Para Reels]**
```
0–3s (GANCHO):
[fala ou ação de abertura]

3–10s (CONTEXTO):
[fala]

10–45s (DESENVOLVIMENTO):
Passo 1: [fala]
Passo 2: [fala]
Passo 3: [fala]

45–55s (VIRADA):
[fala — o insight mais forte]

55–60s (CTA):
[fala + ação na tela]

Direção visual:
- Enquadramento sugerido: [busto / tela cheia / produto em foco]
- Texto na tela: [momentos em que aparece legenda ou destaque]
- Música sugerida: [estilo / humor — não nome específico por direitos]
```

**[Para Story]**
```
Frame 1:
Texto: [GANCHO / PERGUNTA]
Elemento interativo: [enquete / pergunta / nenhum]
Briefing visual: [descrever]

Frame 2:
Texto: [DESENVOLVIMENTO]
Elemento interativo: [se houver]
Briefing visual: [descrever]

Frame 3:
Texto: [CTA / LINK]
Elemento interativo: [link / botão]
Briefing visual: [descrever]
```

---

#### LEGENDA

```
[LINHA 1 — GANCHO]
(frase que para o scroll, complementa ou replica o visual)

[DESENVOLVIMENTO — 3 a 5 linhas]
(contexto, valor, história ou dado relevante)

[CTA FINAL]
(ação específica e direta)

.
.
.

Hashtags:
#[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ] #[ ]
```

---

#### SUGESTÃO DE PUBLICAÇÃO

```
Melhor horário:     [ ex: terça ou quinta, 19h–21h ]
Frequência ideal:   [ ex: 3x por semana para feed, diário para story ]
Interação sugerida: [ ex: responder comentários nas primeiras 2h ]
```

---

## Regras de Qualidade

1. **O gancho deve funcionar sem contexto** — lido sozinho, já deve gerar reação
2. **Legenda não é resumo do visual** — ela complementa, expande ou conta a história por trás
3. **CTA específico supera CTA genérico** sempre — "Me conta nos comentários qual etapa você está" > "Gostou? Comenta!"
4. **Para Reels: os primeiros 3 segundos decidem tudo** — o gancho é a prioridade absoluta
5. **Para Story: menos texto, mais ação** — o usuário passa rápido, o elemento interativo é o que engaja
6. **Tom da marca acima de tendência** — não adianta usar o som do momento se destoa da marca
7. **Hashtags: mix de nicho (alto volume) + específicas (baixo volume)** — nunca só genéricas

---

## Checkpoints

⏸ **CP1 — Copy aprovada**
Copy completo gerado (visual + legenda) → apresentar para aprovação antes de gerar briefing visual.

⏸ **CP2 — Formato confirmado**
Se formato não foi especificado no comando (Feed / Reels / Story), perguntar antes de estruturar o output.

---

## Checklist antes de entregar

**Teste Supremo (gate obrigatório):**
- [ ] Se removermos logo, nome e cores desta marca do post — alguém ainda reconheceria quem está se comunicando? Se não → revisar antes de entregar.

**Gate de referência (obrigatório):**
- [ ] Ao menos 1 princípio de `reference-context.json` está explicitamente rastreável no output? Se não → o post é raso. Revisar.

**Checklist técnico:**
- [ ] O gancho do visual/roteiro funciona isolado?
- [ ] A legenda complementa sem repetir o visual?
- [ ] O CTA é específico e alinhado ao objetivo?
- [ ] O briefing visual é acionável no Canva sem explicação adicional?
- [ ] O tom está alinhado ao `client.md`?
- [ ] Para Reels: os primeiros 3s estão fortes?
- [ ] Para Story: há elemento interativo em pelo menos 1 frame?

---

## Exemplo de Ativação no Cursor

```
Use a skill-post.md.

Cliente: [slug do cliente]
Formato: [Feed / Reels / Story]
Tema: [tema do post]
Objetivo: [objetivo]
CTA: [ação desejada]
```

---

*Skill v1.1 — MarketingOS*
*v1.1: reference-context.json integrado — gate de profundidade obrigatório antes de entregar.*
