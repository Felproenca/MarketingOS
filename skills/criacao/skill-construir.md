---
name: skill-construir
version: "1.0"
group: criacao
command: /construir [objetivo] --brand [slug]
inputs:
  required: [objetivo, brand]
  optional: [query, top, out]
env: []
---

# skill-construir.md — Construção a partir do Catálogo (Anel 3 do Motor de Estudo)
> Estrutura entra. Alma re-veste. Nunca clona.
> Lê o catálogo de estudos de caso, monta um blueprint a partir da ESTRUTURA dos
> casos relevantes e re-veste pela `design-system.json`/`visual-dna.json` da marca.
> Output: `clients/[slug]/outputs/site/blueprint.json` → consumido por `skill-site-builder`.

---

## Princípio operacional

O Motor de Estudo (`/reverter` + `extract-structure` + `synthesize-case-study`) acumula
estudos de caso na Biblioteca Viva. `/construir` é o **consumidor de construção**:

- **dos estudos de caso** vem só a ESTRUTURA — ordem de seções, componentes, mecânica de motion, padrões buildáveis;
- **da marca** vem a ALMA — paleta, tipografia, copy, radius, regras de UX;
- o **gate da alma** rejeita todo padrão que viola o `anti_dna` da marca — e o relatório é observável (mostra o que rejeitou e por quê).

Nunca sai paleta, copy ou fonte de uma referência. O `nunca_copiar` de cada estudo é vinculante.

---

## Contexto mínimo necessário

- `intelligence/reference-library/case-studies/_catalog.json` (Anel 2 — rodar `build-case-catalog.mjs` antes se desatualizado)
- `clients/[slug]/outputs/branding/design-system.json` (tokens concretos de re-skin)
- `clients/[slug]/outputs/branding/visual-dna.json` (princípios — para o operador validar o tom)

NÃO carregar: outputs de outros clientes, paleta/copy das referências (proibido por design).

Pré-requisito: a marca precisa ter passado por `/perceber` → `/branding` → `/direcao-criativa`
(senão não há `design-system.json` para re-vestir).

---

## Pipeline

```
1. CONSULTA   catálogo ranqueado por objetivo + query (setor/estilo/padrão/tensão)
2. ESTRUTURA  extrai ordem de seções + componentes + padrões dos top-N casos
3. GATE       cada padrão absorvível passa pelo anti_dna da marca → absorvido ou rejeitado
4. RE-SKIN    aplica tokens da marca (paleta, tipografia, radius, UX)
5. BLUEPRINT  grava blueprint.json com proveniência (cita id do caso) + relatório do gate
6. ENTREGA    site-builder consome o blueprint. Teste Supremo antes de publicar.
```

Execução:
```bash
node scripts/construir.mjs \
  --objetivo "<objetivo de aquisição>" \
  --brand <slug> \
  --query "<setor estilo padrão>" \
  --out clients/<slug>/outputs/site/blueprint.json
```

Se o catálogo não tiver caso relevante (score 0): registrar a lacuna em
`intelligence/skill-updates.md` e estudar 1–2 referências novas (`/adquirir` + síntese) antes.

---

## Saída — `blueprint.json`

- `sources[]` — estudos de caso usados, com `id` citado (rastreabilidade — Gate de Referências)
- `sections[]` — esqueleto (papel + caso de origem)
- `tokens` — a marca que veste (paleta, tipografia, layout_patterns, ux_rules)
- `patterns_absorbed[]` — o que entrou (re-vestido)
- `soul_gate` — `rejected[]` (com motivo), `nunca_copiar[]` herdado, `anti_dna` da marca
- `next` — handoff para `skill-site-builder`

---

## Regras

- Estrutura dos casos; alma da marca. Nunca o contrário.
- Todo padrão absorvido é re-vestido pelos tokens da marca antes de existir.
- O gate é observável: o relatório sempre mostra o que foi rejeitado e por quê.
- Citar o `id` de cada estudo de caso usado (rastreabilidade).
- Antes da entrega final: Teste Supremo ("sem logo/cor, reconhece a marca?") + Gate de Direção de Arte.
- Anti-referência também constrói: dela se absorve a técnica, nunca o anti-padrão.

---

## Ativação

```
Use a skill-construir.md.

/construir site de aquisição do MarketingOS
brand: felipe-proenca
query: site marketing agência dark conversão
```

---

*Skill v1.0 — MarketingOS · Anel 3 do Motor de Estudo*
*O conjunto de estudos vira sites e sistemas — re-vestidos pela alma, nunca clonados.*
