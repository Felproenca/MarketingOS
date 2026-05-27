# skill-venda.md — Venda
> Skill do grupo: Venda
> Carregada quando o lead está na mão e precisa virar cliente.
> Marketing aqueceu. Agora é hora de fechar.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2 e 4 (negócio, persona, tom)
→ notes.md — histórico do lead: origem, objeções e estágio
→ alma.md — autenticidade como postura de venda
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, estrategia.md, intelligence/

---

## Propósito

Marketing cria contexto e desejo.
Venda cria decisão.

Esta skill estrutura o que dizer, como dizer e quando dizer
para transformar interesse em compromisso.

---

## Input obrigatório

```
client.md do cliente ativo
Contexto do lead:
  → De onde veio (Instagram, WhatsApp, indicação, pitch deck)
  → O que já sabe sobre o serviço
  → Qual objeção apareceu ou pode aparecer
  → Em qual estágio está (frio, morno, quente)
```

---

## Os estágios da venda

```
ESTÁGIO 1 — ABERTURA
  O lead acabou de entrar em contato.
  Objetivo: qualificar e criar conexão.
  Não: apresentar preço ou serviço ainda.

ESTÁGIO 2 — DIAGNÓSTICO
  Entender o problema real antes de oferecer solução.
  Objetivo: o lead sentir que você entendeu antes de qualquer um.
  Não: falar mais do que ouvir.

ESTÁGIO 3 — APRESENTAÇÃO
  Mostrar a solução no contexto do problema do lead.
  Objetivo: o lead ver o resultado, não o serviço.
  Não: listar features, listar entregas.

ESTÁGIO 4 — OBJEÇÃO
  O lead resiste. Preço, timing, desconfiança.
  Objetivo: dissolver sem pressionar.
  Não: rebater. Nunca rebater. Entender e reposicionar.

ESTÁGIO 5 — FECHAMENTO
  O lead está pronto.
  Objetivo: facilitar a decisão, não empurrar.
  Não: dar desconto para fechar. Isso sinaliza que o preço era errado.
```

---

## Formato de output

---

### PLANO DE VENDA — [Nome do Lead / Empresa]

**Estágio atual:** [ Abertura / Diagnóstico / Apresentação / Objeção / Fechamento ]
**Origem do lead:** [ ]
**O que já sabe:** [ ]
**Objeção identificada ou provável:** [ ]

---

#### Mensagem para o estágio atual

```
Canal: [ WhatsApp / Reunião / E-mail ]

[TEXTO PRONTO — específico para esse lead, não genérico]

Objetivo desta mensagem: [ ]
Próximo passo esperado:  [ ]
```

---

#### Se houver objeção — como responder

```
Objeção:          [ ]
O que está por trás dela: [ o medo real, não a objeção declarada ]
Como responder:   [ ]
O que não dizer:  [ ]

Mensagem de resposta:
→ [TEXTO — dissolve sem pressionar]
```

---

#### Script de reunião (se aplicável)

```
Abertura (2 min):
→ [Como começar — contexto, não apresentação]

Diagnóstico (10 min):
→ Perguntas a fazer:
   1. [pergunta que revela o problema real]
   2. [pergunta que revela o custo do problema]
   3. [pergunta que revela o que já tentaram]

Apresentação (10 min):
→ [Como conectar o serviço ao problema específico desse lead]
→ Não listar o que inclui — mostrar o resultado que terão

Fechamento (5 min):
→ [Como propor o próximo passo sem pressão]
→ Pergunta de fechamento: [uma pergunta, não um pitch]
```

---

#### Proposta (se pedida)

```
Formato:    Apresentação HTML (skill-pitch-deck) ou mensagem direta
Plano sugerido: [ Essencial / Head Implantado / Performance ]
Justificativa:  [ por que esse plano para esse lead ]

Não enviar proposta antes de diagnóstico.
Proposta sem diagnóstico é tiro no escuro.
```

---

## As objeções mais comuns e como dissolvê-las

```
"Está caro"
→ Por trás: incerteza sobre retorno
→ Resposta: reposicionar no valor, não no preço
→ "Faz sentido. Me conta — qual resultado você precisaria ver
   em 90 dias para esse investimento fazer sentido?"

"Preciso pensar"
→ Por trás: falta de urgência ou medo de decidir errado
→ Resposta: identificar o que falta para decidir
→ "Claro. O que você precisaria saber ou ver para se sentir
   confortável em avançar?"

"Já tentei agência antes e não funcionou"
→ Por trás: desconfiança legítima baseada em experiência real
→ Resposta: validar a experiência, diferenciar o modelo
→ "Faz todo sentido a desconfiança. Me conta o que aconteceu —
   quero entender para garantir que não vamos repetir o mesmo erro."

"Não tenho tempo para acompanhar"
→ Por trás: medo de mais uma coisa para gerenciar
→ Resposta: mostrar que o sistema trabalha por eles
→ "É exatamente por isso que o modelo existe. Você aprova,
   eu opero. Quanto tempo você tem disponível por semana?"
```

---

## Regras

1. **Nunca apresentar preço antes de diagnóstico**
2. **Nunca dar desconto para fechar** — renegocia prazo, não preço
3. **O lead fala mais do que você** — especialmente no diagnóstico
4. **Objeção é sinal de interesse** — quem não quer, some. Quem objeta, considera.
5. **Uma pergunta por vez** — não ametralhar o lead com perguntas
6. **Próximo passo sempre definido** — toda conversa termina com uma ação clara

---

## Checklist antes de entregar

- [ ] O estágio do lead está correto?
- [ ] A mensagem é específica para esse lead?
- [ ] Se há objeção, a resposta dissolve sem pressionar?
- [ ] O script de reunião tem mais perguntas do que afirmações?
- [ ] O próximo passo está definido?

---

## Exemplo de ativação

```
/vender
  lead: pontos-cardeais
  estágio: objeção
  objeção: "está caro, preciso pensar"

/vender
  lead: shana-joias
  estágio: fechamento
  contexto: reunião amanhã às 14h
```

---

*Skill v1.0 — MarketingOS*
*Grupo: Venda*
*Marketing aquece. Esta skill fecha.*
