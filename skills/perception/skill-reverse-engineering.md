---
name: skill-reverse-engineering
version: "1.0"
group: perception
command: /reverter [url | screenshot | referência]
inputs:
  required: [url | screenshot | referencia_slug]
  optional: [contexto, client]
env: []
---

# skill-reverse-engineering.md — Engenharia Reversa de Obras
> Transforma obra em conhecimento.
> Não descreve o que uma obra é. Extrai o que ela demonstra.
> Output: análise semântica estruturada + entrada em `intelligence/reference-library/`

---

## Princípio

O objetivo não é copiar.
O objetivo é compreender por que funciona — para poder aplicar o princípio em outro contexto.

Uma obra responde 5 perguntas:
1. Por que funciona?
2. O que comunica?
3. O que pode ser absorvido?
4. O que jamais deve ser copiado?
5. Qual princípio pode ser reutilizado?

---

## Contexto mínimo necessário

- `intelligence/reference-library/reference-taxonomy.md`
- `intelligence/reference-library/reference-schema.json`

NÃO carregar: client.md, alma.md, campaigns.md ou qualquer contexto de projeto.

---

## Pipeline de análise

### Passo 1 — Observação

Com a obra diante do sistema (URL, screenshot ou vídeo), observar:

**Primeira impressão (3 segundos):**
- O que o olho vai primeiro?
- Qual emoção é provocada antes de qualquer leitura?
- Qual é a velocidade percebida da obra?

**Estrutura:**
- O que organiza a composição?
- O que cria hierarquia?
- O que é ausência intencional?

**Movimento (se presente):**
- O movimento reforça ou contradiz a mensagem?
- Qual é o timing? Rápido, lento, pulsante?
- Existe física? Geração? Reatividade?

---

### Passo 2 — Diagnóstico

Responder em sequência:

**Por que funciona?**
Diagnóstico de 1 a 3 frases do mecanismo central.
Não descrever o que se vê — explicar por que produz o efeito que produz.

Exemplo correto: "A ausência de movimento numa composição densa cria percepção de controle absoluto — o que normalmente exigiria velocidade, aqui é comunicado pela imobilidade."
Exemplo incorreto: "O site usa cores escuras e tipografia grande."

**O que comunica além do óbvio?**
Todo objeto de design comunica em camadas:
- Camada 1: o que diz literalmente
- Camada 2: o que implica sobre quem fez
- Camada 3: o que comunica sobre quem usa ou consome

Identificar a Camada 2 e a Camada 3.

---

### Passo 3 — Tensão

Identificar a contradição interna que torna a obra memorável.

Formato: `[qualidade A] que parece [qualidade B inesperada]`

Consultar `reference-taxonomy.md` seção 1. Se nenhuma tensão existente se aplica, criar nova.

Se a tensão não puder ser identificada com precisão: registrar como `tensao_pendente` e sinalizar ao operador.

---

### Passo 4 — Dimensões

Medir nos 8 parâmetros da taxonomia:
`tempo` | `ritmo` | `densidade` | `profundidade` | `contraste` | `temperatura` | `movimento` | `ornamentacao`

Cada medição deve ser justificável: "densidade: esparso porque [observação específica]".

---

### Passo 5 — Absorver e Nunca Copiar

**Absorver** (máximo 5 itens):
- Padrões específicos e transferíveis para outros contextos
- Cada item: descrever o padrão, não a aparência
- Proibido genérico: "boa tipografia", "bom uso de cores"
- Formato: "[elemento] como [função perceptiva] — [como transferir]"

Exemplo: "Silêncio visual entre seções como pausa respiratória — aplicável a qualquer entrega onde o usuário precisa de tempo para processar o que acabou de ver."

**Nunca copiar** (mínimo 3 itens):
- Paleta específica (sempre)
- Layout e composição exata (sempre)
- Copy e nomenclatura (sempre)
- Elementos identitários específicos da obra (adicionar)

---

### Passo 6 — Princípio Transferível

Uma frase. O padrão abstrato por trás do que funciona.

Critério: deve ser aplicável em contextos completamente diferentes da obra original.
Se precisar mencionar a obra para explicar, está descrevendo — não extraindo o princípio.

Correto: "quando a estrutura é invisível, a energia parece ilimitada"
Incorreto: "o Active Theory usa transições rápidas que criam impacto"

---

### Passo 7 — Tags e contexto de uso

Extrair da taxonomia:
- `visual_tags`
- `motion_tags`
- `interaction_tags`
- `emocao` (máximo 3)
- `contexto` (quando referenciar esta obra)
- `stack` detectada ou inferida

---

## Output

Gerar objeto seguindo `reference-schema.json`.

Se for análise de referência externa para o banco:
→ Salvar em `intelligence/reference-library/acquired/[slug].json`
→ Apresentar para validação (ver `skill-reference-acquisition.md` Passo 5)

Se for análise de obra do próprio cliente (site atual, post, campanha):
→ Incluir no `perception.json` como seção `analise_obras_do_cliente`
→ Comparar DNA da obra com DNA desejado — identificar gaps

Se for análise de concorrente:
→ Salvar em `clients/[slug]/intelligence/concorrentes/[slug-concorrente].json`
→ Identificar tensões do concorrente que se sobrepõem ou contradizem o cliente

---

## Ativação

```
Use a skill-reverse-engineering.md.

/reverter https://linear.app
contexto: entender como comunicam velocidade sem criar ansiedade
```

```
Use a skill-reverse-engineering.md.

/reverter [screenshot do site atual do cliente]
contexto: auditoria de identidade — verificar gap entre DNA desejado e DNA atual
client: [slug]
```

---

*Skill v1.0 — MarketingOS Perception Engine*
*A obra é o ponto de partida. O princípio é o destino.*
