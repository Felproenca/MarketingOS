---
name: skill-lead-capture
version: "1.2"
group: aquisicao
command: /prospectar leads
inputs:
  required: [client.md, campaigns.md]
  optional: [intelligence/repertoire-updaters/acquisition.md]
env: []
---

# skill-lead-capture.md — Captura de Leads
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: contexto do cliente via `client.md`.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2 e 4 (negócio, persona, tom)
→ campaigns.md — para registrar o fluxo criado
→ skills/funnel-strategy/SKILL.md — estratégia de fricção, qualificação e roteamento
→ skills/funnel-strategy/qualification-engine.md — perguntas e classificação de lead
→ skills/funnel-strategy/schemas/smart-form.schema.json — contrato de formulário inteligente
→ skills/funnel-strategy/schemas/routing-rules.schema.json — rotas pós-captura
→ NÃO carregar: metrics.json, brand-kit.json, intelligence/, alma.md, notes.md, estrategia.md

---

## Funnel Strategy — gate comercial obrigatório

Captura não é formulário. Captura é qualificação.

Antes de criar qualquer fluxo, definir:

```text
Friction level:
Expected lead signal:
Qualification goal:
Lead scoring:
Routing destination:
Next best action:
```

Regra: máximo 4 perguntas antes da primeira entrega de valor percebida.

---

## Objetivo da Skill

Estruturar e gerar o sistema completo de captura de leads para um cliente, cobrindo:
- Definição do ativo de captura (isca digital, oferta, CTA)
- Copy do formulário ou fluxo de entrada
- Sequência de confirmação e primeiro contato
- Integração com WhatsApp ou e-mail
- Registro no `campaigns.md`

---

## Input Esperado

```
1. Canal de captura     → [ Landing page / Instagram / WhatsApp direto / Ads / Site ]
2. Ativo de captura     → [ Isca digital / Orçamento / Consulta / Desconto / Conteúdo exclusivo ]
3. Dados a coletar      → [ Nome / WhatsApp / E-mail / Segmento / Outro ]
4. Destino do lead      → [ WhatsApp / CRM / Supabase / E-mail / Planilha ]
5. Primeiro contato     → [ Automático via Typebot / Manual / E-mail ]
```

Se algum estiver ausente, consulte o `client.md` antes de perguntar.

---

## Estrutura de Output

---

## Mapa de Captura v1.1

Antes de criar o fluxo, classificar a temperatura do lead:

```text
Frio:
  Ainda nao confia. Precisa de diagnostico, checklist, comparacao, guia ou conteudo util.

Morno:
  Reconhece o problema. Precisa de prova, exemplo, simulacao, demo ou conversa curta.

Quente:
  Quer agir. Precisa de CTA direto, baixo atrito e resposta rapida.
```

Escolher o ativo conforme a intencao:

```text
Problema pouco claro      -> diagnostico/checklist
Problema claro            -> simulacao/demo
Comparando opcoes         -> comparativo/guia de decisao
Pronto para comprar       -> WhatsApp/orcamento/agendamento
Busca autoridade          -> newsletter/conteudo recorrente
```

Regra: captura boa pede o minimo necessario para cumprir a promessa.

---

## Tracking minimo

Toda captura deve recomendar pelo menos um evento:

```text
view_capture_asset
click_primary_cta
start_form
submit_lead
click_whatsapp
qualified_lead
proposal_requested
```

Se nao houver ferramenta de analytics, registrar como pendencia tecnica.

---

### CAPTURA DE LEADS — [Nome do Cliente]

**Canal:** [ ]
**Ativo:** [ ]
**Destino:** [ ]
**Temperatura do lead:** [ frio / morno / quente ]
**Evento principal:** [ ]

#### FUNNEL METADATA

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

#### OFERTA DE ENTRADA

```
Headline do CTA:
[frase que justifica o preenchimento — o que o lead ganha]

Subheadline:
[1 linha que reduz fricção — ex: "Sem compromisso. Resposta em até 2h."]

Botão:
[texto do botão — específico, não genérico]
```

---

#### FORMULÁRIO / FLUXO DE CAPTURA

```
Campo 1: Nome
  → Label: [ ]
  → Placeholder: [ ]

Campo 2: WhatsApp
  → Label: [ ]
  → Placeholder: [ ]
  → Validação: formato (xx) xxxxx-xxxx

Campo 3 (opcional): [ ]
  → Label: [ ]
  → Placeholder: [ ]

Mensagem de confirmação pós-envio:
  → [ texto exibido após o lead preencher ]
```

---

#### PRIMEIRO CONTATO — WHATSAPP (Typebot)

```
Mensagem de abertura (enviada imediatamente após captura):
→ [TEXTO — personalizado com o nome do lead]

Mensagem 2 (se não houver resposta em 2h):
→ [TEXTO — reforço sem pressão]

Mensagem 3 (se não houver resposta em 24h):
→ [TEXTO — última tentativa com CTA diferente]
```

---

#### PRIMEIRO CONTATO — E-MAIL (se aplicável)

```
Assunto:
→ [TEXTO — personalizado, sem parecer spam]

Corpo:
→ [TEXTO — curto, direto, com próximo passo claro]

CTA do e-mail:
→ [TEXTO + link ou botão]
```

---

#### SEQUÊNCIA DE NUTRIÇÃO — E-MAIL (v1.2, quando o lead ainda não está pronto pra WhatsApp)

Usar quando o lead entra frio/morno (não pede preço/urgência de cara) — e-mail
nutre sem exigir presença humana em tempo real, poupando a capacidade de
atendimento (útil sobretudo quando a operação do cliente tem pouca gente
respondendo). Ver `skills/funnel-strategy/platform-playbooks/email.md` para a
lógica completa.

```
Sequência de boas-vindas: 5-7 e-mails / 14 dias, 1 CTA comportamental por e-mail
  (nunca "compre agora" logo de cara)

Gatilho de saída da sequência → WhatsApp:
  lead clicou, respondeu ou perguntou preço/urgência = intent level sobe pra
  high → rotear pra WhatsApp/comercial imediatamente, não esperar a sequência
  terminar

E-mail 1 (imediato): [entrega o que foi prometido na captura + 1 pergunta leve]
E-mail 2 (dia 2-3): [prova/case/exemplo relevante ao segmento do lead]
E-mail 3 (dia 5-7): [conteúdo de valor, sem CTA de venda]
E-mail 4-7 (até dia 14): [aprofunda + 1 CTA comportamental por e-mail]
```

---

#### CONFIGURAÇÃO TÉCNICA

```
Ferramenta de formulário:   [ Typebot / Tally / Formulário próprio / Meta Lead Ads ]
Destino dos dados:          [ Supabase / Planilha / CRM / Webhook ]
Trigger de automação:       [ Envio do formulário / Clique no link / Resposta no WhatsApp ]
Notificação interna:        [ Sim / Não — canal: ___ ]
Evento de tracking:         [ view_capture_asset / click_primary_cta / submit_lead / click_whatsapp ]
```

---

#### HANDOFF PARA VENDA

```
Origem da captura:
Ativo prometido:
Temperatura:
Dados coletados:
Pergunta/resposta de qualificacao:
Mensagem enviada:
Proximo passo esperado:
```

---

#### REGISTRO NO campaigns.md

```
Nome do fluxo:     Captura — [nome do ativo]
Gatilho:           [evento que inicia o fluxo]
Etapas:            [número de mensagens]
Status:            Ativo
```

---

## Regras de Qualidade

1. **Menos campos = mais conversão** — nunca peça mais do que o necessário
2. **O CTA deve entregar o que promete** — se prometeu orçamento, o próximo passo é o orçamento
3. **Primeiro contato em até 5 minutos** — leads esfriam rápido
4. **Nunca usar "preencha o formulário" como CTA** — diga o benefício, não a ação
5. **Mensagem de confirmação não é agradecimento genérico** — reforce o que o lead vai receber e quando

---

## Regras v1.1

6. **Todo fluxo precisa de tracking minimo** — sem evento, nao ha aprendizado
7. **Captura fria nao pede compromisso grande** — primeiro entrega microvalor
8. **Handoff para venda e obrigatorio** — lead capturado sem contexto vira atendimento frio

---

## Regras v1.2

9. **Sequência de e-mail nunca substitui WhatsApp em intenção alta** — é nutrição de topo/meio de funil; no primeiro sinal de intenção alta (clique, resposta, pergunta de preço), rotear pra conversa humana.
10. **Não empilhar mais gatilhos manuais do que a operação aguenta** — se a sequência de e-mail não puder rodar quase 100% automática depois de configurada 1x, ela vira mais uma tela pra checar e é abandonada.

---

## Checkpoints

⏸ **CP1 — Fluxo aprovado**
Estrutura do fluxo de captura definida → aprovar lógica de qualificação e mensagens antes de gerar assets.

---

## Checklist antes de entregar

- [ ] O CTA comunica benefício, não ação?
- [ ] O formulário tem o mínimo de campos necessários?
- [ ] A mensagem de confirmação informa o próximo passo?
- [ ] O primeiro contato WhatsApp está personalizado com o nome do lead?
- [ ] O destino dos dados está definido e integrado?
- [ ] O fluxo foi registrado no `campaigns.md`?
- [ ] A temperatura do lead foi classificada?
- [ ] O evento principal de tracking foi definido?
- [ ] O handoff para venda esta claro?
- [ ] Funnel Metadata foi preenchido?
- [ ] O roteiro respeita máximo de 4 perguntas antes de valor percebido?
- [ ] Lead scoring separa fit de intenção?
- [ ] Existe rota para lead bom, lead frio, lead ruim e lead urgente?

---

## Exemplo de Ativação no Cursor

```
Use a skill-lead-capture.md.

Cliente: [slug]
Canal: [canal de captura]
Ativo: [o que o lead recebe]
Destino: [onde o lead vai parar]
Primeiro contato: [WhatsApp / E-mail / Manual]
```

---

*Skill v1.1 — MarketingOS*
