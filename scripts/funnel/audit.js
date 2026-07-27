#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  formatFunnelMetadataMarkdown,
  inferFunnelMetadata,
  validateFunnelMetadata,
} = require('./metadata');

const ROOT = path.resolve(__dirname, '..', '..');
const CLIENTS_DIR = path.join(ROOT, 'clients');
const BASELINE_FILE = 'funnel-baseline.json';
const IGNORED_DIRS = new Set(['.vercel', 'node_modules', '.git', 'dist', 'build']);
const IGNORED_FILES = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'package.json',
  'package-lock.json',
  'hyperframes.json',
  'agent-roster.json',
  'task-graph.json',
  'context-report.json',
  'legenda.md',
]);

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || 'audit';

  if (command === 'metadata') {
    printMetadata(args);
    return;
  }

  if (command === 'audit') {
    auditClient(args);
    return;
  }

  fail(`Comando desconhecido: ${command}\nUso: node scripts/funnel/audit.js audit --slug [slug]\n     node scripts/funnel/audit.js metadata --type carousel --objective "..."`);
}

function printMetadata(args) {
  const metadata = inferFunnelMetadata({
    output_type: args.type || args.output || 'default',
    objective: args.objective || args.objetivo || '',
    cta: args.cta || '',
  });
  const validation = validateFunnelMetadata(metadata);
  if (args.json) {
    console.log(JSON.stringify({ validation, funnel_metadata: metadata }, null, 2));
    return;
  }
  console.log(formatFunnelMetadataMarkdown(metadata));
}

function auditClient(args) {
  const slug = args.slug || args.client;
  if (!slug) fail('Uso: node scripts/funnel/audit.js audit --slug [slug]');

  const clientDir = path.join(CLIENTS_DIR, slug);
  if (!fs.existsSync(clientDir)) fail(`Cliente nao encontrado: ${slug}`);

  const baseline = readBaseline(clientDir);
  const files = collectCommercialFiles(clientDir);
  const rows = files.map((file) => auditFile(file, baseline));
  const enforcedRows = rows.filter((row) => row.status !== 'legacy_discarded');
  const summary = {
    client: slug,
    checked_at: new Date().toISOString(),
    baseline,
    total_files: enforcedRows.length,
    valid: enforcedRows.filter((row) => row.status === 'valid').length,
    missing: enforcedRows.filter((row) => row.status === 'missing').length,
    invalid: enforcedRows.filter((row) => row.status === 'invalid').length,
    not_applicable: enforcedRows.filter((row) => row.status === 'not_applicable').length,
    legacy_discarded: rows.filter((row) => row.status === 'legacy_discarded').length,
    files: rows,
  };

  const outDir = path.join(clientDir, 'outputs', 'acquisition');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'funnel-operational-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2), 'utf8');

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(`# Funnel Operational Audit - ${slug}`);
  console.log('');
  console.log(`- Arquivos verificados: ${summary.total_files}`);
  console.log(`- Validos: ${summary.valid}`);
  console.log(`- Sem metadata: ${summary.missing}`);
  console.log(`- Invalidos: ${summary.invalid}`);
  console.log(`- Nao aplicaveis: ${summary.not_applicable}`);
  console.log(`- Legados descartados: ${summary.legacy_discarded}`);
  if (baseline && baseline.activated_at) console.log(`- Baseline: ${baseline.activated_at}`);
  console.log(`- Relatorio: ${relative(outPath)}`);

  const problemRows = enforcedRows.filter((row) => row.status === 'missing' || row.status === 'invalid').slice(0, 12);
  if (problemRows.length) {
    console.log('');
    console.log('## Pendencias');
    for (const row of problemRows) {
      const detail = row.missing.length ? `missing ${row.missing.join(', ')}` : row.invalid.join(', ');
      console.log(`- ${relative(row.file)}: ${row.status} (${detail})`);
    }
  }
}

function collectCommercialFiles(clientDir) {
  const outputDir = path.join(clientDir, 'outputs');
  if (!fs.existsSync(outputDir)) return [];

  const allowedDirs = new Set([
    'acquisition',
    'carousels',
    'creative-direction',
    'demo',
    'posts',
    'reels',
    'site',
    'strategy',
  ]);
  const allowedExt = new Set(['.json', '.md']);
  const result = [];

  walk(outputDir, (file) => {
    const rel = path.relative(outputDir, file).replace(/\\/g, '/');
    const first = rel.split('/')[0];
    if (!allowedDirs.has(first)) return;
    if (!allowedExt.has(path.extname(file))) return;
    if (shouldIgnoreFile(file, outputDir)) return;
    if (file.endsWith('funnel-operational-audit.json')) return;
    if (file.endsWith(BASELINE_FILE)) return;
    result.push(file);
  });

  return result.sort();
}

function shouldIgnoreFile(file, rootDir) {
  const relParts = path.relative(rootDir, file).split(path.sep);
  if (relParts.some((part) => IGNORED_DIRS.has(part))) return true;
  return IGNORED_FILES.has(path.basename(file));
}

function auditFile(file, baseline) {
  const ext = path.extname(file).toLowerCase();
  const raw = readText(file);
  if (!raw.trim()) return row(file, 'not_applicable');

  if (ext === '.json') {
    try {
      const data = JSON.parse(raw);
      const validation = validateFunnelMetadata(data);
      if (isLegacyDiscarded(file, baseline, validation)) return row(file, 'legacy_discarded', validation);
      if (!hasAnyMetadataSignal(data)) return row(file, 'missing', validation);
      return row(file, validation.valid ? 'valid' : 'invalid', validation);
    } catch (error) {
      return row(file, 'not_applicable', { invalid: ['json_parse_error'], error: error.message });
    }
  }

  if (ext === '.md') {
    const metadata = parseMarkdownMetadata(raw);
    const validation = validateFunnelMetadata(metadata || {});
    if (isLegacyDiscarded(file, baseline, validation)) return row(file, 'legacy_discarded', validation);
    if (!metadata) return row(file, 'missing', validation);
    return row(file, validation.valid ? 'valid' : 'invalid', validation);
  }

  return row(file, 'not_applicable');
}

function readBaseline(clientDir) {
  const baselinePath = path.join(clientDir, 'outputs', 'acquisition', BASELINE_FILE);
  if (!fs.existsSync(baselinePath)) return null;
  try {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    if (!baseline.activated_at || Number.isNaN(Date.parse(baseline.activated_at))) return null;
    return {
      activated_at: baseline.activated_at,
      mode: baseline.mode || 'ignore_legacy_before_activation',
      reason: baseline.reason || '',
    };
  } catch {
    return null;
  }
}

function isLegacyDiscarded(file, baseline, validation) {
  if (!baseline || !baseline.activated_at || validation.valid) return false;
  return fs.statSync(file).mtimeMs < Date.parse(baseline.activated_at);
}

function parseMarkdownMetadata(raw) {
  if (!/^## Funnel Metadata/im.test(raw)) return null;

  const block = raw.split(/^## Funnel Metadata/im)[1] || '';
  const lines = block.split(/\r?\n/);
  const metadata = {};

  for (const line of lines) {
    if (/^##\s+/.test(line)) break;
    const match = line.match(/^-\s*([^:]+):\s*(.*)$/);
    if (!match) continue;
    const key = normalizeMarkdownKey(match[1]);
    if (key) metadata[key] = match[2].trim();
  }

  return metadata;
}

function normalizeMarkdownKey(key) {
  const normalized = key.toLowerCase().trim();
  const map = {
    'funnel stage': 'funnel_stage',
    'intent level': 'intent_level',
    'friction level': 'friction_level',
    'expected lead signal': 'lead_signal_expected',
    'qualification goal': 'qualification_goal',
    'primary cta': 'primary_cta',
    'secondary cta': 'secondary_cta',
    'routing destination': 'routing_destination',
    'next best action': 'next_best_action',
  };
  return map[normalized] || '';
}

function hasAnyMetadataSignal(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.funnel_metadata && typeof data.funnel_metadata === 'object') return true;
  return [
    'funnel_stage',
    'intent_level',
    'friction_level',
    'lead_signal_expected',
    'expected_lead_signal',
    'routing_destination',
    'next_best_action',
  ].some((key) => Object.prototype.hasOwnProperty.call(data, key));
}

function row(file, status, validation = {}) {
  return {
    file,
    status,
    missing: validation.missing || [],
    invalid: validation.invalid || [],
    error: validation.error || '',
  };
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, visit);
      continue;
    }
    visit(full);
  }
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function relative(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function parseArgs(argv) {
  const result = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      result._.push(token);
      continue;
    }
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

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  auditClient,
  parseMarkdownMetadata,
};
