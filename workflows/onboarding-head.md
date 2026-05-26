# onboarding-head.md — Primeiro Mês do Head Implantado
> Localização: /workflows/onboarding-head.md
> Execute este workflow no início de cada novo cliente em regime de Head Implantado.
> Pré-requisito: client.md preenchido + contrato assinado.

---

## Objetivo

Estruturar as primeiras 4 semanas do Head Implantado de forma que, ao final do mês, o cliente tenha:
- Diagnóstico completo e documentado
- Posicionamento claro e operacional
- Pelo menos um canal com conteúdo no ar
- Primeira reunião de resultado realizada
- Ritmo mensal definido

A frase que guia este workflow:

> *"No final do primeiro mês, o cliente não deve mais perguntar 'o que você está fazendo'. Ele deve saber, acompanhar e já ver resultado."*

---

## Input Obrigatório

```
Slug do cliente:     [ informar ao ativar ]
Arquivo base:        /clients/[slug]/client.md — deve estar completo (Blocos 1 a 9)
Canais prioritários: [ extrair do client.md Bloco 8 ]
Orçamento de mídia:  [ definido no contrato — ou "orgânico apenas" ]
Data de início:      [ informar ao ativar ]
```

Antes de iniciar qualquer etapa, leia o `client.md` e `estrategia.md` completos.
Se algum bloco essencial estiver incompleto, sinalize e aguarde preenchimento.

---

## Etapas do Workflow

Execute em ordem. Cada semana é uma fase distinta.

---

### SEMANA 1 — Diagnóstico Completo

**Objetivo:** entender a fundo onde o cliente está antes de tocar em qualquer coisa.

**Regra da semana 1:** não publicar, não executar, não propor. Só ouvir, observar e documentar.

```
ETAPA 1.1 — Leitura de contexto
  → Ler client.md (todos os blocos)
  → Ler notes.md — há alertas ou histórico?
  → Ler runs.md — houve trabalho anterior?
  → Ler metrics.json — qual é o ponto de partida?

ETAPA 1.2 — Auditoria de presença digital
  → Instagram: frequência de publicação, tipos de conteúdo, engajamento médio, bio, link
  → Site: existe? converte? tem CTA claro? velocidade?
  → WhatsApp: tem número de negócios? tem automação? qual é o fluxo hoje?
  → Tráfego pago: tem campanhas ativas? qual o orçamento e o ROAS atual?
  → Google: aparece na busca local? tem Google Business configurado?

ETAPA 1.3 — Análise de concorrência
  → Ativar skill-investigar.md para os 2 principais concorrentes
  → Documentar: o que eles fazem bem, o que não fazem, onde há espaço

ETAPA 1.4 — Documentação do diagnóstico
  → Registrar tudo em notes.md (seção "Diagnóstico Inicial")
  → Atualizar metrics.json com dados reais levantados
  → Identificar os 3 maiores gaps de aquisição
  → Identificar o canal com maior potencial imediato
```

**Entrega da semana 1:**
```
→ notes.md: seção "Diagnóstico Inicial" preenchida
→ metrics.json: atualizado com dados reais
→ 1 reunião de alinhamento com o cliente (30 min) para validar diagnóstico
```

---

### SEMANA 2 — Posicionamento e Primeiras Entregas

**Objetivo:** definir como a marca vai se comunicar e produzir as primeiras peças.

```
ETAPA 2.1 — Posicionamento
  → Ativar skill-offer-positioning.md
  → Validar ou reescrever: tagline, mensagem central, oferta em uma frase
  → Definir o que muda na comunicação a partir de agora
  → Registrar decisões em campaigns.md

ETAPA 2.2 — Identidade visual (se necessário)
  → Avaliar brand-kit.json: está atualizado e operacional?
  → Se não: ativar skill-branding.md antes de qualquer peça visual

ETAPA 2.3 — Primeiras produções
  → Ativar skill-carousel.md: 1 carrossel de posicionamento ou autoridade
  → Ativar skill-post.md: 3 posts de feed para o grid inicial
  → Se tiver site a construir: ativar skill-site-builder.md em modo estrutura

ETAPA 2.4 — Calendário do mês
  → Montar calendário de conteúdo para as semanas 3 e 4
  → Definir frequência de publicação por canal
  → Registrar em campaigns.md
```

**Entrega da semana 2:**
```
→ Posicionamento validado e registrado em campaigns.md
→ brand-kit.json atualizado
→ 1 carrossel + 3 posts prontos para publicação
→ Calendário de conteúdo das semanas 3 e 4 definido
```

---

### SEMANA 3 — Primeiros Conteúdos no Ar

**Objetivo:** colocar a operação em movimento e começar a coletar dados reais.

```
ETAPA 3.1 — Publicação
  → Publicar os conteúdos produzidos na semana 2
  → Seguir protocolo de publicação: ativar skill-publicar.md
  → Registrar data e canal de cada publicação em campaigns.md

ETAPA 3.2 — Ativação de canal prioritário
  → Se canal prioritário for Instagram: primeiros posts no ar + interação ativa
  → Se canal prioritário for Site: publicar e configurar rastreamento básico (Analytics)
  → Se canal prioritário for Ads: montar campanha via skill-anuncio.md
    com orçamento inicial conservador (aprendizado, não escala)
  → Se canal prioritário for WhatsApp: configurar fluxo de primeiro contato
    via skill-lead-capture.md

ETAPA 3.3 — Monitoramento inicial
  → Após 48h do primeiro conteúdo: registrar métricas iniciais no metrics.json
  → Identificar: o que gerou mais reação (mesmo que pequena)
  → Não otimizar ainda — só observar e registrar

ETAPA 3.4 — Check-in semanal
  → Enviar check-in ao cliente seguindo o modelo da skill-head-implantado.md
  → Incluir: primeiros números, o que foi aprendido, o que vem na semana 4
```

**Entrega da semana 3:**
```
→ Pelo menos 3 peças publicadas no canal prioritário
→ metrics.json com primeiros dados reais da operação
→ Check-in semanal enviado ao cliente
```

---

### SEMANA 4 — Primeira Reunião de Resultado + Definição do Ritmo Mensal

**Objetivo:** consolidar o primeiro mês, mostrar resultado e definir como será daqui em diante.

```
ETAPA 4.1 — Preparação da reunião
  → Ativar workflows/reuniao-estrategica.md
  → Levantar todas as métricas do mês em metrics.json
  → Identificar: o que funcionou, o que não funcionou, o que muda
  → Preparar pauta da reunião (máx. 5 pontos)

ETAPA 4.2 — Reunião de resultado
  → Executar /workflows/reuniao-estrategica.md com o cliente
  → Apresentar dados reais sem esconder o que não performou
  → Propor ajustes baseados no que foi aprendido

ETAPA 4.3 — Relatório do primeiro mês
  → Ativar /workflows/relatorio-executivo.md
  → Salvar em /clients/[slug]/outputs/dashboard/relatorio-[MMAAAA].md

ETAPA 4.4 — Definição do ritmo mensal
  → Definir com o cliente: reunião quinzenal ou mensal?
  → Definir: quais KPIs acompanhar todo mês?
  → Definir: qual é o calendário de conteúdo do mês seguinte?
  → Registrar tudo em estrategia.md

ETAPA 4.5 — Fechamento do onboarding
  → Atualizar runs.md com o registro completo do primeiro mês
  → Executar /fechar para salvar aprendizados na intelligence/
```

**Entrega da semana 4:**
```
→ Reunião de resultado realizada
→ Relatório do mês salvo em outputs/dashboard/
→ Ritmo mensal definido e registrado em estrategia.md
→ Calendário do mês 2 montado
```

---

## Regras deste Workflow

1. **Semana 1 é só diagnóstico** — nada de publicar ou executar antes de entender o cenário
2. **Nunca pular a validação de posicionamento** — tudo que vem depois depende disso
3. **Primeiras publicações não são para performar** — são para aprender o que funciona
4. **A reunião da semana 4 é inegociável** — o cliente precisa ver resultado antes de decidir continuar
5. **Registrar tudo em tempo real** — notes.md e campaigns.md atualizados semanalmente
6. **Nunca inventar dados** — se não tem métrica real, sinalizar como estimativa

---

## Checklist de Entrega (fim do primeiro mês)

- [ ] Diagnóstico documentado em notes.md?
- [ ] metrics.json com dados reais (não estimados)?
- [ ] Posicionamento validado e registrado em campaigns.md?
- [ ] brand-kit.json atualizado e operacional?
- [ ] Pelo menos 3 peças publicadas no canal prioritário?
- [ ] Calendário de conteúdo do mês 2 definido?
- [ ] Reunião de resultado realizada?
- [ ] Relatório do mês gerado e salvo?
- [ ] Ritmo mensal definido em estrategia.md?
- [ ] runs.md atualizado com registro do primeiro mês?

---

## Exemplo de Ativação

```
Execute o workflow /workflows/onboarding-head.md.

Cliente: [slug]
Data de início: [YYYY-MM-DD]
Canais prioritários: [extrair do client.md]
Orçamento de mídia: [valor aprovado ou "orgânico apenas"]
```

---

*Workflow v1.0 — MarketingOS*
