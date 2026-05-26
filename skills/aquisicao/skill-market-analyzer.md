# skill-market-analyzer.md — Analisador de Mercado
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar.
> Topo do funil de prospecção — alimenta o skill-prospector.
> Usa web search nativo do Claude para dados em tempo real.

---

## Objetivo

Identificar mercados e nichos com maior potencial para o MarketingOS,
analisando crescimento, ticket médio, maturidade digital e oportunidade
de aquisição — e passar o nicho escolhido diretamente para o prospector.

---

## Posição no fluxo

```
/mercado
  → skill-market-analyzer    ← esta skill
  → rankeia nichos por oportunidade
  → usuário escolhe ou confirma
        ↓
/prospector [nicho escolhido]
  → skill-prospector
```

---

## Modos de operação

```
Modo A — Descoberta livre
  Comando: /mercado
  Sistema busca nichos em crescimento sem direcionamento
  Ideal para: expandir carteira, encontrar novos mercados

Modo B — Nicho informado
  Comando: /mercado nicho: [nicho]
  Sistema analisa profundamente o nicho informado
  Ideal para: validar uma aposta antes de prospectar

Modo C — Região específica
  Comando: /mercado nicho: [nicho] região: [cidade/estado]
  Sistema foca na oportunidade local
  Ideal para: prospecção geolocalizada
```

---

## Input esperado

```
1. Modo de operação     → detectado automaticamente pelo comando
2. Nicho (se informado) → fornecido no comando ou vindo do histórico
3. Região (opcional)    → Brasil por padrão, cidade/estado se informado
4. client.md ativo      → para cruzar com o perfil de cliente ideal
5. intelligence/benchmarks.json → para comparar com o que já foi operado
```

---

## Lógica de análise

Para cada nicho analisado, responder:

```
CRESCIMENTO
  → O setor está crescendo, estável ou em declínio?
  → Quais dados ou sinais indicam isso?
  → Horizonte: 6 meses, 1 ano, 3 anos

MATURIDADE DIGITAL
  → O nicho já usa marketing digital ou ainda é analógico?
  → Qual o nível médio de presença digital dos players?
  → Quanto espaço existe para diferenciação?
  → (Quanto mais analógico, maior a oportunidade)

TICKET MÉDIO
  → Qual o valor médio de venda no nicho?
  → Qual o potencial de recorrência?
  → Quanto esse cliente consegue pagar por marketing?

PERFIL DO DECISOR
  → Quem decide a contratação de marketing nesse negócio?
  → Como esse decisor se informa e toma decisões?
  → Qual a maior dor que ele tem com marketing hoje?

CONCORRÊNCIA NO SERVIÇO
  → Quantas agências/profissionais já atendem esse nicho?
  → Qual o nível de qualidade do que já existe?
  → Existe espaço para um player com sistema integrado?

SUBNICHOS
  → Quais são os segmentos dentro do nicho principal?
  → Algum subniche tem oportunidade específica?
  → Qual o mais acessível para uma operação inicial?

SAZONALIDADE
  → O nicho tem picos e vales ao longo do ano?
  → Quando é o melhor momento para entrar?
```

---

## Formato de output

---

### ANÁLISE DE MERCADO
**Data:** [ ]
**Modo:** [ Descoberta / Nicho informado / Regional ]
**Região:** [ Brasil / Estado / Cidade ]

---

#### Ranking de oportunidades

| # | Nicho | Crescimento | Maturidade digital | Ticket médio | Score |
|---|---|---|---|---|---|
| 1 | [ ] | [ ] | [ Baixa/Média/Alta ] | R$ [ ] | [ /10 ] |
| 2 | [ ] | [ ] | [ ] | R$ [ ] | [ /10 ] |
| 3 | [ ] | [ ] | [ ] | R$ [ ] | [ /10 ] |

> Score = combinação de crescimento + oportunidade digital + ticket médio
> Maturidade digital baixa = maior oportunidade para o MarketingOS

---

#### Análise detalhada — [Nicho #1]

```
Crescimento:
→ [dados e sinais observados]

Maturidade digital:
→ [como o nicho usa marketing hoje]
→ [o que falta e onde está a oportunidade]

Ticket médio:
→ [faixa de valor + potencial de recorrência]

Perfil do decisor:
→ [quem é, como decide, qual a dor principal]

Concorrência no serviço:
→ [quem já atende esse nicho e como]

Subnichos identificados:
→ [lista com potencial de cada um]

Sazonalidade:
→ [picos, vales, melhor momento de entrada]

Alavancagem principal:
→ [o que o MarketingOS entregaria que ninguém entrega hoje nesse nicho]
```

---

#### Recomendação estratégica

```
Nicho prioritário:     [ ]
Motivo:                [ por que esse e não os outros ]
Subniche de entrada:   [ o mais acessível para começar ]
Abordagem recomendada: [ como chegar nesse cliente ]
Próximo passo:         /prospector nicho: [nicho] região: [região]
```

---

#### Salvar em intelligence/

```
Atualizar: intelligence/market-opportunities.md
  → adicionar nicho analisado com score e data
  → registrar oportunidade identificada

Atualizar: intelligence/benchmarks.json
  → adicionar ou atualizar bloco do nicho com:
     ticket médio, maturidade digital, perfil do decisor
```

---

#### Passagem para o prospector

Ao final, perguntar:

```
"Quer prospectar no nicho [nicho escolhido] agora?"

Se sim:
→ Passar contexto completo para skill-prospector
→ Comando: /prospector nicho: [nicho] região: [região]

Se não:
→ Salvar análise e aguardar próximo comando
```

---

## Regras de qualidade

1. **Dados antes de opinião** — toda afirmação tem base em dado ou sinal observável
2. **Maturidade digital baixa é oportunidade, não problema** — sinalizar como vantagem
3. **Ticket médio define viabilidade** — nicho com ticket baixo pode não sustentar o serviço
4. **Subniche é mais acionável que nicho amplo** — sempre detalhar
5. **Sempre terminar com passagem para o prospector** — análise sem ação é desperdício
6. **Salvar em intelligence/** — cada análise melhora o sistema

---

## Checklist antes de entregar

- [ ] Pelo menos 3 nichos foram analisados e rankeados?
- [ ] Cada nicho tem score justificado?
- [ ] A maturidade digital foi avaliada?
- [ ] O perfil do decisor foi descrito?
- [ ] A recomendação estratégica é específica e acionável?
- [ ] Foi oferecida a passagem para o prospector?
- [ ] intelligence/ foi atualizado?

---

## Exemplo de ativação

```
/mercado
/mercado nicho: clínicas de estética
/mercado nicho: escritórios de advocacia região: Rio de Janeiro
```

---

*Skill v1.0 — MarketingOS*
*Topo do funil de prospecção — sempre seguida de skill-prospector*
