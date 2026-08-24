# Content Funnel Engine

Todo conteudo deve ter funcao comercial.

Um conteudo pode ser bonito, inteligente e bem escrito.
Se nao captura sinal nem move o lead, ele nao alimenta o sistema.

---

## Tipos De Conteudo

### Conteudo De Tensao

Funcao: fazer o lead perceber que existe um problema.

Exemplo:

```text
Seu site nao parece ruim. Ele parece comum. E comum nao vende premium.
```

Metadata:

```text
stage: awareness
intent: low
friction: 0
signal: salvar, comentar, compartilhar
```

---

### Conteudo De Diagnostico

Funcao: fazer o lead se enxergar no problema.

Exemplo:

```text
3 sinais de que sua pagina inicial esta afastando cliente bom.
```

Metadata:

```text
stage: problem-aware
intent: medium
friction: 1
signal: pedir checklist, comentar nicho
```

---

### Conteudo De Criterio

Funcao: ensinar como avaliar uma solucao.

Exemplo:

```text
Pagina bonita nao basta. Uma pagina premium precisa gerar confianca, direcao e acao.
```

Metadata:

```text
stage: solution-aware
intent: medium
friction: 1 ou 2
signal: clicar, responder, pedir exemplo
```

---

### Conteudo De Prova

Funcao: mostrar transformacao, bastidor, antes/depois e raciocinio.

Exemplo:

```text
Como eu transformaria o site de uma clinica em uma pagina que parece R$10k.
```

Metadata:

```text
stage: comparison
intent: medium/high
friction: 2
signal: pedir analise
```

---

### Conteudo De Oferta

Funcao: abrir porta para diagnostico ou sprint.

Exemplo:

```text
Estou selecionando 3 negocios para reconstruir a primeira dobra do site com direcao premium.
```

Metadata:

```text
stage: decision
intent: high
friction: 3
signal: formulario, DM, call
```

---

### Conteudo De Retencao

Funcao: educar cliente e aumentar percepcao de valor da entrega.

Exemplo:

```text
O que medir depois que seu novo site entra no ar.
```

---

### Conteudo De Expansao

Funcao: criar demanda por proxima etapa.

Exemplo:

```text
Depois do site, o proximo gargalo e transformar trafego em conversa qualificada.
```

---

## JSON Obrigatorio Para Posts

Todo post deve sair com:

```json
{
  "content_type": "",
  "funnel_stage": "",
  "intent_level": "",
  "friction_level": "",
  "lead_signal_expected": "",
  "cta": "",
  "next_asset": ""
}
```

---

## Regra Editorial

O conteudo nao precisa vender sempre.
Mas precisa saber o que esta movendo:

- consciencia;
- confianca;
- criterio;
- prova;
- intencao;
- qualificacao;
- decisao;
- retencao;
- expansao.
