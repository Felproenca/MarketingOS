---
name: skill-perception-engine
version: "1.0"
group: perception
command: /perceber [slug]
inputs:
  required: [slug]
  optional: [force_rebuild]
env: []
---

# skill-perception-engine.md — Perception Engine
> Orquestrador das 6 camadas de percepção.
> Executa antes de qualquer criação para novo cliente, ou quando a identidade mudar.
> Output: `clients/[slug]/outputs/branding/perception.json`

---

## Princípio

Toda produção é consequência da compreensão. Este skill é a compreensão.

Não gera conteúdo. Gera o mapa de percepção que torna qualquer conteúdo futuro coerente.

---

## Contexto mínimo necessário

Carregar antes de executar:
- `alma.md` (raiz)
- `clients/[slug]/client.md`
- `clients/[slug]/outputs/branding/visual-dna.json` (se existir)
- `intelligence/reference-library/reference-taxonomy.md`
- `intelligence/reference-library/index.json`

NÃO carregar: campaigns.md, runs.md, metrics.json, posts, reels, carrosseis.

---

## As 6 Camadas

### Camada 1 — Leitura de Alma

**Objetivo:** descobrir não o que a empresa vende, mas o que deseja provocar.

Ler `client.md` e extrair:

```
Pergunta central: o que essa marca deseja que as pessoas SINTAM?
(não o que ela faz — o que ela provoca)
```

Registrar:
- Proposta de valor emocional (não funcional)
- Tom de voz atual vs tom de voz desejado
- Valores declarados vs valores implícitos (o que está nas entrelinhas)
- O que o fundador diz que é vs o que parece ser

---

### Camada 2 — Vetores de Percepção

**Objetivo:** mapear a intensidade de cada dimensão perceptiva da marca.

Medir em escala 1-5 (1=ausente, 5=dominante):

```json
{
  "autoridade": 0,
  "calor_humano": 0,
  "precisao": 0,
  "inovacao": 0,
  "energia": 0,
  "sofisticacao": 0,
  "proximidade": 0,
  "exclusividade": 0
}
```

Instrução: não classificar em categorias fixas. Medir intensidades.
Uma marca pode ter `autoridade: 4` e `calor_humano: 4` — a tensão entre os dois é parte da assinatura.

---

### Camada 3 — Assinatura Perceptiva

**Objetivo:** identificar a combinação única de tensões que torna esta marca inconfundível.

A assinatura é derivada dos Vetores de Percepção — especificamente das tensões entre dimensões altas.

Formato: `[qualidade A] que parece [qualidade B inesperada]`

Exemplos:
- `autoridade: 4` + `calor_humano: 4` → "autoridade que parece conversa"
- `precisao: 5` + `proximidade: 3` → "precisão que parece cuidado"
- `sofisticacao: 4` + `energia: 4` → "sofisticação que parece urgência"

Registrar:
- Assinatura principal (1 tensão)
- Assinaturas secundárias (máximo 2)
- Anti-DNA: o que essa marca NUNCA pode parecer (dimensões que contradizem a identidade)

---

### Camada 4 — DNA Visual

**Objetivo:** traduzir a Assinatura Perceptiva em parâmetros visuais operacionais.

Definir os 8 parâmetros:

```json
{
  "tempo": "lento | moderado | acelerado",
  "ritmo": "estático | pulsante | contínuo | errático",
  "densidade": "esparso | equilibrado | denso",
  "profundidade": "plano | camadas | imersivo",
  "contraste": "suave | médio | extremo",
  "temperatura": "fria | neutra | quente",
  "movimento": "ausente | sutil | expressivo | explosivo",
  "ornamentacao": "minimalista | funcional | ornamental | maximalista"
}
```

Cada parâmetro deve ser justificado pela Assinatura Perceptiva.
Exemplo: se a assinatura é "autoridade que parece conversa" → `temperatura: quente`, `densidade: equilibrado`, `movimento: sutil`.

---

### Camada 5 — Matching de Referências

**Objetivo:** conectar o DNA desta marca a obras reais que comunicam tensões compatíveis.

Consultar `intelligence/reference-library/index.json`.

Critério de matching:
1. Tensão da referência compatível com a Assinatura Perceptiva da marca
2. Dimensões sobrepostas em 3+ parâmetros
3. Contexto de uso relevante

Retornar máximo 3 referências com:
- Qual tensão as conecta
- O que especificamente absorver para esta marca
- O que desta referência NÃO se aplica

Se o banco de referências for insuficiente para o contexto da marca, sinalizar: "Referências insuficientes para [contexto]. Recomendar: `/adquirir [url sugerida]`."

---

### Camada 6 — Direção Criativa

**Objetivo:** gerar briefing operacional que toda skill de criação vai herdar.

Baseado nas 5 camadas anteriores, definir:

**Para qualquer criação:**
- O que esta marca quer que o usuário sinta ao ver uma peça
- O que esta marca nunca pode parecer
- As 3 perguntas que qualquer peça precisa responder antes de sair

**Por tipo de entrega:**
- Site/Landing: prioridade visual, estrutura de scroll, tom do hero
- Carrossel: densidade por slide, ritmo de revelação, tipo de tensão editorial
- Reel: tempo de atenção, tipo de movimento, cena de abertura
- Post: hierarquia visual, peso do copy vs imagem
- Pitch/Apresentação: ritmo de slides, intensidade de dados vs narrativa

---

## Output — perception.json

Salvar em `clients/[slug]/outputs/branding/perception.json`:

```json
{
  "slug": "",
  "generated_at": "",
  "camada_1_alma": {
    "provocacao_central": "",
    "tom_atual": "",
    "tom_desejado": "",
    "tensao_interna": ""
  },
  "camada_2_vetores": {
    "autoridade": 0,
    "calor_humano": 0,
    "precisao": 0,
    "inovacao": 0,
    "energia": 0,
    "sofisticacao": 0,
    "proximidade": 0,
    "exclusividade": 0
  },
  "camada_3_assinatura": {
    "principal": "",
    "secundarias": [],
    "anti_dna": []
  },
  "camada_4_visual_dna": {
    "tempo": "",
    "ritmo": "",
    "densidade": "",
    "profundidade": "",
    "contraste": "",
    "temperatura": "",
    "movimento": "",
    "ornamentacao": ""
  },
  "camada_5_referencias": [
    {
      "slug": "",
      "tensao_compativel": "",
      "absorver_para_esta_marca": [],
      "nao_aplicavel": ""
    }
  ],
  "camada_6_direcao": {
    "sensacao_alvo": "",
    "nunca_parecer": [],
    "perguntas_de_saida": [],
    "por_tipo": {
      "site": "",
      "carrossel": "",
      "reel": "",
      "post": "",
      "pitch": ""
    }
  }
}
```

---

## Teste Supremo — gate obrigatório antes de encerrar

Antes de entregar o `perception.json`, responder:

> "Se removermos o logo, o nome e as cores desta marca de qualquer peça que o sistema gerar a partir deste mapa — alguém ainda reconheceria quem está se comunicando?"

Se não → a Assinatura Perceptiva não está específica o suficiente. Refazer Camada 3.
Se sim → o mapa está válido.

---

## Quando re-executar

- Novo cliente (sempre, antes de qualquer criação)
- Mudança de posicionamento ou público-alvo
- Rebranding
- Quando o Teste Supremo falhar em 2+ peças consecutivas
- A cada 6 meses como auditoria de identidade

---

## Ativação

```
Use a skill-perception-engine.md.

/perceber felipe-proenca
```

*Skill v1.0 — MarketingOS Perception Engine*
