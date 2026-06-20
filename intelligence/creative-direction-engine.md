# Creative Direction Engine - direcao efetiva antes da execucao

> Status: gate operacional do Creative OS.
> Funcao: transformar objetivo em direcao de cena antes de qualquer video, animacao, site visual, carrossel ou imagem.
> Regra: sem direcao de cena, o motor nao executa. Brief fraco gera output generico.

---

## Por que existe

O Creative OS decide a forma expressiva.
O Motion Pattern Library escolhe a fisica.
O Creative Direction Engine dirige a peca.

Sem esta camada, a IA tende a produzir:

- layout correto, mas sem assinatura;
- motion bonito, mas decorativo;
- tese boa, mas sem cena;
- visual elegante, mas sem tensao.

O salto e tratar cada output como uma peca dirigida:

```text
objetivo -> percepcao -> metafora -> cena -> beats -> motion -> asset -> critica
```

---

## Contrato obrigatorio

Antes de criar qualquer peca visual/motion, preencher:

```json
{
  "asset_id": "",
  "objective": "",
  "desired_perception": "",
  "audience_before": "",
  "audience_after": "",
  "emotional_temperature": "frio | tenso | curioso | incomodado | aliviado | decidido",
  "central_metaphor": "",
  "creative_tension": {
    "before": "",
    "after": "",
    "enemy": ""
  },
  "scene_direction": {
    "what_the_viewer_sees": "",
    "what_changes_on_screen": "",
    "what_must_be_understood_without_explanation": ""
  },
  "storyboard_beats": [
    {
      "time": "0-2s",
      "function": "abrir tensao",
      "visual": "",
      "motion": "",
      "copy": ""
    },
    {
      "time": "2-5s",
      "function": "materializar o problema",
      "visual": "",
      "motion": "",
      "copy": ""
    },
    {
      "time": "5-8s",
      "function": "virada",
      "visual": "",
      "motion": "",
      "copy": ""
    },
    {
      "time": "8-10s",
      "function": "assinatura",
      "visual": "",
      "motion": "",
      "copy": ""
    }
  ],
  "visual_language": {
    "composition": "",
    "type_behavior": "",
    "texture": "",
    "color_role": "",
    "negative_space": ""
  },
  "motion_language": {
    "pattern": "",
    "physics": "",
    "easing": "",
    "tempo": "",
    "hero_animation": ""
  },
  "references": {
    "composition": [],
    "motion": [],
    "texture": [],
    "rhythm": [],
    "do_not_copy": []
  },
  "constraints": {
    "must_not_feel_like": [],
    "one_hero_animation": true,
    "no_default_ease": true,
    "no_stock_visual": true,
    "brand_filter": []
  },
  "acceptance_gate": {
    "has_clear_scene": false,
    "has_transformation": false,
    "motion_has_meaning": false,
    "visual_metaphor_is_visible": false,
    "not_template_like": false,
    "can_be_critiqued_frame_by_frame": false
  }
}
```

Arquivo sugerido:

```text
clients/[slug]/outputs/creative-direction/[asset-id].json
```

---

## Perguntas que destravam a direcao

### 1. Percepcao

- O que a pessoa acredita antes de ver?
- O que ela precisa acreditar depois?
- Qual percepcao errada a peca combate?
- Qual frase a pessoa deveria conseguir repetir ao final?

### 2. Metafora

- O problema parece o que visualmente?
- A solucao parece o que visualmente?
- A transformacao e de dispersao para foco, peso para alivio, invisivel para visivel, ruido para diagnostico?
- A metafora aparece na tela ou so no texto?

### 3. Cena

- Se removesse a legenda, ainda daria para entender a ideia?
- O que se move e por que?
- O que fica parado para dar contraste?
- Qual detalhe faz a peca parecer dirigida, nao template?

### 4. Ritmo

- Onde esta o primeiro atrito?
- Onde a peca respira?
- Onde acontece a virada?
- O final assina uma tese ou so encerra?

### 5. Restricao

- O que esta proibido porque enfraquece a marca?
- Qual e a unica animacao-hero?
- Qual cor e acento, nao atmosfera inteira?
- O que um dev mediano faria aqui que o MarketingOS nao deve fazer?

---

## Storyboard por beats

Para video/animacao, nunca gerar tudo de uma vez.
Dividir por funcao dramatica:

| Beat | Funcao | Pergunta |
|---|---|---|
| 0-2s | Atrito | O que prende sem gritar? |
| 2-5s | Materializacao | Como o problema vira objeto/sistema visivel? |
| 5-8s | Virada | Qual transformacao acontece na tela? |
| 8-10s | Assinatura | Qual tese fica? |

Para pecas maiores, expandir sem perder a funcao:

```text
hook -> tensao -> evidencia -> virada -> sistema -> assinatura -> acao
```

---

## Biblioteca inicial de linguagem visual

Use como ponto de partida, nao como preset.

### Mapa de rastro

Quando usar:
Aquisição, origem de leads, DM, cockpit, conteudo que precisa provar observabilidade.

Cena:
Pontos soltos deixam rastros e formam trilhas verificaveis.

Evitar:
Particulas bonitas que nao formam leitura.

### Camada invisivel revelada

Quando usar:
Diagnostico, funil, causa/sintoma, estrategia.

Cena:
Superficie limpa abre camadas abaixo dela; o problema real aparece por transparencia, corte ou parallax.

Evitar:
Empilhar cards como se profundidade fosse sombra.

### Pressao e alivio

Quando usar:
Decisao, oferta, gargalo, antes/depois.

Cena:
Elementos comprimidos recuperam espaco depois da decisao certa.

Evitar:
Bounce ludico ou exagerado.

### Sistema respirando

Quando usar:
Cockpit, automacao, agenda, operacao continua.

Cena:
Linhas, nos ou camadas se movem com ruido baixo; parece vivo, nao aleatorio.

Evitar:
Blob decorativo e aurora generica.

### Corte de diagnostico

Quando usar:
Separar sintoma de causa, mostrar precisao, desmontar promessa vaga.

Cena:
Uma linha ou mascara atravessa a composicao e reorganiza o conteudo.

Evitar:
Wipe padrao sem consequencia visual.

---

## Gate de direcao criativa

Antes de executar o motor:

1. Existe uma metafora central visivel?
2. A peca tem transformacao de cena, nao so entrada de elementos?
3. Cada beat tem funcao clara?
4. O movimento carrega significado?
5. Existe referencia de composicao, ritmo ou textura?
6. Existe lista do que a peca nao pode parecer?
7. A marca aparece na decisao visual, nao apenas no logo/cor?
8. O output pode ser criticado frame a frame?

Qualquer "nao" bloqueia execucao.

---

## Handoff para o motor

O motor visual recebe:

```text
creative_os_brief
creative_direction_brief
motion_pattern
reference_sources
brand_tokens
acceptance_gate
```

E devolve:

```text
source_files
rendered_asset
verification_frames
decisions_log
critique_notes
metrics_to_watch
```

---

## Como aplicar em um teste de video

Exemplo minimo:

```text
Objetivo: mostrar que postagem solta nao gera previsibilidade.
Percepcao: de "preciso postar mais" para "preciso criar rastro de aquisicao".
Metafora: particulas soltas viram mapa operacional.
Beat 0-2s: tela dispersa, palavras soltas.
Beat 2-5s: rastros aparecem e denunciam falta de origem.
Beat 5-8s: rastros convergem em nos de sistema.
Beat 8-10s: assinatura: "Criacao vira aquisicao quando ganha rastro."
Motion: Caos -> Sistema + Mapa de rastro.
Nao pode parecer: template de SaaS, dashboard generico, particula decorativa.
```

