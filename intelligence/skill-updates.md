# skill-updates.md — Log de Melhorias de Skills
> Localização: /intelligence/skill-updates.md
> Registro de todas as melhorias aplicadas nas skills com base em resultados reais de clientes.
> Cada atualização rastreável: qual cliente gerou o aprendizado, o que mudou, por quê.

---

## Por que este arquivo existe

Skills não são estáticas. Cada cliente que opera no sistema gera dados reais que podem melhorar o output para todos os clientes futuros. Este arquivo é o registro dessas melhorias — o que mudou, com base em quê, e quem se beneficia.

```
Fluxo de atualização:

notes.md do cliente
  → padrão confirmado em patterns.md
  → melhoria identificada para uma skill
  → registrada aqui antes de aplicar
  → skill atualizada
  → versão incrementada
```

---

## Formato de entrada

```
### [ID] — [Nome da Skill] v[versão anterior] → v[nova versão]

Data:             [ mês/ano ]
Origem:           [ cliente ou padrão que gerou o aprendizado ]
Padrão associado: [ ID em patterns.md, se houver ]

O que mudou:
→ Descrição clara da alteração — seção, regra, formato ou instrução

Por que mudou:
→ Dado ou observação que justificou a mudança

Impacto esperado:
→ O que melhora no output a partir dessa atualização

Clientes beneficiados:
→ [ Todos os novos / Clientes de nicho X / Todos ]
```

---

## Atualizações Aplicadas

### U012 — Motor de DM DIAGNOSTICO operacional

Data:             junho/2026
Origem:           Publicacao Agenda w25-01 e CTA "Comente DIAGNOSTICO"
Padrao associado: comentario -> DM -> lead magnet -> captura -> metricas

O que mudou:
→ `scripts/dm-engine/server.js` ganhou endpoints operacionais de teste e observabilidade: `/api/test-comment`, `/api/logs`, `/api/captures` e `/health` expandido.
→ `scripts/dm-engine/test-flow.js` valida o funil localmente: comentario com palavra-chave, ledger, captura de lead.
→ `npm run dm:test` entra como teste rapido do motor.
→ `scripts/insights/acquisition.js` agora le `clients/[slug]/leads/dm-engine-log.json` e transforma comentarios-chave em metrica real, nao mais lacuna nao-instrumentada.
→ `.env.example` e `scripts/dm-engine/DEPLOY.md` documentam variaveis e teste operacional.

Por que mudou:
→ O CTA publicado prometia entrega ao comentar DIAGNOSTICO. O sistema precisava ter rastro, captura e medicao antes de escalar auto-DM.

Impacto esperado:
→ O funil inbound fica observavel: comentario, DM em fila/enviada, captura e aprendizado entram no sistema sem depender de planilha manual.

Clientes beneficiados:
→ Felipe Proenca / MarketingOS agora; replicavel para outros clientes com lead magnet e webhook configurados.

---

### U011 — Agenda de Conteudo no Cockpit v1.0

Data:             junho/2026
Origem:           Plano `gostei-tem-detalhes-dde-quizzical-sky.md`
Padrao associado: rotina semanal 70/20/10 + gate humano de publicacao

O que mudou:
→ A Agenda deixa de ser avulsa e vira rotina operacional no Cockpit.
→ `clients/felipe-proenca/agenda.json` e a aba Agenda passam a ser a fonte de verdade semanal.
→ `scripts/agenda/plan-week.js` planeja a semana 70/20/10 sem inventar performance.
→ `scripts/scraper-panel/server.js` ganhou endpoints para planejar, editar/preparar item e validar publicacao via publisher em dry-run.
→ `workflows/agenda-semanal.md` documenta o loop medir → aprender → planejar → rascunhar → preparar → publicar com OK → medir.
→ `clients/felipe-proenca/brand-brief.md` satisfaz a regra de parada como brief permanente pendente de validacao humana.

Por que mudou:
→ O MarketingOS ja tinha outbound e metricas no Cockpit, mas faltava o lado inbound/conteudo como cadencia observavel.

Impacto esperado:
→ Conteudo deixa de ser demanda solta e passa a operar como sistema semanal de aquisicao, com aprovacao humana antes de qualquer publicacao real.

Clientes beneficiados:
→ Felipe Proenca / MarketingOS agora; padrao replicavel para outros clientes com `brand-brief.md` validado.

---

### U010 — Motor de Estudo (novo) + skill-construir v1.0

Data:             junho/2026
Origem:           Sessão 2026-06-18 com Felipe — ecossistema "coleta do conceito como produto"
Padrão associado: análise estrutural + estudo de caso + construção re-vestida

O que mudou:
→ Novo eixo de EXECUÇÃO (complementar à percepção de `/reverter`/`/adquirir`), em 3 anéis:
  - Anel 1 — `scripts/extract-structure.mjs` (mede tokens reais do DOM) + `scripts/synthesize-case-study.mjs` (funde estrutura + conceito num case-study) + schema `case-studies/_schema.json`.
  - Anel 2 — `scripts/build-case-catalog.mjs` → `_catalog.json` (catálogo consultável por setor/padrão/tensão).
  - Anel 3 — `scripts/construir.mjs` + `skills/criacao/skill-construir.md` (`/construir`): lê o catálogo, monta blueprint da ESTRUTURA dos casos e RE-VESTE pela `design-system.json` da marca; gate da alma rejeita o que viola `anti_dna` (observável).
→ 1º case-study real: `case-studies/itaplay.json` (anti-referência).

Por que mudou:
→ Faltava o eixo que mede estrutura e a transforma em construção sem clonar. O conceito coletado vira a moeda única (estudo de caso) que alimenta site/branding/diagnóstico. Vídeo/animação ficam fora (consumidores do pipeline existente).

Impacto esperado:
→ Construção de sites/sistemas mais rápida e fundamentada em referências reais, sempre re-vestida pela alma da marca (Teste Supremo + anti_dna). Posicionamento afiado por estudo de concorrentes (anti-referências).

Clientes beneficiados:
→ Todos os que têm `design-system.json` (pós `/perceber`→`/branding`→`/direcao-criativa`).

---

### U009 — Retenção/Reativação v1.0 → v1.1

Data:             junho/2026
Origem:           Growth Pack v1 — `intelligence/update-packages/2026-06-growth-pack.md`
Padrão associado: customer success, churn prevention, health scoring, lifecycle emails

O que mudou:
→ `skill-retention.md` recebeu health score 0-10, sinais de expansão, ação por risco e pergunta de sucesso do cliente.
→ `skill-reactivation.md` recebeu diagnóstico de reativação, score 0-10, reconhecimento de histórico e critério de arquivamento.

Por que mudou:
→ Crescimento sem retenção abre vazamento depois da aquisição. A operação precisa detectar risco, reforçar valor e reativar sem parecer spam.

Impacto esperado:
→ Mais clareza sobre clientes em risco, oportunidades de expansão e reativação com contexto real.

Clientes beneficiados:
→ Clientes ativos, inativos e operações de head implantado.

---

### U008 — skill-seo.md v1.0 → v1.1

Data:             junho/2026
Origem:           Growth Pack v1 — `intelligence/update-packages/2026-06-growth-pack.md`
Padrão associado: AI SEO, AEO, programmatic SEO, directory submissions, schema

O que mudou:
→ `skill-seo.md` separa SEO tradicional de AEO/descoberta por IA, inclui queries por problema, solução, comparação, local, autoridade e IA, além de checklist de citabilidade.

Por que mudou:
→ Descoberta hoje acontece em buscadores tradicionais e em respostas geradas por IA. O plano precisa cobrir os dois sem inventar volume ou presença.

Impacto esperado:
→ Estratégias de busca mais conectadas a autoridade, captura e conversão.

Clientes beneficiados:
→ Clientes com site, busca local, conteúdo evergreen ou autoridade de nicho.

---

### U007 — skill-pitch-deck.md v2.1 → v2.2

Data:             junho/2026
Origem:           Growth Pack v1 — `intelligence/update-packages/2026-06-growth-pack.md`
Padrão associado: proposal, sales enablement, case studies, testimonials

O que mudou:
→ `skill-pitch-deck.md` recebeu proposta guiada por diagnóstico, custo da inação, prova/microprova, slides obrigatórios v2.2 e follow-ups D+2, D+7 e D+14.

Por que mudou:
→ Proposta sem diagnóstico vira apresentação bonita. O deck precisa carregar decisão, prova e próximo passo.

Impacto esperado:
→ Pitchs mais comerciais, menos genéricos e mais conectados ao problema observado no prospect.

Clientes beneficiados:
→ Fluxos de aquisição, reativação e fechamento.

---

### U006 — skill-lead-capture.md v1.0 → v1.1

Data:             junho/2026
Origem:           Growth Pack v1 — `intelligence/update-packages/2026-06-growth-pack.md`
Padrão associado: lead magnets, popups, free tools, signup, analytics, funnel

O que mudou:
→ `skill-lead-capture.md` recebeu mapa de captura por temperatura do lead, seleção de ativo por intenção, tracking mínimo e handoff para venda.

Por que mudou:
→ Aquisição sem captura rastreável vira atenção desperdiçada. O fluxo precisa pedir pouco, prometer algo claro e registrar evento.

Impacto esperado:
→ Capturas com menos fricção, melhor rastreamento e transição mais limpa para venda.

Clientes beneficiados:
→ Todos os fluxos de landing, WhatsApp, site, ads e lead magnets.

---

### U005 — skill-site-audit.md v1.0

Data:             junho/2026
Origem:           Growth Pack v1 — `intelligence/update-packages/2026-06-growth-pack.md`
Padrão associado: market-audit, homepage-audit, CRO, copywriting, seo-audit, competitor profiling

O que mudou:
→ Criada `skills/analise/skill-site-audit.md`.
→ `skills/analise/_admin.md`, `CLAUDE.md`, `workflows/commands.md` e `docs/manual-de-uso.md` passaram a reconhecer `/analisar site`.

Por que mudou:
→ O MarketingOS precisava de uma auditoria comercial de site para diagnosticar promessa, CTA, prova, fricção, SEO/AEO básico e vazamento de lead.

Impacto esperado:
→ Diagnósticos melhores para prospect, cliente e demo, sempre com quick win de 7 dias e mensagem curta para abrir conversa.

Clientes beneficiados:
→ Prospects, clientes com site/landing e fluxos de demo personalizada.

---

### U004 — skill-social-copy.md v1.0 → v1.1

Data:             junho/2026
Origem:           Repertoire Updaters — `ai-marketing-claude-code-skills.md` + `marketingskills.md`
Padrão associado: Voice Extractor, De-AI-ify, Social Card Generator, Content Idea Generator, Social/Copywriting

O que mudou:
→ `skills/criacao/skill-social-copy.md` evoluiu para v1.1 com motor de voz,
  filtro De-AI-ify, raciocínio por plataforma, motores de ideia por
  posicionamento, `voice_match_score`, `humanidade_check` e reprovação
  estruturada.
→ `skills/criacao/_admin.md` recebeu a regra de voz v1.1: voz, plataforma
  e humanidade antes de aprovar copy.

Por que mudou:
→ Os repertórios externos mostraram que copy social forte não nasce só de
  template de plataforma. Ela precisa preservar voz, remover sinais de IA,
  adaptar nativamente por canal e justificar o formato escolhido.

Impacto esperado:
→ Menos copy genérica, variações realmente diferentes, mais coerência entre
  voz da marca e plataforma, e menor risco de conteúdo com aparência de IA.

Clientes beneficiados:
→ Todos os fluxos futuros de criação social.

---

### U003 — Aquisição v1.0 → v1.1

Data:             junho/2026
Origem:           Repertoire Updaters — `intelligence/repertoire-updaters/acquisition.md`
Padrão associado: Repertório externo filtrado: prospecting, cold outreach, CRO, RevOps, sales enablement, proof assets

O que mudou:
→ `skills/aquisicao/_admin.md` recebeu o fluxo de aquisição em 5 camadas:
  sinal, dor, desejo, prova e próximo passo.
→ `skills/aquisicao/skill-prospecting-agent.md` evoluiu para v1.1 com score
  de oportunidade 0-10, sinais observáveis, estrutura outbound, cadência e
  handoff para venda.
→ `skills/aquisicao/skill-offer-positioning.md` evoluiu para v1.1 com camada
  de aquisição, escada de oferta e checklist para oferta fria.
→ `skills/venda/skill-venda.md` evoluiu para v1.1 com handoff de aquisição,
  prova antes de proposta e preservação do sinal que gerou a conversa.

Por que mudou:
→ A análise dos quatro repertórios externos mostrou que aquisição forte depende
  de qualificar sinais, gerar microvalor antes da oferta principal, preservar
  contexto no handoff para venda e usar prova antes de proposta.

Impacto esperado:
→ Menos abordagem genérica, maior qualidade de leads priorizados, mensagens
  mais específicas e transição mais forte entre prospecção, oferta e venda.

Clientes beneficiados:
→ MarketingOS e todos os fluxos futuros de aquisição.

---

### U001 — skill-carousel.md v1.0 → v2.0

Data:             maio/2026
Origem:           Fran Santos — fluxo identificado como ineficiente (markdown → Python → HTML = 3 etapas)
Padrão associado: —

O que mudou:
→ Output alterado de markdown com briefing visual para HTML completo funcional.
→ Adicionado template HTML com brand-kit.json dinâmico, navegação por teclado/touch,
  barra de progresso e legenda de publicação como comentário no final do arquivo.

Por que mudou:
→ O fluxo anterior gerava copy em .md e exigia conversão Python separada.
→ Isso duplicava tokens, adicionava etapa manual e aumentava chance de erro.

Impacto esperado:
→ Um único comando entrega HTML funcional pronto para screenshot ou publicação.
→ Zero etapas intermediárias, zero Python para carrosseis.

Clientes beneficiados:
→ Todos os novos clientes a partir de maio/2026.

---

### U002 — skill-abrir.md v1.0 → v2.0

Data:             maio/2026
Origem:           Diagnóstico sistêmico — intelligence não era carregada no início da sessão
Padrão associado: —

O que mudou:
→ Adicionado Passo 2 obrigatório: carregar intelligence/patterns.md, benchmarks.json
  e experiments.md ANTES de carregar o contexto do cliente.

Por que mudou:
→ Ao trocar de cliente, os padrões aprendidos com clientes anteriores não eram
  transferidos para o novo contexto — cada sessão começava do zero.

Impacto esperado:
→ Padrões cross-client ativos sempre calibram o output desde o início da sessão,
  independente do cliente ativo.

Clientes beneficiados:
→ Todos.

---

### Exemplo ilustrativo (não aplicado)

```
### U001 — skill-carousel.md v1.0 → v1.1

Data:             [ a preencher ]
Origem:           [ a preencher ]
Padrão associado: P001

O que mudou:
→ Adicionada instrução na seção "Gancho": para nichos de confiança
  (joalheria, saúde, segurança), priorizar gancho emocional sobre informativo.
  Exemplos de cada tipo adicionados ao arquivo.

Por que mudou:
→ Carrosséis com gancho emocional geraram engajamento 2–3x maior em
  dois clientes de nichos de confiança. Padrão registrado em P001.

Impacto esperado:
→ Ganchos gerados pela skill serão mais assertivos para nichos de confiança
  sem necessidade de instrução manual a cada ativação.

Clientes beneficiados:
→ Todos os novos clientes de nicho de confiança
```

---

## Skills e Versões Atuais

| Skill | Versão atual | Última atualização | Total de updates |
|---|---|---|---|
| `skill-carousel.md` | v2.0 | maio/2026 | 1 |
| `skill-abrir.md` | v2.0 | maio/2026 | 1 |
| `skill-post.md` | v1.0 | — | 0 |
| `skill-site-builder.md` | v1.0 | — | 0 |
| `skill-dashboard.md` | v1.0 | — | 0 |
| `skill-lead-capture.md` | v1.1 | junho/2026 | 1 |
| `skill-funnel-analysis.md` | v1.0 | — | 0 |
| `skill-retention.md` | v1.1 | junho/2026 | 1 |
| `skill-reactivation.md` | v1.1 | junho/2026 | 1 |
| `skill-offer-positioning.md` | v1.1 | junho/2026 | 1 |
| `skill-prospecting-agent.md` | v1.1 | junho/2026 | 1 |
| `skill-venda.md` | v1.1 | junho/2026 | 1 |
| `skill-social-copy.md` | v1.1 | junho/2026 | 1 |
| `skill-site-audit.md` | v1.0 | junho/2026 | 1 |
| `skill-seo.md` | v1.1 | junho/2026 | 1 |
| `skill-pitch-deck.md` | v2.2 | junho/2026 | 1 |

---

## Melhorias Pendentes

> Melhorias identificadas mas ainda não aplicadas — aguardando confirmação de padrão ou aprovação.

```
### [PENDENTE] — [Skill] — [Descrição curta]
Origem:       [ onde foi identificada ]
Status:       [ Aguardando confirmação em segundo cliente / Aguardando aprovação ]
Prazo:        [ quando revisar ]
```

### [PENDENTE] — skill-offer-positioning / virada-aquisicao / motor de conteúdo — Doutrina de Aquisição 2026
Origem:       Protocolo estratégico externo trazido pelo Felipe (2026-06-17), capturado e filtrado em `intelligence/doctrine-aquisicao-2026.md`
Status:       Aguardando decisão do Felipe — productizar oferta em escada de valor vs. manter done-for-you puro (é virada de modelo de negócio, não só de comunicação)
Prazo:        Próxima sessão de estratégia
Aplicar quando confirmado, um por vez:
→ [FEITO 2026-06-17] Camada de métricas do grafo de interesse → `scripts/insights/acquisition.js` (`npm run insights:aquisicao`), dado real da Graph API com proveniência, regra "tudo é verdade". Pendente só: gerar token Meta novo (o atual expirou 08/06) para o 1º pull real.
→ Funil Conteúdo→DM→próxima ação → alinhar com Motor de Aquisição + Motor de Follow-up
→ "Oferta chata" ultra-específica → afinar `skill-offer-positioning` e ICP
Não aplicar sem filtro: IG-first como dogma e perfil-como-página ferem observabilidade e a regra de parada do operador.

### [FEITO 2026-06-19] — Motor de DM / Diagnóstico — Pré-captura obrigatória
Origem:       Felipe pediu que o fluxo tivesse coleta de dados antes do diagnóstico.
O que mudou:  Lead magnet `diagnostico.html` agora coleta nome, WhatsApp, e-mail, site/Instagram e negócio antes do quiz; o resultado mantém os campos preenchidos para correção antes do envio.
Operacional:  `/api/capture` passou a recusar captura incompleta; teste local cobre comentário `DIAGNOSTICO` + captura enriquecida.
Por quê:      Comentário vira conversa, mas o ativo precisa capturar contato e contexto antes de entregar valor, reduzindo abandono sem perder observabilidade.

### [FEITO 2026-06-19] — Motor de DM / Diagnóstico — Palavra-chave tolerante
Origem:       Felipe apontou que comentários reais vêm com erro de digitação.
O que mudou:  Detector de palavra-chave agora normaliza acentos, compacta texto e aceita distância curta de edição para `DIAGNOSTICO`.
Operacional:  `dm:test` valida `diagnostco`, `diagnotico`, `diganostico`, `diag nostico`, `diagnósticoooo` e confirma que frase sem palavra-chave não dispara.
Por quê:      O funil precisa responder intenção real, não só string perfeita.

### [FEITO 2026-06-19] — Creative OS / Orquestração dos motores visuais
Origem:       Felipe nomeou o salto: parar de criar motores soltos e criar a camada que decide objetivo → percepção → física → motor.
O que mudou:  Criados `intelligence/creative-os.md` e `intelligence/motion-pattern-library.md`.
Operacional:  CLAUDE.md agora exige Creative OS antes de site-builder, reel-builder, carousel, motion, image-generation e `/construir`; command-router reconhece `/creative-os` e `/construir`.
Por quê:      Site, reels, carrossel e animação passam a ser manifestações do mesmo sistema, não ferramentas isoladas.

### [FEITO 2026-06-20] — Creative Direction Engine / Direcao efetiva de peca
Origem:       Teste de video/animacao mostrou que, sem direcao de cena detalhada, a execucao fica correta mas generica.
O que mudou:  Criados `intelligence/creative-direction-engine.md` e `templates/creative-direction-brief.json`; Creative OS agora passa por direcao de peca antes de renderizar video, animacao, landing visual, carrossel ou imagem.
Operacional:  CLAUDE.md exige metafora visivel, tensao criativa, storyboard por beats, linguagem visual/motion, referencias, lista do que nao pode parecer e gate frame a frame; command-router reconhece `/direcao-peca`.
Por quê:      A peca deixa de ser "visual bonito" e passa a ser dirigida: percepcao -> metafora -> cena -> beats -> motion -> critica.

### [FEITO 2026-06-20] — Creative OS / Matriz de engines de video e animacao
Origem:       Felipe trouxe HyperFrames e Remotion como salto para formalizar a producao de video programavel.
O que mudou:  Creative OS agora diferencia `render-reel.js`, HyperFrames, Remotion e Manim por papel operacional.
Operacional:  `render-reel.js` fica como bancada local; HyperFrames vira motor premium para motion autoral web (HTML/CSS/GSAP/Canvas/UI); Remotion vira motor de escala (series, templates, dados, React); Manim fica para diagramas e explicacoes tecnicas.
Por quê:      Primeiro direcao, depois motor. Ferramenta nao decide a peca; a peca escolhe a ferramenta.

### [FEITO 2026-06-20] — HyperFrames / Repositorio externo conectado
Origem:       Felipe decidiu que o MarketingOS precisa ter o repositorio do HyperFrames por perto.
O que mudou:  Adicionado submodule `external/hyperframes` apontando para `https://github.com/heygen-com/hyperframes`.
Operacional:  README e manual registram `git submodule update --init --recursive`; clone foi feito com LFS smudge skip para evitar baixar baselines grandes de teste.
Por quê:      HyperFrames vira referencia e motor premium local para video programavel sem copiar o repositorio para dentro do historico do MarketingOS.

### [FEITO 2026-06-18] — Doutrina de Direção de Arte (anti-engessamento)
Origem:       Felipe trouxe o diagnóstico de outputs de IA "engessados" + referência Awwwards (Kaptar/Mux).
O que mudou:  Criado `intelligence/doctrine-direcao-de-arte.md` (5 pilares: easing custom/spring, generative noise, restrição, framework de briefing, Canvas/WebGL/shader) + GATE anti-boilerplate no CLAUDE.md (junto do Teste Supremo).
Aplicar nas skills (uma por vez, próximas sessões): reel-builder, reels, site-builder, creative-direction, carousel, image-generation, visual-spec consultam a doutrina antes de gerar.
Por quê:      A IA é espelho — o gargalo de qualidade é direção de arte, não execução técnica (pipeline já faz Three.js/bloom/GSAP). Filtrado pela marca (gold único acento) e pela alma minimalista.

---

*Última atualização: junho/2026*
*Total de updates aplicados: 12*
*Responsável pela curadoria: MarketingOS*
