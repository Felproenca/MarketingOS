#!/usr/bin/env node
/**
 * construir.mjs — MarketingOS / Anel 3 do Motor de Estudo
 * Lê o catálogo de estudos de caso, monta um BLUEPRINT a partir da ESTRUTURA dos
 * casos relevantes e RE-VESTE pela visual-dna/design-system da marca (gate da alma).
 *
 * Estrutura entra. Alma re-veste. Nunca clona. O gate é OBSERVÁVEL (reporta o que
 * rejeitou e por quê).
 *
 * Uso:
 *   node scripts/construir.mjs --objetivo "site de aquisição do MarketingOS" \
 *     --brand felipe-proenca --query "site agência dark conversão" \
 *     --out clients/felipe-proenca/outputs/site/blueprint.json
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { dirname, join } from 'path';

const A = process.argv.slice(2);
const arg = (f, d) => { const i = A.indexOf(f); return i !== -1 ? A[i + 1] : d; };
const objetivo = arg('--objetivo', 'site institucional');
const brand = arg('--brand');
const query = arg('--query', objetivo);
const topN = +arg('--top', 3);
const out = arg('--out', `clients/${brand}/outputs/site/blueprint.json`);
if (!brand) { console.error('uso: --objetivo "..." --brand <slug> [--query "..."] [--out ...]'); process.exit(1); }

const CAT = 'intelligence/reference-library/case-studies/_catalog.json';
const CS_DIR = 'intelligence/reference-library/case-studies';

// ── 1) consultar catálogo ────────────────────────────────────────────────────────
const catalog = JSON.parse(readFileSync(CAT, 'utf-8'));
const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
const score = (e) => {
  const hay = [e.name, e.tension, e.principio, ...(e.sector||[]), ...(e.style||[]), ...(e.mood||[]), ...(e.patterns||[]), ...(e.use_for||[])].join(' ').toLowerCase();
  return terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
};
const ranked = catalog.entries.map(e => ({ e, s: score(e) })).sort((a, b) => b.s - a.s).filter(x => x.s > 0).slice(0, topN);
if (ranked.length === 0) { console.error('Nenhum estudo de caso relevante no catálogo para essa query.'); process.exit(2); }

// ── 2) carregar marca (tokens concretos = re-skin) ───────────────────────────────
const ds = JSON.parse(readFileSync(`clients/${brand}/outputs/branding/design-system.json`, 'utf-8'));
const antiDna = (ds.anti_dna || []).map(s => s.toLowerCase());

// ── 3) gate da alma: padrão da fonte vs anti_dna da marca ────────────────────────
// pontes explícitas (palavras que não batem por substring mas conflitam de fato)
const BRIDGES = [
  { pat: /(p[íi]lula|pill|radius|500px)/i, anti: /(border-radius|radius)/, reason: 'border-radius alto viola o anti_dna' },
  { pat: /(foto|stock|movimento|corredor|banco de imagem)/i, anti: /(foto|imagem|banco|stock)/, reason: 'foto de banco de imagem viola o anti_dna' },
  { pat: /(gradiente|aurora|degrad[êe])/i, anti: /(gradiente|aurora|degrad)/, reason: 'gradiente/aurora viola o anti_dna' },
  { pat: /(emoji)/i, anti: /(emoji)/, reason: 'emoji viola o anti_dna' },
];
// O re-skin já resolve cor/fonte/copy automaticamente — o gate só rejeita conflito
// ESTRUTURAL/mecânico (radius alto, foto de stock, gradiente, emoji). Cor de acento,
// "dark", "paleta" NÃO são rejeitados: viram tokens da marca.
function violates(patternText) {
  const t = patternText.toLowerCase();
  for (const b of BRIDGES) {
    if (b.pat.test(t) && antiDna.some(a => b.anti.test(a))) return `viola anti_dna: ${b.reason}`;
  }
  return null;
}

// ── 4) compor blueprint: ESTRUTURA dos casos + RE-SKIN da marca ──────────────────
const sources = [], rejected = [], absorbed = [], nuncaCopiar = new Set();
let sectionPlan = [];

for (const { e, s } of ranked) {
  const cs = JSON.parse(readFileSync(join(CS_DIR, e.file.replace('case-studies/', '')), 'utf-8'));
  sources.push({ id: cs.id, name: cs.name, role_in_library: cs.role_in_library, match_score: s,
    contributes: 'estrutura/padrões (nunca paleta/copy/fonte)' });

  // estrutura: ordem de seções e componentes (só o esqueleto)
  if (sectionPlan.length === 0) {
    const seen = new Set();
    sectionPlan = (cs.structure?.sections || [])
      .filter(sec => { if (seen.has(sec.role) && sec.role !== 'content') return false; seen.add(sec.role); return sec.height > 40; })
      .map(sec => ({ role: sec.role, from_case: cs.id }));
  }

  // padrões absorvíveis filtrados pelo gate
  for (const item of (cs.concept?.absorver || [])) {
    const v = violates(item);
    if (v) rejected.push({ pattern: item, from: cs.id, reason: v, reskin: 'substituir pelo padrão da marca' });
    else absorbed.push({ pattern: item, from: cs.id });
  }
  (cs.concept?.nunca_copiar || []).forEach(x => nuncaCopiar.add(x));
}

// ── 5) tokens da marca (a alma que veste) ────────────────────────────────────────
const tokens = {
  palette: ds.color_system,
  typography: {
    headline: `${ds.typography.headline_family} ${ds.typography.headline_weight}`,
    editorial: `${ds.typography.editorial_family} ${ds.typography.editorial_style}`,
    mono: ds.typography.mono_family,
    rules: ds.typography.rules,
  },
  spacing: ds.spacing, layout_density: ds.layout_density,
  border_radius: ds.border_radius, shadows: ds.shadows,
  layout_patterns: ds.layout_patterns, components: ds.components,
  ux_rules: ds.ux_rules, perception_dna: ds.perception_dna,
};

const blueprint = {
  _meta: { engine: 'construir.mjs — Anel 3 Motor de Estudo', generated_at: new Date().toISOString(),
    rule: 'Estrutura vem dos estudos de caso. Paleta/tipografia/copy vêm da marca. Nunca clone.' },
  objetivo, brand,
  sources,
  tokens,
  sections: sectionPlan,
  patterns_absorbed: absorbed,
  soul_gate: {
    reskin_rule: 'palette + typography + copy + radius = MARCA; ordem de seções + componentes = estudos de caso',
    rejected,
    nunca_copiar: [...nuncaCopiar],
    anti_dna_da_marca: ds.anti_dna,
  },
  next: 'Consumir por site-builder (gera HTML com os tokens da marca). Teste Supremo antes de entregar.',
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(blueprint, null, 2), 'utf-8');

// ── relatório legível ────────────────────────────────────────────────────────────
console.log(`\n🏗️  /construir — ${objetivo}`);
console.log(`    marca: ${brand}  |  blueprint: ${out}\n`);
console.log(`📚  Estudos usados (estrutura): ${sources.map(s => `${s.id}[${s.match_score}]`).join(', ')}`);
console.log(`🧱  Seções (esqueleto): ${sectionPlan.map(s => s.role).join(' → ')}`);
console.log(`✅  Padrões absorvidos: ${absorbed.length}`);
absorbed.forEach(a => console.log(`    + ${a.pattern.slice(0, 70)}  (${a.from})`));
console.log(`🛡️  Gate da alma — REJEITADOS: ${rejected.length}`);
rejected.forEach(r => console.log(`    ✗ ${r.pattern.slice(0, 50)}  → ${r.reason}`));
console.log(`🎨  Re-skin: paleta ${tokens.palette.background}/${tokens.palette.accent}, fonte ${ds.typography.headline_family}, radius ${tokens.border_radius}`);
console.log(`🚫  nunca_copiar herdado: ${[...nuncaCopiar].length} itens`);
