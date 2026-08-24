---
name: skill-prompt-engineer
version: "1.0"
group: criacao
command: /criar prompt-engineer
inputs:
  required: [brand-kit.json]
  optional: [client.md, notes.md]
env: []
---

# skill-prompt-engineer.md - Prompt Engineer Agent como Skill
> Decide quando um visual deve ser HTML puro e quando exige imagem externa.
> Use depois de `skill-visual-spec.md` ou quando o motor pausar em
> `aguardando_imagens`.

---

## Contexto minimo necessario

Carregar apenas:
- `brand-kit.json` - estilo visual e restricoes
- especificacao visual gerada pela skill anterior
- `client.md` - somente se a imagem depender de restricao de marca

Nao carregar:
- `metrics.json`
- `campaigns.md`
- README do motor
- codigo Python, exceto para corrigir bug do pipeline

---

## DNA Visual — herança obrigatória

Antes de gerar qualquer prompt de imagem externa:

1. Verificar se existe `clients/[slug]/outputs/branding/visual-dna.json`
2. Se NÃO existir → continuar com brand-kit.json (esta skill é auxiliar — não bloquear pipeline)
3. Se existir → carregar APENAS:
   - `visual_dna.temperatura` — alimenta tom de luz e ambiente do prompt
   - `visual_dna.textura` — alimenta textura de superfície e grão
   - `anti_dna.never_use.visual` → negative prompt obrigatório
   - `anti_dna.never_use.color` → negative prompt de cor

Esses campos vão diretamente para o prompt positivo e negativo do gerador de imagem.

---

## Regra de decisao

Usar HTML puro quando:
- o slide e tipografico;
- o slide mostra dado simples;
- o slide usa estrutura, grid, comparacao ou CTA;
- a imagem seria decorativa.

Pedir imagem externa apenas quando:
- slide e gancho;
- `visual_type` e `foto_texto`;
- `background_treatment` e `image-overlay`;
- a foto transmite uma cena humana impossivel de substituir por layout.

---

## Saida para imagem externa

```text
Slide:
Aspect ratio:
Prompt EN:
Prompt PT:
Negative:
Style notes:
Service hints:
Onde salvar:
Comando de upload:
```

Comando:

```bash
npm run upload-image -- --content <content_id> --slide <N> --file <caminho>
```

---

## Regras

- Imagem externa e excecao, nao padrao.
- Nunca pedir imagem para esconder copy fraca.
- Nao usar foto com cara de banco de imagem.
- Se a imagem for necessaria, o prompt deve conter cena, luz, composicao, lente/angulo e o que evitar.
- Depois do upload, verificar se os PNGs finais foram copiados para `clients/[slug]/outputs/`.

