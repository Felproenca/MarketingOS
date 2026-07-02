#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_STATE = path.join(ROOT, 'agency', 'leads', 'signal-intelligence.json');

const EVENT_POINTS = {
  active_ad: 30,
  launch: 28,
  new_unit: 26,
  deadline_promotion: 25,
  active_campaign: 24,
  event: 20,
  hiring_marketing: 18,
  recent_rebrand: 16,
};

const RUPTURE_POINTS = {
  broken_destination: 25,
  no_campaign_page: 22,
  generic_destination: 16,
  direct_to_whatsapp: 12,
  weak_offer_match: 10,
  none_verified: 0,
};

const FIT_POINTS = { exact: 20, strong: 15, partial: 8, none: 0 };
const CAPACITY_POINTS = { verified_spend: 20, active_operation: 14, probable: 7, unknown: 0 };
const OUTCOMES = new Set([
  'queued', 'contacted', 'replied', 'interested', 'meeting',
  'won', 'lost', 'no_reply', 'invalid',
]);

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }
    const [key, inline] = token.slice(2).split('=');
    const next = argv[i + 1];
    if (inline !== undefined) args[key] = inline;
    else if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else args[key] = true;
  }
  return args;
}

function emptyState() {
  return { version: 1, experiment: null, marketDemand: [], prospects: [], updatedAt: null };
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function required(args, keys) {
  const missing = keys.filter((key) => !args[key]);
  if (missing.length) {
    throw new Error(`Campos obrigatorios ausentes: ${missing.map((key) => `--${key}`).join(', ')}`);
  }
}

function dateOnly(value = new Date()) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function ageInDays(observedAt, now = new Date()) {
  const observed = new Date(`${observedAt}T00:00:00Z`);
  if (Number.isNaN(observed.getTime())) return 999;
  return Math.max(0, Math.floor((now - observed) / 86400000));
}

function freshnessMultiplier(days) {
  if (days <= 3) return 1;
  if (days <= 7) return 0.9;
  if (days <= 14) return 0.7;
  if (days <= 30) return 0.4;
  return 0;
}

function evidenceMultiplier(evidence) {
  if (!evidence?.url || !evidence?.observedAt) return 0;
  if (evidence.confidence === 'verified') return 1;
  if (evidence.confidence === 'probable') return 0.7;
  return 0.4;
}

function calculateScore(prospect, now = new Date()) {
  const days = ageInDays(prospect.evidence.observedAt, now);
  const freshness = freshnessMultiplier(days);
  const confidence = evidenceMultiplier(prospect.evidence);
  const timing = Math.round((EVENT_POINTS[prospect.event.type] || 0) * freshness * confidence);
  const capacity = CAPACITY_POINTS[prospect.capacity] || 0;
  const rupture = RUPTURE_POINTS[prospect.rupture.type] || 0;
  const fit = FIT_POINTS[prospect.fit] || 0;
  return {
    total: timing + capacity + rupture + fit,
    dimensions: { timing, capacity, rupture, fit },
    freshnessDays: days,
    eligible: confidence > 0 && freshness > 0 && fit > 0,
  };
}

function hypothesisFor(prospect) {
  return `A empresa esta em movimento porque ${prospect.event.description}. Foi observado que ${prospect.rupture.description}. A oferta pode ser apresentada como experimento, sem afirmar perda ou resultado nao medido.`;
}

function messageFor(prospect) {
  const name = prospect.contact?.name ? `, ${prospect.contact.name}` : '';
  return `Oi${name}. Vi que ${prospect.event.description}. Ao conferir o caminho atual, notei que ${prospect.rupture.description}. Eu consigo montar ${prospect.offer} como um experimento curto. Posso te mostrar a ideia em 30 segundos?`;
}

function normalizeProspect(raw) {
  required(raw, [
    'company', 'segment', 'city', 'event-type', 'event-description',
    'rupture-type', 'rupture-description', 'fit', 'capacity',
    'evidence-url', 'observed-at', 'offer',
  ]);

  const prospect = {
    id: raw.id || `${slugify(raw.company)}-${Date.now()}`,
    company: raw.company,
    segment: raw.segment,
    city: raw.city,
    website: raw.website || null,
    event: { type: raw['event-type'], description: raw['event-description'] },
    rupture: { type: raw['rupture-type'], description: raw['rupture-description'] },
    fit: raw.fit,
    capacity: raw.capacity,
    evidence: {
      url: raw['evidence-url'],
      observedAt: raw['observed-at'],
      confidence: raw.confidence || 'probable',
      note: raw['evidence-note'] || null,
    },
    offer: raw.offer,
    contact: {
      name: raw['contact-name'] || null,
      channel: raw.channel || null,
      value: raw.contact || null,
    },
    status: 'queued',
    outcomes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  prospect.score = calculateScore(prospect);
  prospect.hypothesis = hypothesisFor(prospect);
  prospect.messageDraft = messageFor(prospect);
  return prospect;
}

function statePath(args) {
  return args.state ? path.resolve(args.state) : DEFAULT_STATE;
}

function loadState(args) {
  const state = readJson(statePath(args), emptyState());
  state.marketDemand = state.marketDemand || [];
  return state;
}

function saveState(args, state) {
  state.updatedAt = new Date().toISOString();
  writeJson(statePath(args), state);
}

function init(args) {
  required(args, ['segment', 'city', 'offer']);
  const state = emptyState();
  state.experiment = {
    id: `${slugify(args.segment)}-${slugify(args.city)}-${dateOnly()}`,
    segment: args.segment,
    city: args.city,
    offer: args.offer,
    targetObservations: Number(args.target || 100),
    targetApproaches: Number(args.approaches || 20),
    startedAt: new Date().toISOString(),
  };
  saveState(args, state);
  console.log(`Experimento criado: ${state.experiment.id}`);
  console.log(`Estado: ${statePath(args)}`);
}

function add(args) {
  const state = loadState(args);
  const prospect = normalizeProspect(args);
  if (state.prospects.some((item) => item.id === prospect.id)) {
    throw new Error(`Prospecto duplicado: ${prospect.id}`);
  }
  state.prospects.push(prospect);
  saveState(args, state);
  console.log(`Adicionado: ${prospect.company} | score ${prospect.score.total}/95`);
  console.log(`Elegivel para revisao: ${prospect.score.eligible ? 'sim' : 'nao'}`);
}

function ingest(args) {
  required(args, ['file']);
  const source = readJson(path.resolve(args.file));
  if (!Array.isArray(source)) throw new Error('O arquivo de ingestao deve conter um array JSON.');
  const state = loadState(args);
  let added = 0;
  for (const raw of source) {
    const prospect = normalizeProspect(raw);
    if (state.prospects.some((item) => item.id === prospect.id)) continue;
    state.prospects.push(prospect);
    added += 1;
  }
  saveState(args, state);
  console.log(`${added} prospecto(s) adicionados.`);
}

function trends(args) {
  required(args, ['terms', 'geo', 'timeframe', 'source-url', 'observed-at']);
  const state = loadState(args);
  const values = args.values
    ? args.values.split(',').map((value) => Number(value.trim()))
    : [];
  const terms = args.terms.split(',').map((value) => value.trim()).filter(Boolean);
  if (values.length && values.length !== terms.length) {
    throw new Error('--values deve ter a mesma quantidade de itens de --terms.');
  }
  const snapshot = {
    id: `google-trends-${Date.now()}`,
    source: 'google_trends',
    terms,
    geo: args.geo,
    timeframe: args.timeframe,
    values,
    interpretation: args.interpretation || null,
    sourceUrl: args['source-url'],
    observedAt: args['observed-at'],
    createdAt: new Date().toISOString(),
  };
  state.marketDemand.push(snapshot);
  saveState(args, state);
  console.log(`Google Trends registrado: ${terms.join(' | ')} (${args.geo}, ${args.timeframe})`);
  console.log('Uso: priorizacao do experimento; nao altera o score individual dos prospectos.');
}

function rank(args) {
  const state = loadState(args);
  const ranked = state.prospects
    .map((prospect) => ({ ...prospect, score: calculateScore(prospect) }))
    .filter((prospect) => prospect.score.eligible)
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, Number(args.limit || 20));

  if (!ranked.length) {
    console.log('Nenhum prospecto elegivel. Registre evidencia recente e fit valido.');
    return;
  }
  for (const prospect of ranked) {
    console.log(`${String(prospect.score.total).padStart(2)} | ${prospect.company} | ${prospect.event.type} | ${prospect.status}`);
    console.log(`   Evidencia: ${prospect.evidence.url}`);
    console.log(`   Mensagem: ${prospect.messageDraft}`);
  }
}

function outcome(args) {
  required(args, ['id', 'status']);
  if (!OUTCOMES.has(args.status)) throw new Error(`Status invalido: ${args.status}`);
  const state = loadState(args);
  const prospect = state.prospects.find((item) => item.id === args.id);
  if (!prospect) throw new Error(`Prospecto nao encontrado: ${args.id}`);
  prospect.status = args.status;
  prospect.outcomes.push({ status: args.status, reason: args.reason || null, at: new Date().toISOString() });
  prospect.updatedAt = new Date().toISOString();
  saveState(args, state);
  console.log(`Resultado registrado: ${prospect.company} -> ${args.status}`);
}

function report(args) {
  const state = loadState(args);
  const counts = {};
  for (const prospect of state.prospects) counts[prospect.status] = (counts[prospect.status] || 0) + 1;
  const total = state.prospects.length;
  const contacted = total - (counts.queued || 0);
  const replied = (counts.replied || 0) + (counts.interested || 0) + (counts.meeting || 0) + (counts.won || 0);
  console.log(`Experimento: ${state.experiment?.id || 'nao iniciado'}`);
  console.log(`Observacoes: ${total}`);
  console.log(`Contatados: ${contacted}`);
  console.log(`Responderam: ${replied}`);
  console.log(`Vendas: ${counts.won || 0}`);
  console.log(`Snapshots Google Trends: ${state.marketDemand.length}`);
  console.log(`Status: ${JSON.stringify(counts)}`);
}

function help() {
  console.log(`Uso:
  signals init --segment "..." --city "..." --offer "..."
  signals add --company "..." [campos de sinal]
  signals ingest --file observations.json
  signals trends --terms "termo 1,termo 2" --geo "BR-SP" --timeframe "90d" --source-url "..." --observed-at "AAAA-MM-DD"
  signals rank [--limit 20]
  signals outcome --id ID --status replied
  signals report

Eventos: ${Object.keys(EVENT_POINTS).join(', ')}
Rupturas: ${Object.keys(RUPTURE_POINTS).join(', ')}
Fit: ${Object.keys(FIT_POINTS).join(', ')}
Capacidade: ${Object.keys(CAPACITY_POINTS).join(', ')}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const commands = { init, add, ingest, trends, rank, outcome, report };
  if (!command || !commands[command]) {
    help();
    process.exit(command ? 1 : 0);
  }
  commands[command](args);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Erro: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { calculateScore, freshnessMultiplier, evidenceMultiplier, normalizeProspect };
