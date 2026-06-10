'use strict';

const fs = require('fs');
const path = require('path');
const { normalizeReference } = require('./context-schema');

function resolveReferences(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const limit = Number(options.limit || 3);
  const outputType = String(options.outputType || '').toLowerCase();
  const indexPath = path.join(rootDir, 'intelligence', 'reference-library', 'index.json');
  const report = options.report;

  const index = readJson(indexPath, report, 'reference_index');
  const entries = Array.isArray(index && index.references) ? index.references : [];
  const scored = entries
    .map((entry) => {
      const full = loadFullReference(rootDir, entry, report) || entry;
      const normalized = normalizeReference(full, full.__source_path || '');
      return {
        ...normalized,
        score: scoreReference(normalized, options),
        index_entry: entry,
      };
    })
    .filter((ref) => ref.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!entries.length && report) {
    report.missing.push({ key: 'reference_index', path: relative(rootDir, indexPath), reason: 'empty_or_missing' });
  }

  if (outputType && report) {
    report.sources.reference_resolver_output_type = outputType;
  }

  return scored;
}

function loadFullReference(rootDir, entry, report) {
  const slug = entry && entry.slug;
  if (!slug) return null;

  const candidates = [
    path.join(rootDir, 'intelligence', 'reference-library', 'seed', `${slug}.json`),
    path.join(rootDir, 'intelligence', 'reference-library', 'acquired', `${slug}.json`),
  ];

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const json = readJson(candidate, report, `reference:${slug}`);
    if (json) {
      json.__source_path = relative(rootDir, candidate);
      return json;
    }
  }

  if (report) {
    report.skipped.push({
      key: `reference:${slug}`,
      path: candidates.map((candidate) => relative(rootDir, candidate)).join(' | '),
      reason: 'full_json_not_found_used_index_entry',
    });
  }
  return null;
}

function scoreReference(reference, options) {
  const perception = options.perception || {};
  const visualDna = options.visualDna || {};
  const outputType = String(options.outputType || '').toLowerCase();
  const haystack = [
    reference.tension,
    reference.transferable_principle,
    ...(reference.emotions || []),
    ...(reference.contexts || []),
    JSON.stringify(reference.dimensions || {}),
  ]
    .join(' ')
    .toLowerCase();

  const signals = extractSignals(perception, visualDna, outputType);
  let score = 0;

  for (const signal of signals.text) {
    if (signal && haystack.includes(signal)) score += 3;
  }

  for (const [key, value] of Object.entries(signals.dimensions)) {
    if (reference.dimensions && reference.dimensions[key] === value) score += 2;
  }

  for (const context of reference.contexts || []) {
    if (outputType && String(context).toLowerCase().includes(outputType)) score += 2;
    if (outputType === 'carousel' && ['produto', 'tecnologia', 'saas'].includes(String(context).toLowerCase())) score += 1;
  }

  if (reference.transferable_principle) score += 1;
  if (reference.what_to_steal && reference.what_to_steal.length) score += 1;
  return score;
}

function extractSignals(perception, visualDna, outputType) {
  const signature = perception.camada_3_assinatura || {};
  const layer4 = perception.camada_4_visual_dna || {};
  const dna = visualDna.visual_dna || visualDna || {};
  const text = [
    signature.tensao_principal,
    signature.principal,
    ...(signature.tensoes_secundarias || []).map((item) => item.tensao || item),
    outputType,
  ]
    .flat()
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return {
    text,
    dimensions: {
      tempo: normalizeDimension(dna.tempo || layer4.tempo),
      densidade: normalizeDimension(dna.densidade || layer4.densidade),
      temperatura: normalizeDimension(dna.temperatura || layer4.temperatura),
      movimento: normalizeDimension(dna.movimento || layer4.movimento),
      contraste: normalizeDimension(dna.contraste || layer4.contraste),
    },
  };
}

function normalizeDimension(value) {
  const text = String(value || '').toLowerCase();
  if (!text) return '';
  if (text.includes('lento')) return 'lento';
  if (text.includes('moderado') || text.includes('medio') || text.includes('médio')) return 'moderado';
  if (text.includes('acelerado') || text.includes('rapido') || text.includes('rápido')) return 'acelerado';
  if (text.includes('baixo') || text.includes('baixa') || text.includes('esparso')) return 'esparso';
  if (text.includes('equilibr')) return 'equilibrado';
  if (text.includes('denso') || text.includes('alta')) return 'denso';
  if (text.includes('fria')) return 'fria';
  if (text.includes('quente')) return 'quente';
  if (text.includes('neutra')) return 'neutra';
  if (text.includes('sutil') || text.includes('preciso')) return 'sutil';
  if (text.includes('expressivo')) return 'expressivo';
  if (text.includes('extremo') || text.includes('alto')) return 'extremo';
  return text.split(/\s+/)[0];
}

function readJson(filePath, report, key) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (report) report.loaded.push({ key, path: relative(process.cwd(), filePath) });
    return json;
  } catch (error) {
    if (report) report.errors.push({ key, path: relative(process.cwd(), filePath), error: error.message });
    return null;
  }
}

function relative(rootDir, filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

module.exports = {
  resolveReferences,
  scoreReference,
};
