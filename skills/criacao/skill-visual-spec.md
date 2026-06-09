---
name: skill-visual-spec
version: "1.0"
group: criacao
command: /criar visual-spec
inputs:
  required: [client.md, brand-kit.json]
  optional: [notes.md, alma.md]
env: []
---

# skill-visual-spec.md - Visual Spec Agent como Skill
> Converte o `VisualSpecAgent` em direcao visual por slide.
> Use para transformar copy aprovada em especificacao visual antes de HTML,
> PNG, imagem externa ou design manual.

---

## Contexto minimo necessario

Carregar apenas:
- `client.md` - posicionamento, publico, tom
- `brand-kit.json` - paleta, tipografia, restricoes, estilo
- `notes.md` - somente mapa de nicho/angulo, se existir

Nao carregar:
- `metrics.json`
- `campaigns.md`
- `intelligence/` inteira
- arquivos do motor, salvo depuracao

---

## DNA Visual — herança obrigatória

Antes de gerar qualquer especificação visual:

1. Verificar se existe `clients/[slug]/outputs/branding/visual-dna.json`
2. Se NÃO existir → interromper e instruir: "Execute /direcao-criativa antes de criar spec visual para este cliente."
3. Se existir → carregar APENAS:
   - `visual_dna.densidade`
   - `visual_dna.contraste`
   - `visual_dna.ornamentação`
   - `visual_dna.ritmo_tipográfico`
   - `anti_dna.never_use.visual`
   - `anti_dna.never_use.typography`

Não carregar o visual-dna.json inteiro — apenas os campos relevantes para spec visual.

---

## Entrada

```text
Formato: 1:1 | 4:5 | 9:16
Plataforma: instagram | linkedin | tiktok | youtube | x
Copy aprovada: [slides ou post]
Posicao editorial: provocacao | educacao | opiniao | demonstracao
```

---

## Saida obrigatoria

Para cada slide/frame:

```text
Slide [N]
Role: gancho | conteudo | prova | cta
Headline:
Body:
Visual type: tipografico | foto_texto | screenshot | dados | hibrido
Layout: center | left | split | overlay
Focal point:
Emphasis words:
Background treatment:
CTA:
```

---

## Matriz rapida

- Provocacao -> tipografia forte, contraste, pouca explicacao.
- Educacao -> hierarquia clara, estrutura, respiro.
- Opiniao -> editorial, assinatura, ponto de vista.
- Demonstracao -> screenshot, dado, processo real, prova visivel.

---

## Regras

- O slide 1 deve funcionar sem legenda.
- Cada slide carrega uma ideia.
- Texto deve caber no formato sem reduzir legibilidade.
- Visual deve amplificar a ideia, nao decorar.
- Se precisar de foto externa, marcar explicitamente para `skill-prompt-engineer.md`.

