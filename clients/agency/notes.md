

## Estado Atual

Última leitura operacional:
[DATA]

Último workflow executado:
[workflow]

Última campanha alterada:
[campanha]

Último insight confirmado:
[insight]

---

# notes.md — [Nome do Cliente]
> Memória viva do projeto. Atualizado ao longo de toda a operação.
> Duas partes: diário operacional (o que aconteceu) + inteligência acumulada (o que foi aprendido).
> O Cursor lê este arquivo antes de qualquer operação para evitar repetir erros e aproveitar o que já funciona.

---

# PARTE 1 — DIÁRIO OPERACIONAL

> Registro cronológico de reuniões, decisões, ajustes e eventos relevantes.
> Entradas em ordem decrescente — mais recente no topo.
> Formato: `## [DATA] — [TÍTULO DA ENTRADA]`

---

## 2026-06-10 — Pitch Liliana Sierra — demo-sistema v2

**Contexto:** Sessão de refinamento do demo interativo `demo-sistema-liliana.html` antes da reunião de fechamento.

**O que foi feito:**
- Nova seção "O que acontece depois que você assina" inserida entre pricing e brinde — linha do tempo dia a dia (setup, WA, Calendar, conteúdo, site, cruzeiro)
- Nota transparente sobre o provider de WhatsApp API (~R$ 97–150/mês pago pela Liliana) — transformado em argumento de confiança
- Copy do pricing corrigida: removida a promessa "8–15 novos pedidos/mês a partir do dia 30" — substituída por ROI baseado em 2 sessões adicionais (dado real, controlável)
- Texto da lista de espera corrigido: "adiantar" → "agendar" (quem está na lista não tem sessão existente)
- IDs de seção renumerados (s8→s9→s10) após inserção

**Decisões tomadas:**
- Promessas específicas de volume de leads fora do demo — risco jurídico e de relacionamento
- Transparência sobre ferramentas de terceiros é posicionamento, não fraqueza
- ROI deve ser ancorado no que o cliente controla (preço da sessão), não no que o sistema promete

**Próximo passo:** Reunião de fechamento com Liliana. Se positivo → onboarding com skill-head-implantado + setup real do WA provider.

## 2026-06-05 — Prospecção Liliana Sierra

**Contexto:** Hipnoterapeuta (@lilianasierraoficial), 1.160 seguidores, última publicação há 58 semanas, agenda cheia por indicação.

**Decisão:** Ângulo de amplificação — "você já tem o mais difícil, o sistema garante que não para." Atacar a estrutura foi testado e rejeitado (agenda cheia = resultado → questionar isso fecha a conversa).

**O que foi feito:**
- Conversa WhatsApp iniciada → resposta positiva, pediu pitch formal
- Pitch gerado e publicado: https://demo-omega-amber-71.vercel.app
- Carrossel educativo de hipnoterapia gerado

**Próximo passo:** Aguardar retorno. Se positivo → onboarding com skill-venda ou skill-head-implantado.

## [DATA] — Instalação do cliente

- Ambiente criado via `create-client.js`
- `client.md` gerado — aguardando preenchimento
- Próximo passo: preencher os 10 blocos e executar `client-demo.md`

---

> ↑ Novas entradas sempre acima desta linha

---

### Como usar o diário

```
Registre sempre que:
  → Houver reunião ou alinhamento com o cliente
  → Uma decisão estratégica for tomada
  → Uma campanha for ajustada ou pausada
  → O cliente der feedback (positivo ou negativo)
  → Algo inesperado acontecer (bom ou ruim)
  → Uma skill gerar output que o cliente aprovou ou rejeitou

Formato sugerido por entrada:
  ## [DATA] — [TÍTULO]
  Participantes: (se reunião)
  Contexto: o que motivou esse registro
  Decisão / Evento: o que aconteceu
  Impacto: o que muda a partir disso
  Próximo passo: ação imediata derivada
```

---

# PARTE 2 — INTELIGÊNCIA ACUMULADA

> O que foi aprendido sobre este cliente ao longo do tempo.
> Atualizado conforme padrões emergem — não no dia a dia, mas quando algo se confirma.
> O Cursor prioriza esta seção para calibrar qualquer operação futura.

---

## O que funciona para este cliente

> Padrões confirmados que geram resultado. Só entra aqui o que foi testado e validado.

```
Conteúdo:
  →

Tom e linguagem:
  →

Canais com melhor retorno:
  →

Horários e frequência que performam melhor:
  →

Tipos de oferta que convertem:
  →

Formatos de CTA que funcionam:
  →
```

---

## O que não funciona

> O que foi testado e não gerou resultado — ou gerou rejeição do cliente ou do público.
> Fundamental para o Cursor não repetir o que já falhou.

```
Conteúdo que não engajou:
  →

Tom ou abordagem que o cliente rejeitou:
  →

Canais com baixo retorno para este perfil:
  →

Tipos de oferta que não converteram:
  →

Erros operacionais que não devem se repetir:
  →
```

---

## Comportamento do público

> Padrões observados no cliente ideal deste negócio.
> Baseado em dados reais de campanha, WhatsApp e engajamento.

```
Como reage a conteúdo educativo:
  →

Como reage a conteúdo de venda direta:
  →

Principal objeção observada na prática:
  →

Melhor momento de abordagem (dia / hora):
  →

Canal preferido de resposta:
  →

O que acelera a decisão de compra:
  →

O que trava a decisão de compra:
  →
```

---

## Sazonalidades e padrões de período

> Comportamentos que se repetem em épocas específicas do ano.

```
Meses fortes (histórico ou observado):
  →

Meses fracos:
  →

Datas relevantes para o negócio:
  →

Eventos externos que impactam a operação:
  →
```

---

## Feedbacks do cliente sobre o MarketingOS

> O que o cliente disse sobre as entregas, o sistema e a operação.
> Tanto positivo quanto negativo — sem filtro.

```
Aprovações explícitas:
  →

Críticas ou insatisfações:
  →

Pedidos recorrentes:
  →

Expectativas declaradas:
  →
```

---
## Hipóteses em validação

→ Conteúdo emocional pode performar melhor que produto puro
→ Reels curtos podem gerar mais leads
→ WhatsApp responde melhor no período da manhã
---
## Padrões de aprovação do cliente

→ Prefere headlines menos agressivas
→ Aprova posts mais minimalistas
→ Não gosta de excesso de emojis
→ Responde rápido no WhatsApp
→ Demora aprovações de vídeo
---
## Decisões estratégicas tomadas

> Escolhas importantes que definem a direção do projeto.
> Registradas aqui para que o Cursor entenda o raciocínio por trás de cada direção.

```
[DATA] → [Decisão] — Motivo: [por que foi tomada]
[DATA] → [Decisão] — Motivo: [por que foi tomada]
```

---

## Contexto informal relevante

> Informações que não cabem em nenhum bloco do `client.md` mas impactam a operação.
> Pode ser: cultura interna, relacionamento com o cliente, restrições não declaradas, nuances do setor.

```
→
→
→
```

---

*Criado em: ___________*
*Última atualização operacional: ___________*
*Última atualização de inteligência: ___________*
