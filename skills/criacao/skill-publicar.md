---
name: skill-publicar
version: "2.0"
group: criacao
command: /publicar
inputs:
  required: [client.md, campaigns.md]
  optional: [brand-kit.json, instagram-config.json]
env:
  optional: [INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_USER_ID, IMGBB_API_KEY]
---

# skill-publicar.md — Aprovação e Publicação de Conteúdo
> Skill isolada do MarketingOS.
> Protocolo de revisão final e checklist de publicação multi-plataforma.
> Nunca publica automaticamente — toda publicação exige aprovação explícita.

---

## Contexto mínimo necessário
→ client.md — Bloco 4 (tom e restrições da marca)
→ campaigns.md — para registrar a publicação
→ brand-kit.json — checklist visual de identidade
→ NÃO carregar: metrics.json, intelligence/, alma.md, notes.md, estrategia.md

---

## Objetivo

Garantir que nenhum conteúdo vai ao ar sem:
1. Revisão de qualidade contra os critérios da marca
2. Aprovação explícita do operador
3. Checklist técnico por plataforma
4. Registro da publicação em `campaigns.md`

---

## Input Esperado

```
1. Conteúdo a publicar → [output gerado — path do arquivo ou cole aqui]
2. Plataforma(s)       → [ Instagram / Facebook / LinkedIn / TikTok / Site / WhatsApp ]
3. Formato             → [ Feed / Reels / Story / Carrossel / Post de blog / Anúncio ]
4. Data/hora           → [ Publicar agora / Agendar para: YYYY-MM-DD HH:MM ]
5. Objetivo            → [ Engajamento / Venda / Tráfego / Relacionamento ]
```

---

## Protocolo de Publicação

### Passo 1 — Revisão de qualidade (persona: revisor)

Antes de qualquer aprovação, verifique contra os critérios da marca:

**Copy:**
- [ ] Tom alinhado ao `client.md`?
- [ ] Sem erros ortográficos ou gramaticais?
- [ ] CTA claro e específico?
- [ ] Gancho forte no início (post/carrossel)?
- [ ] Legenda dentro do limite da plataforma?

**Visual (se aplicável):**
- [ ] Cores e tipografia alinhadas ao `brand-kit.json`?
- [ ] Logo presente e legível?
- [ ] Texto na imagem menor que 20% da área (Meta)?
- [ ] Resolução adequada para a plataforma?

**Estratégia:**
- [ ] Alinhado ao foco declarado em `estrategia.md`?
- [ ] Hashtags relevantes e não genéricas?
- [ ] Link de destino correto (se houver)?

---

## Checkpoints

⏸ **CP1 — APROVAÇÃO OBRIGATÓRIA** (Passo 2)
Revisão de qualidade concluída → apresentar resumo completo e aguardar [A], [E] ou [C].
**Não avançar sem resposta. Esta skill não publica automaticamente.**

⏸ **CP2 — Registro confirmado**
Após publicação: confirmar que entrada foi criada em campaigns.md.

---

### Passo 2 — Apresentar resumo para aprovação

Exiba exatamente neste formato antes de qualquer ação:

```
── REVISÃO DE CONTEÚDO ──────────────────────────────

Conteúdo: [título ou descrição curta]
Plataforma: [plataforma(s)]
Formato: [formato]
Publicação: [agora / agendado para: data/hora]

COPY:
[texto completo do conteúdo]

CHECKLIST:
  ✓ Tom alinhado
  ✓ CTA presente
  ✓ Sem erros
  ⚠️ [item com problema — se houver]

APROVAÇÃO NECESSÁRIA:

  [A] Aprovar e publicar / agendar
  [E] Editar antes de publicar
  [C] Cancelar

─────────────────────────────────────────────────────
```

**Pare aqui. Não avance sem resposta.**

---

### Passo 3 — Publicar via Publisher (Instagram)

Se aprovado para Instagram, o publisher automatiza a publicação real via Meta Graph API:

```bash
# Feed (imagem única)
npm run publicar -- --slug <slug> --file <url_ou_path> --caption "legenda" --format feed

# Carrossel (múltiplas imagens)
npm run publicar -- --slug <slug> \
  --file slide1.png --file slide2.png --file slide3.png \
  --caption "legenda" --format carousel

# Reel (vídeo)
npm run publicar -- --slug <slug> --file video.mp4 --caption "legenda" --format reel

# Testar sem publicar
npm run publicar -- --slug <slug> --file <arquivo> --caption "legenda" --dry-run
```

**Pré-requisito:** `clients/[slug]/instagram-config.json` com `accessToken` e `igUserId`.
Copiar template de `clients/_template/instagram-config.json`.

Para outras plataformas (LinkedIn, TikTok, Facebook), usar o checklist manual abaixo.

---

### Passo 4 — Checklist técnico por plataforma

Após aprovação, confirme os requisitos técnicos:

#### Instagram — Feed (imagem)
- [ ] Imagem: 1080×1080px (quadrado) ou 1080×1350px (retrato)
- [ ] Legenda: até 2.200 caracteres (primeiras 3 linhas são o que aparece)
- [ ] Hashtags: até 30 (recomendado: 5 a 15 relevantes)
- [ ] Alt text descritivo adicionado?

#### Instagram — Carrossel
- [ ] Primeira imagem é o gancho (mais importante)
- [ ] Consistência visual entre slides
- [ ] Última imagem tem CTA claro
- [ ] Legenda com gancho + desenvolvimento + CTA

#### Instagram — Reels
- [ ] Vídeo: 9:16, mín. 1080×1920px
- [ ] Duração: 15-90 segundos (ideal: até 60s)
- [ ] Legenda: até 2.200 caracteres
- [ ] Trilha sonora licenciada (se usar música)

#### Instagram — Stories
- [ ] Formato: 1080×1920px
- [ ] Sticker de link ativo (se for redirecionar)
- [ ] Duração: até 15 segundos por frame (vídeo)
- [ ] CTA visível nos primeiros 3 segundos

#### Facebook — Feed / Reels
- [ ] Mesmos requisitos do Instagram (conteúdo pode ser cross-posted)
- [ ] URL de destino preenchida (se link)

#### LinkedIn
- [ ] Tom mais formal e profissional que Instagram
- [ ] Legenda: até 3.000 caracteres (posts mais longos performam bem)
- [ ] Imagem: 1200×628px (link preview) ou 1080×1080px (post de imagem)
- [ ] CTA de conexão profissional (não de venda direta)

#### TikTok
- [ ] Vídeo: 9:16, 1080×1920px
- [ ] Duração: 15s-3min (ideal: 15-60s)
- [ ] Descrição: até 2.200 caracteres
- [ ] Hashtags relevantes para o nicho

#### Site / Blog
- [ ] Meta title: até 60 caracteres com palavra-chave
- [ ] Meta description: até 155 caracteres com CTA
- [ ] Imagem de capa com alt text
- [ ] Links internos adicionados?
- [ ] Post publicado ou agendado na plataforma?

#### WhatsApp / Newsletter
- [ ] Texto sem formatação de redes sociais (sem hashtags)
- [ ] Personalização se possível ("Olá [nome]")
- [ ] Link de ação claro

---

### Passo 5 — Registrar publicação em campaigns.md

Adicione entrada em `clients/[slug]/campaigns.md`:

```markdown
## [YYYY-MM-DD] — [Título do conteúdo]

**Plataforma:** [plataforma(s)]
**Formato:** [formato]
**Objetivo:** [engajamento / venda / tráfego]
**Status:** [Publicado / Agendado para: data]
**Link:** [URL do post — se disponível]
**Observações:** [qualquer nota relevante]
```

---

### Passo 6 — Confirmar publicação

```
✅ Conteúdo [publicado / agendado]

Plataforma: [nome]
Data/hora: [quando vai ao ar]
Registrado em: campaigns.md

Próximo conteúdo sugerido: [baseado em estrategia.md]
```

**Pós-publicação obrigatória:** executar `intelligence/checklist-pos-publicacao.md` imediatamente.
A janela de distribuição das primeiras horas é a única real — saves e DMs nos primeiros 30 min definem o alcance.

---

## Regras

1. **Nunca publique sem aprovação explícita** — passo 2 é obrigatório e inegociável.
2. Se o checklist de qualidade tiver um `⚠️`, descreva o problema e peça instrução.
3. Nunca cross-poste sem adaptar o copy — cada plataforma tem tom e formato próprios.
4. Toda publicação deve ser registrada em `campaigns.md` — sem exceção.
5. Se o conteúdo for anúncio pago, redirecionar para `skill-anuncio.md` antes de publicar.
6. Agendamento é indicado — anote data/hora em `campaigns.md` mesmo antes de publicar.

---

## Exemplo de Ativação

```
/publicar
Conteúdo: outputs/carousels/2026-05-19-como-escolher-joia-em-ouro-18k/copy.md
Plataforma: Instagram
Formato: Carrossel
Data: 2026-05-20 19:00
Objetivo: Educação + Autoridade
```

---

*Skill v2.0 — MarketingOS*
*Publisher real via Meta Graph API (Instagram feed, carrossel, reels). Checklist multi-plataforma para canais sem API.*
