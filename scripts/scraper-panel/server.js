#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const { randomUUID } = require('crypto');

require('dotenv').config();

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PENDING_FILE = path.join(ROOT, 'agency/leads/pending-approval.json');
const SETTINGS_FILE = path.join(ROOT, 'agency/leads/scraper-panel-settings.json');
const SCRAPER_CLI = path.join(ROOT, 'scripts/scraper/index.js');
const FOLLOWUP_CLI = path.join(ROOT, 'scripts/pipeline/followup.js');
const AGENDA_PLAN_CLI = path.join(ROOT, 'scripts/agenda/plan-week.js');
const PUBLISHER_CLI = path.join(ROOT, 'scripts/publisher/index.js');
const AGENDA_SLUG = process.env.AGENDA_SLUG || 'felipe-proenca';

const store = require('../pipeline/store');
const guard = require('../pipeline/guard');

const PORT = parseInt(process.env.SCRAPER_PANEL_PORT || '5173', 10);
const jobs = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

const DEFAULT_SETTINGS = {
  schedule: {
    enabled: false,
    start: '09:00',
    end: '18:00',
    days: [1, 2, 3, 4, 5, 6],
  },
  outputs: {
    whatsapp: true,
    email: false,
    diagnosis: true,
    demo: false,
    landing: false,
    followup: true,
  },
  copy: {
    angle: 'Nomear um gargalo real de aquisição observado no lead.',
    tone: 'Direto, humano, casual, sem parecer automação.',
    cta: 'Terminar com uma pergunta simples que convide resposta.',
    whatsapp: 'Oi! Vi um ponto no posicionamento de vocês que pode estar travando conversas novas. Isso acontece por aí?',
    emailSubject: 'Vi um gargalo de aquisição em {{empresa}}',
    emailBody: 'Oi! Analisei rapidamente a presença de vocês e vi um gargalo que pode estar reduzindo conversas novas. Faz sentido eu te mostrar?',
    notes: 'Primeiro contato nunca envia link, demo ou pitch. Outputs extras entram depois da resposta.',
  },
};

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
}

function agendaFileFor(slug = AGENDA_SLUG) {
  return path.join(ROOT, 'clients', slug, 'agenda.json');
}

function normalizeAgendaStatus(value, fallback = 'planned') {
  const allowed = ['planned', 'drafted', 'prepared', 'published', 'measured'];
  return allowed.includes(value) ? value : fallback;
}

function formatForPublisher(format) {
  if (format === 'carrossel') return 'carousel';
  if (format === 'reel') return 'reel';
  return 'feed';
}

function collectAgendaFiles(item) {
  const explicit = Array.isArray(item.files) ? item.files : [];
  if (explicit.length) return explicit;
  if (!item.draftPath) return [];

  const draftPath = path.resolve(ROOT, item.draftPath);
  if (!draftPath.startsWith(ROOT)) return [];
  if (!fs.existsSync(draftPath)) return [];

  const mediaRx = /\.(png|jpe?g|webp|mp4|mov|webm)$/i;
  const stat = fs.statSync(draftPath);
  if (stat.isFile() && mediaRx.test(draftPath)) return [path.relative(ROOT, draftPath)];
  if (!stat.isDirectory()) return [];

  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (mediaRx.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(draftPath);

  const preferred = files.filter(file => file.split(path.sep).includes('instagram'));
  return (preferred.length ? preferred : files)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(file => path.relative(ROOT, file));
}

function cleanTime(value, fallback) {
  const text = String(value || '');
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback;
}

function normalizeSettings(input = {}) {
  const schedule = input.schedule || {};
  const outputs = input.outputs || {};
  const copy = input.copy || {};

  return {
    schedule: {
      enabled: schedule.enabled === true,
      start: cleanTime(schedule.start, DEFAULT_SETTINGS.schedule.start),
      end: cleanTime(schedule.end, DEFAULT_SETTINGS.schedule.end),
      days: Array.from(new Set(
        (Array.isArray(schedule.days) ? schedule.days : DEFAULT_SETTINGS.schedule.days)
          .map(Number)
          .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
      )).sort((a, b) => a - b),
    },
    outputs: {
      whatsapp: outputs.whatsapp !== false,
      email: outputs.email === true,
      diagnosis: outputs.diagnosis !== false,
      demo: outputs.demo === true,
      landing: outputs.landing === true,
      followup: outputs.followup !== false,
    },
    copy: {
      angle: String(copy.angle || DEFAULT_SETTINGS.copy.angle).slice(0, 600),
      tone: String(copy.tone || DEFAULT_SETTINGS.copy.tone).slice(0, 600),
      cta: String(copy.cta || DEFAULT_SETTINGS.copy.cta).slice(0, 600),
      whatsapp: String(copy.whatsapp || DEFAULT_SETTINGS.copy.whatsapp).slice(0, 1200),
      emailSubject: String(copy.emailSubject || DEFAULT_SETTINGS.copy.emailSubject).slice(0, 300),
      emailBody: String(copy.emailBody || DEFAULT_SETTINGS.copy.emailBody).slice(0, 1800),
      notes: String(copy.notes || DEFAULT_SETTINGS.copy.notes).slice(0, 1200),
    },
  };
}

function loadSettings() {
  return normalizeSettings(readJson(SETTINGS_FILE, DEFAULT_SETTINGS));
}

function saveSettings(settings) {
  const normalized = normalizeSettings(settings);
  writeJson(SETTINGS_FILE, normalized);
  return normalized;
}

function timeToMinutes(time) {
  const [hour, minute] = String(time).split(':').map(Number);
  return hour * 60 + minute;
}

function withinCustomSchedule(schedule, now = new Date()) {
  if (!schedule.enabled) return false;
  if (!schedule.days.includes(now.getDay())) return false;

  const current = now.getHours() * 60 + now.getMinutes();
  const start = timeToMinutes(schedule.start);
  const end = timeToMinutes(schedule.end);

  if (start === end) return true;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

function sendGate(settings = loadSettings(), now = new Date()) {
  if (guard.remainingToday(now) <= 0) {
    return {
      ok: false,
      source: 'cap',
      ignoreHours: false,
      reason: `Teto diario atingido (${guard.DAILY_CAP} envios). Continue amanha.`,
    };
  }

  const defaultGate = guard.canSend({ now });
  if (defaultGate.ok) {
    return { ok: true, source: 'default', ignoreHours: false, reason: null };
  }

  if (withinCustomSchedule(settings.schedule, now)) {
    return {
      ok: true,
      source: 'custom',
      ignoreHours: true,
      reason: `Janela personalizada ativa (${settings.schedule.start}-${settings.schedule.end}).`,
    };
  }

  if (settings.schedule.enabled) {
    return {
      ok: false,
      source: 'custom',
      ignoreHours: false,
      reason: `Fora da janela personalizada (${settings.schedule.start}-${settings.schedule.end}).`,
    };
  }

  return {
    ok: false,
    source: 'default',
    ignoreHours: false,
    reason: defaultGate.reason,
  };
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload muito grande'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON invalido'));
      }
    });
    req.on('error', reject);
  });
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, number));
}

function pendingList() {
  return readJson(PENDING_FILE, []);
}

function savePending(list) {
  writeJson(PENDING_FILE, list);
}

function compactJob(job) {
  return {
    id: job.id,
    type: job.type,
    label: job.label,
    status: job.status,
    exitCode: job.exitCode,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    command: job.command,
    logs: job.logs.slice(-400),
  };
}

function recentJobs() {
  return Array.from(jobs.values())
    .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
    .slice(0, 10)
    .map(compactJob);
}

function hasRunningJob() {
  return Array.from(jobs.values()).some(job => job.status === 'running');
}

function pipelineSummary(settings = loadSettings()) {
  const state = store.load();
  const contacts = Object.entries(state)
    .map(([key, contact]) => ({ key, ...contact }))
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));

  const counts = contacts.reduce((acc, contact) => {
    const step = contact.step || 'unknown';
    acc[step] = (acc[step] || 0) + 1;
    return acc;
  }, {});

  const dueFollowups = store.dueFollowups();
  const awaitingReply = store.awaitingReply();
  const highTouchDue = store.dueHighTouch();
  const value = store.pipelineValue();
  const gate = sendGate(settings);

  return {
    total: contacts.length,
    counts,
    sentToday: store.sentToday(),
    dueFollowups: dueFollowups.length,
    awaitingReply: awaitingReply.length,
    highTouchDue: highTouchDue.length,
    highTouch: highTouchDue.map(({ key, contact }) => ({
      key,
      name: contact.name,
      segment: contact.segment,
      value: contact.value,
      planValue: contact.planValue,
      nextActionAt: contact.nextActionAt,
      nextActionDraft: contact.nextActionDraft,
    })),
    value, // { mrr, planTotal, deals } — o "R$ em jogo" soma sozinho
    dailyCap: guard.DAILY_CAP,
    remainingToday: guard.remainingToday(),
    withinBusinessHours: guard.withinBusinessHours(),
    canSend: gate.ok,
    sendGateSource: gate.source,
    sendGateIgnoresDefaultHours: gate.ignoreHours,
    sendBlockReason: gate.reason,
    contacts: contacts.slice(0, 120),
  };
}

function statePayload() {
  const pending = pendingList();
  const settings = loadSettings();
  return {
    generatedAt: new Date().toISOString(),
    settings,
    pending: {
      total: pending.length,
      items: pending.map((entry, index) => ({ index, ...entry })),
    },
    pipeline: pipelineSummary(settings),
    jobs: recentJobs(),
  };
}

function appendLog(job, chunk) {
  const lines = String(chunk)
    .replace(/\r/g, '')
    .split('\n')
    .filter(Boolean);

  for (const line of lines) {
    job.logs.push({
      at: new Date().toISOString(),
      line,
    });
  }

  if (job.logs.length > 800) {
    job.logs.splice(0, job.logs.length - 800);
  }
}

function runJob({ type, label, args, env = {} }) {
  if (hasRunningJob()) {
    const error = new Error('Ja existe um job em andamento');
    error.status = 409;
    throw error;
  }

  const id = randomUUID();
  const command = ['node', ...args.map(arg => String(arg))].join(' ');
  const job = {
    id,
    type,
    label,
    status: 'running',
    exitCode: null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    command,
    logs: [],
  };

  jobs.set(id, job);
  appendLog(job, `$ ${command}`);

  const child = spawn(process.execPath, args, {
    cwd: ROOT,
    env: { ...process.env, FORCE_COLOR: '0', ...env },
    windowsHide: true,
  });

  child.stdout.on('data', chunk => appendLog(job, chunk));
  child.stderr.on('data', chunk => appendLog(job, chunk));
  child.on('error', error => {
    job.status = 'failed';
    job.finishedAt = new Date().toISOString();
    appendLog(job, `Erro ao iniciar: ${error.message}`);
  });
  child.on('close', code => {
    job.status = code === 0 ? 'finished' : 'failed';
    job.exitCode = code;
    job.finishedAt = new Date().toISOString();
    appendLog(job, `Processo finalizado com codigo ${code}`);
  });

  return compactJob(job);
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/state') {
    return sendJson(res, 200, statePayload());
  }

  if (req.method === 'GET' && url.pathname === '/api/settings') {
    return sendJson(res, 200, loadSettings());
  }

  if (req.method === 'PUT' && url.pathname === '/api/settings') {
    const body = await readBody(req);
    const settings = saveSettings(body);
    return sendJson(res, 200, settings);
  }

  const jobMatch = url.pathname.match(/^\/api\/jobs\/([^/]+)$/);
  if (req.method === 'GET' && jobMatch) {
    const job = jobs.get(jobMatch[1]);
    if (!job) return sendJson(res, 404, { error: 'Job nao encontrado' });
    return sendJson(res, 200, compactJob(job));
  }

  if (req.method === 'POST' && url.pathname === '/api/campaigns/start') {
    const body = await readBody(req);
    const query = String(body.query || '').trim();
    const channel = ['whatsapp', 'email', 'both'].includes(body.channel) ? body.channel : 'whatsapp';
    const maxLeads = clampNumber(body.maxLeads, 1, 50, 10);
    const minScore = clampNumber(body.minScore, 0, 10, 6);

    if (!query) return sendJson(res, 400, { error: 'Busca obrigatoria' });

    const job = runJob({
      type: 'scrape',
      label: query,
      args: [SCRAPER_CLI, query, `--max=${maxLeads}`, `--score=${minScore}`, `--channel=${channel}`],
    });

    return sendJson(res, 201, job);
  }

  if (req.method === 'POST' && url.pathname === '/api/approved/send') {
    const body = await readBody(req);
    const dryRun = body.dryRun !== false;
    const settings = loadSettings();
    const gate = sendGate(settings);
    const forceIgnoreHours = body.ignoreHours === true;
    const usePanelSchedule = body.usePanelSchedule !== false;
    const ignoreHours = forceIgnoreHours || (usePanelSchedule && gate.ignoreHours);

    if (!dryRun && body.confirm !== 'ENVIAR') {
      return sendJson(res, 400, { error: 'Confirmacao ENVIAR obrigatoria para envio real' });
    }

    if (!dryRun && !forceIgnoreHours && usePanelSchedule && !gate.ok) {
      return sendJson(res, 400, { error: gate.reason || 'Envio bloqueado pela janela configurada' });
    }

    const args = [SCRAPER_CLI, '--send-approved'];
    if (dryRun) args.push('--dry-run');
    if (ignoreHours) args.push('--fora-do-horario');

    const job = runJob({
      type: dryRun ? 'send-dry-run' : 'send-approved',
      label: dryRun ? 'Simulacao de envio' : 'Envio aprovado',
      args,
    });

    return sendJson(res, 201, job);
  }

  if (req.method === 'POST' && url.pathname === '/api/followup/run') {
    const body = await readBody(req);
    const send = body.send === true;
    const settings = loadSettings();
    const gate = sendGate(settings);
    const forceIgnoreHours = body.ignoreHours === true;
    const usePanelSchedule = body.usePanelSchedule !== false;
    const ignoreHours = forceIgnoreHours || (usePanelSchedule && gate.ignoreHours);

    if (send && body.confirm !== 'ENVIAR') {
      return sendJson(res, 400, { error: 'Confirmacao ENVIAR obrigatoria para follow-up real' });
    }

    if (send && !forceIgnoreHours && usePanelSchedule && !gate.ok) {
      return sendJson(res, 400, { error: gate.reason || 'Follow-up bloqueado pela janela configurada' });
    }

    const args = [FOLLOWUP_CLI];
    if (send) args.push('--enviar');
    if (ignoreHours) args.push('--fora-do-horario');

    const job = runJob({
      type: send ? 'followup-send' : 'followup-plan',
      label: send ? 'Follow-up aprovado' : 'Plano de follow-up',
      args,
    });

    return sendJson(res, 201, job);
  }

  // Edita/promove um lead do pipeline: tier, valor, ação agendada (high-touch), variante.
  // Não envia nada — só modela. O envio segue pelo gate de aprovação dos outros endpoints.
  if (req.method === 'POST' && url.pathname === '/api/lead') {
    const body = await readBody(req);
    const key = String(body.key || '');
    if (!key || !store.get(key)) {
      return sendJson(res, 404, { error: 'Lead nao encontrado no pipeline' });
    }

    let lead = store.get(key);

    if (typeof body.tier === 'string') {
      const updated = store.setTier(key, body.tier);
      if (!updated) return sendJson(res, 400, { error: 'Tier invalido (use mass ou high-touch)' });
      lead = updated;
    }

    if (body.value !== undefined || body.planValue !== undefined) {
      const value = body.value !== undefined ? clampNumber(body.value, 0, 1e7, undefined) : undefined;
      const planValue = body.planValue !== undefined ? clampNumber(body.planValue, 0, 1e8, undefined) : undefined;
      lead = store.setValue(key, { value, planValue });
    }

    if (body.nextActionAt !== undefined || body.nextActionDraft !== undefined) {
      const at = body.nextActionAt !== undefined ? String(body.nextActionAt).slice(0, 10) || null : undefined;
      const draft = body.nextActionDraft !== undefined ? String(body.nextActionDraft).slice(0, 2000) : undefined;
      lead = store.setNextAction(key, { at, draft });
    }

    if (typeof body.variant === 'string') {
      lead = store.update(key, { variant: body.variant.slice(0, 24) });
    }

    return sendJson(res, 200, { lead });
  }

  const pendingMatch = url.pathname.match(/^\/api\/pending\/(\d+)$/);
  if (pendingMatch && req.method === 'DELETE') {
    const index = Number(pendingMatch[1]);
    const pending = pendingList();
    if (!pending[index]) return sendJson(res, 404, { error: 'Lead pendente nao encontrado' });
    const [removed] = pending.splice(index, 1);
    savePending(pending);
    return sendJson(res, 200, { removed, pending: pending.length });
  }

  if (pendingMatch && req.method === 'PATCH') {
    const index = Number(pendingMatch[1]);
    const body = await readBody(req);
    const pending = pendingList();
    if (!pending[index]) return sendJson(res, 404, { error: 'Lead pendente nao encontrado' });

    if (typeof body.channel === 'string' && ['whatsapp', 'email', 'both'].includes(body.channel)) {
      pending[index].channel = body.channel;
    }

    if (body.message && typeof body.message === 'object') {
      pending[index].message = {
        ...(pending[index].message || {}),
        ...body.message,
      };
    }

    pending[index].updatedAt = new Date().toISOString();
    savePending(pending);
    return sendJson(res, 200, { item: { index, ...pending[index] } });
  }

  // Agenda de conteúdo (calendário editorial 70/20/10) — fonte: clients/<slug>/agenda.json
  if (req.method === 'GET' && url.pathname === '/api/agenda') {
    const slug = String(url.searchParams.get('slug') || AGENDA_SLUG);
    return sendJson(res, 200, readJson(agendaFileFor(slug), { week: null, items: [] }));
  }
  if (req.method === 'POST' && url.pathname === '/api/agenda/plan') {
    const body = await readBody(req);
    const slug = String(body.slug || AGENDA_SLUG);
    const args = [AGENDA_PLAN_CLI, '--slug', slug];
    if (body.week) args.push('--week', String(body.week));
    if (body.n) args.push('--n', String(clampNumber(body.n, 3, 7, 5)));
    if (body.dryRun === true) args.push('--dry-run');

    const job = runJob({
      type: 'agenda-plan',
      label: `Agenda semanal ${slug}`,
      args,
    });

    return sendJson(res, 201, job);
  }
  if (req.method === 'POST' && url.pathname === '/api/agenda/item') {
    const body = await readBody(req);
    const slug = String(body.slug || AGENDA_SLUG);
    const agendaPath = agendaFileFor(slug);
    const agenda = readJson(agendaPath, { week: null, items: [] });
    const item = (agenda.items || []).find(i => i.id === body.id);
    if (!item) return sendJson(res, 404, { error: 'Item da agenda nao encontrado' });
    const ALLOWED = ['caption', 'hook', 'formato', 'scheduledAt', 'draftPath', 'problema'];
    for (const k of ALLOWED) if (body[k] !== undefined) item[k] = String(body[k]).slice(0, 4000);
    if (body.status !== undefined) item.status = normalizeAgendaStatus(body.status, item.status);
    item.updatedAt = new Date().toISOString();
    writeJson(agendaPath, agenda);
    return sendJson(res, 200, { item });
  }
  if (req.method === 'GET' && url.pathname === '/api/agenda/status') {
    const slug = String(url.searchParams.get('slug') || AGENDA_SLUG);
    const agenda = readJson(agendaFileFor(slug), { week: null, items: [] });
    const items = agenda.items || [];
    const counts = items.reduce((acc, item) => {
      const status = item.status || 'planned';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    const blockers = items
      .filter(item => ['drafted', 'prepared'].includes(item.status) && (!item.caption || !collectAgendaFiles(item).length))
      .map(item => ({ id: item.id, status: item.status, missingCaption: !item.caption, missingFiles: !collectAgendaFiles(item).length }));
    return sendJson(res, 200, {
      ok: true,
      slug,
      week: agenda.week || null,
      total: items.length,
      counts,
      next: items.filter(item => !['published', 'measured'].includes(item.status)).slice(0, 3),
      blockers,
    });
  }
  if (req.method === 'POST' && url.pathname === '/api/agenda/publish') {
    const body = await readBody(req);
    const slug = String(body.slug || AGENDA_SLUG);
    const agendaPath = agendaFileFor(slug);
    const agenda = readJson(agendaPath, { week: null, items: [] });
    const item = (agenda.items || []).find(i => i.id === body.id);
    if (!item) return sendJson(res, 404, { error: 'Item da agenda nao encontrado' });

    const dryRun = body.dryRun !== false;
    if (!dryRun && body.confirm !== 'PUBLICAR') {
      return sendJson(res, 400, { error: 'Confirmacao PUBLICAR obrigatoria para publicacao real' });
    }
    if (!item.caption) return sendJson(res, 400, { error: 'Caption obrigatoria antes de publicar' });

    const files = collectAgendaFiles(item);
    if (!files.length) {
      return sendJson(res, 400, { error: 'Nenhum arquivo renderizado encontrado em draftPath/files' });
    }

    const args = [PUBLISHER_CLI, '--slug', slug, '--format', formatForPublisher(item.formato)];
    for (const file of files) args.push('--file', file);
    args.push('--caption', item.caption, '--hook', item.hook || '', '--theme', item.problema || '');
    if (dryRun) args.push('--dry-run');

    const job = runJob({
      type: dryRun ? 'agenda-publish-dry-run' : 'agenda-publish',
      label: `${dryRun ? 'Validar' : 'Publicar'} ${item.id}`,
      args,
    });

    item.lastPublishJob = job.id;
    item.lastPublishDryRun = dryRun;
    item.updatedAt = new Date().toISOString();
    if (!dryRun) item.publishRequestedAt = item.updatedAt;
    writeJson(agendaPath, agenda);
    return sendJson(res, 201, job);
  }

  return sendJson(res, 404, { error: 'Rota nao encontrada' });
}

function serveStatic(req, res, url) {
  let pathname = url.pathname;
  if (pathname === '/') pathname = '/cockpit.html';        // cockpit é a porta de entrada
  else if (pathname === '/classic') pathname = '/index.html'; // painel operacional detalhado
  const decoded = decodeURIComponent(pathname);
  const filePath = path.resolve(PUBLIC_DIR, `.${decoded}`);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': 'no-store',
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname.startsWith('/api/')) {
      await handleApi(req, res, url);
      return;
    }

    serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, error.status || 500, { error: error.message || 'Erro interno' });
  }
});

server.listen(PORT, () => {
  console.log(`MarketingOS Scraper Panel: http://localhost:${PORT}`);
});
