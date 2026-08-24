# skill-niche-intelligence.md — Inteligência de Nicho
> Skill do grupo: Criação
> Executada antes de qualquer geração de conteúdo.
> Transforma o Claude num especialista sênior do nicho do cliente.
> Sem esta skill, o conteúdo gerado poderia ser de qualquer marca.

---

## Objetivo

Antes de escrever uma linha de conteúdo, responder:
→ O que um especialista sênior deste nicho diria
  que nenhum gerador genérico diria?
→ Qual o ângulo que ainda não foi explorado?
→ Como fala alguém que viveu dentro deste mercado?

---

## Contexto mínimo necessário

→ client.md — Bloco de nicho e posicionamento
→ intelligence/benchmarks.json — seção do nicho ativo
→ intelligence/patterns.md — padrões confirmados
→ NÃO carregar: metrics.json, campaigns.md, brand-kit.json

---

## Quando ativar

```
ATIVAR quando:
  → Não existe mapa criativo em notes.md para este cliente
  → O nicho do cliente mudou desde a última criação
  → O tema solicitado é novo ou não foi abordado antes
  → O operador pede /criar sem especificar ângulo

NÃO ativar quando:
  → Mapa criativo existe e tema já foi trabalhado
  → É uma variação de conteúdo já aprovado
  → O operador especificou o ângulo explicitamente
```

---

## Classificação de maturidade do tema

Para cada tema solicitado, classificar:

```
EMERGENTE
  Poucos falam. Alto valor para quem explorar agora.
  → Surfar antes de virar mainstream
  → Tom: "aqui está o que está acontecendo antes de todo mundo saber"

ASCENDENDO
  Crescendo. Janela ainda aberta.
  → Ângulo que ninguém dentro da tendência viu ainda
  → Tom: "aqui está o que a maioria está errando nessa tendência"

MAINSTREAM
  Todo mundo fala. Precisa de ângulo diferente.
  → Contradizer o consenso com dado ou perspectiva real
  → Tom: "aqui está o que todos repetem mas poucos questionam"

SATURADO
  Overdiscutido. Só vale se subverter completamente.
  → A verdade incômoda que os outros evitam
  → Tom: "aqui está o que ninguém tem coragem de dizer"
```

---

## Posição editorial por objetivo

```
Objetivo AWARENESS + tema EMERGENTE   → Educação
Objetivo AWARENESS + tema MAINSTREAM  → Provocação
Objetivo AUTORIDADE + tema qualquer   → Opinião ou Demonstração
Objetivo CONVERSÃO + tema qualquer    → Demonstração
```

Posições:

```
PROVOCAÇÃO
  Desafia o consenso em uma frase
  O leitor pensa: "espera, isso não é o que todo mundo diz"
  Visual: contraste alto, tipografia grande

EDUCAÇÃO
  Ensina o que poucos sabem de verdade
  Não o óbvio — o que especialistas sabem e iniciantes não
  Visual: estrutura clara, hierarquia

OPINIÃO
  Toma partido com argumento
  Quem discorda continua lendo para rebater
  Quem concorda salva para compartilhar

DEMONSTRAÇÃO
  Mostra ao vivo, não explica
  O produto operando, o resultado real, o processo exposto
  Visual: screenshot, terminal, antes/depois real
```

---

## Linguagem por nicho — como calibrar

Para qualquer nicho, responder antes de gerar:

```
1. LINGUAGEM INTERNA
   Quais termos especialistas usam entre si?
   Quais palavras sinalizam que você é de dentro?
   Quais expressões soam amador neste nicho?

2. O QUE ESTÁ EMERGINDO AGORA
   O que líderes deste nicho estão discutindo
   nos últimos 90 dias que ainda não chegou ao mainstream?

3. O CLICHÊ QUE NINGUÉM MAIS AGUENTA
   Qual frase todos no nicho repetem e ninguém mais lê?
   → Esta frase nunca entra no conteúdo

4. A VERDADE INCÔMODA
   O que todo especialista sabe mas evita falar abertamente?
   → Este é o ângulo que diferencia

5. O PROTAGONISTA REAL
   Quem é o herói da história deste nicho?
   Nunca é a empresa. Sempre é o cliente dela.
   Como é a vida dele antes e depois do serviço?
```

---

## Formato de output

---

### MAPA DE NICHO — [Nome do Cliente] · [Nicho]

**Maturidade do tema:** [ Emergente / Ascendendo / Mainstream / Saturado ]
**Posição editorial:** [ Provocação / Educação / Opinião / Demonstração ]

---

#### Como fala um especialista sênior deste nicho

```
Usa:     [3-5 termos específicos do nicho]
Evita:   [2-3 clichês que desposicionam]
Tom:     [como fala em conversa real, não em post]
```

---

#### O ângulo único

```
O que todos dizem:  [o lugar-comum do nicho]
O que você diz:     [o ângulo que ninguém explorou ainda]
Por que funciona:   [por que esse ângulo ressoa neste nicho]
```

---

#### O gancho — 5 variações

```
1. PROVOCAÇÃO
   [frase que desafia o consenso]

2. DADO INESPERADO
   [número ou fato específico que surpreende]

3. CONFISSÃO
   [admite algo que o nicho evita]

4. PERGUNTA INCÔMODA
   [pergunta sem resposta óbvia]

5. DECLARAÇÃO COM POSIÇÃO
   [afirmação direta, não neutra]
```

---

#### Para os 15% — emoção primeiro

```
O que essa pessoa sente quando o problema ainda não foi resolvido:
[resposta específica ao nicho — não genérica]

A primeira frase que para o scroll:
[baseada no gancho escolhido acima]
```

---

#### Para os 85% — lógica por baixo

```
A prova que justifica a decisão emocional:
[dado, caso, processo ou resultado concreto]

A lógica que sustenta o ângulo:
[por que faz sentido para quem pensa antes de decidir]
```

---

#### Passagem para execução

```
Com este mapa preenchido, executar:
→ /criar carrossel  → skill-carousel.md
→ /criar post       → skill-post.md
→ /criar site       → skill-site-builder.md

O mapa não se repete. Alimenta a skill de execução como contexto.
Salvar em notes.md do cliente para reutilização.
```

---

## Critério de qualidade

O mapa passa se:

```
✓ Um especialista sênior do nicho leria e diria
  "esse é um ângulo que eu não tinha pensado"

✓ O gancho não poderia ser de outro nicho

✓ Não usa nenhum clichê identificado

✓ Tem posição editorial clara — não é neutro

✓ A emoção vem antes da informação
```

Falha se:

```
✗ O ângulo poderia ser de qualquer empresa do setor
✗ O gancho começa com "5 dicas para..."
✗ Não tem ponto de vista definido
✗ A linguagem não é específica ao nicho
```

---

## Exemplos por nicho

### Seguros

```
Usa:     apólice, cobertura, sinistro, franquia, seguradora
Evita:   "proteja o que importa", "imprevistos acontecem"
Tom:     conselheiro independente, não vendedor

Ângulo:  "Seu seguro parece completo. Provavelmente não é."
Prova:   "70% dos sinistros negados têm uma cláusula em comum"

Gancho 1: "Você tem seguro. E vai descobrir que não tem
           na pior hora possível."
Gancho 2: "O sinistro foi negado. A culpa foi da apólice
           que você assinou sem ler."
```

### Saúde e Estética

```
Usa:     protocolo, evidência clínica, indicação, resultado
Evita:   "milagre", "sem esforço", "aprovado por famosas"
Tom:     autoridade médica acessível, baseado em evidência

Ângulo:  "O procedimento que todo mundo está fazendo
          tem uma contraindicação que ninguém menciona."
Prova:   "Dado clínico ou observação real do profissional"

Gancho 1: "Antes de agendar, tem uma pergunta que
           seu médico deveria ter feito — e provavelmente não fez."
Gancho 2: "Fiz X procedimentos em Y pacientes.
           Aqui está o que eu não faria em mim mesmo."
```

### Jurídico e Contábil

```
Usa:     risco, proteção, compliance, estrutura, estratégia
Evita:   "seu direito é nosso compromisso", "excelência"
Tom:     consultor estratégico, não advogado formal

Ângulo:  "O contrato que parece simples é o que mais
          aparece nos processos que ganho."
Prova:   "Caso real (sem identificar) com lição concreta"

Gancho 1: "Assinei um contrato parecido com o seu semana passada.
           Tinha três cláusulas que vão custar caro."
Gancho 2: "O barato que saiu caro: quanto custa não ter
           assessoria preventiva."
```

### Inteligência Artificial

```
Usa:     LLM, agente, RAG, contexto, inference, deployment
Evita:   "IA vai mudar tudo", "o futuro chegou", "ChatGPT faz"
Tom:     técnico mas acessível, cético saudável

Ângulo:  "O agente que funcionou na demo vai falhar
          em produção. Aqui está por quê."
Prova:   "Caso técnico real com o que quebrou e como resolveu"

Gancho 1: "Seu agente de IA parece inteligente.
           Até o primeiro edge case."
Gancho 2: "Passei 3 semanas construindo o agente perfeito.
           Ele falhou na primeira sexta-feira em produção."
```

---

## Exemplo de ativação

```
/criar
→ _admin.md de criação verifica: existe mapa criativo?
→ NÃO → ativar skill-niche-intelligence
→ Gerar mapa de nicho
→ Passar para skill-carousel ou skill-post com contexto rico

/criar carrossel — tema: "erros no seguro auto"
→ Tem tema → verificar maturidade
→ Mainstream → posição: Provocação
→ Gerar mapa com ângulo único
→ Executar skill-carousel com contexto
```

---

*Skill v1.0 — MarketingOS*
*Grupo: Criação*
*Executada antes de qualquer geração de conteúdo*
*Sem esta skill, o conteúdo gerado poderia ser de qualquer marca*
