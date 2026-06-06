---
name: skill-social-content-agent
version: "1.0"
group: criacao
command: /criar conteudo
inputs:
  required: [client.md, brand-kit.json]
  optional: [alma.md, intelligence/benchmarks.json]
env: []
---

# skill-social-content-agent.md — Orquestrador de Conteúdo Social
> Skill mestre do grupo criacao.
> Orquestra: skill-social-copy → skill-visual-spec → skill-image-generation → skill-post
> Entrega o pacote completo por post: copy aprovada + prompt Nano Banana + spec HTML + legenda final.
> O operador recebe tudo pronto para executar: roda o prompt no Nano Banana, injeta a imagem no sistema HTML.

---

## Contexto mínimo necessário

Carregar apenas:
- `client.md` — blocos 2 e 4 (persona, tom, restrições)
- `brand-kit.json` — paleta, tipografia, estilo, proibições
- `intelligence/benchmarks.json` — somente bloco `content_performance` do formato em jogo

Não carregar: metrics.json, campaigns.md, notes.md, estrategia.md, system-usage.json

---

## Input do Operador

```
Cliente:    [slug]
Pilar:      [ Demonstração | Educação | Problema→Sistema | Bastidores ]
Nicho:      [ clinica | escritorio | pet | seguro | generico ]
Formato:    [ Feed | Reels | Story ]
Objetivo:   [ Autoridade | Engajamento | Awareness | Conversão ]
Tema:       [tema livre — ex: "como não perder lead no WhatsApp"]
CTA:        [ WhatsApp | Link na bio | Salvar | Comentar | DM | nenhum ]
```

Se algum campo estiver ausente, pergunte antes de executar.

---

## Pipeline de Execução

O agente executa 4 estágios em sequência.
Pausar no CP entre estágios 2 e 3 — operador aprova copy antes de gerar prompt de imagem.

---

### ESTÁGIO 1 — Copy (skill-social-copy)

Gerar 2 variações de copy para o formato solicitado.
Output: hook + body + CTA + hashtags para cada variação.

Critério de corte automático:
- Hook começa com "você sabia", "5 dicas" ou promessa genérica → reescrever
- Tecnologia aparece antes do problema → reescrever
- CTA fraco ou genérico → reescrever

---

### ESTÁGIO 2 — Spec Visual (skill-visual-spec)

Com a melhor variação de copy (ou aguardar aprovação do operador),
gerar a especificação visual completa do post.

Output por frame/slide:
```
Role:              [ gancho | conteudo | prova | cta ]
Headline:          [ ]
Body:              [ ]
Visual type:       [ tipografico | foto_texto | screenshot | hibrido ]
Layout:            [ center | left | split | overlay ]
Focal point:       [ ]
Emphasis words:    [ ]
Background:        [ ]
CTA:               [ ]
```

⏸ CP — Apresentar copy final + spec visual para aprovação antes de continuar.

---

### ESTÁGIO 3 — Prompt de Imagem para Nano Banana

Com spec visual aprovada, gerar o prompt de imagem.

Regras do prompt:
- Sempre em inglês
- Estrutura: [sujeito] + [ambiente] + [estilo visual] + [iluminação] + [paleta] + [mood] + [qualidade]
- Paleta extraída do brand-kit.json do cliente
- Negative prompt sempre presente
- Sem texto, tipografia, logos ou watermarks na imagem
- Uma imagem por post — não resolver dois contextos no mesmo prompt

Output:

```
PROMPT NANO BANANA:
[prompt completo em inglês]

NEGATIVE PROMPT:
[elementos a evitar]

DIMENSÕES:
Formato: [Feed 1080x1080 | Stories 1080x1920 | Feed retrato 1080x1350]

NOTAS DE USO:
→ [como a imagem entra no layout HTML — fundo, overlay, destaque]
→ [elementos do HTML que serão sobrepostos na imagem]
```

---

### ESTÁGIO 4 — Pacote Final para o Sistema HTML

Montar o pacote completo que o operador entrega ao sistema.

```json
{
  "client": "[slug]",
  "format": "[Feed|Reels|Story]",
  "pilar": "[pilar]",
  "nicho": "[nicho]",
  "objetivo": "[objetivo]",

  "copy": {
    "visual_headline": "[texto que aparece NA imagem — máx 10 palavras]",
    "visual_subtext": "[linha de apoio opcional na imagem]",
    "caption_hook": "[linha 1 da legenda]",
    "caption_body": "[linhas 2-5]",
    "caption_cta": "[CTA final]",
    "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"]
  },

  "image": {
    "prompt": "[prompt completo para Nano Banana]",
    "negative_prompt": "[negative prompt]",
    "width": 1080,
    "height": 1080,
    "notes": "[instrução de uso da imagem no HTML]"
  },

  "html_instructions": {
    "background": "[como usar a imagem — fundo full | overlay escuro | elemento à direita]",
    "text_overlay": "[textos que o HTML sobrepõe na imagem]",
    "gold_accents": "[onde aplicar destaques gold]",
    "layout": "[composição do slide HTML]"
  },

  "publish": {
    "best_time": "[ex: terça ou quinta 19h–21h]",
    "frequency": "[ex: 1x feed + 1x story por semana]",
    "interaction": "[ex: responder comentários primeiras 2h]"
  }
}
```

---

## Regras Gerais

1. **Pilar define o ângulo, nicho define o exemplo** — o produto (MarketingOS) nunca é citado diretamente; é demonstrado
2. **Gancho funciona sem contexto** — lido sozinho já gera reação
3. **Copy não repete o visual** — complementa, expande ou conta a história por trás
4. **Prompt de imagem sem texto** — toda tipografia é responsabilidade do sistema HTML
5. **Tom da marca acima de tendência** — não usar estética que destoe do preto/gold editorial
6. **Uma peça por execução** — não gerar múltiplos posts no mesmo comando; qualidade > volume

---

## Checkpoints

⏸ **CP1 — Copy aprovada**
Apresentar as 2 variações de copy + spec visual antes de gerar prompt de imagem.
Aguardar escolha do operador.

⏸ **CP2 — Pacote aprovado**
Apresentar o JSON completo antes de salvar ou publicar.
Operador executa o prompt no Nano Banana e injeta a imagem no sistema HTML.

---

## Checklist antes de entregar

- [ ] brand-kit.json do cliente foi lido?
- [ ] O pilar está claro e o nicho do exemplo foi definido?
- [ ] O hook funciona isolado — sem contexto?
- [ ] O prompt de imagem NÃO contém texto, logo ou watermark?
- [ ] As dimensões estão corretas para o formato?
- [ ] O JSON está completo e sem campos vazios?
- [ ] As html_instructions são acionáveis sem explicação adicional?

---

## Exemplo de Ativação no Claude Code / Cursor

```
Use a skill-social-content-agent.md.

Cliente: marketingos
Pilar: Demonstração
Nicho: clinica
Formato: Feed
Objetivo: Autoridade
Tema: como uma clínica nunca perde um lead no WhatsApp
CTA: Link na bio
```

---

## Fluxo no Ecossistema

```
/criar conteudo
      ↓
skill-social-copy        → 2 variações de copy
      ↓
skill-visual-spec        → especificação visual por frame
      ↓
⏸ CP1 — aprovação do operador
      ↓
skill-image-generation   → prompt completo para Nano Banana
      ↓
operador roda no Nano Banana → imagem gerada
      ↓
sistema HTML             → monta post com identidade do cliente
      ↓
converte PNG → publica automático
```

---

*Skill v1.0 — MarketingOS*
*Orquestra: skill-social-copy + skill-visual-spec + skill-image-generation + skill-post*
*Gerador de imagem: Nano Banana (externo) — operador executa manualmente*
*Atualizar benchmarks.json após cada post com dados de performance reais*
