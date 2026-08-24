# Funnel Metadata Template

Use este bloco em todo output comercial.

```md
## Funnel Metadata

- Funnel stage:
- Intent level:
- Friction level:
- Expected lead signal:
- Qualification goal:
- Primary CTA:
- Secondary CTA:
- Routing destination:
- Next best action:
```

---

## Campos

```text
Funnel stage:
awareness | problem-aware | solution-aware | comparison | decision | retention | expansion

Intent level:
low | medium | high

Friction level:
0 | 1 | 2 | 3 | 4
```

---

## Extensão Instagram (obrigatória em peça do canal)

Quando a peça for post, carrossel, reel, story, live ou broadcast de Instagram,
preencher também (doutrina: `intelligence/doutrina-instagram-operacao.md`):

```md
## Instagram Channel Metadata

- Discovery channel: instagram (reel | carousel | post | story | live | broadcast)
- Conversion channel: whatsapp | dm | link | form | shop
- Trigger: [palavra-chave | reply | sticker | CTA verbal | link]
- First response asset: [o que o lead recebe em <60s]
- Origin tag: [código de atribuição, ex.: REEL-MAPA-0726]
- Response SLA: [hot lead <15 min no horário comercial | Hipótese: ...]
- Save / Share / DM motive: [qual dos três a peça foi desenhada para provocar]
- Private domain entry: [Broadcast | Close Friends | WA list | email | nenhum — com hipótese]
```

Regra: peça de descoberta sem motivo de SAVE/SHARE/DM e sem handoff → reprovar.

---

## Exemplo

```md
## Funnel Metadata

- Funnel stage: problem-aware
- Intent level: medium
- Friction level: 1
- Expected lead signal: comentar MAPA ou enviar site na DM
- Qualification goal: identificar nicho, principal gargalo e urgencia
- Primary CTA: comente MAPA para receber o checklist
- Secondary CTA: salve para comparar depois
- Routing destination: ManyChat -> WhatsApp com contexto
- Next best action: entregar checklist e perguntar onde o lead sente que perde venda

## Instagram Channel Metadata

- Discovery channel: instagram (carousel)
- Conversion channel: whatsapp
- Trigger: comente MAPA
- First response asset: checklist de gargalos de aquisicao (PDF/DM)
- Origin tag: CAR-MAPA-0726
- Response SLA: auto <60s; humano <15 min se pedir analise
- Save / Share / DM motive: SAVE (framework) + DM (keyword MAPA)
- Private domain entry: keyword -> lista de entrega + opcao de Broadcast
```

---

## Regra De Hipotese

Quando nao houver dado confirmado:

```text
Hipotese: lead ainda nao validado.
Hipotese: canal escolhido por compatibilidade, nao por performance confirmada.
Hipotese: CTA de baixa friccao recomendado por baixa maturidade do lead.
```
