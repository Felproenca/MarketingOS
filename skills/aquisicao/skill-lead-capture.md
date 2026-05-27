# skill-lead-capture.md — Captura de Leads
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: contexto do cliente via `client.md`.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2 e 4 (negócio, persona, tom)
→ campaigns.md — para registrar o fluxo criado
→ NÃO carregar: metrics.json, brand-kit.json, intelligence/, alma.md, notes.md, estrategia.md

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

### CAPTURA DE LEADS — [Nome do Cliente]

**Canal:** [ ]
**Ativo:** [ ]
**Destino:** [ ]

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

#### CONFIGURAÇÃO TÉCNICA

```
Ferramenta de formulário:   [ Typebot / Tally / Formulário próprio / Meta Lead Ads ]
Destino dos dados:          [ Supabase / Planilha / CRM / Webhook ]
Trigger de automação:       [ Envio do formulário / Clique no link / Resposta no WhatsApp ]
Notificação interna:        [ Sim / Não — canal: ___ ]
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

## Checklist antes de entregar

- [ ] O CTA comunica benefício, não ação?
- [ ] O formulário tem o mínimo de campos necessários?
- [ ] A mensagem de confirmação informa o próximo passo?
- [ ] O primeiro contato WhatsApp está personalizado com o nome do lead?
- [ ] O destino dos dados está definido e integrado?
- [ ] O fluxo foi registrado no `campaigns.md`?

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

*Skill v1.0 — MarketingOS*
