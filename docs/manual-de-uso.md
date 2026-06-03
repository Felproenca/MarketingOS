# Manual de Uso - MarketingOS
> Guia operacional completo para instalar, abrir sessao, operar clientes, gerar outputs, prospectar, publicar e salvar aprendizados.
> Fonte de verdade operacional: `CLAUDE.md`. Este manual explica o uso pratico sem substituir a constituicao do sistema.

---

## 1. O que e o MarketingOS

MarketingOS e um sistema operacional de marketing orientado por IA para aquisicao, posicionamento e conversao.

Ele combina:

- `manifesto.md`: o porque de tudo.
- `alma.md`: missao, visao, filtros e linguagem.
- `CLAUDE.md`: regras operacionais completas.
- `clients/`: contexto, estrategia, metricas e outputs por cliente.
- `skills/`: capacidades isoladas por area.
- `workflows/`: sequencias operacionais.
- `scripts/`: automacoes de criacao, prospeccao, publicacao e inteligencia.
- `intelligence/`: padroes, benchmarks e aprendizados cross-client.

O principio central:

MarketingOS nao vende posts, gestao de redes ou ferramentas. Vende IA aplicada ao negocio para gerar leads, operar canais e dar controle em tempo real.

---

## 2. Regra de ouro

Antes de qualquer operacao criativa, estrategica ou comercial:

1. Ler `manifesto.md`.
2. Ler `alma.md`.
3. Ler `CLAUDE.md`.
4. Seguir o fluxo da skill ou workflow correto.

Antes de qualquer output para cliente:

1. Abrir o cliente.
2. Ler intelligence global.
3. Ler contexto do cliente.
4. Gerar output no diretorio certo.
5. Registrar aprendizados ao final.

Sem contexto, sem output.

---

## 3. Requisitos

- Node.js 18 ou superior.
- Git.
- npm.
- Playwright instalado via `npm install`.
- Arquivo `.env` local quando usar APIs, e-mail, WhatsApp, publicacao ou upload.
- Claude Code, Cursor ou outro agente capaz de seguir `CLAUDE.md`.

No Windows, se o PowerShell bloquear `npm.ps1`, use:

```bash
npm.cmd run <script>
```

---

## 4. Instalacao

```bash
git clone https://github.com/Felproenca/MarketingOS.git
cd MarketingOS
npm install
```

Copie o arquivo de exemplo de ambiente:

```bash
copy .env.example .env
```

No Linux/macOS:

```bash
cp .env.example .env
```

Preencha apenas as variaveis que forem necessarias para a operacao do dia.

---

## 5. Estrutura do repositorio

```text
/marketing-os
  manifesto.md
  alma.md
  CLAUDE.md
  AGENTS.md
  README.md
  package.json
  /agency
  /clients
    /_template
    /[slug]
      client.md
      notes.md
      estrategia.md
      campaigns.md
      metrics.json
      brand-kit.json
      runs.md
      /outputs
  /docs
  /intelligence
  /scripts
  /skills
  /templates
  /workflows
```

Arquivos dentro de `clients/[slug]/` sao privados por padrao e ficam fora do git, exceto o template.

---

## 6. Arquivos fundamentais

| Arquivo | Funcao |
|---|---|
| `manifesto.md` | Documento fundacional. Nao editar. |
| `alma.md` | Constituicao do sistema, filtros de criacao e linguagem. |
| `CLAUDE.md` | Fonte unica de instrucao operacional. |
| `AGENTS.md` | Ponte para agentes que procuram instrucoes em `AGENTS.md`. |
| `workflows/commands.md` | Referencia rapida de comandos. |
| `docs/manual-de-uso.md` | Manual pratico completo. |

---

## 7. Fluxo padrao de sessao

Toda operacao segue este ciclo:

```text
/abrir [slug]
  -> carregar intelligence
  -> carregar contexto do cliente
  -> executar skill ou workflow
  -> salvar output em clients/[slug]/outputs/
  -> registrar decisoes e aprendizados
/fechar
```

### Abrir cliente

```text
/abrir toqueindiano
```

O sistema deve carregar:

- `intelligence/patterns.md`
- `intelligence/benchmarks.json`
- `intelligence/experiments.md`, quando aplicavel
- `clients/[slug]/client.md`
- `clients/[slug]/notes.md`
- `clients/[slug]/runs.md`
- `clients/[slug]/metrics.json`
- `clients/[slug]/brand-kit.json`, quando visual for relevante

### Salvar checkpoint

```text
/salvar
```

Use quando houver uma entrega intermediaria importante.

### Fechar sessao

```text
/fechar
```

Use sempre ao final. O fechamento deve registrar aprendizados, atualizar historico e commitar quando o workflow pedir.

---

## 8. Criar novo cliente

Via npm:

```bash
npm run novo -- toqueindiano
```

Ou diretamente:

```bash
node scripts/create-client.js toqueindiano
```

O script cria:

- Estrutura em `clients/[slug]/`.
- Arquivos base: `client.md`, `notes.md`, `campaigns.md`, `metrics.json`, `brand-kit.json`, `estrategia.md`.
- Pastas de output.
- Pastas de assets.
- Onboarding interativo no terminal.

Depois de criar:

1. Revise `clients/[slug]/client.md`.
2. Revise `clients/[slug]/brand-kit.json`.
3. Abra a sessao com `/abrir [slug]`.

---

## 9. Contexto por cliente

| Arquivo | Uso |
|---|---|
| `client.md` | Dados, ICP, tom, restricoes, objetivo e posicionamento. |
| `notes.md` | Diario operacional, alertas e inteligencia acumulada. |
| `estrategia.md` | Prioridades atuais e proximos movimentos. |
| `campaigns.md` | Campanhas, conteudos e decisoes. |
| `runs.md` | Historico de sessoes. |
| `metrics.json` | Performance real por canal. |
| `brand-kit.json` | Identidade visual e regras de imagem. |
| `instagram-config.json` | Configuracao da Meta Graph API e upload de midia. |
| `published.json` | Historico de publicacoes. |

Nunca misture contexto entre clientes.

---

## 10. Onde salvar outputs

Todo output deve ir para `clients/[slug]/outputs/`.

| Tipo | Pasta |
|---|---|
| Posts | `outputs/posts/` |
| Carrosseis | `outputs/carousels/` |
| Sites | `outputs/site/` |
| Branding | `outputs/branding/` |
| Anuncios | `outputs/anuncios/` |
| SEO | `outputs/seo/` |
| Inteligencia | `outputs/inteligencia/` |
| Demos | `outputs/demo/` ou `outputs/demos/` conforme script |
| Dashboards | `outputs/dashboard/` |
| Imagens | `outputs/images/` |

---

## 11. Skills por grupo

### Analise

Comando base:

```text
/analisar
```

Use para:

- Dashboard de performance.
- Diagnostico de funil.
- Investigacao de concorrente ou referencia.
- Auditoria SEO.
- Decisao estrategica.

Arquivos:

- `skills/analise/_admin.md`
- `skills/analise/skill-dashboard.md`
- `skills/analise/skill-funnel-analysis.md`
- `skills/analise/skill-investigar.md`
- `skills/analise/skill-seo.md`
- `skills/analise/skill-estrategista.md`

### Criacao

Comando base:

```text
/criar
```

Use para:

- Direcao criativa.
- Carrossel.
- Post.
- Branding.
- Site.
- Imagem.
- Publicacao.

Regra importante: antes de criar, a skill de criatividade deve encontrar a verdade humana e a direcao criativa. Conteudo sem verdade vira ruido.

Arquivos:

- `skills/criacao/_admin.md`
- `skills/criacao/skill-criatividade.md`
- `skills/criacao/skill-carousel.md`
- `skills/criacao/skill-post.md`
- `skills/criacao/skill-branding.md`
- `skills/criacao/skill-site-builder.md`
- `skills/criacao/skill-image-generation.md`
- `skills/criacao/skill-publicar.md`

### Aquisicao

Comando base:

```text
/prospectar
```

Use para:

- Analise de mercado.
- Prospecao.
- Posicionamento de oferta.
- Pitch deck.
- Captura de leads.
- Anuncios.

Arquivos:

- `skills/aquisicao/_admin.md`
- `skills/aquisicao/skill-market-analyzer.md`
- `skills/aquisicao/skill-prospector.md`
- `skills/aquisicao/skill-offer-positioning.md`
- `skills/aquisicao/skill-pitch-deck.md`
- `skills/aquisicao/skill-lead-capture.md`
- `skills/aquisicao/skill-anuncio.md`

### Venda

Comando base:

```text
/vender
```

Use para abordagem, argumento, follow-up e fechamento.

Arquivo:

- `skills/venda/skill-venda.md`

### Relacionamento

Comando base:

```text
/relacionar
```

Use para:

- Retencao.
- Reativacao.
- Head de marketing implantado.

Arquivos:

- `skills/relacionamento/skill-retention.md`
- `skills/relacionamento/skill-reactivation.md`
- `skills/relacionamento/skill-head-implantado.md`

---

## 12. Workflows

| Workflow | Quando usar |
|---|---|
| `workflows/open-client.md` | Abrir cliente. |
| `workflows/close-client.md` | Fechar sessao. |
| `workflows/pipeline-runner.md` | Encadear varias skills. |
| `workflows/onboarding-head.md` | Primeiro mes de head implantado. |
| `workflows/reuniao-estrategica.md` | Reuniao estrategica recorrente. |
| `workflows/relatorio-executivo.md` | Relatorio executivo mensal. |
| `workflows/client-demo.md` | Demo personalizada para cliente/prospect. |

Pipelines previstos:

```text
/pipeline branding-completo
/pipeline lancamento-conteudo
/pipeline diagnostico
/pipeline seo-completo
/pipeline campanha-paga
```

---

## 13. CLI principal

### Criar cliente

```bash
npm run novo -- [slug]
```

### Router de comandos

```bash
npm run cmd -- /novo [slug]
npm run cmd -- /cliente [slug]
npm run cmd -- /status
npm run cmd -- /atualizar
npm run cmd -- /carrossel --tema "tema do carrossel"
```

### Salvar

```bash
npm run salvar
```

### Testes

```bash
npm test
```

Hoje o teste configurado apenas informa que nao ha suite automatizada.

---

## 14. Carrosseis

Gerar carrossel:

```bash
npm run carousel:generate -- --slug toqueindiano --tema "Imagem bonita nao vende" --slides 7
```

Renderizar carrosseis padrao:

```bash
npm run carousel:render
```

Renderizar um HTML especifico:

```bash
node scripts/render-carousel-file.js clients/toqueindiano/outputs/carousels/meu-carrossel.html
```

Regra do sistema:

- Carrossel deve sair em HTML direto.
- Nao usar markdown intermediario.
- Nao usar Python para converter carrossel.
- PNGs devem ser gerados a partir do HTML.

---

## 15. Branding

Fluxo recomendado:

```text
/abrir [slug]
/criar branding
```

Outputs esperados:

- Direcao criativa.
- Paleta.
- Tipografia.
- Regras visuais.
- Possiveis telas/slides em `outputs/branding/`.

Para a identidade da Toque Indiano existe um renderizador especifico:

```bash
node scripts/render-branding.js
```

Ele le:

```text
clients/toqueindiano/outputs/branding/apresentacao-identidade.html
```

E exporta slides em:

```text
clients/toqueindiano/outputs/branding/slides/
```

---

## 16. Site e landing page

Fluxo obrigatorio:

```text
/abrir [slug]
/criar branding
/criar site
```

Regra:

- Site depende de branding.
- Output vai para `clients/[slug]/outputs/site/`.
- Site ou landing deve falar de beneficio, medo e desejo antes de tecnologia.

---

## 17. Imagens

Fluxo:

```text
/abrir [slug]
/criar imagem
```

O sistema usa `brand-kit.json` para manter coerencia visual.

Quando usar imagem gerada:

- Conteudo precisa de apoio visual.
- O cliente nao tem banco de imagens suficiente.
- A imagem nao pode inventar prova, produto, depoimento ou dado.

Quando nao usar:

- Se houver foto real melhor.
- Se a imagem gerada parecer perfeita demais e reduzir confianca.
- Se o output exigir prova real.

---

## 18. Prospecao classica

Script:

```bash
npm run prospector -- --slug <slug> --query "clinica estetica" --city "Sao Paulo" --max 20 --channels whatsapp,email --sources maps,search --dry-run
```

O que faz:

1. Busca leads no Google Maps e Google Search.
2. Deduplica resultados.
3. Enriquece com site, email e telefone.
4. Salva leads em `clients/[slug]/outputs/inteligencia/`.
5. Em modo normal, envia WhatsApp/e-mail conforme configurado.

Use `--dry-run` antes de qualquer envio real.

Opcoes:

| Flag | Funcao |
|---|---|
| `--slug` | Cliente alvo. |
| `--query` | Termo de busca. |
| `--city` | Cidade. |
| `--max` | Maximo de leads por fonte. |
| `--channels` | `whatsapp,email`, `whatsapp` ou `email`. |
| `--sources` | `maps,search`, `maps` ou `search`. |
| `--dry-run` | Testa sem enviar. |
| `--no-enrich` | Nao visitar sites para enriquecer contatos. |

---

## 19. Scraper Inteligente v2

Script:

```bash
npm run scraper -- "clinica estetica Rio de Janeiro" --dry-run --max=10 --score=6 --channel=email
```

Dry-run curto:

```bash
npm run scraper:dry -- "clinica estetica Rio de Janeiro" --max=10 --score=6
```

Pipeline:

```text
Discovery -> Analysis -> Qualification -> Message -> Outreach
```

Modulos:

| Arquivo | Funcao |
|---|---|
| `scripts/scraper/discovery.js` | Busca e normaliza leads. |
| `scripts/scraper/analyzer.js` | Analisa site, CTA, WhatsApp, form, SEO e Instagram. |
| `scripts/scraper/qualifier.js` | Da score de oportunidade de 0 a 10. |
| `scripts/scraper/message-builder.js` | Gera mensagem personalizada via Claude. |
| `scripts/scraper/outreach.js` | Envia e-mail ou prepara WhatsApp. |

Opcoes:

| Flag | Padrao | Funcao |
|---|---:|---|
| `--max=N` | `10` | Maximo de leads qualificados. |
| `--score=N` | `6` | Score minimo para abordagem. |
| `--dry-run` | `false` | Gera mensagens sem enviar. |
| `--channel=X` | `email` | `email`, `whatsapp` ou `both`. |

Variaveis relevantes:

```env
ANTHROPIC_API_KEY=...
EMAIL_USER=...
EMAIL_PASS=...
SCRAPER_DELAY_MS=2000
SCRAPER_MAX_LEADS=10
```

Regra de uso:

- Sempre rode com `--dry-run` primeiro.
- Nunca envie abordagem sem revisar a mensagem.
- Score alto significa oportunidade visivel, nao garantia de compra.
- Nao invente dado, resultado ou prova.

---

## 20. Demo Pipeline

Script:

```bash
npm run demo -- --query "clinica estetica" --city "Sao Paulo" --segment clinica --max 10 --dry-run
```

Uso com cliente:

```bash
npm run demo -- --slug toqueindiano --query "..." --city "..." --segment b2b --only-demo
```

Segmentos:

- `clinica`
- `b2b`
- `diagnostico`

O que faz:

1. Busca leads.
2. Enriquece contatos.
3. Extrai sinais de marca.
4. Gera demo personalizada.
5. Opcionalmente envia outreach.

Use:

- `--dry-run` para gerar e simular envio.
- `--only-demo` para salvar demo localmente sem enviar nada.

---

## 21. Sherlock

Script:

```bash
npm run sherlock -- --slug <slug> --target @handle --platform instagram
```

Exemplos:

```bash
npm run sherlock -- --slug toqueindiano --target @concorrente --platform instagram
npm run sherlock -- --slug toqueindiano --target https://youtube.com/@canal --platform youtube
npm run sherlock -- --slug toqueindiano --target @empresa --platform linkedin
```

Use para investigar perfis e referencias.

Output:

```text
clients/[slug]/outputs/inteligencia/YYYY-MM-DD-sherlock-[alvo].md
```

---

## 22. Publicacao via Meta Graph API

Script:

```bash
npm run publicar -- --slug <slug> --file img.png --caption "legenda" --dry-run
```

Feed:

```bash
npm run publicar -- --slug toqueindiano --file slide.png --caption "Legenda"
```

Carrossel:

```bash
npm run publicar -- --slug toqueindiano --file slide1.png --file slide2.png --file slide3.png --caption "Legenda" --format carousel
```

Reel:

```bash
npm run publicar -- --slug toqueindiano --file video.mp4 --caption "Legenda" --format reel
```

Pre-requisito:

```text
clients/[slug]/instagram-config.json
```

Campos esperados:

- `accessToken`
- `igUserId`
- `imgbbApiKey`, quando precisar transformar arquivo local em URL publica

Regra:

- Nunca publicar sem aprovacao.
- Sempre testar com `--dry-run`.
- Registrar publicacao em `published.json`/`campaigns.md` quando aplicavel.

---

## 23. WhatsApp

Scripts usam `whatsapp-web.js`.

Sessao local:

```text
.whatsapp-session/
```

Essa pasta nao deve ir para o git.

Primeiro uso:

1. Rodar o script que inicializa WhatsApp.
2. Escanear QR Code.
3. Aguardar autenticacao.
4. Enviar apenas depois de revisar mensagem e destinatario.

Script especifico da Toque Indiano:

```bash
node scripts/send-identidade-toqueindiano.js
```

Ele envia os slides de identidade gerados em:

```text
clients/toqueindiano/outputs/branding/slides/
```

---

## 24. E-mail

Configuracao no `.env`:

```env
EMAIL_USER=felipe@marketingos.com.br
EMAIL_PASS=sua_senha_de_app
EMAIL_FROM=Felipe Proenca <felipe@marketingos.com.br>
```

Para Gmail, use senha de app, nao a senha principal.

Scripts que podem usar e-mail:

- `scripts/prospector/index.js`
- `scripts/scraper/outreach.js`
- `scripts/demo-pipeline/index.js`

Regra:

- E-mail frio precisa ser especifico.
- A primeira linha deve provar que houve analise.
- Evitar mensagem generica, automatica ou corporativa.

---

## 25. Variaveis de ambiente

Exemplo de `.env`:

```env
ANTHROPIC_API_KEY=...

EMAIL_USER=...
EMAIL_PASS=...
EMAIL_FROM=...

IMGBB_API_KEY=...

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

SCRAPER_DELAY_MS=2000
SCRAPER_MAX_LEADS=10
```

Nunca commitar `.env`.

---

## 26. Intelligence

Arquivos principais:

| Arquivo | Uso |
|---|---|
| `intelligence/patterns.md` | Padroes cross-client confirmados. |
| `intelligence/benchmarks.json` | Benchmarks por canal/nicho. |
| `intelligence/experiments.md` | Experimentos em andamento. |
| `intelligence/skill-updates.md` | Log de melhorias de skills. |
| `intelligence/system-usage.json` | Uso do sistema. |
| `intelligence/market-opportunities.md` | Oportunidades de mercado. |

Antes de operar um cliente, intelligence vem antes do contexto do cliente.

---

## 27. Regras de conteudo para Felipe/MarketingOS

Antes de criar qualquer conteudo de marca para Felipe Proenca ou MarketingOS, parar e responder:

1. Para quem esse conteudo fala e o que essa pessoa sente antes de encontrar o Felipe?
2. O que o Felipe quer dizer que ninguem mais tem coragem de dizer?
3. Esse conteudo serve para fechar cliente agora ou construir quem o Felipe e no mercado?
4. O Felipe esta disposto a aparecer nisso?

Sem essas respostas, nao criar estrutura.

---

## 28. Filtros de qualidade

Antes de aprovar qualquer output:

1. Isso e autentico?
2. Poderia ter sido dito so por essa marca?
3. Serve ao cliente ou serve a metrica?
4. Conversa com o limbico?
5. Tem substancia para o racional?
6. Esta alinhado com o manifesto?
7. Tem proximo passo claro?
8. Evita promessa que nao pode provar?

---

## 29. O que nunca fazer

- Publicar ou enviar conteudo automaticamente sem aprovacao.
- Inventar metricas, dados ou depoimentos.
- Gerar conteudo generico sem ler `client.md`.
- Ignorar tom, persona ou restricoes do cliente.
- Criar campanha sem objetivo declarado.
- Sugerir acao sem justificativa baseada em dados ou contexto.
- Misturar contexto entre clientes.
- Comitar credenciais, sessoes de WhatsApp, cookies ou dados privados.

---

## 30. Git e versionamento

Ver estado:

```bash
git status --short
```

Ver diff:

```bash
git diff
```

Adicionar tudo que deve entrar:

```bash
git add .
```

Commit:

```bash
git commit -m "docs: add manual de uso"
```

Subir:

```bash
git push
```

Antes de commitar, confirme que nao existem:

- `.env`
- sessoes de WhatsApp
- cookies de navegador
- dados privados de cliente fora do `.gitignore`
- chaves de API
- senhas

---

## 31. Troubleshooting

### PowerShell bloqueou npm

Use:

```bash
npm.cmd run <script>
```

### Playwright falhou

Instale os browsers:

```bash
npx playwright install
```

No Windows com PowerShell bloqueado:

```bash
npx.cmd playwright install
```

### Scraper nao achou leads

Tente:

- Termo mais amplo.
- Cidade maior.
- `--score` menor no Scraper v2.
- Rodar so `maps` ou so `search`.
- Aumentar `--max`.

### E-mail nao envia

Verifique:

- `EMAIL_USER`.
- `EMAIL_PASS`.
- Senha de app do Gmail.
- Bloqueio SMTP.
- `verifyEmail()` no log.

### WhatsApp nao autentica

Verifique:

- QR Code escaneado.
- Sessao local nao corrompida.
- WhatsApp Web funcionando no navegador.
- Numero de destino com DDI e DDD.

### Publicacao Instagram falha

Verifique:

- `accessToken`.
- `igUserId`.
- Permissoes da Meta Graph API.
- Se a imagem esta em URL publica.
- Se o formato e aceito pela API.

---

## 32. Checklist antes de entregar output

- Cliente correto aberto.
- `client.md` lido.
- `notes.md` lido.
- `metrics.json` conferido quando houver performance envolvida.
- `brand-kit.json` usado quando houver visual.
- Output salvo em `clients/[slug]/outputs/`.
- Conteudo passa pelos filtros de `alma.md`.
- Proximo passo esta claro.
- Nada foi publicado ou enviado sem aprovacao.
- Aprendizado relevante registrado.

---

## 33. Checklist de operacao de prospeccao

Antes:

- Definir ICP.
- Definir cidade/nicho.
- Rodar dry-run.
- Revisar mensagem.
- Conferir limite diario.

Durante:

- Monitorar erros.
- Nao forcar envio sem contato valido.
- Evitar cadencia agressiva.

Depois:

- Salvar leads.
- Registrar contatados.
- Registrar respostas.
- Ajustar abordagem com base no que respondeu.

---

## 34. Principio final

MarketingOS opera com alma ou nao opera.

Se o output nao ajuda o cliente a crescer, nao importa se esta bonito.
Se a abordagem nao prova que houve cuidado, vira spam.
Se a estrategia nao tem coragem, vira manutencao do mesmo.

O sistema existe para encontrar a verdade humana do negocio e multiplicar essa verdade ate ela virar resultado.
