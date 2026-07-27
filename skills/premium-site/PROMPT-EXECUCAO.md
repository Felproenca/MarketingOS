# PROMPT DE EXECUÇÃO — Novo Site Premium (MarketingOS)

## Como usar
Copie o prompt, preencha o BRIEFING, cole no Claude Code dentro do repo MarketingOS.

---

## PROMPT: Site completo

```
Vamos construir um site premium. Siga o fluxo completo de skills/premium-site/SKILL.md.

### BRIEFING

**Negócio:** [nome]
**Nicho:** [nicho específico]
**Proposta de valor:** [1-2 frases]
**Público:** [quem é o cliente]
**Localização:** [cidade/bairro]

**Assets:**
- Logo: [sim/não]
- Fotos próprias: [sim/não, quantidade, qualidade]
- Instagram: [@perfil]
- Site atual: [URL]
- Cores existentes: [se tem]

**Comunicar:**
- [ponto 1]
- [ponto 2]
- [ponto 3]

**CTA principal:** [ação esperada do visitante]
**WhatsApp:** [número/link]
**Instagram:** [URL]

### EXECUÇÃO

1. Leia skills/premium-site/SKILL.md e TODOS os arquivos que ele referencia (inclusive skill-creative-direction.md, skill-visual-spec.md, visual-references.json, copy-references.json)
2. Gere a DIREÇÃO CRIATIVA (JSON do VisualSpecAgent estendido) — me apresente pra aprovação ANTES de montar
3. Gere TODOS os prompts de assets e me entregue
4. Após aprovação e assets prontos, monte o site em agency/demos/[slug]/site/index.html
5. Rode o checklist de review antes de entregar
```

---

## PROMPT: Iteração rápida com placeholders

```
Vamos construir um site premium com placeholders pra iterar rápido.

[BRIEFING acima]

### EXECUÇÃO

1. Leia skills/premium-site/SKILL.md + todos os arquivos referenciados
2. Gere a DIREÇÃO CRIATIVA e me apresente
3. Gere prompts de assets MAS monte o site com imagens placeholder (picsum.photos nas dimensões corretas)
4. Salve em agency/demos/[slug]/site/index.html
5. Quando eu entregar os assets reais, substitua
```

---

## PROMPT: Só direção criativa

```
Preciso da DIREÇÃO CRIATIVA pra este negócio. Pare no Step 2.

[BRIEFING acima]

### EXECUÇÃO

1. Leia skills/premium-site/SKILL.md + referências
2. Consulte intelligence/visual-references.json e copy-references.json
3. Gere o JSON completo de direção criativa com assinatura perceptiva, tipografia, paleta, seções, copy direction
4. Gere prompts de assets
5. Me apresente organizado
```

---

## PROMPT: Revisar site existente

```
Revise este site contra skills/premium-site/SKILL.md. O site está em [caminho].

1. Leia o kit completo
2. Analise o site
3. Liste violações dos anti-padrões
4. Liste elementos obrigatórios faltantes
5. Proponha correções
6. Implemente após aprovação
```

---

## COMANDOS RÁPIDOS

```
"Ajuste a paleta — accent fraco"
"Reescreva copy do hero — genérico"
"Troque tipografia pra [combinação do typography-map]"
"Adiciona marquee: [texto]"
"Remove seção [nome]"
"Gere prompt de asset pra [hero/showcase/gallery]"
"Review contra checklist"
"Grain muito forte, reduz pra 0.03"
"Adiciona pseudo-3D [método] em [seção]"
"Move site de demos pra clients/[slug]"
```
