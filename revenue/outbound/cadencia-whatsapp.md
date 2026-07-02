# Cadencia WhatsApp alinhada ao Prospector

## Objetivo

Usar WhatsApp como fluxo de trabalho cadenciado, nao como disparo bruto. O prospector precisa classificar lead, dor, nicho e estagio para escolher a proxima mensagem.

## Estados do funil

```text
discovered
qualified
pending_approval
sent
replied
diagnostic_offered
diagnostic_paid
campaign_offered
closed
dead
followup_1
followup_2
```

## Campos que o prospector precisa salvar

- segment
- city
- score
- main_problem
- observed_detail
- offer_angle
- preferred_channel
- whatsapp
- instagram
- last_message
- next_step
- next_action_at

## Cadencia recomendada

### Dia 0 - Primeiro contato

Objetivo: resposta, nao venda.

```text
Oi! Vi o perfil de voces e notei [observacao especifica].

Isso normalmente faz o pessoal gostar do conteudo, mas nao necessariamente chamar no WhatsApp.

Isso acontece por ai tambem?
```

### Se respondeu

Objetivo: permissao para enviar ideia.

```text
Faz sentido. Eu montei um modelo simples de campanha de 7 dias para transformar conteudo em conversa de orcamento.

Posso te mandar uma ideia aplicada ao perfil de voces?
```

### Depois da permissao

Objetivo: entregar valor e abrir oferta.

```text
Olhando rapido, eu testaria:

1. [ajuste de bio/oferta]
2. [conteudo de dor/prova]
3. [CTA especifico para WhatsApp]

Tenho um kit pronto com essa estrutura por R$37. Se quiser algo personalizado, faco o Diagnostico Express por R$197 e te entrego em 24h.

Quer ver o kit ou prefere a analise personalizada?
```

### D+2 sem resposta

```text
Oi! So trazendo isso para cima.

A ideia era te mostrar um jeito simples de transformar o conteudo que voces ja fazem em mais conversas no WhatsApp. Quer que eu te mande o modelo?
```

### D+5 sem resposta

```text
Prometo que e a ultima vez que apareco por aqui.

Se fizer sentido ver o modelo de captacao de 7 dias, me responde com KIT. Se nao for prioridade agora, tudo certo tambem.
```

## Regras anti-caos

- Nunca mandar link no primeiro contato.
- Nunca mandar mais de 2 follow-ups sem resposta.
- Nunca vender antes da pessoa responder.
- Sempre ancorar em detalhe real do perfil.
- Registrar resposta e proximo passo no pipeline.
- High-touch para leads com score alto ou ticket potencial alto.

## Ajuste tecnico sugerido

O `message-builder` deve gerar:

```json
{
  "first_touch": "...",
  "observed_detail": "...",
  "main_problem": "...",
  "offer_angle": "bio|oferta|conteudo|whatsapp|prova",
  "reply_next": "...",
  "kit_pitch": "...",
  "diagnostic_pitch": "..."
}
```

Assim o painel deixa de mostrar apenas mensagem e passa a mostrar uma mini-estrategia por lead.
