---
name: skill-reactivation
version: "1.1"
group: relacionamento
command: /relacionar reactivation
inputs:
  required: [client.md, notes.md]
  optional: [intelligence/repertoire-updaters/claude-skills.md, intelligence/repertoire-updaters/marketingskills.md]
env: []
---

# skill-reactivation.md — Reativação de Clientes Inativos
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: `client.md` + histórico de clientes inativos.

---

## Contexto mínimo necessário
→ client.md — Blocos 1 e 2 (negócio, ciclo de compra, perfil do cliente)
→ notes.md — histórico de inativos e tentativas anteriores
→ campaigns.md — fluxos de reativação já tentados
→ NÃO carregar: brand-kit.json, intelligence/, alma.md, estrategia.md, metrics.json

---

## Objetivo da Skill

Estruturar e executar campanhas de reativação de clientes que pararam de comprar ou responder, cobrindo:
- Identificação e segmentação de inativos
- Diagnóstico do motivo de inatividade
- Sequência de reativação por canal
- Oferta ou gancho de retorno
- Critério de encerramento (quando parar de tentar)

---

## Definição de Inativo

```
Inativo Recente:    sem compra ou contato há 30–60 dias
Inativo Médio:      sem compra ou contato há 60–120 dias
Inativo Longo:      sem compra ou contato há mais de 120 dias
Perdido:            sem resposta após sequência completa de reativação
```

Defina o corte de inatividade com base no ciclo de compra do `client.md`.
Para negócios de compra mensal, 45 dias já é inativo.
Para negócios de compra anual, o corte pode ser 6 meses.

---

## Input Esperado

```
1. Segmento de inativo  → [ Recente / Médio / Longo ]
2. Motivo provável      → [ Esquecimento / Preço / Concorrência / Insatisfação / Sem motivo aparente ]
3. Canal disponível     → [ WhatsApp / E-mail / Instagram DM / Todos ]
4. Oferta de retorno    → [ Desconto / Bônus / Conteúdo exclusivo / Novidade / Sem oferta ]
5. Histórico do cliente → [ Compras anteriores / Produto preferido / Última interação ]
```

---

## Diagnostico de Reativacao v1.1

Antes da mensagem, responder:

```text
Por que essa pessoa comprou antes?
O que provavelmente fez ela parar?
Qual valor ainda pode existir para ela?
O que mudou desde a ultima interacao?
Qual oferta seria ajuda real, nao desespero?
```

Score de reativacao:

```text
Valor historico:          0-2
Recencia:                 0-2
Motivo conhecido:         0-2
Canal valido:             0-1
Oferta relevante:         0-2
Risco de incomodo:        0-1 invertido
Total:                    0-10
```

Classificacao:

```text
8-10: contato humano personalizado
6-7: sequencia curta com valor
0-5: campanha leve ou arquivar
```

---

## Lógica de Segmentação

Antes de gerar qualquer mensagem, classifique os inativos:

```
Grupo A — Alto valor + Inativo Recente
  → Prioridade máxima
  → Abordagem personalizada
  → Contato humano antes de automação

Grupo B — Alto valor + Inativo Médio ou Longo
  → Prioridade alta
  → Sequência automatizada + contato humano no final

Grupo C — Baixo valor + Inativo Recente
  → Prioridade média
  → Sequência automatizada completa

Grupo D — Baixo valor + Inativo Longo
  → Prioridade baixa
  → 1 tentativa com oferta forte — se não responder, arquivar
```

---

## Formato de Output

---

### CAMPANHA DE REATIVAÇÃO — [Nome do Cliente]

**Segmento:** [ ]
**Canal principal:** [ ]
**Oferta de retorno:** [ ]
**Score de reativacao:** [0-10]
**Motivo provavel da inatividade:** [ ]
**O que mudou desde a ultima interacao:** [ ]

---

#### Mensagem de Abertura

> Regra: nunca abrir com "sumiu" ou "sentimos sua falta" — clichê que gera rejeição imediata.
> Abrir com valor, novidade ou referência ao histórico do cliente.

```
Canal: WhatsApp
Timing: início da sequência

[TEXTO DA MENSAGEM]

→ Tom: [ baseado no client.md ]
→ Personalização: [ nome + referência ao histórico se disponível ]
→ Sem pressão: não pedir compra na primeira mensagem
```

---

#### Mensagem 2 — Entrega de Valor

```
Canal: [ mesmo ou alternativo ]
Timing: 3 dias após mensagem 1 sem resposta

[TEXTO DA MENSAGEM]

→ Objetivo: entregar algo útil sem pedir nada em troca
→ Pode ser: dica, novidade, conteúdo, atualização do produto
→ Encerrar com pergunta aberta — não com CTA de compra
```

---

#### Mensagem 3 — Oferta ou Gancho

```
Canal: [ ]
Timing: 7 dias após mensagem 1 sem resposta

[TEXTO DA MENSAGEM]

→ Apresentar a oferta de retorno (se houver)
→ Criar senso de oportunidade sem pressão artificial
→ CTA claro e específico
```

---

#### Mensagem 4 — Última Tentativa

```
Canal: [ ]
Timing: 14 dias após mensagem 1 sem resposta

[TEXTO DA MENSAGEM]

→ Tom direto e honesto — sem drama
→ Deixar a porta aberta para o futuro
→ Não pedir desculpas, não pressionar
→ Se não responder após esta: mover para "Perdido" e arquivar
```

---

#### Sequência por Segmento

**Inativo Recente (30–60 dias)**
```
Dia 1:  Mensagem de abertura com referência ao histórico
Dia 4:  Entrega de valor
Dia 8:  Oferta ou novidade
Dia 15: Última tentativa
→ Se sem resposta: arquivar
```

**Inativo Médio (60–120 dias)**
```
Dia 1:  Mensagem de abertura com gancho forte
Dia 5:  Entrega de valor + pergunta sobre experiência anterior
Dia 10: Oferta de retorno
Dia 18: Última tentativa com tom de encerramento
→ Se sem resposta: arquivar
```

**Inativo Longo (120+ dias)**
```
Dia 1:  Mensagem única com oferta forte
→ Se sem resposta em 7 dias: arquivar
→ Não investir sequência longa em inativo longo sem histórico de valor
```

---

#### Oferta de Retorno (se aplicável)

```
Tipo de oferta:         [ Desconto / Bônus / Frete grátis / Acesso exclusivo / Novidade ]
Valor percebido:        [ ]
Condição:               [ ex: "válido até [data]" / "para os próximos X clientes" ]
Como apresentar:        [ naturalidade — não parecer desespero ]
Mensagem da oferta:     [TEXTO]
```

---

#### Critério de Encerramento

```
Encerrar a sequência quando:
  [ ] Cliente respondeu negativamente de forma clara
  [ ] Sequência completa sem nenhuma resposta
  [ ] Cliente pediu para não ser mais contatado

Ação após encerramento:
  → Registrar motivo no campaigns.md
  → Mover para lista "Perdidos" no CRM ou Supabase
  → Não deletar — pode ser reativado em campanha futura sazonal
```

---

#### Métricas da Campanha

```
Total de inativos abordados:    [ ]
Responderam:                    [ ] ([ ]%)
Reativados (voltaram a comprar): [ ] ([ ]%)
Custo da campanha:              R$ [ ]
Receita recuperada:             R$ [ ]
ROI da reativação:              [ ]x
```

---

## Regras de Qualidade

1. **Nunca abrir com "sentimos sua falta"** — é o maior clichê de reativação e gera rejeição
2. **Personalização real supera automação perfeita** — referência ao histórico vale mais que qualquer desconto
3. **Máximo 4 tentativas** — mais que isso é spam e queima o relacionamento
4. **Oferta só na mensagem 3** — entregar valor antes de pedir
5. **Inativo longo = 1 tentativa com oferta forte** — não gastar sequência em quem sumiu há muito tempo
6. **Registrar tudo no campaigns.md** — reativação bem documentada vira aprendizado para o sistema

---

## Regras v1.1

7. **Reconhecer contexto anterior** — reativacao sem memoria parece spam
8. **Oferta so vale se for relevante** — desconto sem diagnostico queima valor
9. **Arquivar tambem e cuidado** — insistir demais reduz chance futura

---

## Checkpoints

⏸ **CP1 — Mensagens aprovadas**
Mensagens de reativação geradas → aprovação obrigatória antes de qualquer envio.
Nunca enviar para inativos sem confirmação explícita de quem recebe e quando.

---

## Checklist antes de entregar

- [ ] Os inativos foram segmentados por tempo e valor?
- [ ] A abertura não usa clichê de reativação?
- [ ] A sequência entrega valor antes de apresentar oferta?
- [ ] O critério de encerramento está definido?
- [ ] As métricas da campanha estão estruturadas para rastreamento?
- [ ] O resultado será registrado no `campaigns.md`?
- [ ] Score de reativacao foi calculado?
- [ ] A mensagem reconhece historico real?
- [ ] O criterio de arquivamento esta claro?

---

## Exemplo de Ativação no Cursor

```
Use a skill-reactivation.md.

Cliente: [slug]
Segmento: [Recente / Médio / Longo]
Canal: [WhatsApp / E-mail / Ambos]
Oferta: [tipo de oferta ou "sem oferta"]
Histórico disponível: [Sim / Não]
```

---

*Skill v1.1 — MarketingOS*
