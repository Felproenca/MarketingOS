---
name: skill-offer-positioning
version: "1.1"
group: aquisicao
command: /prospectar oferta
inputs:
  required: [client.md, alma.md]
  optional: [intelligence/repertoire-updaters/acquisition.md]
env: []
---

# skill-offer-positioning.md — Posicionamento de Oferta
> Skill isolada do MarketingOS.
> Leia este arquivo completo antes de executar qualquer operação.
> Input obrigatório: `client.md` com Blocos 1, 2, 3 e 4 preenchidos.

---

## Contexto mínimo necessário
→ client.md — Blocos 1, 2, 3 e 4 (negócio, persona, concorrência, tom)
→ alma.md — filtros de autenticidade (o que não é verdadeiro não sai)
→ intelligence/benchmarks.json — APENAS `offer_benchmarks` (cta_performance, discount_vs_value) para escolher CTA e ângulo de oferta com o que já converteu
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, notes.md, estrategia.md, system-usage.json, experiments.md

> Se `offer_benchmarks` tiver dados reais (≠ 0/vazio), deixar o CTA e o tipo de
> oferta (desconto vs. valor) seguirem o que converteu. Se zerado, decidir pela
> lógica da oferta — não fabricar número.

---

## Objetivo da Skill

Estruturar e comunicar a oferta principal do cliente de forma que ela seja:
- Irresistível para o cliente ideal
- Diferenciada da concorrência
- Clara o suficiente para converter sem precisar de explicação adicional
- Adaptável para diferentes canais (site, ads, WhatsApp, Instagram)

---

## Input Esperado

```
1. Produto ou serviço   → extraído do client.md Bloco 1
2. Público-alvo         → extraído do client.md Bloco 2
3. Principal concorrente→ extraído do client.md Bloco 3
4. Tom da marca         → extraído do client.md Bloco 4
5. Ticket médio         → extraído do client.md Bloco 1
6. Objeção principal    → extraído do client.md Bloco 2
7. Canal de destino     → [ Site / Ads / WhatsApp / Instagram / Todos ]
```

---

## Lógica de Construção da Oferta

Antes de gerar qualquer copy, responda internamente:

```
1. O que o cliente compra de verdade?
   → Não o produto — o resultado, a transformação, o sentimento
   → Ex: não "consultoria jurídica" mas "dormir tranquilo sabendo que está protegido"

2. Por que ele compraria agora e não depois?
   → Qual é o custo da inação?
   → Existe urgência real ou percebida?

3. Por que compraria de você e não do concorrente?
   → Diferencial real, não genérico
   → "Atendimento personalizado" não é diferencial — especifique

4. Qual é a maior objeção e como a oferta a dissolve?
   → A oferta deve antecipar e responder a objeção antes de ela ser dita

5. O que torna essa oferta óbvia de aceitar?
   → Redução de risco: garantia, sem compromisso, trial, resultado antes do pagamento
```

---

## Estrutura da Oferta

---

## Camada de Aquisicao v1.1

Antes de escrever a oferta para prospeccao, transformar o contexto em uma cadeia comercial:

```text
Sinal observado:
-> O que vimos no site, perfil, anuncio, oferta, funil ou atendimento.

Medo ativado:
-> O que o prospect teme perder se continuar igual.

Desejo ativado:
-> O que ele quer conquistar, dominar ou destravar.

Diagnostico:
-> O que parece estar impedindo esse resultado.

Promessa de proximo passo:
-> O que podemos mostrar, diagnosticar ou construir sem pedir uma decisao grande demais.

Prova:
-> Dado, benchmark, comparacao, demo, case, print, auditoria ou observacao concreta.
```

Regra: em aquisicao fria, a primeira oferta quase nunca e "compre".
A primeira oferta e uma decisao pequena:

```text
ver um diagnostico
receber 2 pontos de melhoria
comparar com concorrentes
ver uma demo personalizada
entender onde esta vazando cliente
```

So depois disso a oferta comercial entra.

---

## Escada de Oferta para Aquisicao

```text
Degrau 1 - Gancho de diagnostico
Objetivo: conseguir resposta.
Ex: "Quer que eu te mande os 2 pontos que mais podem estar travando conversao?"

Degrau 2 - Microvalor
Objetivo: provar leitura e competencia.
Ex: mini-auditoria, comparacao, print comentado, demo simples.

Degrau 3 - Conversa
Objetivo: entender contexto real antes de propor.
Ex: chamada curta, audio, WhatsApp, reuniao de diagnostico.

Degrau 4 - Oferta principal
Objetivo: apresentar o sistema no contexto do gargalo confirmado.
Ex: diagnostico de aquisicao (30 dias) -> implementacao do gargalo encontrado (60 dias).
O sistema se adapta ao gargalo, nao o contrario (virada-aquisicao.md).
```

Promessa central da oferta (nunca "melhorar seu marketing"):
"Descobrir por que sua aquisicao e imprevisivel — e construir o sistema que reduz isso."

O diagnostico de 30 dias e vendido como o primeiro ato da correcao —
cada semana entrega algo que ja muda a operacao do cliente.
Nunca como "pagar para ser analisado".

Toda adaptacao por canal deve indicar em qual degrau esta.

---

### POSICIONAMENTO DA OFERTA — [Nome do Cliente]

---

#### A Transformação Central

```
Antes:   [como o cliente ideal se sente / qual problema enfrenta antes da oferta]
Depois:  [como ele se sente / qual resultado tem depois da oferta]
Ponte:   [o que a oferta faz para levar do antes ao depois]
```

---

#### A Oferta em Uma Frase

> Fórmula: [Resultado desejado] + [Prazo ou especificidade] + [Sem/Com + redução de risco]

```
Versão 1 (direta):
→ [TEXTO]

Versão 2 (emocional):
→ [TEXTO]

Versão 3 (autoridade):
→ [TEXTO]
```

---

#### Componentes da Oferta

```
Entrega principal:
→ O que o cliente recebe de forma tangível
→ [DESCRIÇÃO — específica, não genérica]

Bônus ou diferenciais (se houver):
→ [item 1 + valor percebido]
→ [item 2 + valor percebido]

Garantia ou redução de risco:
→ [o que elimina o medo de comprar errado]

Condição ou urgência (se aplicável):
→ [limite real de vagas, prazo, condição especial]

Preço ou âncora de valor:
→ [como apresentar o preço sem que pareça caro]
```

---

#### Argumentação contra a Objeção Principal

```
Objeção:        [a mais comum extraída do client.md]
Resposta direta: [como a oferta dissolve essa objeção]
Prova:          [dado, depoimento ou garantia que suporta a resposta]

Copy da resposta para uso em ads ou WhatsApp:
→ [TEXTO — natural, não defensivo]
```

---

#### Adaptação por Canal

**Site / Landing Page**
```
Headline (H1):
→ [TEXTO — promessa clara em até 10 palavras]

Subheadline:
→ [TEXTO — expande a promessa e qualifica o público]

CTA principal:
→ [TEXTO do botão]

Elemento de redução de risco abaixo do CTA:
→ [TEXTO — ex: "Sem compromisso. Resposta em até 2h."]
```

**Meta Ads**
```
Headline do anúncio:
→ [TEXTO — até 40 caracteres]

Texto principal (copy do ad):
→ [TEXTO — gancho + benefício + CTA em até 5 linhas]

CTA do botão:
→ [ Saiba mais / Fale conosco / Comprar / Ver oferta ]
```

**WhatsApp (abordagem ativa)**
```
Abertura:
→ [TEXTO — apresenta sem vender na primeira linha]

Apresentação da oferta:
→ [TEXTO — direto, sem enrolação]

CTA:
→ [TEXTO — próximo passo claro e específico]
```

**Instagram (legenda de post ou stories)**
```
Gancho (primeira linha):
→ [TEXTO — para o scroll]

Corpo:
→ [TEXTO — desenvolve a oferta em 3 a 5 linhas]

CTA:
→ [TEXTO — específico para o formato]
```

---

#### Teste de Clareza da Oferta

Aplique estes filtros antes de aprovar:

```
Filtro 1 — Teste do leigo
  → Alguém fora do setor entende o que está sendo oferecido em 5 segundos?
  → [ Sim / Não — reescrever se não ]

Filtro 2 — Teste do diferencial
  → O concorrente principal poderia usar essa mesma copy?
  → [ Sim — não está diferenciado o suficiente / Não — aprovado ]

Filtro 3 — Teste da objeção
  → A maior objeção do público está respondida antes de ser perguntada?
  → [ Sim / Não — adicionar elemento de redução de risco ]

Filtro 4 — Teste do CTA
  → O próximo passo é óbvio e fácil?
  → [ Sim / Não — simplificar o CTA ]
```

---

#### Variações para Teste A/B

```
Variação A — foco no resultado:
  Headline: [TEXTO]
  CTA: [TEXTO]

Variação B — foco na redução de risco:
  Headline: [TEXTO]
  CTA: [TEXTO]

Variação C — foco no diferencial:
  Headline: [TEXTO]
  CTA: [TEXTO]

Critério de vitória: maior taxa de conversão em 7 dias
Registrar resultado em: campaigns.md → Testes A/B
```

---

## Regras de Qualidade

1. **A oferta comunica transformação, não produto** — o cliente compra o depois, não o durante
2. **Diferencial genérico é inexistente** — "qualidade e atendimento" não diferencia ninguém
3. **Objeção não respondida é venda perdida** — antecipar é mais eficiente que rebater
4. **Menos é mais no CTA** — um próximo passo claro converte mais que múltiplas opções
5. **Redução de risco sempre que o ticket for alto** — garantia, trial ou resultado parcial antes do pagamento
6. **Testar pelo menos 2 variações** — nunca lançar com uma única versão de headline

---

## Checkpoints

⏸ **CP1 — Posicionamento aprovado**
Posicionamento de oferta gerado → aprovar antes de gerar copy de abordagem.
Mudança de posicionamento aqui requer reescrita do copy.

---

## Checklist antes de entregar

- [ ] A transformação central está descrita (antes / depois / ponte)?
- [ ] A oferta em uma frase está clara sem precisar de contexto adicional?
- [ ] Os componentes da oferta estão todos preenchidos?
- [ ] A objeção principal foi respondida com prova?
- [ ] A copy foi adaptada para todos os canais relevantes?
- [ ] Os 4 filtros de clareza foram aplicados?
- [ ] Pelo menos 2 variações para teste A/B foram geradas?
- [ ] Se for aquisicao fria, o sinal observado esta explicito?
- [ ] O primeiro proximo passo e pequeno o suficiente para gerar resposta?
- [ ] Existe prova, diagnostico ou microvalor antes da oferta principal?

---

## Exemplo de Ativação no Cursor

```
Use a skill-offer-positioning.md.

Cliente: [slug]
Canal de destino: [Site / Ads / WhatsApp / Instagram / Todos]
Foco: [Resultado / Redução de risco / Diferencial]
```

---

*Skill v1.0 — MarketingOS*
