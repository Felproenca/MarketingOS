#!/usr/bin/env node
/**
 * synthesize-case-study.mjs — MarketingOS / Keystone do Motor de Estudo
 * Funde a face de CONSTRUÇÃO (medida por extract-structure.mjs) com a face de
 * PERCEPÇÃO (interpretada pela engenharia reversa /reverter) num case-study único.
 *
 * O script NÃO interpreta — só estrutura. O conceito vem pronto do operador/skill.
 *
 * Uso:
 *   node scripts/synthesize-case-study.mjs \
 *     --structure .poc/itaplay.json \
 *     --concept   .poc/itaplay.concept.json \
 *     --out intelligence/reference-library/case-studies/itaplay.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const A = process.argv.slice(2);
const arg = (f) => { const i = A.indexOf(f); return i !== -1 ? A[i + 1] : null; };
const structPath = arg('--structure'), conceptPath = arg('--concept'), out = arg('--out');
if (!structPath || !conceptPath || !out) {
  console.error('uso: --structure <json> --concept <json> --out <json>');
  process.exit(1);
}

const S = JSON.parse(readFileSync(structPath, 'utf-8'));
const C = JSON.parse(readFileSync(conceptPath, 'utf-8'));

// ── accents: cores saturadas (não cinza/branco/preto) da paleta medida ──────────
const saturated = (hex) => {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return false;
  const n = parseInt(m[1], 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (Math.max(r, g, b) - Math.min(r, g, b)) > 40;
};
const accents = [...new Set([...(S.palette?.backgrounds || []), ...(S.palette?.text || [])]
  .map(x => x.value).filter(saturated))];

// ── mapear seções medidas → papel ────────────────────────────────────────────────
const roleOfSection = (sec) => {
  const t = (sec.tag || '').toLowerCase(), c = (sec.class || '').toLowerCase();
  if (t === 'header' || t === 'nav' || c.includes('header')) return 'header';
  if (t === 'footer' || c.includes('footer')) return 'footer';
  if (c.includes('hero') || c.includes('banner')) return 'hero';
  return 'content';
};
const sections = (S.sections || []).map(sec => ({
  role: roleOfSection(sec),
  headings: (sec.headings || []).map(h => h.replace(/\s+/g, ' ').trim()),
  ctas: sec.ctas || [],
  bg: sec.bg || null,
  height: sec.height || 0,
}));

const slug = C.slug || (S.url || '').replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/(^-|-$)/g, '').toLowerCase();

const caseStudy = {
  id: `cs-${slug}`,
  slug,
  name: C.name || S.title || slug,
  source_url: S.url || C.source_url || '',
  source_type: C.source_type || 'site',
  captured_at: S.captured_at || new Date().toISOString(),
  role_in_library: C.role_in_library || 'referência',

  physical: {
    screenshots: C.screenshots || [],
    video: C.video || null,
    stack: S.stack || [],
    stack_confidence: (S.stack && S.stack.length) ? 'detected' : 'inferred',
  },

  structure: {
    palette: {
      backgrounds: S.palette?.backgrounds || [],
      text: S.palette?.text || [],
      accents,
    },
    typography: {
      fonts: S.typography?.fonts || [],
      scale: S.typography?.sizes || [],
      weights: S.typography?.weights || [],
    },
    radius: S.radius || [],
    grid: C.structure_overrides?.grid || '',
    sections,
    components: C.structure_overrides?.components || [],
    motion: C.structure_overrides?.motion || [],
    copy: (S.headings || []).map(h => (h.text || '').replace(/\s+/g, ' ').trim()).filter(Boolean),
  },

  concept: C.concept || {},
  index: C.index || {},
  system: {
    status: C.status || 'draft',
    validated_by: C.validated_by || null,
    validated_at: C.validated_at || null,
    used_in: [],
    notes: C.notes || null,
  },
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(caseStudy, null, 2), 'utf-8');

console.log('✅ case-study:', out);
console.log('   id:', caseStudy.id, '| papel:', caseStudy.role_in_library);
console.log('   accents detectados:', accents.join(', ') || '(nenhum)');
console.log('   seções:', sections.length, '| tensão:', caseStudy.concept.tension || '⚠️ vazia');
console.log('   índice setor:', (caseStudy.index.sector || []).join(', ') || '⚠️ vazio');
