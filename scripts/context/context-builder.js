'use strict';

const fs = require('fs');
const path = require('path');
const { createEmptyContext, normalizeReferenceContext, normalizeResolvedReferences } = require('./context-schema');
const { resolveKnowledgePlan, normalizeOutputType } = require('./knowledge-resolver');
const { resolveReferences } = require('./reference-resolver');

function buildContext(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const clientSlug = options.client_slug || options.clientSlug || options.slug;
  const outputType = normalizeOutputType(options.output_type || options.outputType || options.type);

  if (!clientSlug) {
    throw new Error('buildContext requires client_slug');
  }

  const context = createEmptyContext(clientSlug, outputType);
  const plan = resolveKnowledgePlan(outputType);
  context.context_report.sources.knowledge_profile = outputType;

  for (const file of plan.files) {
    const resolvedPath = path.join(rootDir, file.path.replace('{slug}', clientSlug));
    const value = readFileByType(resolvedPath, file, context.context_report, rootDir);
    if (value === null || value === undefined) continue;
    assignContextValue(context, file.key, value);
  }

  context.constraints = collectConstraints(context);
  context.industry = collectIndustry(context);

  if (context.reference_context && Object.keys(context.reference_context).length) {
    const normalized = normalizeReferenceContext(context.reference_context);
    context.references = normalized.references_used;
    context.reference_summary = normalized;
  } else {
    const resolved = resolveReferences({
      rootDir,
      outputType,
      perception: context.perception,
      visualDna: context.visual_dna,
      limit: plan.reference_limit,
      report: context.context_report,
    });
    context.references = resolved;
    context.reference_summary = normalizeResolvedReferences(resolved);
  }

  context.context_report.summary = {
    client_slug: clientSlug,
    output_type: outputType,
    loaded_count: context.context_report.loaded.length,
    missing_count: context.context_report.missing.length,
    skipped_count: context.context_report.skipped.length,
    errors_count: context.context_report.errors.length,
    references_count: Array.isArray(context.references) ? context.references.length : 0,
    reference_source: context.reference_summary ? context.reference_summary.source : 'none',
  };

  return context;
}

function readFileByType(filePath, file, report, rootDir) {
  const rel = relative(rootDir, filePath);
  if (!fs.existsSync(filePath)) {
    report.missing.push({ key: file.key, path: rel, required: Boolean(file.required) });
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    report.loaded.push({ key: file.key, path: rel });
    if (file.type === 'json') {
      return JSON.parse(raw);
    }
    return raw;
  } catch (error) {
    report.errors.push({ key: file.key, path: rel, error: error.message });
    return null;
  }
}

function assignContextValue(context, key, value) {
  if (key === 'client') {
    context.client = { raw: value };
    return;
  }
  if (key === 'branding') {
    context.branding = value || {};
    return;
  }
  if (key === 'perception') {
    context.perception = value || {};
    return;
  }
  if (key === 'visual_dna') {
    context.visual_dna = value || {};
    return;
  }
  if (key === 'reference_context') {
    context.reference_context = value || {};
    return;
  }
  context[key] = value;
}

function collectConstraints(context) {
  const constraints = [];
  const brandRules = context.branding && context.branding.rules ? context.branding.rules : {};
  const perceptionSignature = context.perception && context.perception.camada_3_assinatura
    ? context.perception.camada_3_assinatura
    : {};

  pushAll(constraints, brandRules.never, 'branding.rules.never');
  pushAll(constraints, perceptionSignature.anti_dna, 'perception.camada_3_assinatura.anti_dna');

  const direction = context.perception && context.perception.camada_6_direcao_criativa;
  if (direction) {
    pushAll(constraints, direction.nunca_parecer, 'perception.camada_6_direcao_criativa.nunca_parecer');
    pushAll(constraints, direction.palavras_proibidas, 'perception.camada_6_direcao_criativa.palavras_proibidas');
  }

  return constraints;
}

function collectIndustry(context) {
  const raw = context.client && context.client.raw ? context.client.raw : '';
  const match = String(raw).match(/(?:Segmento|Nicho|Setor)\s*[:\-]\s*(.+)/i);
  return {
    raw: match ? match[1].trim() : '',
  };
}

function pushAll(target, values, source) {
  if (!values) return;
  const list = Array.isArray(values) ? values : [values];
  for (const value of list) {
    if (!value) continue;
    if (typeof value === 'object') {
      target.push({ source, value: value.proibido || value.value || JSON.stringify(value), raw: value });
    } else {
      target.push({ source, value: String(value) });
    }
  }
}

function relative(rootDir, filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const context = buildContext({
    client_slug: args.slug || args.client,
    output_type: args.output || args.type || 'default',
    rootDir: process.cwd(),
  });
  console.log(JSON.stringify(context, null, 2));
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
      continue;
    }
    result[key] = next;
    i += 1;
  }
  return result;
}

module.exports = {
  buildContext,
};
