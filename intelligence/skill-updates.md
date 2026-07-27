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

## Repertório Externo Registrado (aguardando aplicação em skill)

- **2026-07-23 / implantado 2026-07-27** — `intelligence/doutrina-instagram-operacao.md`
  Sistema de crescimento e conversão para Instagram (fonte: `MarketingOS_Instagram_Operacao.md`)
  + expansão P0 com mecanismos de Ásia (domínio privado CN, velocidade/SEO KR, processo JP)
  e Europa (self-service, save/share, compliance). **Aplicado** em: CLAUDE.md (gate),
  agenda-semanal, funnel-strategy (template/schema/playbook/SKILL), conversational-commerce,
  skills de criação (post, carousel, reels, social-content-agent), criacao/_admin,
  manual-de-uso, commands.md. Ver U018 abaixo.

- **2026-07-03** — `intelligence/repertoire-externo/jonas-25-formas-crescer-com-conteudo.md`
  Framework de 25 mecanismos de como conteúdo consistente cresce um negócio (alcance,
  vendas, relacionamento, receita, institucional). Fonte: transcript de vídeo (Jonas,
  Content Lead). Não contradiz manifesto.md/alma.md — reforça conteúdo como infraestrutura
  de aquisição. Ainda não aplicado em nenhuma skill específica — candidatos:
  `skills/aquisicao/skill-offer-positioning.md` (linguagem de justificativa de proposta) e
  `skills/venda/skill-venda.md` (blocos 2 e 4 do framework).

- **2026-07-04** — `intelligence/repertoire-externo/vlog-documentario-vs-ia.md`
  Framework de 3 arcos (Maior / Episódio / Aprendizado) pra transformar documentação real
  (vlog/série) em ativo que a IA não replica. Fonte: transcript de vídeo (criador de
  conteúdo/educação). Não contradiz manifesto.md/alma.md — reforça verdade humana e
  fundador(a) como ativo incopiável, já em uso no cliente Toque Indiano
  (`clients/toqueindiano/outputs/reels/roteiro-filmagem-organica.md`). Candidato natural:
  `skills/criacao/skill-reels.md` e `skills/criacao/skill-lancamento.md` (estruturar séries
  documentais por arco, não só peças avulsas) — ainda não aplicado formalmente.

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

### U018 — Doutrina Instagram Operação + wiring P0 (Ásia/Europa)

Data:             2026-07-27
Origem:           input `MarketingOS_Instagram_Operacao.md` (2026-07-23) + pesquisa de
                  mecanismos CN/KR/JP/EU filtrados pela north star de aquisição
Padrão associado: nenhum ainda — implantação de doutrina de canal

O que mudou:
→ `intelligence/doutrina-instagram-operacao.md` expandida com: camadas de domínio
  privado, IG SEO + save/share/DM gate, handoff WhatsApp com origin tag/SLA,
  self-service de entrada, compliance EU, indicadores P0, gate de qualidade 14 pontos.
→ Gate obrigatório em `CLAUDE.md` e checklist em `docs/manual-de-uso.md`.
→ `/agenda` (`workflows/agenda-semanal.md`) consulta doutrina, ciclo semanal por função
  e métricas de domínio privado / origin tag.
→ Funnel Metadata: template + schema (`instagram_channel` opcional) + playbook Instagram
  + SKILL.md + conversational-commerce (SLA).
→ Skills de criação (post, carousel, reels, social-content-agent) e `_admin.md` passam a
  carregar a doutrina no contexto mínimo e exigir Instagram Channel Metadata.

Por que mudou:
→ A doutrina existia como arquivo solto; não era consultada pelo sistema. Sem wiring,
  Instagram continuava produção de peça sem máquina de conversão observável.

Impacto esperado:
→ Toda peça de IG declara função, save/share/DM, handoff e origem — aquisição no canal
  fica mais observável e ajustável; agenda deixa de ser só volume.

Clientes beneficiados:
→ Todos com operação Instagram (Felipe, Toque Indiano, Fortunato, demais)

### U017 — skill-offer-positioning.md v1.1 → v1.2 — modelo híbrido de oferta

Data:             julho/2026
Origem:           decisão do Felipe (2026-07-10), resolvendo o item "Decisão aberta"
                  registrado em `intelligence/doctrine-aquisicao-2026.md` desde
                  2026-06-17 — Fase 4 do mandato de aquisição.
Padrão associado: nenhum ainda — decisão de modelo, não padrão observado

O que mudou:
→ Nova seção "Modelo Híbrido de Oferta v1.2": entrada productizada (pacote fixo,
  repetível, baixa fricção) + upsell done-for-you (customizado, depois que o
  cliente já comprou e confia). Mapeado pra estrutura já existente (diagnóstico
  30d = entrada, implementação 60d + R$497/mês = upsell).

Por que mudou:
→ Resolve a tensão entre o protocolo externo (escada productizada) e o
  done-for-you que é a força atual do MarketingOS, sem virar de modelo de
  negócio — só formaliza a entrada como mais padronizada/repetível.

Impacto esperado:
→ Desbloqueia produção de material de entrada padronizado (menos análise sob
  medida por prospect desde o primeiro contato).

Clientes beneficiados:
→ MarketingOS/Felipe (oferta própria) — candidato a se propagar pra clientes
  que também vendem em escada, se validado

---

### U016 — skill-seo.md v1.1 → v1.2 — checklist tático de AEO

Data:             julho/2026
Origem:           mandato do Felipe (2026-07-10): "sistema deve usar todas as ferramentas
                  possíveis pra ser o melhor motor de aquisição digital" — Fase 1 (gap
                  analysis) identificou que a camada AEO existente era teórica, sem tática
                  concreta; Fase 2 (pesquisa multilingual pt-BR/en/es) trouxe fatores reais
                  de citação por IA e ferramentas gratuitas.
Padrão associado: nenhum ainda — primeira aplicação, monitorar em clientes futuros

O que mudou:
→ Checklist tático adicionado à Camada AEO (Google Business Profile, resposta a reviews
  em 24h, schema LocalBusiness/JSON-LD, robots.txt pra crawlers de IA, ferramentas
  gratuitas de checagem) + limite honesto explícito: ferramenta paga de GEO é prematura
  pra cliente de pequeno varejo/nicho local, prioridade real costuma ser conversão.

Por que mudou:
→ Pesquisa (multilingual) mostrou que os fatores de maior impacto são de baixo custo/alta
  higiene digital, não motor pesado — evita a skill recomendar investimento
  desproporcional ao porte do cliente.

Impacto esperado:
→ `/analisar seo` passa a entregar ação concreta e gratuita de AEO, não só teoria
  "busca tradicional vs. busca por IA".

Clientes beneficiados:
→ Todos os novos e existentes com auditoria de SEO/AEO

---

### U015 — skill-lead-capture.md v1.1 → v1.2 — sequência de nutrição por e-mail

Data:             julho/2026
Origem:           mandato do Felipe (2026-07-10) + caso Toque Indiano (capacidade de
                  atendimento limitada a 1 pessoa). Fase 1 (gap analysis) identificou que
                  o sistema não tinha skill de sequência de e-mail apesar de a própria
                  doutrina (`doctrine-aquisicao-2026.md`) já recomendar "lista de e-mail
                  como ativo proprietário imune a algoritmo". Fase 2 (pesquisa multilingual)
                  trouxe estrutura de sequência (boas-vindas, reengajamento, qualificação
                  com bifurcação) e o achado central: e-mail nutre demanda sem consumir
                  capacidade de atendimento.
Padrão associado: nenhum ainda — primeira aplicação, monitorar em clientes futuros

O que mudou:
→ Nova seção "Sequência de nutrição — e-mail" em `skill-lead-capture.md`, com gatilho
  explícito de saída pra WhatsApp quando intent level sobe. Criado
  `skills/funnel-strategy/platform-playbooks/email.md` (modelo de canal reutilizável) e
  `skills/funnel-strategy/platform-playbooks/marketplace.md` (Shopee/ML/TikTok
  Shop/IG Shopping, com o achado de que velocidade de resposta é fator de ranqueamento
  algorítmico no marketplace, não só experiência do cliente).

Por que mudou:
→ Capacidade de atendimento é gargalo operacional recorrente em clientes pequenos
  (1 pessoa só) — e-mail é o único canal levantado que gera aquisição sem tocar
  nesse gargalo.

Impacto esperado:
→ Clientes com capacidade de atendimento limitada ganham um canal de aquisição
  adicional que não compete pelo tempo de quem atende.

Clientes beneficiados:
→ Todos os novos e existentes, prioridade pra operações pequenas/solo

---

### U014 — Motion Site Factory v1.0 — orquestração e documentação para vídeo

Data:             junho/2026
Origem:           Benchmark Overclock + necessidade de produzir sites cinematográficos em escala
Padrão associado: hierarquia → contratos → task graph → crítica → recibos → vídeo

O que mudou:
→ Criada `skills/criacao/motion-site-factory/SKILL.md` com papéis especializados, contexto isolado e gates independentes.
→ Criados templates de `agent-roster.json`, `task-graph.json` e `creation-manifest.json`.
→ Criado validador determinístico para papéis, dependências, ciclos, capture IDs, desktop/mobile e handoff de vídeo.
→ Criado workflow `/motion-site` e integrado ao grupo de criação, command router, commands e site-builder.
→ Criado o primeiro pacote válido em `clients/felipe-proenca/outputs/site/mkos-main/`.

Por que mudou:
→ Sites avançados exigem direção, assets, motion, frontend, QA e documentação. Um único agente com contexto total aumenta custo, mistura responsabilidades e faz a criação terminar sem material reutilizável.

Impacto esperado:
→ Mais paralelismo seguro, menor desperdício de contexto, QA independente e cada site pronto para gerar vídeos, cases e conteúdo sem reconstruir a história depois.

Clientes beneficiados:
→ Todos os projetos cinematográficos e a futura produção em escala da Motion Site Factory.

### U013 — Design Taste Frontend — repertório externo instalado e filtrado

Data:             junho/2026
Origem:           Motion Site Factory — pesquisa de skills artísticas para elevar qualidade em escala
Padrão associado: brief → direção por nicho → variação visual → construção → crítica

O que mudou:
→ Instalada globalmente a skill `design-taste-frontend`, do repositório `leonxlnx/taste-skill`.
→ Entram no repertório: leitura declarada do briefing, dials de variação/motion/densidade, disciplina anti-default, preservação de identidade em redesigns e checklist de pre-flight.
→ A skill opera depois de `perception.json`, `visual-dna.json` e Creative Direction; nunca substitui essas camadas.
→ Proibições universais da skill externa são tratadas como alertas contextuais, não como lei. Brand kit, acessibilidade, objetivo de aquisição e direção do cliente vencem qualquer preferência estética importada.
→ Não entram como default: estética pronta, rotação aleatória de arquétipos, fontes presumidas sem licença, dependências não verificadas ou regras que apaguem sinais autênticos da marca.

Por que mudou:
→ Produção de sites em escala precisa variar linguagem por nicho sem cair em templates de IA. O ganho real da skill é aumentar a qualidade da decisão e da crítica, não impor uma aparência única.

Impacto esperado:
→ Sites de hamburgueria, tatuador, produtos e outros nichos partem de leituras visuais distintas, com motion proporcional à proposta e QA mais rigoroso antes da entrega.

Clientes beneficiados:
→ Todos os novos projetos da Motion Site Factory.

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
| `skill-lead-capture.md` | v1.2 | julho/2026 | 2 |
| `skill-funnel-analysis.md` | v1.0 | — | 0 |
| `skill-retention.md` | v1.1 | junho/2026 | 1 |
| `skill-reactivation.md` | v1.1 | junho/2026 | 1 |
| `skill-offer-positioning.md` | v1.2 | julho/2026 | 2 |
| `skill-prospecting-agent.md` | v1.1 | junho/2026 | 1 |
| `skill-venda.md` | v1.1 | junho/2026 | 1 |
| `skill-social-copy.md` | v1.1 | junho/2026 | 1 |
| `skill-site-audit.md` | v1.0 | junho/2026 | 1 |
| `skill-seo.md` | v1.2 | julho/2026 | 2 |
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

### [FEITO 2026-06-20] — HyperFrames / Skills instaladas para Codex
Origem:       Felipe pediu executar `npx skills add heygen-com/hyperframes`.
O que mudou:  Instaladas 17 skills HyperFrames em `.agents/skills` com `npx.cmd skills add heygen-com/hyperframes --agent codex --skill '*' -y`; criado `skills-lock.json`.
Operacional:  `npx.cmd skills list --json` confirma `hyperframes`, `hyperframes-animation`, `hyperframes-cli`, `hyperframes-core`, `hyperframes-creative`, `motion-graphics`, `product-launch-video`, `website-to-video` e demais skills do pacote no escopo do projeto.
Por quê:      O motor premium agora tem conhecimento operacional local para Codex, não só o repositorio externo.

### [FEITO 2026-06-20] — Creative OS / Anime.js como runtime de motion
Origem:       Felipe trouxe Anime.js como referencia para ampliar a camada de animacao web-native.
O que mudou:  Creative OS e Creative Direction Engine agora separam engine de runtime: HyperFrames e o motor; GSAP, Anime.js, Three.js, Lottie e CSS/WAAPI sao runtimes internos.
Operacional:  Anime.js entra para stagger, SVG draw/morph/path, motion leve e modular; GSAP segue como timeline principal para cenas densas e direcao cinematografica.
Por quê:      Evita criar "mais um motor" solto. A metafora e os beats escolhem o runtime certo.

### [FEITO 2026-06-20] — Creative OS / Anime.js WAAPI
Origem:       Felipe trouxe a camada WAAPI do Anime.js (`waapi.animate`) como alternativa ainda mais leve.
O que mudou:  `animejs-waapi` entrou como runtime explicito no brief de direcao criativa.
Operacional:  Usar para transform/opacity, texto quebrado em caracteres, loops simples, stagger leve e micro-motion sobre Web Animation API; usar Anime.js completo quando houver SVG draw/morph/path ou toolkit mais amplo.
Por quê:      Mantem a arquitetura leve: HyperFrames e engine; Anime.js/WAAPI e runtime escolhido pela cena.

### [FEITO 2026-06-20] — /repositorios / Mapa operacional de repos externos
Origem:       Felipe acionou `/repositorios` para organizar o ecossistema de repositórios externos.
O que mudou:  Criado `workflows/repositorios.md` e registrado `/repositorios` no command-router e `workflows/commands.md`.
Operacional:  O comando separa repositórios de repertório (`repertoire-updaters`) de infraestrutura conectada (`external/hyperframes`) e documenta restore de submodule/skills.
Por quê:      Repositório externo entra como repertório ou infraestrutura, nunca como verdade final nem cópia em bloco.

### [FEITO 2026-06-18] — Doutrina de Direção de Arte (anti-engessamento)
Origem:       Felipe trouxe o diagnóstico de outputs de IA "engessados" + referência Awwwards (Kaptar/Mux).
O que mudou:  Criado `intelligence/doctrine-direcao-de-arte.md` (5 pilares: easing custom/spring, generative noise, restrição, framework de briefing, Canvas/WebGL/shader) + GATE anti-boilerplate no CLAUDE.md (junto do Teste Supremo).
Aplicar nas skills (uma por vez, próximas sessões): reel-builder, reels, site-builder, creative-direction, carousel, image-generation, visual-spec consultam a doutrina antes de gerar.
Por quê:      A IA é espelho — o gargalo de qualidade é direção de arte, não execução técnica (pipeline já faz Three.js/bloom/GSAP). Filtrado pela marca (gold único acento) e pela alma minimalista.

### [FEITO 2026-06-20] - /repositorios / Analise dos exercitos de IA
Origem:       Felipe enviou os links reais de Ruflo, Superpowers, Open Design, ECC e CLAUDE.md do Karpathy para analisar um por um.
O que mudou:  `workflows/repositorios.md` agora registra funcao real, encaixe no MarketingOS, risco, nao-fazer e ordem de integracao.
Operacional:  Superpowers/Karpathy viram gate leve de dev; ECC inspira auditoria de harness; Open Design inspira `DESIGN.md` por cliente; Ruflo fica para estudo modular de custo, goals, memoria, seguranca, browser QA e testgen.
Por que:      O sistema ganha criterio para absorver repos externos sem virar Frankenstein: adaptar pecas pequenas que aumentem aquisicao, qualidade e confiabilidade.

---

*Última atualização: junho/2026*
*Total de updates aplicados: 17*
*Responsável pela curadoria: MarketingOS*
