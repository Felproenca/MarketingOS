---
name: skill-acquisition-intelligence
version: "1.0"
group: inteligencia
command: /inteligencia aquisicao
inputs:
  required: [client.md]
  optional: [meeting-signals.json, metrics.json, campaigns.md, estrategia.md, site, instagram, crm, published.json]
env: []
---

# skill-acquisition-intelligence.md - Acquisition Intelligence
> Diagnostica o principal gargalo que impede aquisicao previsivel.
> Nunca assume que o problema e trafego, conteudo, SEO, automacao ou vendas.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - negocio, oferta, publico, canais e metas
- `clients/[slug]/inputs/meetings/*-signals.json` - se existir
- `metrics.json` - se houver dados reais de canais, leads, conversao ou vendas
- `campaigns.md` - se houver campanhas ativas ou historico recente
- `estrategia.md` - se houver foco operacional atual
- Site, Instagram, CRM, funil ou conteudo publicado somente quando forem insumos da analise

Nao carregar:
- transcricoes inteiras quando existir `signals.json`
- `brand-kit.json`, exceto se posicionamento visual for parte do gargalo
- `perception.json` e `visual-dna.json`, exceto quando a hipotese for diferenciacao/percepcao
- outputs antigos de outros clientes

---

## Objetivo

Encontrar o gargalo principal de aquisicao e priorizar a proxima acao pelo impacto.

A pergunta central:

```text
O que mais impede esta empresa de transformar aquisicao em algo observavel, ajustavel ou previsivel?
```

---

## Entrada esperada

```text
client_slug:
periodo analisado:
fontes disponiveis:
- client.md
- meeting-signals.json
- site
- instagram
- crm/funil
- metrics.json
- campaigns.md
- published.json
objetivo de aquisicao:
```

---

## Hipoteses concorrentes obrigatorias

Testar pelo menos estas dimensoes:

```text
1. Visibilidade
   SEO, IA Search, trafego, distribuicao, alcance qualificado

2. Conversao
   landing pages, oferta, formularios, CTA, prova, reducao de risco

3. Comercial
   follow-up, tempo de resposta, cadencia, qualificacao, proposta

4. Posicionamento
   clareza, diferenciacao, categoria, promessa, autoridade percebida

5. Conteudo
   consistencia, autoridade, tese, alinhamento com dores reais

6. Retencao / indicacao
   recompra, pos-venda, referrals, expansao de conta
```

---

## Processo

1. Listar evidencias disponiveis e ausentes.
2. Transformar cada dimensao em hipotese testavel.
3. Separar fato, inferencia, opiniao e lacuna.
4. Comparar hipoteses pelo impacto potencial e pela confianca da evidencia.
5. Escolher o gargalo principal somente quando houver evidencia suficiente.
6. Registrar riscos e assumptions quando a confianca for limitada.
7. Propor plano de 30 dias para diagnostico/ajuste e plano de 60 dias para implementacao.

---

## Output obrigatorio

Salvar em:

```text
clients/[slug]/outputs/acquisition/acquisition-diagnosis.json
```

Schema operacional:

```json
{
  "_meta": {
    "client_slug": "",
    "generated_at": "",
    "period": "",
    "sources": [],
    "confidence_score": 0
  },
  "primary_bottleneck": {
    "area": "",
    "description": "",
    "why_it_matters": ""
  },
  "secondary_bottlenecks": [],
  "evidence": [],
  "missing_evidence": [],
  "hypotheses_tested": [],
  "impact_level": "low | medium | high | critical",
  "urgency_level": "low | medium | high | critical",
  "acquisition_score": 0,
  "recommended_actions": [],
  "30_day_plan": [],
  "60_day_plan": [],
  "risks": [],
  "assumptions": []
}
```

---

## Criterios de score

Pontuar de 0 a 100:

```text
Visibilidade qualificada:       0-15
Clareza de posicionamento:      0-15
Forca da oferta:                0-15
Conversao dos ativos:           0-15
Processo comercial/follow-up:   0-15
Prova e confianca:              0-10
Observabilidade dos dados:      0-10
Retencao/indicacao:             0-5
```

Classificacao:

```text
80-100: aquisicao observavel; otimizar gargalos especificos
60-79: sistema promissor, mas com vazamentos claros
40-59: aquisicao instavel; corrigir gargalo antes de escalar
0-39: aquisicao opaca; diagnostico e instrumentacao primeiro
```

---

## Regras

1. Nunca assumir que trafego e o problema.
2. Nunca recomendar mais conteudo sem provar que conteudo remove o gargalo.
3. Nunca recomendar automacao antes de entender se o processo merece ser automatizado.
4. Nunca inventar metricas, conversoes, faturamento ou benchmarks.
5. Sempre separar dados reais, estimativas e inferencias.
6. Sempre indicar qual proxima evidencia reduziria a incerteza.
7. Toda acao recomendada deve aumentar aquisicao observavel, ajustavel ou previsivel.

---

## Checklist antes de entregar

- [ ] Todas as seis hipoteses concorrentes foram consideradas?
- [ ] O gargalo principal tem evidencia, nao apenas intuicao?
- [ ] Dados reais, inferencias e lacunas estao separados?
- [ ] O score foi calculado com criterio claro?
- [ ] O plano de 30 dias diagnostica/ajusta antes de escalar?
- [ ] O plano de 60 dias implementa conforme o gargalo encontrado?
- [ ] A recomendacao evita vender IA, automacao ou marketing como produto?

---

*Skill v1.0 - MarketingOS*
