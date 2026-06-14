# Reference Library — protocolo de consulta

Biblioteca externa de referências com código real (Three.js, GSAP, Framer, vanilla JS),
sistemas visuais, paletas por setor, benchmarks de sites e análises de concorrentes.

**Localização:** `../social-content-agents` (repo irmão de marketing-os)
**Repo:** https://github.com/Felproenca/social-content-agents

---

## Quando consultar

| Situação | O que buscar |
|---|---|
| Spec de motion para reel, carrossel ou site | `motion/` — código pronto para adaptar (GSAP, Three.js, Framer, vanilla) |
| Definir sistema visual ou paleta | `visual/styles/` e `visual/color-systems/` |
| Benchmark de layout ou interação | `sites/` — Stripe, Vercel, Linear, Aesop, Lusion etc. |
| Posicionamento contra players do nicho | `competitors/` |
| Contexto de indústria (beauty, medical) | `industries/` |
| Padrões de gancho | `copy/hooks.json` |
| Prospecção, diagnóstico de funil ou conteúdo de aquisição | `frameworks/acquisition/` — diagnóstico 30 dias, modelo 70/20/10, mapa de 5 gargalos |

---

## Como consultar (duas vias)

**Via 1 — leitura direta (preferida dentro de skill):**
1. Ler `../social-content-agents/index.json` (~5KB — memória curta do sistema)
2. Cruzar `tags` e `tensions` das entries com a assinatura perceptiva / brief
3. Carregar APENAS os JSONs completos das 1–3 referências compatíveis (campo `path`)

**Via 2 — CLI (quando precisar de ranking por keyword):**
```bash
cd ../social-content-agents
python -m src.query search [keywords] [--category X] [--type Y]
python -m src.query get [id]      # JSON completo de uma referência
python -m src.query list          # tudo, agrupado por categoria
python -m src.query stats         # totais por tipo e maturidade
```

A API Python `search_for_agent({sector, style, mood, industry, acquisition_objective, bottleneck, stage})`
existe para integração programática (scripts, agents) — não para uso manual em skill.
Quando o brief é de aquisição (`acquisition_objective` ou `bottleneck` presentes),
entradas com `acquisition_role` relevante recebem boost no ranking.

---

## Regras de uso

1. **Código entra adaptado, nunca colado cru.** Todo snippet passa pelo filtro do
   `visual-dna.json` do cliente (tempo, movimento, anti_dna) antes de entrar no output.
2. **Esta biblioteca não substitui o gate.** `reference-context.json` continua
   obrigatório — a Reference Library é fonte de execução (como fazer), a Biblioteca
   Viva (`intelligence/reference-library/`) é fonte de percepção (por que fazer).
3. **Máximo 3 referências por consulta.** Carregar o índice inteiro + todos os JSONs
   é desperdício de contexto.
4. **Respeitar `maturity`.** Usar apenas `stable` e `growing`. Nunca `outdated`/`deprecated`.
5. **Registrar uso.** Se uma referência da biblioteca influenciou o output, citá-la na
   declaração de princípios da skill (id da entry).
6. **Lacuna identificada → registrar** em `intelligence/skill-updates.md` para
   alimentar a biblioteca depois.
