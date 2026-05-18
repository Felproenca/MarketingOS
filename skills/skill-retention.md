# skill-retention.md — Retenção de Clientes
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: `client.md` + histórico de clientes (se disponível).

---

## Objetivo da Skill

Estruturar e gerar o sistema de retenção de clientes ativos, cobrindo:
- Mapeamento do ciclo de vida do cliente
- Pontos de contato pós-venda
- Sequências de relacionamento e valor contínuo
- Identificação de clientes em risco de churn
- Ações para aumentar LTV (valor do cliente ao longo do tempo)

---

## Input Esperado

```
1. Modelo de negócio     → [ Recorrente / Pontual / Por projeto ]
2. Ciclo médio de compra → [ semanal / mensal / trimestral / anual / único ]
3. Canais de contato     → [ WhatsApp / E-mail / Instagram / Todos ]
4. Histórico disponível  → [ Sim — descrever / Não ]
5. Principal risco       → [ Esquecimento / Preço / Concorrência / Insatisfação ]
```

---

## Mapa do Ciclo de Vida do Cliente

```
NOVO CLIENTE
  → Primeiras 24h após compra
  → Primeiros 7 dias
  → Primeiro mês

CLIENTE ATIVO
  → Engajamento contínuo
  → Upsell / Cross-sell
  → Programa de indicação

CLIENTE EM RISCO
  → Sinais de churn
  → Ação preventiva

CLIENTE INATIVO
  → Passa para skill-reactivation.md
```

---

## Formato de Output

---

### PLANO DE RETENÇÃO — [Nome do Cliente]

---

#### Sequência Pós-Venda Imediata

```
Contato 1 — imediato após compra (até 2h):
Canal: [ WhatsApp / E-mail ]
Objetivo: confirmar, agradecer, gerar segurança
Mensagem:
→ [TEXTO — personalizado, sem parecer automático]

Contato 2 — 3 dias após compra:
Canal: [ ]
Objetivo: verificar experiência inicial
Mensagem:
→ [TEXTO]

Contato 3 — 7 dias após compra:
Canal: [ ]
Objetivo: entregar valor adicional / dica / conteúdo relevante
Mensagem:
→ [TEXTO]
```

---

#### Cadência de Relacionamento Contínuo

```
Frequência recomendada: [ semanal / quinzenal / mensal ]

Tipo de conteúdo por contato:
  Semana 1: [ ]
  Semana 2: [ ]
  Semana 3: [ ]
  Semana 4: [ ]

Canais a usar: [ ]
Tom: [ baseado no client.md ]
```

---

#### Programa de Indicação

```
Existe programa de indicação? [ Sim / Não / A criar ]

Estrutura sugerida:
  Gatilho:      [ quando o cliente indica? ]
  Benefício:    [ o que o cliente que indica recebe? ]
  Benefício 2:  [ o que o indicado recebe? ]
  Comunicação:  [ como o cliente fica sabendo do programa? ]
  Registro:     [ como rastrear indicações? ]
```

---

#### Oportunidades de Upsell / Cross-sell

```
Com base no produto/serviço principal do client.md:

Upsell (versão maior / mais completa):
→ [ produto ou serviço + momento ideal para oferecer ]

Cross-sell (produto complementar):
→ [ produto ou serviço + momento ideal para oferecer ]

Gatilho de oferta:
→ [ quando e como abordar sem parecer agressivo ]

Mensagem de oferta:
→ [TEXTO — contextualizado, baseado no histórico do cliente]
```

---

#### Sinais de Churn (Cliente em Risco)

```
Indicadores de alerta:
  [ ] Sem compra há [ X ] dias/meses
  [ ] Sem resposta nas últimas [ X ] mensagens
  [ ] Reclamação registrada sem resolução
  [ ] Redução no ticket médio
  [ ] Cancelamento de serviço recorrente

Ação ao detectar sinal:
  → Contato humano prioritário (não automático)
  → Oferta de valor ou solução antes de desconto
  → Registro no campaigns.md
```

---

#### Métricas de Retenção a Acompanhar

```
Taxa de recompra:           [ ]% — meta: [ ]%
Churn mensal:               [ ]% — meta abaixo de: [ ]%
LTV médio:                  R$ [ ]
NPS (se coletado):          [ ]
Tempo médio de retenção:    [ ] meses
```

---

## Regras de Qualidade

1. **Pós-venda começa em até 2h** — janela de encantamento ou decepção
2. **Relacionamento não é spam** — frequência alta sem valor gera cancelamento
3. **Upsell só após entrega de valor comprovada** — nunca na primeira semana
4. **Churn é mais barato de prevenir do que reverter** — monitorar sinais antes de perder
5. **Indicação é o canal de menor CPL** — estruturar antes de escalar tráfego pago
6. **Nunca automatizar o contato de alerta de churn** — deve ser humano e personalizado

---

## Checklist antes de entregar

- [ ] A sequência pós-venda imediata cobre os primeiros 7 dias?
- [ ] A cadência de relacionamento tem frequência e tipo de conteúdo definidos?
- [ ] Oportunidades de upsell e cross-sell foram identificadas?
- [ ] Os sinais de churn estão definidos com ação correspondente?
- [ ] As métricas de retenção estão definidas com metas?
- [ ] O programa de indicação foi estruturado ou avaliado?

---

## Exemplo de Ativação no Cursor

```
Use a skill-retention.md.

Cliente: [slug]
Modelo de negócio: [recorrente / pontual / projeto]
Ciclo de compra: [frequência]
Principal risco de churn: [motivo]
Canais disponíveis: [WhatsApp / E-mail / Ambos]
```

---

*Skill v1.0 — MarketingOS*
