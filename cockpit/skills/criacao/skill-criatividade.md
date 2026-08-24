---
name: skill-criatividade
version: "1.0"
group: criacao
command: /criar (obrigatória antes de qualquer criação sem mapa)
inputs:
  required: [manifesto.md, alma.md, client.md]
  optional: [notes.md]
env: []
---

# skill-criatividade.md — Criatividade
> Skill do grupo: Criação
> Lida antes de qualquer execução de conteúdo.
> Não gera conteúdo. Encontra o que deve ser dito.

---

## Gatilho de ativação

```
CONTEXTO 1 — Sem mapa criativo
  Condição: notes.md não tem mapa criativo aprovado para este cliente
  Ação: executar skill-criatividade antes de qualquer skill de conteúdo

CONTEXTO 1B — Nicho identificado mas sem profundidade
  Condição: client.md tem nicho preenchido mas
  não há análise de ângulo ou maturidade de tema
  Ação: executar skill-niche-intelligence ANTES
  de executar o mapa criativo completo
  O mapa de nicho alimenta as perguntas centrais
```

---

## Contexto mínimo necessário
→ manifesto.md — norte filosófico (obrigatório)
→ alma.md — missão, visão e filtros de criação (obrigatório)
→ client.md — Blocos 1, 2 e 4 (negócio, persona, tom)
→ notes.md — inteligência acumulada e histórico criativo
→ intelligence/patterns.md — padrões cross-client já validados (calibra a verdade humana com o que conecta)
→ intelligence/benchmarks.json — APENAS a seção do nicho ativo (insights e ângulos que já funcionaram nesse nicho)
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json, estrategia.md, system-usage.json, experiments.md

> A skill consulta o que já foi aprendido — mas não copia. Insight passado calibra
> a escavação; nunca substitui a busca pela verdade humana deste cliente.

---

## Propósito

Antes de criar qualquer post, carrossel, site ou campanha —
existe uma pergunta mais importante:

**Qual a verdade humana por trás desse negócio?**

Sem essa resposta, qualquer conteúdo é ruído.
Com ela, qualquer conteúdo é conexão.

---

## O que esta skill faz

Escava. Não executa.

Encontra o que já existe dentro do negócio do cliente
que ainda não foi dito da forma certa —
ou que nunca foi dito.

---

## Input obrigatório

```
client.md do cliente ativo — completo
notes.md — seção de inteligência acumulada
Qualquer conteúdo que o cliente já produziu (se disponível)
```

---

## As perguntas centrais

Execute internamente antes de gerar qualquer output:

```
1. VERDADE
   Se esse negócio desaparecesse amanhã,
   quem sentiria falta — e por quê?
   → A resposta é o que o negócio realmente entrega.

2. PROTAGONISTA
   Quem é o herói da história desse negócio?
   → Nunca é a empresa. Sempre é o cliente.

3. TRANSFORMAÇÃO
   Como é a vida do cliente antes de encontrar esse negócio?
   Como é depois?
   → Entre esses dois pontos está o conteúdo.

4. VOZ
   Se esse negócio fosse uma pessoa,
   como ela falaria numa conversa real?
   → Não no Instagram. Numa mesa de bar.

5. MARCA GERACIONAL
   Daqui a 20 anos, o que esse negócio terá representado
   para as pessoas que atendeu?
   → Essa é a direção criativa de longo prazo.

6. O QUE NINGUÉM ESTÁ DIZENDO
   No nicho desse cliente, qual verdade incômoda
   todo mundo sabe mas ninguém fala?
   → Esse é o ângulo que diferencia.
```

## Antes de escrever qualquer copy

Não procure o template certo.
Procure a verdade humana primeiro.

A copy nasce quando você consegue responder:
→ O que essa pessoa sente às 23h quando
  o problema ainda não foi resolvido?
→ Se ela pudesse resolver isso amanhã,
  como seria diferente o dia dela?
→ Qual frase dela — numa conversa real,
  não num post — descreve exatamente o problema?

Quando tiver essa frase: escreva a partir dela.
Não sobre ela. A partir dela.

A lógica dos 15% e dos 85%:

Para quem decide pelo sentimento:
  A primeira frase precisa fazer a pessoa
  parar e pensar "é exatamente isso"
  Antes de qualquer argumento, ela precisa
  sentir que você entende o que ela sente

Para quem precisa de validação:
  Depois da emoção, entregar a prova
  Número real, caso real, processo real
  A lógica que justifica a decisão que
  o coração já tomou

Marcas com gravidade real arrastam os 85%
naturalmente — a autenticidade dos 15%
se torna aspiracional para todos.

---

## Formato de output

---

### MAPA CRIATIVO — [Nome do Cliente]

---

#### A verdade humana

```
[1 a 3 frases. O que esse negócio realmente é
 além do produto ou serviço que vende.]
```

---

#### O protagonista

```
Quem é o herói:     [descrição da pessoa que esse negócio serve]
Antes:              [como era a vida dessa pessoa antes]
Depois:             [como é depois]
A transformação:    [o que muda de verdade]
```

---

#### A voz

```
Tom:                [como fala — não adjetivos genéricos, exemplos reais]
Palavras que usa:   [vocabulário natural da marca]
Palavras que evita: [o que soa falso ou genérico para essa marca]
Exemplo de frase:   [uma linha que soa como essa marca, não como qualquer uma]
```

---

#### O ângulo diferenciador

```
O que todos no nicho dizem:  [o lugar-comum do setor]
O que esse cliente pode dizer que ninguém mais pode: [o ângulo único]
```

---

#### A direção criativa

```
Tema central:       [o fio condutor de todo o conteúdo]
Formato que serve:  [qual formato amplifica melhor essa verdade]
O que evitar:       [o que trairia a autenticidade dessa marca]
Marco geracional:   [o que esse conteúdo pode representar em 5 anos]
```

---

#### Passagem para execução

Com o mapa preenchido, perguntar:

```
"Qual conteúdo quer executar primeiro?
 Carrossel → /criar carrossel
 Post      → /criar post
 Site      → /criar site"
```

O mapa criativo é passado como contexto para a skill de execução.
Não se repete. Não se reexplica. Alimenta.

---

## O que esta skill não faz

Não gera headlines. Não escreve legendas. Não cria carrosséis.
Isso é trabalho das outras skills.

Esta skill garante que quando elas executarem,
vão executar a coisa certa — não só da forma certa.

---

## A referência que guia esta skill

A Oakley não perguntou "que óculos vender?"
Perguntou "que visão de mundo queremos proteger?"

A resposta definiu tudo:
o produto, a comunicação, o cliente, o legado.

Faça a mesma pergunta para cada cliente.

---

## Regras

1. **Nunca pular esta skill** quando o cliente não tem mapa criativo definido
2. **Uma verdade por cliente** — não tentar dizer tudo ao mesmo tempo
3. **O protagonista nunca é a empresa** — sempre o cliente dela
4. **Autenticidade supera perfeição** — imperfeição real conecta mais que polimento genérico
5. **O mapa é vivo** — atualizar no notes.md sempre que uma nova verdade emergir
6. **Partir do que já se provou** — antes de escavar, revisar `patterns.md` e os insights do nicho em `benchmarks.json`. Não redescobrir o que o sistema já sabe; usar isso para mirar o ângulo que ninguém ainda explorou (pergunta 6).

---

## Checkpoints

⏸ **CP1 — Mapa criativo aprovado**
Mapa completo gerado → apresentar para aprovação antes de passar contexto para qualquer skill de execução.
Este é o ponto de maior impacto: um mapa errado contamina tudo que vem depois.

---

## Checklist antes de passar para execução

- [ ] A verdade humana foi encontrada — não descrita, encontrada?
- [ ] O protagonista é o cliente, não a empresa?
- [ ] A voz tem exemplo concreto, não só adjetivos?
- [ ] O ângulo diferenciador é impossível de copiar?
- [ ] O mapa foi salvo no notes.md do cliente?
- [ ] skill-niche-intelligence foi executada?
- [ ] O ângulo gerado é específico ao nicho?
- [ ] O gancho não poderia ser de outro nicho?
- [ ] A posição editorial está definida?

---

## Exemplo de ativação

```
/criar
→ Admin de criação identifica que não há mapa criativo
→ Carrega skill-criatividade.md
→ Executa o mapa
→ Passa para skill de conteúdo com contexto rico
```

---

*Skill v1.0 — MarketingOS*
*Grupo: Criação*
*Executada antes de qualquer conteúdo. Sempre.*
