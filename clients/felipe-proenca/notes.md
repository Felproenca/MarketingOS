# notes.md — Felipe Proença

## 2026-06-11 — Reference Library integrada + site novo 3D scroll-driven

**O que foi feito:**
- Reference Library externa (`../social-content-agents`, 42 refs com código real) integrada ao sistema: protocolo em `workflows/reference-library.md`, blocos nas 6 skills de criação
- `skill-content-engine.md` deprecada — repo pivotou, motor Python preservado na branch `legacy-content-engine`
- Site novo gerado: `outputs/site/index.html` — Three.js camera fly-through por scroll, partículas gold, manifesto pinado, terminal vivo (comando digitando + 6 camadas processando + perception.json retornando), schematics SVG nos passos Perceber/Compreender/Produzir, princípios materializando por scrub
- Validado via Playwright: zero erros de console, 8 previews PNG

**Decisões tomadas:**
1. **3D admitido no DNA com condição:** todo movimento dirigido pelo leitor (scroll/mouse), nada anda sozinho — tradução de "movimento mínimo como sinal de controle". Texto continua entrando só por fade.
2. **Divisão de papéis dos bancos:** Reference Library = execução (como fazer, código); Biblioteca Viva = percepção (por que fazer, tensões). `reference-context.json` segue como gate.
3. **Terminal vivo como padrão de prova:** o `terminal_block` do brand-kit elevado de estático para operante — o sistema demonstrando a si mesmo (princípio Stripe).

**O que funcionou:**
- Teste de integração de ponta a ponta: gates → consulta (3 refs) → código adaptado ao DNA → render validado. O fluxo desenhado pela manhã funcionou à tarde sem ajuste.
- Feedback do Felipe direcionou refinamento certeiro: "telas em operação" + "camadas no scroll" — ambos implementados sem quebrar o DNA.

**Próximos passos:**
- Site é draft aprovado em conteúdo/motion — falta deploy (Vercel/Netlify) e domínio
- Avaliar migração dos bancos antigos (`visual-references.json`, `copy-references.json`) para a Reference Library

---

## 2026-06-10 — Virada de posicionamento: Perception Engine + Branding completo

**O que foi feito:**
- `/perceber felipe-proenca` executado: Perception Engine completo, 6 camadas
- `perception.json` gerado em `outputs/branding/`
- `tese.md` criado: tese central, manifesto revisado, 10 princípios inegociáveis
- `conteudo-30-dias.md` criado: plano de validação da tese antes de qualquer mudança visual
- `/branding felipe-proenca` executado: 6 arquivos de branding reescritos (pré-Virada estavam desatualizados)
- Wallpaper desktop 3840×2160 gerado: `outputs/wallpaper-desktop.png`

**Decisões estratégicas tomadas:**

1. **Assinatura Perceptiva:** "sistema que parece manifesto" — o Felipe não apresenta ferramentas, apresenta uma forma de pensar.

2. **ICP redefinido por perfil, não por setor.** O ICP anterior ("médicos, pet shops, etc.") era o ICP de uma agência. O novo ICP é: fundador/CEO com marketing ativo mas sem lógica unificada — resultado inconsistente que não consegue explicar.

3. **Posicionamento externo:** "Sistema Operacional de Marketing" (não "Intelligence-First Marketing" — categoria sem significado público ainda). Internamente: Intelligence-First Marketing.

4. **Promessa principal revisada:** "Você vai operar marketing com direção, não com esperança." Substituiu "Você vai saber de onde vem o próximo cliente" (muito genérico).

5. **Framing de produção corrigido:** Não é guerra contra produção. "Produção sem interpretação é ruído. Interpretação sem produção é estagnação. A vantagem está na combinação — mas na ordem certa."

6. **A frase que cria categoria:** "Não automatizamos criação. Automatizamos a inteligência que torna a criação válida." — ninguém no mercado está vendendo isso.

7. **Princípio central:** "O sistema é o argumento." Não dizer que tem IA — mostrar o perception.json. Não dizer que tem método — mostrar a evolução do raciocínio.

8. **Plano 30 dias aprovado:** Antes de mexer em branding visual, validar a tese através de conteúdo. Se em 30 dias as pessoas começarem a usar a linguagem do Felipe, a tese é real.

**Pendências identificadas nesta sessão:**
- Prospector precisa ser atualizado com o novo ICP (perfil, não setor)
- Scraper precisa ficar mais eficiente

---

## 2026-06-08 — Framework estratégico completo (inteligência para próximas sessões)

**Origem:** Felipe encerrou sessão com dump estratégico completo. Registrar como inteligência permanente.

### Diagnóstico de posicionamento — perguntas que precedem qualquer criação

Antes de qualquer campanha, post ou venda, responder:
1. **Qual o problema que resolvemos?** — o dinheiro mora no problema, não na solução
2. **Para quem resolvemos?** — ICP completo:
   - Gênero, faixa etária, nível de experiência
   - Localização
   - Faturamento mensal e anual
3. **Qual é a solução?** — tech / educação / serviço / processo / IA?
4. **Como entregamos?** — a entrega precisa ser definida antes da promoção
5. **Como promovemos?** — só então envelopar para distribuição

### Filosofia de conteúdo (registrada como diretriz permanente)

**Rede social ≠ vitrine. É canal de distribuição, aquisição, conversão e retenção.**

- Oferta precisa ser colocada na mesa das pessoas com consistência e repetição
- Todo conteúdo tem objetivo claro:
  - Stories → link
  - Reels → oferta
  - Feed → valor + autoridade
- Ratio de entrega: entregar 10, sacar 1 / entregar 100, sacar 10
  - "Serve 10x mais" antes de pedir qualquer coisa
  - Quem entrega valor cria o direito de vender

### Infraestrutura digital necessária

**Terreno próprio vs terreno alugado:**
- Redes sociais = terreno dos outros. O algoritmo muda. A conta pode ser derrubada.
- Site = terreno próprio. Muda o jogo completamente.
- Ter site = estar à frente de ~50% dos concorrentes no segmento digital

**Páginas necessárias:**
- Página de venda
- Página de atração
- Página de captura / leads
- Página de produtos
- Site institucional
- Blog (SEO + autoridade)

**Tráfego orgânico:** conteúdo consistente + SEO correto → lento mas constrói autoridade
**Tráfego pago:** validar → escalar

### Canais de distribuição

| Canal | Tipo de conteúdo | Objetivo |
|---|---|---|
| Instagram | Reels + Stories + Feed | Aquisição + Conversão |
| YouTube | Vídeos longos + Shorts | Autoridade + SEO |
| LinkedIn | Posicionamento B2B | Aquisição B2B |
| TikTok | Reels adaptados | Alcance jovem |
| Spotify | Podcast | Autoridade + Relacionamento |

**Pendente:** Banner do canal YouTube

### IA e IoT em campanhas — oportunidade identificada

Estudo mostra que a maioria das empresas do segmento digital usa redes sociais mas IA+IoT em campanhas ainda é **pouco difundido**. Isso é:
1. Campo de aquisição (mostrar diferenciação)
2. Pauta de conteúdo (educar antes de vender)

### Filosofia de criação visual (Felipe, 2026-06-08)

> "Engessar criação é uma burrice."
> "Imagina juntar essas variáveis — texto emergindo de objetos, movimentos de câmera."
> "Nossas mentes não são uma parede, são portas."

**Diretriz:** tipos de criação não são silos. Combinação livre de variáveis é o padrão, não a exceção.

### Citação permanente registrada

> "A diferença de um cara bom e de um cara ruim é que só um cara bom superou as coisas ruins."

---

## 2026-06-06 — Pipeline de Reels nativo validado + carrossel publicado

**O que foi feito:**
- Carrossel "Sistema vs Agente" criado, renderizado e publicado (Instagram + Facebook)
  - Instagram: instagram.com/p/DZOgBfukrgO/
  - 7 slides: canvas de nós animado no slide 1, gold flip no slide 5, terminal block no slide 2
- Pipeline de Reels criado do zero: HTML animado → Playwright grava → FFmpeg MP4
  - Reel 01: "O próximo funcionário que você vai contratar não é humano" (tema 1 de 4)
  - Operador só adiciona áudio no CapCut — zero edição de vídeo
- Skill `skills/criacao/skill-reels.md` criada e documentada
- Inteligência registrada: `intelligence/patterns.md` P001, `benchmarks.json` seção reels_texto_revelado
- Checklist pós-publicação criado: `intelligence/checklist-pos-publicacao.md`
- Benchmarks de algoritmo Instagram 2026 registrados (hierarquia de sinais, saves 3–8%)

**Decisões tomadas:**
- Pipeline Playwright → MP4 aprovado como padrão de Reels (sem edição de vídeo)
- Logo final em CSS @keyframes obrigatório (JS transitions não disparam no Playwright)
- Letter-spacing positivo (0.01em) — negativo achata letras na gravação
- 3 Reels restantes (temas 2, 3, 4) a produzir nas próximas sessões
- Explorar Three.js / GSAP / Matter.js para elevar qualidade visual (ver "futuro" na memória)

**Próximos passos:**
- Executar checklist de primeiros 30 min pós-publicação do carrossel
- Produzir Reels 02, 03 e 04 (temas pesquisados nesta sessão)
- Em ~48h: `npm run insights -- --slug felipe-proenca`
- Próxima sessão: explorar "futuro" — Three.js no pipeline de Reels

---

## 2026-06-04 — Prompt master para editor de Reels IA

**O que foi feito:**
- Prompt master criado para um editor de video por IA operando no Codex.
- Arquivo salvo em `outputs/criacao/prompt-video-editor-felipe.md`.
- O prompt consolida identidade, inteligencia, alma, brand-kit, ICP, linguagem verbal, linguagem visual e doutrina de edicao para Reels do Felipe / MarketingOS.

**Decisoes tomadas:**
- O editor deve tratar cada Reel como prova publica do MarketingOS, nao como conteudo generico.
- Direcao principal: build in public, processo real, clareza estrategica e prova antes de promessa.
- Edicao deve evitar estetica de agencia, hype, template viral, emojis como linguagem principal e qualquer promessa sem prova.
- O output do editor deve incluir tese, hook, cortes principais, legendas, destaques visuais, CTA e riscos de desalinhamento.

**Proximos passos:**
- Testar o prompt com um video bruto real do Felipe.
- Se funcionar, transformar a estrutura em template reutilizavel para outros clientes.

---

## 2026-06-04 — Integração social-content-agents: descartada

**O que foi feito:**
- Diagnóstico da integração HTTP: servidor em background instável no Windows (uvicorn reloader recria processos, impossível de gerenciar via Node).
- Substituição por subprocess CLI direto funcionou parcialmente: copy gerada com qualidade, pipeline visual entregou HTML/PNG com layout inutilizável.
- Encoding de `estrategia.md` corrigido (UTF-8).
- Revertido para estado original do commit `a1383b6`.

**O que não funciona — registrado:**
- Pipeline visual do motor produz HTML sem hierarquia tipográfica adequada.
- Custo real: ~$2 + 1h sem output publicável.

**O que ficou de valor:**
- CopyAgent gera hooks e ângulos fortes — vale uso isolado para copy no futuro.
- Fluxo nativo do MarketingOS (carousel → Playwright → PNG) continua sendo o caminho correto para visual.

**Próximos passos:**
- Retomar fluxo nativo: /criar carousel → HTML → PNG.
- Renovar token Meta/Instagram para rodar `npm run insights`.

---

## 2026-06-03 — Conteúdo IA aplicada + teste de interligação social-content-agents

**O que foi feito:**
- Conteúdo de autoridade criado sobre IA aplicada como sistema de aquisição.
- Brief enviado ao `social-content-agents` via `npm run criar-conteudo`.
- Job aceito pelo motor com content ID `felipe-proenca-curiosidade-sobre-ia-20260603-032133`, mas ficou preso em `gerando`.
- Carrossel criado localmente em HTML e renderizado em 6 PNGs 1080×1080.
- Copy, legenda, stories e direção visual salvos em `outputs/posts/2026-06-03/conteudo-ia-aplicada-autoridade.md`.
- Correção de português e acentuação aplicada nos slides e no markdown.

**Decisões tomadas:**
- Tese central da peça: "IA não é vantagem competitiva. Direção é."
- Ângulo: IA não salva estratégia ruim; ela acelera o improviso quando não existe sistema.
- Formato escolhido: carrossel 6 slides, identidade Marketing/OS v2, sem emojis, com terminal block no slide de sistema.

**Problemas encontrados:**
- `social-content-agents` expunha rota `/api/brief` apenas na cópia aninhada do projeto; o servidor inicial estava servindo API antiga.
- Processo interno do motor ficou preso em `gerando`, possivelmente no subprocesso do Claude CLI.
- `npm run insights -- --slug felipe-proenca --min-age-hours 48` falhou porque o token Meta expirou.

**Próximos passos:**
- Revisar visualmente todos os 6 PNGs finais.
- Publicar carrossel após aprovação.
- Renovar token Meta/Instagram para rodar insights.

---

## 2026-06-05 — Pitch Bruno Capelli + deploy Netlify

**O que foi feito:**
- Pitch deck completo criado para o Salão Bruno Capelli usando `templates/pitch-deck-template.html`
- 2 carrosséis navegáveis embutidos no pitch (tabs: Cor & Colorimetria + Mechas & Balayage)
- Site preview com botão "Abrir site →" linkando para `site-preview.html`
- Carrosséis standalone (`carousel-1-cor.html` e `carousel-2-balayage.html`) atualizados com navegação prev/next + dots
- Site corrigido: `body { width: 100% }` — sem gap branco à direita do viewport
- Link do catálogo WhatsApp (`wa.me/catalog/5521979852192`) adicionado em todos os CTAs do site e pitch
- Deploy no Netlify: `https://pontos-cardeais-preview.netlify.app`

**Decisões tomadas:**
- Carrossel individual em HTML = navegável sempre, PNG só após aprovação (regra salva em memória)
- Pitch usa template único — sem criar arquivos soltos fora do padrão
- Catálogo WhatsApp do Bruno Capelli como destino de conversão (não WhatsApp pessoal)

**Aprendizado de comportamento:**
- Todo `carousel-*.html` precisa de barra de navegação abaixo do frame 540x540 — salvo em memória permanente

**Próximos passos:**
- Renovar sessão WhatsApp (rodar `node scripts/prospector/send-prospects.js` e escanear QR)
- Enviar Etapa 2 para Bruno Capelli: (21) 99763-3682
- Acompanhar respostas dos petshops (Dom Peludo, Pet Hero, Petshop Mania, Toca da Raposa)
- Se Bruno Capelli responder: enviar link do pitch `pontos-cardeais-preview.netlify.app/pitch-bruno-capelli.html`

---

## 2026-06-05 — Diagnóstico de aquisição + nova abordagem de prospecção

**Contexto:**
- 25 posts publicados, nenhum gerou DM de potencial cliente
- Prospecção anterior (3 PNGs no primeiro contato) não converteu
- WhatsApp não está gerando retorno
- Decisão: múltiplos funis em paralelo

**Mudanças implementadas:**
- skill-prospector.md atualizada com protocolo de 3 etapas obrigatórias
- Primeiro contato: 1 mensagem, sem PNG, sem pitch, termina com pergunta
- Diagnóstico completo só na Etapa 3, após resposta do lead

**Nicho priorizado:** Pet Shops (clínicas de estética não converteu antes)
**Regiões:** Rio de Janeiro + São Paulo (capitais)

**Rodada de prospecção executada:**
- 4 quentes identificados: Dom Peludo (SP), Pet Hero (SP), Petshop Mania (RJ), Toca da Raposa (RJ)
- Dom Peludo e Pet Hero com WhatsApp confirmado — prontos para envio imediato
- Arquivo: `outputs/prospects/petshops-rj-sp-2026-06-05.md`

**Padrão dos quentes:**
→ 1.000–2.500 seguidores, WhatsApp na bio sem automação, serviços variados sem funil

**Próximos passos:**
- Enviar mensagens de Etapa 2 para Dom Peludo e Pet Hero hoje
- Verificar WhatsApp de Petshop Mania e Toca da Raposa antes de enviar
- Registrar respostas no arquivo de prospects
- Se 2+ responderem com mesmo padrão → intelligence/patterns.md

---

## 2026-05-29 — Virada estratégica: build in public

**O que aconteceu:**
- Carrossel 13 criado ("Esse feed foi construído por um sistema")
- Felipe questionou: "estamos vendendo algo que não existe?"
- Resposta: não — o sistema existe e está funcionando. Mas o posicionamento estava errado.
- Virada: parar de vender resultado, começar a mostrar processo em tempo real.

**Decisão registrada:**
- Ângulo novo para toda a Grade 2: build in public como posicionamento, não como humildade.
- Honesto. Único. Constrói credibilidade sem precisar de prova que ainda não existe.

---

## 2026-06-29 - Conteúdo informativo dentro da operação

**Decisão permanente:**
- Topic Intelligence e prospecção com site pronto operam continuamente.
- Conteúdo público informa, interpreta mercado e gera interesse.
- Conteúdo não vende diretamente o site de R$97 ou a solução total por padrão.
- Venda direta pertence a outbound, diagnóstico ou ativo explicitamente comercial.
- CTAs preferidos: salvar, acompanhar, comparar, responder e pedir o estudo.

---
