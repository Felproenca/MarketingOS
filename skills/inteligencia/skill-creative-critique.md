---
name: skill-creative-critique
version: "1.0"
group: inteligencia
command: /inteligencia critica
inputs:
  required: [asset, creative-brief.json, perception.json, visual-dna.json, reference-context.json]
  optional: [client.md, brand-kit.json, campaigns.md]
env: []
---

# skill-creative-critique.md - Creative Critique
> Critica outputs antes de publicar.
> Nao cria. Nao reescreve inicialmente. Primeiro julga.

---

## Contexto minimo necessario

Carregar apenas:
- Peca gerada ou caminho do asset analisado
- `clients/[slug]/outputs/creative-direction/creative-brief.[tipo].json`
- `clients/[slug]/outputs/branding/perception.json`
- `clients/[slug]/outputs/branding/visual-dna.json`
- `clients/[slug]/outputs/branding/reference-context.json`
- `client.md` - somente tom, restricoes e promessa da marca
- `brand-kit.json` - somente se houver avaliacao visual

Nao carregar:
- transcricoes inteiras
- outputs antigos de outros clientes
- intelligence global inteira
- metricas, exceto se a peca afirma resultado de performance
- campanhas antigas, exceto se a peca faz parte de uma campanha ativa

---

## Objetivo

Impedir que uma peca generica, fraca, artificial ou desconectada da direcao entre em publicacao.

Pergunta central:

```text
Esta peca poderia ser publicada por qualquer concorrente?
```

Se sim, ela nao esta pronta.

---

## Entrada esperada

```text
client_slug:
asset_path:
asset_type: carousel | post | reel | site | landing | ad | copy | image | pitch | other
creative_brief_path:
publication_context:
```

---

## Processo

1. Ler o asset sem tentar corrigir.
2. Identificar a tese central da peca.
3. Comparar a tese com o `creative-brief`.
4. Comparar a expressao com `perception.json`, `visual-dna.json` e `reference-context.json`.
5. Separar problema de gosto de problema de estrategia.
6. Pontuar clareza, tese, diferenciacao, memorabilidade e aderencia.
7. Decidir: `approve`, `revise` ou `reject`.
8. Se exigir revisao, listar correcoes obrigatorias por impacto.

---

## Criterios de analise

### Clareza

```text
A mensagem e compreendida rapidamente?
O publico entende o problema antes de entender o produto?
O proximo passo e obvio?
```

### Forca da tese

```text
Existe uma ideia central?
Ela sustenta a peca inteira?
Ela provoca uma mudanca de percepcao?
```

### Diferenciacao

```text
Isso poderia ser publicado por qualquer concorrente?
A linguagem pertence a marca?
Existe assinatura intelectual ou visual?
```

### Tensao

```text
Existe conflito real?
A peca encosta em uma dor, medo, desejo ou contradicao?
Ou apenas explica algo correto e esquecivel?
```

### Memorabilidade

```text
Existe uma frase, imagem, estrutura ou decisao lembravel?
Algo sobreviveria depois do scroll?
```

### Continuidade da experiência — sites e landings

Carregar também `intelligence/experience-continuity.md` e o
`creation-manifest.json`.

```text
O hero abre uma promessa que o restante sustenta?
A intensidade respira ou a qualidade despenca?
Cada seção muda uma crença, entrega prova ou oferece recompensa?
Copy, arte, assets e motion contam a mesma história?
O CTA final resolve a tensão aberta no hero?
Mobile preserva a narrativa ou apenas empilha o desktop?
```

Se houver “hero memorável + restante genérico”, a decisão mínima é `revise`,
independentemente da média.

### Aderencia ao DNA

Verificar contra:

```text
perception.json
visual-dna.json
creative-brief.[tipo].json
reference-context.json
```

### Aderencia as referencias

```text
Os principios foram absorvidos?
Ou a peca apenas copiou aparencia, layout, tom ou gimmick?
```

### Risco de IA

```text
O texto parece generico, polido demais ou sem friccao?
O visual parece template?
Existe excesso de simetria, obviedade ou frase intercambiavel?
```

---

## Output obrigatorio

Salvar em:

```text
clients/[slug]/outputs/critique/[asset]-critique.json
```

Schema operacional:

```json
{
  "_meta": {
    "client_slug": "",
    "asset_path": "",
    "asset_type": "",
    "generated_at": "",
    "sources": [],
    "confidence_score": 0
  },
  "central_thesis": "",
  "clarity_score": 0,
  "thesis_strength": 0,
  "differentiation_score": 0,
  "genericity_risk": "low | medium | high | critical",
  "memorability_score": 0,
  "experience_continuity": {
    "score": 0,
    "hero_quality_cliff": false,
    "intensity_curve_evidence": [],
    "copy_art_motion_alignment": [],
    "distributed_rewards": [],
    "cta_resolves_opening_tension": false
  },
  "adherence_to_dna": {
    "score": 0,
    "evidence": []
  },
  "adherence_to_references": {
    "score": 0,
    "evidence": []
  },
  "what_feels_generic": [],
  "what_feels_like_ai": [],
  "what_feels_like_brand": [],
  "strategic_problems": [],
  "execution_problems": [],
  "required_fixes": [],
  "publish_decision": "approve | revise | reject",
  "reasoning": []
}
```

---

## Regras de decisao

### approve

Usar apenas quando:

- a tese esta clara;
- a peca tem diferenca reconhecivel;
- o DNA da marca aparece sem depender de logo/cor;
- nao ha problema critico de clareza, promessa ou prova;
- a peca cumpre o objetivo de aquisicao do Creative Brief.
- em sites/landings, continuidade da experiência >= 8 e sem queda de qualidade após o hero.

### revise

Usar quando:

- a ideia e boa, mas a execucao dilui;
- ha trechos genericos corrigiveis;
- a peca tem tese, mas falta tensao, prova ou memorabilidade;
- o problema pode ser corrigido sem recomecar do zero.

### reject

Usar quando:

- a peca contradiz o Creative Brief;
- parece template ou conteudo intercambiavel;
- usa promessa sem prova;
- o DNA da marca nao aparece;
- a peca nao serve ao objetivo de aquisicao;
- a revisao exigiria reconstruir a ideia central.

---

## Scoring

Pontuar de 0 a 100:

```text
Clareza:                  0-20
Forca da tese:            0-20
Diferenciacao:            0-20
Memorabilidade:           0-15
Aderencia ao DNA:         0-15
Aderencia as referencias: 0-10
```

Classificacao:

```text
85-100: publicavel
70-84: forte, revisar pontos especificos
50-69: potencial existe, revisao estrutural
0-49: rejeitar ou reconstruir
```

Regra soberana:

```text
Mesmo com score alto, promessa sem prova ou genericidade critica exige revise ou reject.
Para sites/landings, `hero_quality_cliff: true`, continuidade abaixo de 8 ou CTA
desconectado da tensão inicial também impedem `approve`.
```

---

## Checklist antes de entregar

- [ ] O asset foi analisado sem reescrever antes?
- [ ] O Creative Brief foi comparado com a peca?
- [ ] `perception.json`, `visual-dna.json` e `reference-context.json` foram usados?
- [ ] Problemas estrategicos e de execucao foram separados?
- [ ] O risco de genericidade foi avaliado?
- [ ] A decisao `approve | revise | reject` foi registrada?
- [ ] Correcoes obrigatorias foram priorizadas por impacto?

---

*Skill v1.0 - MarketingOS*
