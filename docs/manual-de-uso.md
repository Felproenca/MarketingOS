# Manual Geral de Uso - MarketingOS
> Guia pratico para operar o MarketingOS no dia a dia.
> Fonte de verdade: `CLAUDE.md`. Este manual explica como usar o sistema sem substituir suas regras.

---

## 1. O que e o MarketingOS

MarketingOS e um Sistema Operacional de Aquisicao.

Ele existe para identificar, compreender e remover gargalos que impedem uma empresa de adquirir clientes de forma consistente.

O sistema nao vende posts, sites, dashboards, IA ou automacao.
Esses sao meios.

O que o sistema busca entregar:

- clareza
- direcao
- aquisicao observavel
- aquisicao ajustavel
- aquisicao progressivamente previsivel

North Star:

```text
Como isso torna a aquisicao mais observavel, ajustavel ou previsivel?
```

Se uma acao nao contribui para isso, ela nao deveria existir.

---

## Atualizacao operacional - junho/2026

Estado atual do MarketingOS:

- **Cockpit**: painel operacional em `npm run scraper:panel`, com Pipeline, Agenda, Metricas e Config.
- **Agenda**: rotina manual/assistida no Cockpit. Planeja semana 70/20/10, gera hook/legenda, marca rascunho/preparo, valida envio em dry-run e publica somente com confirmacao `PUBLICAR`.
- **Motor de DM**: comentario `DIAGNOSTICO` ou variacoes proximas aciona o fluxo comentario -> DM -> lead magnet -> captura. Em teste sem custo pode rodar no Render Free com acordador local.
- **Lead magnet de diagnostico**: coleta nome, WhatsApp, e-mail, site/Instagram e negocio antes do quiz.
- **Metricas de aquisicao**: `npm run insights:aquisicao -- --slug [slug]` grava `clients/[slug]/acquisition-metrics.json`; o Cockpit le esse arquivo quando atualizado.
- **/construir**: gera blueprint de site/sistema a partir do catalogo de estudos de caso + alma da marca.
- **Creative OS**: camada obrigatoria antes de qualquer motor visual. Decide objetivo -> mudanca de percepcao -> referencia/catalogo -> fisica/motion -> motor certo.
- **Direcao de peca**: gate antes de video, animacao, landing visual, carrossel ou imagem. Transforma percepcao em metafora, cena, beats, linguagem visual, motion e criterios frame a frame.
- **Escolha de engine**: primeiro direcao, depois motor. `render-reel.js` testa rapido, HyperFrames dirige motion autoral web, Remotion escala series/templates, Manim explica sistemas tecnicos.

Arquivos centrais:

```text
intelligence/creative-os.md
intelligence/creative-direction-engine.md
intelligence/motion-pattern-library.md
intelligence/doctrine-direcao-de-arte.md
templates/creative-direction-brief.json
intelligence/reference-library/case-studies/_catalog.json
workflows/agenda-semanal.md
scripts/dm-engine/DEPLOY.md
```

---

## 2. Fundacao obrigatoria

Antes de qualquer operacao, o agente precisa ler:

1. `manifesto.md`
2. `alma.md`
3. `virada-aquisicao.md`
4. `CLAUDE.md`

Na pratica:

- `manifesto.md` define o porque.
- `alma.md` define a missao, os filtros e a linguagem.
- `virada-aquisicao.md` define a doutrina de aquisicao.
- `CLAUDE.md` define como operar.

`AGENTS.md` apenas aponta para `CLAUDE.md`.

---

## 3. Regra de ouro

Sem contexto, sem output.

O fluxo base e sempre:

```text
/abrir [slug]
  -> entender o cliente
  -> escolher grupo
  -> ler _admin.md do grupo
  -> escolher uma skill
  -> ler contexto minimo da skill
  -> executar
  -> salvar output no lugar certo
/fechar
```

Nunca pule o fechamento quando a sessao produziu aprendizado, decisao ou output importante.

---

## 4. Estrutura mental do sistema

O MarketingOS opera em camadas:

```text
Fundacao
  -> manifesto, alma, virada-aquisicao, CLAUDE

Contexto
  -> intelligence global + client.md + notes + metrics + estrategia

Inteligencia
  -> reunioes, sinais, hipoteses, gargalos

Percepcao
  -> perception.json, identidade, tensoes, verdade humana

Direcao
  -> branding, visual-dna.json, reference-context.json

Creative Brief
  -> acquisition_objective + tese + tension + CTA + regras

Output
  -> post, carrossel, site, anuncio, pitch, relatorio

Critica e aprendizado
  -> /inteligencia critica
  -> approve | revise | reject
  -> publicar com aprovacao
  -> medir e aprender
```

Producao e consequencia da compreensao.
Nunca o contrario.

---

## 5. Estrutura de pastas

```text
/marketing-os
  manifesto.md
  alma.md
  virada-aquisicao.md
  CLAUDE.md
  AGENTS.md

  /clients
    /_template
    /[slug]
      client.md
      notes.md
      estrategia.md
      campaigns.md
      runs.md
      metrics.json
      brand-kit.json
      /inputs
        /meetings
      /outputs
        /acquisition
        /branding
        /carousels
        /critique
        /dashboard
        /demo
        /images
        /posts
        /site
        /strategy
        /voice

  /skills
    /analise
    /aquisicao
    /criacao
    /inteligencia
    /perception
    /relacionamento
    /venda

  /workflows
  /scripts
  /intelligence
  /templates
  /docs
```

Cada cliente tem seu proprio contexto.
Nunca misture arquivos, metricas ou outputs entre clientes.

---

## 6. Criar novo cliente

Use:

```bash
npm run novo -- nome-do-cliente
```

Ou:

```bash
node scripts/create-client.js nome-do-cliente
```

O script cria:

- estrutura em `clients/[slug]/`
- arquivos base do cliente
- pastas de inputs
- pastas de outputs
- pastas de assets
- onboarding interativo

Depois de criar:

1. revisar `clients/[slug]/client.md`
2. revisar `clients/[slug]/brand-kit.json`
3. abrir sessao com `/abrir [slug]`

---

## 7. Arquivos por cliente

| Arquivo | Uso |
|---|---|
| `client.md` | Identidade, oferta, publico, tom, canais e metas. |
| `notes.md` | Diario operacional e inteligencia acumulada. |
| `estrategia.md` | Prioridades atuais e proximas decisoes. |
| `campaigns.md` | Campanhas, publicacoes e historico de decisoes. |
| `runs.md` | Historico de sessoes. |
| `metrics.json` | Dados reais de performance. |
| `brand-kit.json` | Identidade visual e restricoes. |
| `published.json` | Historico de publicacoes, quando existir. |
| `instagram-config.json` | Configuracao Meta Graph API, quando existir. |

Regra:

```text
client.md e sempre o minimo.
metrics.json so decide performance se houver dado real.
notes.md guarda o que nao pode se perder.
```

---

## 8. Inputs e outputs

Inputs sao insumos brutos ou semi-processados.

```text
clients/[slug]/inputs/meetings/
```

Exemplo:

```text
2026-06-14-transcript.md
2026-06-14-signals.json
```

Outputs sao entregas, diagnosticos ou artefatos operacionais.

| Tipo | Pasta |
|---|---|
| Diagnostico de aquisicao | `outputs/acquisition/` |
| Branding e percepcao | `outputs/branding/` |
| Carrosseis | `outputs/carousels/` |
| Criticas | `outputs/critique/` |
| Dashboards | `outputs/dashboard/` |
| Demos | `outputs/demo/` |
| Imagens | `outputs/images/` |
| Posts | `outputs/posts/` |
| Sites | `outputs/site/` |
| Estrategia e validacao | `outputs/strategy/` |
| Voz/autoria | `outputs/voice/` |

---

## 9. Comandos principais

### Sessao

```text
/abrir [slug]
/salvar
/fechar
```

### Grupos

```text
/inteligencia
/perceber
/analisar
/criar
/prospectar
/vender
/relacionar
```

### CLI

```bash
npm run novo -- [slug]
npm run cmd -- /status
npm run cmd -- /atualizar
npm run salvar
```

Referencia completa:

```text
workflows/commands.md
```

---

## 10. Como escolher o grupo certo

| Situacao | Grupo |
|---|---|
| Tenho reuniao, hipotese ou sinais brutos | `/inteligencia` |
| Preciso entender identidade, tensoes e percepcao | `/perceber` |
| Preciso diagnosticar performance, funil, site ou SEO | `/analisar` |
| Preciso criar post, carrossel, site, branding ou imagem | `/criar` |
| Preciso gerar demanda, oferta, pitch, lead capture ou outbound | `/prospectar` |
| Preciso abordar lead quente ou fechar | `/vender` |
| Preciso reter, reativar ou operar head implantado | `/relacionar` |

Se a tarefa envolve decisao antes de execucao, comece por `/inteligencia`.

---

## 11. Grupo Inteligencia

Comando base:

```text
/inteligencia
```

Esse grupo reduz erro de decisao.
Ele entra antes de produzir, publicar ou escalar.

### Meeting Intelligence

Use quando houver:

- transcricao de reuniao
- audio
- video
- notas de discovery
- conversa de venda
- alinhamento estrategico

Comando:

```text
/inteligencia reuniao [slug]
```

Saidas:

```text
clients/[slug]/inputs/meetings/YYYY-MM-DD-transcript.md
clients/[slug]/inputs/meetings/YYYY-MM-DD-signals.json
```

O `signals.json` deve resumir:

- dores
- objecoes
- desejos
- canais atuais
- gargalos
- linguagem do cliente
- frases repetidas
- angulos de conteudo
- pistas de oferta
- tarefas de follow-up
- hipoteses de aquisicao

Regra:

```text
Outras skills devem consumir signals.json, nao a transcricao inteira.
```

### Acquisition Intelligence

Use quando a pergunta for:

```text
Por que a aquisicao deste cliente nao e previsivel?
```

Comando:

```text
/inteligencia aquisicao [slug]
```

Saida:

```text
clients/[slug]/outputs/acquisition/acquisition-diagnosis.json
```

A skill deve comparar hipoteses:

- visibilidade
- conversao
- comercial
- posicionamento
- conteudo
- retencao/indicacao

Regra:

```text
Nunca assumir que o problema e trafego, conteudo, SEO, automacao ou vendas.
```

Skills planejadas para proximas levas:

- Office Hours
- Thesis Validation
- Humanizer / Voice Adapter
- Visibility Intelligence

### Creative Critique

Use antes de publicar ou enviar qualquer output importante.

Comando:

```text
/inteligencia critica [slug] [asset]
```

Entrada minima:

- peca gerada
- `creative-brief.[tipo].json`
- `perception.json`
- `visual-dna.json`
- `reference-context.json`

Saida:

```text
clients/[slug]/outputs/critique/[asset]-critique.json
```

Decisao:

```text
approve | revise | reject
```

Regra:

```text
Nenhum output deve ser publicado se parecer generico, template ou desconectado do Creative Brief.
```

---

## 12. Grupo Percepcao

Comando base:

```text
/perceber [slug]
```

Use antes de qualquer criacao relevante para cliente novo.

Output principal:

```text
clients/[slug]/outputs/branding/perception.json
```

O Perception Engine responde:

```text
O que esta marca deseja que as pessoas sintam?
Quais sinais produzem essa percepcao?
```

Regra:

```text
Sem percepcao, a criacao tende a virar template.
```

---

## 13. Grupo Criacao

Comando base:

```text
/criar
```

Use para:

- branding
- direcao criativa
- site
- carrossel
- post
- imagem
- reel
- copy

Fluxo obrigatorio para novo cliente:

```text
Objetivo de aquisicao
  -> /perceber [slug]
  -> /branding
  -> /direcao-criativa
  -> /criar [output]
```

Arquivos importantes:

```text
clients/[slug]/outputs/branding/perception.json
clients/[slug]/outputs/branding/visual-dna.json
clients/[slug]/outputs/branding/reference-context.json
clients/[slug]/outputs/creative-direction/creative-brief.[tipo].json
```

Teste Supremo:

```text
Se removermos logo, nome e cores, alguem ainda reconheceria quem esta comunicando?
```

Se a resposta for nao, a peca nao esta pronta.

---

## 14. Grupo Analise

Comando base:

```text
/analisar
```

Use para:

- dashboard de performance
- funil
- site/landing
- SEO
- concorrente
- estrategia
- aprendizado por metricas

Exemplos:

```text
/analisar dashboard
/analisar funil
/analisar site
/analisar seo
/analisar estrategia
```

Regra:

```text
Dado sem interpretacao e numero.
Interpretacao sem dado e opiniao.
```

Quando nao houver dado real, sinalizar como estimativa ou inferencia.

---

## 15. Grupo Aquisicao

Comando base:

```text
/prospectar
```

Use para:

- analisar mercado
- qualificar prospectos
- posicionar oferta
- criar pitch
- estruturar captura
- criar anuncios
- ativar parcerias

Exemplos:

```text
/prospectar mercado
/prospectar prospector
/prospectar oferta
/prospectar pitch
/prospectar captacao
/prospectar anuncio
/prospectar parcerias
```

Regra:

```text
Outbound inicia conversa sobre gargalo, nao sobre automacao.
```

A abordagem deve conter:

1. sinal
2. dor
3. desejo
4. prova
5. proximo passo

---

## 16. Grupo Venda

Comando base:

```text
/vender
```

Use para:

- abordagem de lead qualificado
- argumento comercial
- resposta a objecoes
- follow-up
- fechamento

Regra:

```text
Nao vender execucao antes de diagnosticar o gargalo.
```

---

## 17. Grupo Relacionamento

Comando base:

```text
/relacionar
```

Use para:

- retencao
- reativacao
- head de marketing implantado

Exemplos:

```text
/relacionar retencao
/relacionar reativacao
/relacionar head
```

---

## 18. Workflows

| Workflow | Uso |
|---|---|
| `workflows/open-client.md` | Abrir cliente. |
| `workflows/close-client.md` | Fechar sessao. |
| `workflows/pipeline-runner.md` | Encadear varias skills. |
| `workflows/reference-library.md` | Consultar biblioteca de referencias. |
| `workflows/client-demo.md` | Demo comercial pre-contratacao. |
| `workflows/onboarding-head.md` | Primeiro mes de head implantado. |
| `workflows/reuniao-estrategica.md` | Reuniao estrategica recorrente. |
| `workflows/relatorio-executivo.md` | Relatorio mensal executivo. |
| `workflows/relatorio-sistema.md` | Relatorio operacional do sistema. |
| `workflows/token-economy.md` | Operacao economica de contexto. |

Para mais de uma skill em sequencia:

```text
usar workflows/pipeline-runner.md
```

---

## 19. Context Builder e Creative Brief

O sistema ja possui uma cadeia de contexto:

```text
Intelligence
  -> Context Builder
  -> Creative Brief
  -> Output
```

Scripts principais:

```text
scripts/context/context-builder.js
scripts/context/knowledge-resolver.js
scripts/context/reference-resolver.js
scripts/context/creative-brief-builder.js
scripts/context/creative-brief-schema.js
```

O Creative Brief precisa conter:

- `acquisition_objective`
- `bottleneck`
- `stage`
- `thesis`
- `tension`
- `content_goal`
- `output_type`
- `references`
- `principles`
- `tone`
- `cta_strategy`

O `acquisition_objective` orienta toda criacao.

---

## 20. Scripts principais

### Criar cliente

```bash
npm run novo -- [slug]
```

### Status e router

```bash
npm run cmd -- /cliente [slug]
npm run cmd -- /status
npm run cmd -- /atualizar
```

### Carrossel

```bash
npm run carousel:generate -- --slug [slug] --tema "tema"
npm run carousel:render
```

### Reel

```bash
npm run cmd -- /direcao-peca
npm run reel:render -- --html caminho/arquivo.html --out saida.webm
```

Fluxo recomendado para video/animacao:

```text
Creative OS -> Direcao de peca -> Motion Pattern Library -> escolha do engine -> render -> critica frame a frame
```

Matriz de escolha:

```text
render-reel.js = teste rapido/local
HyperFrames    = peca autoral, motion web, GSAP, Canvas, UI, direcao visual
Remotion       = escala, templates, dados, series, componentes React
Manim          = diagramas e explicacoes tecnicas
```

### Publicacao

```bash
npm run publicar -- --slug [slug] --file imagem.png --caption "legenda" --dry-run
```

### Insights e aprendizado

```bash
npm run insights -- --slug [slug]
npm run aprender -- --slug [slug]
```

---

## 21. Prospecao e outbound

### Prospector

```bash
npm run prospector -- --slug [slug] --query "clinica estetica" --city "Sao Paulo" --max 20 --channels whatsapp,email --dry-run
```

### Scraper em duas etapas

Etapa 1: gerar lote, sem enviar.

```bash
npm run scraper -- "clinica estetica Tijuca" --max=10 --score=6 --channel=whatsapp
```

Revisar:

```text
agency/leads/pending-approval.json
```

Etapa 2: enviar lote aprovado.

```bash
npm run scraper:enviar
```

Simular envio:

```bash
npm run scraper:dry
```

Painel local:

```bash
npm run scraper:panel
```

Abre em:

```text
http://localhost:5173
```

### Follow-up

```bash
npm run followup
npm run followup:enviar
```

Regra:

```text
Nunca enviar abordagem real sem revisar o lote.
```

---

## 22. Demo Pipeline

Use para gerar demo comercial personalizada.

```bash
npm run demo -- --query "clinica estetica" --city "Sao Paulo" --segment clinica --max 10 --dry-run
```

Para cliente especifico:

```bash
npm run demo -- --slug [slug] --query "..." --city "..." --segment b2b --only-demo
```

Segmentos:

- `clinica`
- `b2b`
- `diagnostico`

Regra:

```text
Demo deve provar leitura especifica, nao parecer apresentacao generica.
```

---

## 23. Site Prospect

Use quando existe uma URL especifica de prospect.

```bash
npm run site-prospect -- --url https://exemplo.com.br --segment b2b --channels whatsapp,email --dry-run
```

Forcar contato:

```bash
npm run site-prospect -- --url https://exemplo.com.br --phone 5511999999999 --email contato@exemplo.com.br --channels whatsapp,email
```

Apenas gerar demo:

```bash
npm run site-prospect -- --url https://exemplo.com.br --only-demo
```

---

## 24. Sherlock

Use para investigar presenca social de perfil, concorrente ou referencia.

```bash
npm run sherlock -- --slug [slug] --target @handle
npm run sherlock -- --slug [slug] --target https://youtube.com/@canal
npm run sherlock -- --slug [slug] --target @empresa --platform linkedin
```

Output:

```text
clients/[slug]/outputs/inteligencia/YYYY-MM-DD-sherlock-[alvo].md
```

---

## 25. Publicacao

Publicacao nunca e automatica sem aprovacao.

Feed:

```bash
npm run publicar -- --slug [slug] --file imagem.png --caption "legenda" --format feed
```

Carrossel:

```bash
npm run publicar -- --slug [slug] --file slide1.png --file slide2.png --file slide3.png --caption "legenda" --format carousel
```

Reel:

```bash
npm run publicar -- --slug [slug] --file video.mp4 --caption "legenda" --format reel
```

Sempre testar:

```bash
npm run publicar -- --slug [slug] --file imagem.png --caption "teste" --dry-run
```

Pre-requisito:

```text
clients/[slug]/instagram-config.json
```

---

## 26. Intelligence externa

Os repertoire updaters trazem repertorio externo para dentro do MarketingOS.
Eles nao substituem a alma do sistema.

Etapa 1: repertorio geral.

```bash
npm run repertoire:update
```

Etapa 2: filtro de aquisicao.

```bash
npm run repertoire:acquisition
```

Regra:

```text
Primeiro preservar repertorio completo.
Depois filtrar aquisicao.
Aplicar em uma skill por vez.
Registrar em intelligence/skill-updates.md.
```

---

## 27. Conteudo para Felipe / MarketingOS

Antes de criar qualquer conteudo para a marca do Felipe ou para o MarketingOS, pare.

Perguntas obrigatorias:

1. Para quem esse conteudo fala, e o que essa pessoa sente antes de encontrar o Felipe?
2. O que o Felipe quer dizer que ninguem mais tem coragem de dizer?
3. Esse conteudo serve para fechar cliente agora ou construir quem o Felipe e no mercado?
4. O Felipe esta disposto a aparecer nisso?

Sem essas respostas, nao estruturar conteudo.

---

## 28. Filtros de qualidade

Antes de entregar qualquer coisa:

1. Isso e autentico?
2. Poderia ter sido dito so por essa marca?
3. Serve ao cliente ou serve a metrica?
4. Conversa com o limbico?
5. Tem substancia para o racional?
6. Esta alinhado com o manifesto?
7. Torna aquisicao mais observavel, ajustavel ou previsivel?
8. Tem proximo passo claro?
9. Se ha dado, ele e real?
10. Se ha inferencia, ela foi sinalizada?

---

## 29. O que nunca fazer

- Publicar sem aprovacao explicita.
- Enviar outreach sem revisar.
- Inventar metricas, provas, faturamento ou depoimentos.
- Gerar conteudo generico sem `client.md`.
- Criar campanha sem objetivo de aquisicao declarado.
- Sugerir acao sem evidencia, contexto ou hipotese clara.
- Misturar clientes.
- Carregar transcricao inteira quando existe `signals.json`.
- Vender IA como produto.
- Validar ideia ruim para ser agradavel.

---

## 30. Checklists rapidos

### Antes de executar

- [ ] Li fundacao necessaria?
- [ ] Cliente correto esta aberto?
- [ ] Objetivo de aquisicao esta claro?
- [ ] Escolhi o grupo certo?
- [ ] Li o `_admin.md` do grupo?
- [ ] Li o contexto minimo da skill?

### Antes de entregar output

- [ ] Output esta salvo em `clients/[slug]/outputs/`?
- [ ] Dados reais e inferencias estao separados?
- [ ] A peca nao parece generica?
- [ ] Existe proximo passo claro?
- [ ] A entrega ajuda aquisicao?

### Antes de publicar ou enviar

- [ ] Houve aprovacao explicita?
- [ ] O conteudo passou por revisao?
- [ ] O canal esta correto?
- [ ] O arquivo/configuracao foi testado com `--dry-run` quando aplicavel?
- [ ] A publicacao/envio sera registrado?

### Ao fechar sessao

- [ ] Aprendizados relevantes foram registrados?
- [ ] Decisoes foram anotadas?
- [ ] Outputs estao no lugar certo?
- [ ] Proximo passo esta claro?
- [ ] Rodar `/fechar`.

---

## 31. Troubleshooting

### PowerShell bloqueou npm

Use:

```bash
npm.cmd run <script>
```

### Playwright falhou

Instale browsers:

```bash
npx playwright install
```

No Windows:

```bash
npx.cmd playwright install
```

### Scraper nao achou leads

Tente:

- termo mais amplo
- cidade maior
- `--score` menor
- `--max` maior
- fonte diferente

### Publicacao falhou

Verifique:

- `instagram-config.json`
- token Meta Graph API
- `igUserId`
- URL publica da imagem/video
- formato aceito pela API

### WhatsApp nao autentica

Verifique:

- QR Code
- `.whatsapp-session/`
- WhatsApp Web funcionando
- telefone com DDI e DDD

---

## 32. Git e seguranca

Ver estado:

```bash
git status --short
```

Ver diff:

```bash
git diff
```

Nunca commitar:

- `.env`
- tokens
- senhas
- cookies
- sessoes de WhatsApp
- dados privados de cliente fora do que ja e esperado pelo repo

---

## 33. Principio final

MarketingOS opera com alma ou nao opera.

Se uma entrega nao ajuda o cliente a crescer, ela nao esta pronta.
Se uma abordagem nao prova leitura especifica, ela vira spam.
Se uma estrategia nao encara o gargalo real, ela so organiza o caos.

O sistema existe para encontrar a verdade humana do negocio e transformar aquisicao em algo cada vez mais claro, observavel e previsivel.
