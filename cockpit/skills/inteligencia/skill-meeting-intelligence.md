---
name: skill-meeting-intelligence
version: "1.0"
group: inteligencia
command: /inteligencia reuniao
inputs:
  required: [client.md, transcript_or_audio, client_slug, meeting_type]
  optional: [notes.md, estrategia.md]
env: []
---

# skill-meeting-intelligence.md - Meeting Intelligence
> Transforma reunioes em inteligencia operacional comprimida.
> Nunca carregar transcricao inteira em outras skills quando `signals.json` existir.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - contexto do negocio, publico, oferta e canais
- Transcricao, audio ou video da reuniao fornecido pelo operador
- `notes.md` - somente se a reuniao menciona historico anterior
- `estrategia.md` - somente se a reuniao redefine prioridade atual

Nao carregar:
- `brand-kit.json`
- `perception.json`
- `visual-dna.json`
- outputs antigos de outros clientes
- transcricoes antigas, exceto quando o operador pedir comparacao

---

## Objetivo

Transformar conversa bruta em sinais reutilizaveis para diagnostico, aquisicao, estrategia e criacao.

A transcricao e insumo bruto.
O `signals.json` e a memoria operacional comprimida.

---

## Entrada esperada

```text
client_slug:
meeting_type: discovery | onboarding | estrategia | performance | venda | pos-venda | outro
date: YYYY-MM-DD
source: transcricao | audio | video | notas
arquivo ou conteudo da reuniao:
```

---

## Processo

1. Identificar o objetivo real da reuniao.
2. Separar fatos, inferencias, opinioes e desejos.
3. Extrair sinais de aquisicao, posicionamento, objecao e linguagem.
4. Preservar frases exatas do cliente quando revelam dor, desejo ou objecao.
5. Transformar a reuniao em `signals.json`.
6. Sinalizar lacunas e follow-ups sem inventar resposta.

---

## Output obrigatorio

Salvar transcricao em:

```text
clients/[slug]/inputs/meetings/YYYY-MM-DD-transcript.md
```

Salvar sinais em:

```text
clients/[slug]/inputs/meetings/YYYY-MM-DD-signals.json
```

Schema operacional:

```json
{
  "_meta": {
    "client_slug": "",
    "meeting_type": "",
    "source": "",
    "generated_at": "",
    "transcript_path": "",
    "confidence_score": 0
  },
  "pains": [],
  "objections": [],
  "desired_outcomes": [],
  "current_acquisition_channels": [],
  "bottlenecks": [],
  "client_language": [],
  "repeated_phrases": [],
  "content_angles": [],
  "offer_clues": [],
  "follow_up_tasks": [],
  "acquisition_hypotheses": [],
  "facts": [],
  "inferences": [],
  "unknowns": []
}
```

---

## Criterios de extracao

### Pains
Dores declaradas ou inferidas com base em fala do cliente.
Separar o que foi dito do que foi interpretado.

### Objections
Objeções do comprador final, do decisor ou do proprio cliente em relacao ao projeto.

### Desired outcomes
Resultado desejado em linguagem de negocio, nao em linguagem de marketing.

### Current acquisition channels
Canais atuais de aquisicao: indicacao, trafego pago, Instagram, SEO, outbound, parceiros, WhatsApp, eventos, comercial ativo.

### Bottlenecks
Possiveis gargalos. Nao decidir ainda o gargalo principal se faltarem evidencias.

### Client language
Palavras, metaforas, frases e estruturas que soam naturais para o cliente.

### Acquisition hypotheses
Hipoteses que a Acquisition Intelligence deve testar depois.

---

## Regras

1. Nunca transformar transcricao em texto bonito; transformar em inteligencia operacional.
2. Nunca apagar incerteza. Se nao ha evidencia, registrar em `unknowns`.
3. Nunca misturar sinais de clientes diferentes.
4. Nao atualizar `client.md`, `perception.json` ou `estrategia.md` automaticamente. Propor atualizacao quando aplicavel.
5. `signals.json` deve ser curto o suficiente para outras skills consumirem sem carregar a reuniao inteira.

---

## Checklist antes de entregar

- [ ] A transcricao foi salva em `inputs/meetings/`?
- [ ] O `signals.json` foi salvo no mesmo diretorio?
- [ ] Dores, objecoes, desejos e gargalos foram separados?
- [ ] Fatos e inferencias foram diferenciados?
- [ ] Existem follow-ups claros para lacunas importantes?
- [ ] Nenhuma metrica ou fala foi inventada?

---

*Skill v1.0 - MarketingOS*
