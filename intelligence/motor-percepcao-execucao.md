# Motor de Estudo → Catálogo → Construção — Ecossistema

> Reescrito 2026-06-18 após correção do Felipe: o motor NÃO é "analisar para gerar".
> O produto é **a coleta do conceito e o estudo de caso**. Geração (vídeo etc.) é consumidor opcional — não recriar o que já existe (Reels/motor universal).
> Escopo escolhido: estudo de caso completo + catálogo consultável + **construção de sites/sistemas** como consumidor de primeira classe.

---

## Princípio que torna o motor eficiente e perfeito

> **A coleta do conceito é o produto. A construção consome o conceito.**
> Uma ingestão → um estudo de caso → catálogo acumulado → muitos consumidores. Zero duplicação.

Toda referência entra **uma vez** e fica disponível **para sempre**, em qualquer profundidade
(só dados medidos, só conceito, ou o estudo completo). É isso que torna o motor "perfeito":
o conhecimento não se perde nem se recria a cada caso.

---

## Os 3 anéis

```
INGESTÃO  (site · imagem · vídeo · campanha · concorrente)
        ↓
╔══ ANEL 1 — MOTOR DE ESTUDO (sempre roda) ══════════════════════════╗
║ 1. CAPTURA física        Playwright: screenshot/vídeo/HTML  [capture-reference.js]  ║
║ 2. MEDIÇÃO estrutural     tokens/seções/copy/stack          [extract-structure.mjs] ║
║ 3. EXTRAÇÃO de conceito   tensão · por que funciona · princípio  [/reverter]        ║
║ 4. SÍNTESE                funde dados + conceito → ESTUDO DE CASO  [LACUNA real]     ║
╚════════════════════════════════════════════════════════════════════╝
        ↓
╔══ ANEL 2 — CATÁLOGO (Biblioteca Viva consultável) ═════════════════╗
║ todos os case-studies indexados por setor/tensão/padrão/stack       ║
║ consulta manual (ler index) + programática (search por brief)       ║
║ = "o conjunto" — conhecimento acumulado que cresce com qualidade    ║
╚════════════════════════════════════════════════════════════════════╝
        ↓
╔══ ANEL 3 — CONSTRUÇÃO (consumidor de 1ª classe: sites/sistemas) ═══╗
║ /construir [objetivo] --brand [slug]:                               ║
║  1. consulta o catálogo → padrões relevantes                        ║
║  2. compõe o blueprint a partir do `structure` dos case-studies     ║
║  3. RE-SKIN pela visual-dna (gate da alma) — NUNCA clona            ║
║  4. entrega via /site-builder                                       ║
╚════════════════════════════════════════════════════════════════════╝

OUTROS CONSUMIDORES (opcionais, sob demanda):
  /branding · diagnóstico de concorrente · prompt de reconstrução ·
  Reels/motion (pipeline que JÁ existe — só consome, nunca recria)
```

---

## O estudo de caso — a moeda única do sistema

`intelligence/reference-library/case-studies/[slug].json` — duas faces no mesmo artefato:

```
{
  id, slug, name, source_url, source_type, captured_at,

  physical:  { screenshots[], video, stack[], stack_confidence },

  structure: {                      // FACE DE CONSTRUÇÃO (medido — extract-structure)
    palette{backgrounds,text,accents}, typography{fonts,scale,weights},
    spacing, radius[], grid,
    sections[ {role, headings, ctas, layout, bg, height} ],
    components[ navbar|hero|cards|marquee|... ],
    motion[ {type, params} ], copy[]
  },

  concept:   {                      // FACE DE PERCEPÇÃO (extraído — /reverter)
    tension, por_que_funciona, principio_transferivel,
    dimensoes{...}, tags{...}, absorver[], nunca_copiar[]
  },

  index:     { sector, mood, style, patterns[], use_for[] },   // CATÁLOGO
  system:    { status, validated_by, used_in[] }
}
```

A **face de construção** é o que faltava: `/reverter` já dá o conceito, mas não dá o blueprint
buildável. `extract-structure.mjs` dá o blueprint mas solto. A SÍNTESE une os dois.

---

## Onde está / o que falta (anti-duplicação)

- ✅ Captura — `capture-reference.js`
- ✅ Conceito — `/reverter`, `/adquirir`
- ✅ Geração/vídeo/site-builder — existem → **consumidores, não recriar**
- ✅ Medição estrutural — `extract-structure.mjs` (provado no itaplay)
- ✅ **SÍNTESE em case-study unificado** — KEYSTONE CONSTRUÍDO 2026-06-18:
  - schema: `intelligence/reference-library/case-studies/_schema.json`
  - síntese: `scripts/synthesize-case-study.mjs` (funde structure + concept)
  - 1º case-study real: `case-studies/itaplay.json` (anti-referência)
- ✅ **Catálogo consultável (Anel 2)** — `scripts/build-case-catalog.mjs` → `_catalog.json` (busca por setor/padrão/tensão)
- 🔨 **`/construir`** — o consumidor de construção que lê o catálogo e monta (re-skin) — PRÓXIMO
- 🔨 unir `extract-structure` + `/reverter` num comando único (`/estudar [url]`)

---

## Sequência de construção do próprio motor (proposta)

1. **Schema do case-study** (o keystone) + pasta `case-studies/`.
2. **Passo de síntese**: junta `extract-structure` (structure) + `/reverter` (concept) num case-study.
3. **Índice/consulta** do catálogo (por setor/tensão/padrão).
4. **`/construir`**: query → blueprint → re-skin pela visual-dna → /site-builder.
5. Animação/motion permanece FORA — consumidor opcional do pipeline de Reels existente.

## Provas já em mão (POC, `.poc/`)
- Medição estrutural: `extract-structure.mjs` → `itaplay.json` (dados reais, leu até posicionamento).
- (O motion do peão foi só demo de UM consumidor — não é o motor.)
