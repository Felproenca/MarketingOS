---
name: skill-criar-conteudo
version: "1.0"
group: criacao
command: /criar conteudo
inputs:
  required: [client.md, brand-kit.json]
  optional: [estrategia.md, alma.md, intelligence/benchmarks.json]
env: []
---

# skill-criar-conteudo.md — Gerador de Conteúdo via Motor
> Skill isolada do MarketingOS.
> Execute quando precisar gerar conteúdo (posts, carrosséis, reels) via o pipeline de integração.
> Substitui a skill-content-engine.md deprecada.
> Output: conteúdo completo (copy + visual) salvo em clients/[slug]/outputs/

---

## Contexto mínimo necessário
→ client.md — nome, nicho, persona, tom, restrições
→ brand-kit.json — paleta, tipografia, estilo visual
→ estrategia.md — foco atual e objetivo da campanha
→ intelligence/benchmarks.json — apenas o bloco do formato/canal em jogo
→ NÃO carregar: metrics.json, campaigns.md, alma.md, notes.md

---

## Objetivo

Gerar conteúdo completo para um cliente usando o pipeline de integração:
1. Montar brief com contexto do cliente
2. Rodar o motor de geração (criar-conteudo.js)
3. Revisar output contra critérios da marca
4. Salvar em clients/[slug]/outputs/

---

## Input Esperado

```
1. Cliente       → slug do cliente (ex: felipe-proenca)
2. Tema          → tema do conteúdo (ex: "IA aplicada: o que muda quando vira sistema")
3. Objetivo      → [ autoridade | engajamento | venda | educacao ]
4. Plataforma    → [ instagram | linkedin | tiktok | all ]
5. Formato       → [ carousel | post | reel | story ] (opcional, motor decide se omitir)
```

---

## Protocolo de Execução

### Passo 1 — Verificar pré-requisitos

```bash
# Verificar se o cliente existe
ls clients/[slug]/client.md

# Verificar se brand-kit existe
ls clients/[slug]/brand-kit.json

# Verificar se o motor está funcional
node scripts/integration/criar-conteudo.js [slug] --dry-run
```

Se `--dry-run` falhar, o motor precisa de manutenção. PARE e sinalize.

### Passo 2 — Rodar dry-run

Antes de gerar conteúdo real, sempre testar:

```bash
node scripts/integration/criar-conteudo.js [slug] --dry-run
```

Isso confirma que:
- O script carrega sem erro
- Os arquivos do cliente estão acessíveis
- O motor consegue montar o brief

### Passo 3 — Rodar geração real

```bash
node scripts/integration/criar-conteudo.js [slug] \
  --tema "[tema]" \
  --objetivo [objetivo] \
  --plataforma [plataforma] \
  [--formato [formato]]
```

**Parâmetros obrigatórios:** `--tema`, `--objetivo`, `--plataforma`
**Parâmetros opcionais:** `--formato` (motor decide se omitir)

### Passo 4 — Revisar output

O motor gera conteúdo em `clients/[slug]/outputs/posts/[YYYY-MM-DD]-[tema]/`

Verifique:
- [ ] Copy está alinhada ao tom do client.md?
- [ ] Visual respeita brand-kit.json?
- [ ] Gancho para o scroll (primeiras 3 linhas)?
- [ ] CTA é específico e claro?
- [ ] Formato correto para a plataforma?

### Passo 5 — Aprovação

Apresente ao usuário:

```
── REVISÃO DE CONTEÚDO ──────────────────────────────

Cliente:    [nome] ([slug])
Tema:       [tema]
Plataforma: [plataforma]
Formato:    [formato]

COPY:
[texto completo do conteúdo]

CHECKLIST:
  ✓ Tom alinhado
  ✓ CTA presente
  ✓ Visual coerente
  ⚠️ [item com problema — se houver]

ARQUIVOS GERADOS:
  → clients/[slug]/outputs/posts/[pasta]/copy.md
  → clients/[slug]/outputs/posts/[pasta]/visual.html (se aplicável)

APROVAÇÃO NECESSÁRIA:
  [A] Aprovar e salvar
  [E] Editar antes de salvar
  [C] Cancelar

─────────────────────────────────────────────────────
```

**Pare aqui. Não avance sem resposta.**

### Passo 6 — Salvar e registrar

Após aprovação:
1. Confirmar que os arquivos estão em `clients/[slug]/outputs/`
2. Registrar em `clients/[slug]/runs.md`
3. Se for publicar depois, oferecer: "Quer publicar com /publicar?"

---

## Checkpoints

⏸ **CP1 — Dry-run confirmado**
Motor funcional → prosseguir para geração real.

⏸ **CP2 — Conteúdo revisado**
Output gerado → apresentar para aprovação antes de salvar.

---

## Output esperado

```
✅ Conteúdo gerado — [Nome do Cliente]

Tema:       [tema]
Plataforma: [plataforma]
Formato:    [formato]

Arquivos:
  → clients/[slug]/outputs/posts/[pasta]/copy.md
  → clients/[slug]/outputs/posts/[pasta]/visual.html
  → clients/[slug]/outputs/posts/[pasta]/legenda.md

Próximo passo sugerido: /publicar para enviar ao ar
```

---

## Regras

1. **Sempre dry-run primeiro** — confirmar que o motor funciona antes de gastar tokens
2. **Tema específico** — "marketing" é genérico; "IA aplicada: o que muda quando vira sistema" é específico
3. **Nunca pular a revisão** — CP2 é obrigatório antes de salvar
4. **Um conteúdo por vez** — não gerar múltiplos temas em sequência sem aprovação
5. **Registrar tudo** — toda geração deve ser registrada em runs.md
6. **Oferecer publicação** — ao final, sempre sugerir /publicar se apropriado

---

## Checklist antes de entregar

- [ ] Dry-run passou sem erro?
- [ ] Tema é específico e relevante para o cliente?
- [ ] Copy respeita o tom do client.md?
- [ ] Visual respeita o brand-kit.json?
- [ ] Gancho para o scroll?
- [ ] CTA claro e específico?
- [ ] Usuário aprovou antes de salvar?
- [ ] Arquivos salvos em clients/[slug]/outputs/?
- [ ] Registrado em runs.md?

---

## Exemplo de Ativação

```
/criar conteudo
Cliente: felipe-proenca
Tema: IA aplicada: o que muda quando vira sistema
Objetivo: autoridade
Plataforma: instagram

---

/criar conteudo
Cliente: felipe-proenca
Tema: 5 tarefas que agentes de IA já conseguem automatizar
Objetivo: autoridade
Plataforma: instagram
Formato: carousel
```

---

## Diferença entre esta skill e skill-content-engine

| | skill-content-engine (deprecated) | skill-criar-conteudo (nova) |
|---|---|---|
| Motor | social-content-agents (Python) | criar-conteudo.js (Node) |
| Status | DEPRECATED | Ativa |
| Comando | /criar com-motor | /criar conteudo |
| Integração | API local HTTP | CLI direto |

---

*Skill v1.0 — MarketingOS*
*Substitui skill-content-engine.md deprecada. Wrapper do criar-conteudo.js.*
