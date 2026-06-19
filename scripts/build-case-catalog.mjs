#!/usr/bin/env node
/**
 * build-case-catalog.mjs — MarketingOS / Anel 2 do Motor de Estudo
 * Varre intelligence/reference-library/case-studies/*.json e monta um índice leve
 * e consultável (_catalog.json). É o "conjunto" que alimenta /construir e as skills.
 *
 * Uso:
 *   node scripts/build-case-catalog.mjs
 *   node scripts/build-case-catalog.mjs --query "agência dark pílula"   # busca rápida
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const DIR = 'intelligence/reference-library/case-studies';
const OUT = join(DIR, '_catalog.json');

const A = process.argv.slice(2);
const query = (() => { const i = A.indexOf('--query'); return i !== -1 ? A[i + 1] : null; })();

const files = readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
const entries = files.map(f => {
  const c = JSON.parse(readFileSync(join(DIR, f), 'utf-8'));
  return {
    id: c.id, slug: c.slug, name: c.name,
    source_url: c.source_url, source_type: c.source_type,
    role_in_library: c.role_in_library,
    status: c.system?.status,
    tension: c.concept?.tension || '',
    principio: c.concept?.principio_transferivel || '',
    sector: c.index?.sector || [],
    style: c.index?.style || [],
    mood: c.index?.mood || [],
    patterns: c.index?.patterns || [],
    use_for: c.index?.use_for || [],
    stack: c.physical?.stack || [],
    file: `case-studies/${f}`,
  };
});

const catalog = {
  _meta: {
    name: "Catálogo de Estudos de Caso — Motor de Estudo",
    built_at: new Date().toISOString(),
    count: entries.length,
    rule: "Anel 2. Consulta por setor/estilo/padrão/tensão. Alimenta /construir e qualquer skill de criação.",
  },
  entries,
};
writeFileSync(OUT, JSON.stringify(catalog, null, 2), 'utf-8');
console.log(`✅ catálogo: ${OUT}  (${entries.length} estudo${entries.length === 1 ? '' : 's'})`);

if (query) {
  const terms = query.toLowerCase().split(/\s+/);
  const score = (e) => {
    const hay = [e.name, e.tension, e.principio, ...e.sector, ...e.style, ...e.mood, ...e.patterns, ...e.use_for, ...e.stack].join(' ').toLowerCase();
    return terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
  };
  const ranked = entries.map(e => ({ e, s: score(e) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  console.log(`\n🔎  "${query}" → ${ranked.length} resultado(s):`);
  for (const { e, s } of ranked.slice(0, 5)) {
    console.log(`   [${s}] ${e.id}  (${e.role_in_library})  — ${e.tension}`);
    console.log(`        padrões: ${e.patterns.join(', ')}`);
  }
}
