# runs.md — Felipe Proença

## Sessão 15 — 2026-06-09

**Status:** Completo
**Objetivo:** Criar e publicar 3 carrosséis de tutorial IA+marketing + corrigir pipeline de render

**Entregáveis:**
- `carousel-ia-mitos/index.html` — 6 slides, desmistificação IA
- `carousel-sistema-captacao/index.html` — 7 slides, framework 5 passos
- `carousel-marketing-diagnostico/index.html` — 6 slides, presença vs sistema
- PNGs 1080×1080px capturados para os 19 slides
- Publicados: Instagram + Facebook (@felipeproenca_marketingos)

**Decisões:**
- Bancos de referência (visual-references.json + copy-references.json) integrados ao processo criativo pela primeira vez
- render-carousel-file.js corrigido: viewport 540px+deviceScaleFactor:2 → 1080px+clip — HTMLs com body fixo em 1080px não cortam mais
- copy-references.json salvo em intelligence/ e registrado em MEMORY.md

**Aprendizados:**
- HTMLs com `body { width: 1080px }` exigem viewport 1080px no render — nunca deviceScaleFactor com viewport menor
- Bancos de referência produzem output visivelmente mais denso e editorial — usar sempre antes de qualquer criação

**Status:** Completo

---

## Sessão 14 — 2026-06-08

**Status:** Completo
**Objetivo:** Fechar pipeline multi-tipo de criação visual + Reel 03 + arsenal sem limitações

**Executado:**

**Pipeline de criação:**
- `skill-reel-builder.md` criado — orquestrador multi-tipo: lê brief, decide tipo, gera HTML, conhece contratos de todos os tipos
- `templates/reels/boilerplate-gsap-motion.html` — GSAP paused timeline + master.seek() frame-accurate ✅ renderizado
- `templates/reels/boilerplate-three-abstract.html` — Three.js r128, TorusKnot como Points com vertex colors ✅ renderizado
- `templates/reels/boilerplate-shader-sdf.html` — Ray marching + metaballs gold, zero biblioteca, pura GLSL ✅ renderizado
- `templates/creation-brief.md` — seção 6 expandida para 28+ tipos com mapa visual completo

**Conteúdo real:**
- `reel-03-brief.md` — brief preenchido antes de buildar (fluxo correto)
- `reel-03-previsivel.html` + `reel-03-previsivel.mp4` — 30s, 900 frames, "Você sabe quem vai ser seu próximo cliente?" ✅

**Tipos validados com render real:**
- `text` (CSS @keyframes), `particles` (Canvas 2D), `motion` (GSAP), `3d-abstrato` (Three.js), `shader-sdf` (GLSL ray marching)

**Aprendizados:**
- Brief fraco → execução técnica. Brief forte → impacto visual. A diferença é sempre o conceito antes do código.
- CSS @keyframes + a.currentTime = frame-accurate em qualquer tipo. É o contrato universal.
- Ray marching (shader-sdf) funciona no Playwright com ANGLE/D3D11 — GPU real, zero artifact.
- Tipos não devem ser silos — juntar variáveis é o que cria criações impossíveis (texto emergindo de objeto 3D, câmera + partículas + shader, etc.)
- O pipeline suporta 28+ tipos. A barreira não é tecnológica — é criativa e de brief.

**Decisão registrada — Felipe:**
- "Engessar criação é uma burrice" — o sistema deve suportar combinação livre de variáveis
- "Nossas mentes não são uma parede, são portas" — filosofia de criação do sistema
- Arsenal expandido: sem limitação de tipo ou combinação

**Próximos passos:**
- [ ] Adicionar áudio Reel 03 no CapCut → publicar
- [ ] Reel 04 com brief preenchido antes de buildar
- [ ] Primeiro reel com tipos combinados (ex: partículas + texto CSS + câmera Three.js)
- [ ] Definir ICP completo (ver inteligência estratégica abaixo)
- [ ] Banner canal YouTube
- [ ] Páginas: captura, produto, institucional, blog

---

## Sessão 13 — 2026-06-06

**Status:** Completo
**Objetivo:** Carrossel sistema vs agente + pipeline de Reels nativo

**Executado:**
- Inteligência de algoritmo Instagram 2026 salva em benchmarks.json + checklist-pos-publicacao.md criado
- Carrossel "Sistema vs Agente" (7 slides): canvas de nós animado, gold flip, terminal block — publicado Instagram + Facebook
  - instagram.com/p/DZOgBfukrgO/
- Pipeline de Reels criado do zero: HTML animado → Playwright grava → FFmpeg MP4
- Reel 01 produzido e aprovado: "O próximo funcionário que você vai contratar não é humano"
- `skills/criacao/skill-reels.md` criada com processo completo
- P001 registrado em `intelligence/patterns.md`
- `npm run reel:render` adicionado ao package.json

**Aprendizados:**
- Pipeline Playwright → MP4 funciona e entrega qualidade — operador só adiciona áudio no CapCut
- Logo final: CSS @keyframes obrigatório (JS transitions não disparam no Playwright)
- Letter-spacing positivo (0.01em) — negativo achata letras na gravação de vídeo
- --duration precisa de buffer de 2000ms além da animação (evita cortar o logo)
- Pesquisa de tema (WebSearch IA + cotidiano → interseção) gerou 4 temas fortes em uma rodada
- Three.js/GSAP/Matter.js são o próximo nível — compatíveis com Playwright, nenhum criador BR usa no pipeline

**Próximos passos:**
- [ ] Checklist 30 min pós-publicação do carrossel
- [ ] Produzir Reels 02, 03, 04
- [ ] Explorar Three.js no Reel 02 ("futuro")
- [ ] insights em ~48h

---

## Sessão 12 — 2026-06-04

**Status:** Completo
**Objetivo:** Criar prompt master para editor de Reels IA do Felipe / MarketingOS

**Executado:**
- Cliente Felipe aberto pelo protocolo do MarketingOS.
- Contexto carregado: manifesto, alma, CLAUDE, intelligence, client.md, estrategia.md, notes.md, brand-kit.json, campaigns.md, metrics.json e icp.md.
- Prompt master criado em `outputs/criacao/prompt-video-editor-felipe.md`.
- Prompt estruturado para carregar inteligencia, identidade, alma, brand, ICP, linguagem verbal, linguagem visual, doutrina de edicao e formato de saida do editor.

**Aprendizados:**
- O editor de Reels precisa operar como extensao da estrategia build in public, nao como ferramenta de corte generica.
- Para Felipe, o criterio de edicao mais importante e clareza de tese + prova de processo; ritmo e estetica entram depois.
- O prompt pode virar template reutilizavel para outros clientes com substituicao de contexto, brand-kit, ICP e objetivos.

**Proximos passos:**
- [ ] Testar o prompt com um video bruto real do Felipe.
- [ ] Validar se o editor devolve tese, hook, cortes, legendas, destaques visuais, CTA e risco de desalinhamento.
- [ ] Se aprovado, criar versao template para `clients/_template` ou skill dedicada.

---

## Sessão 11 — 2026-06-04

**Status:** Parcialmente completo — aguardando envio manual
**Objetivo:** Mudar funil — atacar empresas com sites ruins/não responsivos no RJ

**Executado:**

**Análise de mercado (skill-market-analyzer):**
- Nicho-gatilho definido: "site ruim/não responsivo" como sinal de entrada
- Região: Rio de Janeiro
- 3 nichos priorizados: clínicas/consultórios (9/10), advocacia (8/10), construtoras (8/10)
- Subniche de entrada recomendado: consultórios odontológicos + fisioterapia

**Prospecção real (skill-prospector):**
- 5 prospectos verificados via inspeção real dos sites (WebFetch):

| # | Nome | Nicho | Temperatura | Problema principal |
|---|---|---|---|---|
| 1 | Rocha Meirelles Advogados | Advocacia | 🔴 QUENTE | Site 2016, sem WhatsApp, blog parado 10 anos |
| 2 | Cataldo Advocacia | Advocacia | 🔴 QUENTE | Site com imagens quebradas no mobile, 3 escritórios sem integração |
| 3 | Alexandre Almeida Advocacia | Advocacia | 🔴 QUENTE | Último conteúdo: agosto/2020, sem WhatsApp |
| 4 | JB Rio Reformas | Construção | 🟡 MORNO | WordPress 2015, design datado mas funcional |
| 5 | Aragão Reformas | Construção | 🟡 MORNO | Portfólio genérico, sem narrativa de obra |

**Contatos:**
- Cataldo: @cataldoadvocacia (Instagram) · (21) 99468-5276 (WhatsApp)
- Rocha Meirelles: rochameirelles.com.br (formulário) · (21) 3495-7007
- Alexandre Almeida: alalmeida.adv.br · (21) 2423-0028

**Demo criado para Cataldo Advocacia:**
- HTML: `outputs/demo/cataldo-advocacia-2026-06-04.html`
- PNGs renderizados: `outputs/demo/cataldo-slides/slide-01/02/03.png`
- Script de render: `scripts/render-cataldo-demo.js`
- Script de envio: `scripts/send-cataldo-demo.js`

**Mensagem de abertura pronta** para WhatsApp + Instagram DM (ver campaigns.md)

**Bloqueio de envio automático:**
- `whatsapp-web.js` v1.34.7 fora de sync com o WhatsApp Web atual
- Erro: `Execution context was destroyed` em `Client.inject`
- Fix estrutural: migrar para `@wppconnect-team/wppconnect`

**Aprendizados:**
- "Site ruim" é o gatilho de prospecção mais concreto e verificável do mercado — dá diagnóstico antes da conversa
- Advocacia RJ tem padrão claro: sem WhatsApp + conteúdo parado + dependência de indicação
- Demo personalizado com problema real observado no site cria abertura imediata — nunca template
- `whatsapp-web.js` tem ciclo de vida curto — precisar de solução mais estável para outreach automatizado

**Próximos passos:**
- [ ] Enviar manualmente para Cataldo: WhatsApp (21) 99468-5276 + Instagram @cataldoadvocacia
- [ ] Usar mesma mensagem e slides para Rocha Meirelles (email) e Alexandre Almeida (WhatsApp)
- [ ] Migrar outreach-whatsapp.js para @wppconnect-team/wppconnect
- [ ] Abordar os 3 quentes essa semana — mesmo ciclo de demo

---

## Sessão 10 — 2026-06-03

**Status:** Completo
**Objetivo:** Criar conteúdo de autoridade sobre IA aplicada usando interligação com social-content-agents

**Executado:**
- Cliente Felipe aberto pelo protocolo.
- Brief criado e enviado ao `social-content-agents`.
- Job registrado: `felipe-proenca-curiosidade-sobre-ia-20260603-032133`.
- Carrossel local criado em HTML: `outputs/posts/2026-06-03/ia-aplicada-sistema-carousel.html`.
- 6 slides PNG renderizados em 1080×1080: `outputs/posts/2026-06-03/ia-aplicada-sistema-carousel/`.
- Copy, legenda, stories e direção visual salvos em `outputs/posts/2026-06-03/conteudo-ia-aplicada-autoridade.md`.
- Português e acentuação corrigidos após revisão.
- `npm run aggregate` executado com sucesso.

**Aprendizados:**
- Para conteúdo público, não usar fallback sem acentos: revisar português antes de render final.
- A interligação MarketingOS → social-content-agents precisa de servidor iniciado pela cópia correta com `/api/brief`.
- `social-content-agents` ainda pode prender job em `gerando`; manter fallback local para não bloquear entrega.
- Token Meta expirado bloqueia insights; renovar antes de qualquer fechamento que dependa de dados novos.

**Próximos passos:**
- Publicar o carrossel IA aplicada após aprovação.
- Renovar token Meta/Instagram e rodar insights.
- Reiniciar/limpar social-content-agents antes da próxima geração automática.

---

## Sessão 09 — 2026-06-02

**Status:** Completo
**Objetivo:** Fechamento de sessão (sem geração de conteúdo)

**Executado:**
- benchmarks.json atualizado com data de hoje

**Aprendizados:**
- Nenhum novo nesta sessão

**Próximos passos:**
- Renovar imgbb key → enviar B2B → monitorar clínicas → insights em 48h (a partir de 2026-06-03)

---

## Sessão 08 — 2026-06-01

**Status:** Completo
**Objetivo:** Fix visual + prospecção B2B + pipeline de clínicas

**Executado:**
- Carrossel republicado a 1080×1080 (fix Playwright deviceScaleFactor)
- Handle @felipeproenca_marketingos corrigido em HTML, client.md e memória
- Prospecção B2B: 3 empresas reais mapeadas + mensagens personalizadas criadas
- scripts/prospector/send-prospects.js criado para envio B2B
- 5 clínicas SP contactadas via demo pipeline (segmento: diagnostico)
- imgbb key expirada identificada como bloqueio do slide

**Aprendizados:**
- Playwright: deviceScaleFactor vai em browser.newContext(), nunca em page.screenshot()
- Handle do cliente SEMPRE verificar em client.md antes de qualquer peça visual
- Chrome da sessão anterior trava o próximo run — encerrar sempre com destroyWhatsApp()
- B2B: tom radicalmente diferente do B2C — nunca usar "post", "conteúdo", "agência"
- imgbb key tem validade — verificar antes de cada rodada de demos

**Próximos passos:**
- Renovar imgbb key → enviar B2B → monitorar clínicas → insights em 48h

## Sessão 07 — 2026-05-31

**Status:** Completo
**Objetivo:** Identidade unificada + publisher Facebook + demo pipeline melhorado + conteúdo

**Executado:**
- Identidade Marketing/OS v2: violet descartado → Syne + gold #c9a55c unificado para agency e Instagram
- `agency/brand-kit.json` e `clients/felipe-proenca/brand-kit.json` alinhados (fonte canônica: felipe-proenca)
- Carrossel v2 identidade publicado: instagram.com/p/DY_OZ0zFruX/
- Publisher Facebook implementado: `scripts/publisher/facebook.js` + `--channel all`
- Demo pipeline: diagnóstico personalizado por sinais reais (Instagram, WhatsApp, rating) via `buildDiagnosis()`
- Demo slide 3 reescrito: desejo em vez de steps — "Imagine" na cor do lead
- Carrossel build in public (publisher automático) publicado: instagram.com/p/DY_UzISlmYF/
- Post Facebook conversacional sobre sistema vs indicação
- Capa Facebook gerada: `outputs/branding/facebook-cover.png` (1640×624px)
- alma.md: seção "O que vendemos de verdade" adicionada
- CLAUDE.md: instrução de linguagem — IA aplicada, desejo antes de necessidade
- `clients/felipe-proenca/icp.md` criado com segmentos, dores, emoções e gatilhos
- Bio Facebook definida: "Sistema de IA que gera leads, opera canais e publica conteúdo — enquanto você trabalha."

**Aprendizados:**
- Demo genérico = golpe na cabeça do lead. Diagnóstico com dados reais (Instagram, WhatsApp, rating) muda tudo
- Slide 3 com steps e botão mata o desejo — imagem mental + Playfair italic converte mais
- Token Meta expira em horas — verificar ANTES de publicar
- Facebook page token é derivado automaticamente do user token com pages_manage_posts
- "Imagine" na cor do lead cria conexão imediata — aprovado

**Próximos passos:**
- Subir capa manualmente na Página do Facebook (API não suporta)
- Rodar demo pipeline com leads reais e medir taxa de resposta
- Fechar primeiro cliente — prioridade absoluta

---

## Sessão 06 — 2026-05-29 (tarde)

**Status:** Completo
**Objetivo:** Conteúdo de credibilidade + prospecção

**Executado:**
- Suly Zen Spa: aberta, analisada, demo criada, prospect achou golpe, sessão fechada
- Nest Studio: prospectada via e-mail, registrada no sistema, aguardando retorno
- Carrossel 13 criado e renderizado (7 slides PNG)
- Virada estratégica: abandonado "o sistema funciona" → novo ângulo "build in public"

**Aprendizado mais importante:**
Credibilidade real vem da transparência sobre o processo — não da promessa de resultado sem prova.

**O que muda:**
- Conteúdo = mostrar o que está sendo construído
- Prospecção = Instagram primeiro, DM curto, nunca HTML demo frio no WhatsApp
- Prioridade = fechar UM cliente real

---

## Sessão 05 — 2026-05-29

**Status:** Completo
**Objetivo:** Refinar landing page para publicação (copy, tipografia, hierarquia e animação)

**Executado:**
- Landing page v1 revisada com foco em legibilidade e conversão
- Ajustes de hero: animação aplicada apenas na logo acima do H1 (sem intro de página)
- Correção de quebra/corte da logo durante animação (padding e estrutura)
- Destaques de "negócio" e "sistema" em dourado com luz suave
- Revisão da seção Problema Real para linguagem externa (sem framework interno 15/85)
- Suavização tipográfica dos blocos críticos (Problema, Método e Decisão)

**Aprendizados:**
- 15/85 deve orientar arquitetura da mensagem, não aparecer como copy pública
- Tipografia pesada em dark reduz leitura percebida mesmo com bom contraste
- No viewport real de trabalho, pequenos ajustes de line-height e peso geram ganho imediato de clareza

**Próximos passos:**
- Publicar carrossel antes/depois (legenda pronta em notes.md)
- Publicar landing page pessoal revisada
- Retomar grade 2 (posts 10–18) em sequência

---
## SessÃ£o 04 â€” 2026-05-28

**Status:** Completo
**Objetivo:** Dashboard web + carrossel antes/depois + consolidaÃ§Ã£o de identidade

**Executado:**
- Dashboard completo: index.html + config.js + supabase-client.js + dashboard.js + simulator.js + README
- Carrossel antes/depois: 8 slides HTML + 8 PNGs 1080Ã—1080 via Playwright
- Legenda do carrossel na voz literal do Felipe
- brand-kit.json atualizado com identidade Marketing/OS completa e validada
- AGENTS.md atualizado com regra de parada obrigatÃ³ria para conteÃºdo da marca do operador

**Aprendizados:**
- Copy na voz literal do cliente elimina o tom "engessado" â€” usar frases exatas da conversa como rascunho
- Render de carousel: viewport 540px + deviceScaleFactor 2 = 1080px correto (nÃ£o 1080px direto)
- Emojis em peÃ§as de feed â†’ sempre SVG linha fina (stroke 1.5, gold) â€” padrÃ£o aprovado
- Formato antes/depois (case anÃ´nimo) Ã© o formato de prospecÃ§Ã£o/credencial mais forte observado atÃ© agora

**PrÃ³ximos passos:**
- Publicar carrossel antes/depois
- Publicar Posts 10â€“18
- Landing page no ar
- Aguardar retorno Toque Indiano / Pontos Cardeais

---

## SessÃ£o 03 â€” 2026-05-23

**Status:** Completo
**Objetivo:** Grade 2 (Posts 10â€“18) â€” primeiros 4 entregues + fechamento de arquivos

**Executado:**
- InteligÃªncia da Grade 1 extraÃ­da e registrada em notes.md
- campaigns.md e estrategia.md limpos â€” sÃ³ o que estÃ¡ ativo e pendente
- grade-10-18.md criado com 9 posts planejados (ganchos, pilares, formatos, ordem)
- Posts 10, 11, 12 gerados em PNG 1080Ã—1080 com acentuaÃ§Ã£o correta
- Tag `â€”â€” MARKETINGOS â€”â€”` adicionada no topo de todos os feeds â€” validada
- Destaque tipogrÃ¡fico de "MarketingOS." em branco bold no post-12
- Posts 02â€“09 removidos da pasta (publicados, descartados)
- Carrossel 13 criado (HTML + 7 slides PNG via Playwright)
- Landing page HTML de apresentaÃ§Ã£o do MarketingOS gerada e links atualizados

**Aprendizados:**
- Tag de marca no topo dos feeds aprovada sem ajuste â€” padrÃ£o consolidado
- Destaque de palavra-chave na mesma linha: renderizar word-by-word com textbbox para alinhar baseline
- Carrossel meta (sistema mostrando a si mesmo) Ã© o formato mais diferenciado da grade â€” usar em momentos de virada de narrativa
- Texto nos scripts Python deve usar acentos normalmente â€” cp1252 sÃ³ afeta print(), nÃ£o Pillow

**PrÃ³ximos passos:**
- Publicar Posts 10, 11, 12 (nessa ordem)
- Publicar Carrossel 13
- Gerar Posts 14â€“18 e CarrossÃ©is 15 e 17
- ProspecÃ§Ã£o ativa via WhatsApp com mensagens V1/V2

---

## SessÃ£o 02 â€” 2026-05-22

**Status:** Completo
**Objetivo:** Grade 9 posts â€” geraÃ§Ã£o visual completa + publicaÃ§Ã£o

**Executado:**
- Posts 02â€“09 gerados: 3 carrossÃ©is (HTML + PNGs via Playwright) + 5 feeds (PNG via Pillow)
- Identidade dark minimal validada pelo cliente
- Grade completa publicada no Instagram

---

## SessÃ£o 01 â€” 2026-05-21

**Status:** Completo
**Objetivo:** Onboarding + posicionamento + primeira geraÃ§Ã£o de conteÃºdo

**Executado:**
- client.md completo (9 blocos)
- Oferta posicionada com antes/depois/ponte + frase central
- Post de apresentaÃ§Ã£o: texto na imagem + legenda + briefing visual
- 3 versÃµes de mensagem para prospecÃ§Ã£o direta no WhatsApp

**Aprendizados:**
- Posicionamento "sistema" vs "agÃªncia" Ã© o eixo central â€” tudo parte daÃ­
- AnÃ¡lise prÃ©via gratuita Ã© o desbloqueador da objeÃ§Ã£o principal
- Tom tÃ©cnico/consultivo exige evitar vocabulÃ¡rio de guru â€” manter vigilÃ¢ncia

**PrÃ³ximos passos:**
- Publicar post de apresentaÃ§Ã£o
- Abordar prospectos com mensagens geradas
- Criar brand-kit antes de prÃ³ximas peÃ§as visuais
- Construir os 8 posts restantes do grid inicial
