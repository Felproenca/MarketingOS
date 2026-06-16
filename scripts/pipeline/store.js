'use strict';

/**
 * store.js — Fonte única de verdade do pipeline de prospecção.
 *
 * Arquivo: agency/leads/pipeline.json (objeto keyed por chatId ou domain:xxx)
 *
 * Steps do funil:
 *   discovered → qualified → pending_approval → sent
 *   → followup_1 → followup_2 (sem resposta)
 *   → replied → demo_sent → call_offered → closed | dead
 *
 * Tier:
 *   'mass'        → trilho automático D+2/D+5 com template
 *   'high-touch'  → ação agendada à mão (nextActionAt + nextActionDraft),
 *                   fora do trilho automático. Mora no MESMO pipeline.
 *
 * Valor:
 *   value      → MRR do negócio (R$/mês) — soma em pipelineValue()
 *   planValue  → total do plano (R$)
 *
 * A/B:
 *   variant    → variante de copy carimbada no último envio (mede conversão)
 *   abStage    → em qual etapa o A/B está sendo testado
 *
 * Consultado por: scraper, whatsapp-bot, followup, scraper-panel.
 * Nenhum módulo envia mensagem sem checar isContacted() aqui antes.
 */

const fs = require('fs');
const path = require('path');

const PIPELINE_FILE = path.resolve(__dirname, '../../agency/leads/pipeline.json');

// Steps que significam "essa pessoa já recebeu mensagem" — nunca re-abordar
const CONTACTED_STEPS = [
  'sent', 'followup_1', 'followup_2',
  'replied', 'demo_sent', 'call_offered', 'closed', 'dead',
];

// ── Persistência ──────────────────────────────────────────────────────────────

function load() {
  try {
    return JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function save(state) {
  fs.mkdirSync(path.dirname(PIPELINE_FILE), { recursive: true });
  // Escrita atômica (temp + rename): um crash no meio do write não pode
  // truncar o pipeline — load() voltaria {} e isContacted() liberaria
  // re-abordagem de todos os contatos.
  const tmpFile = `${PIPELINE_FILE}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmpFile, PIPELINE_FILE);
}

// ── Normalização ──────────────────────────────────────────────────────────────

/** "tel:021972246787" | "(21) 97224-6787" → "5521972246787" | null */
function normalizePhoneDigits(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0') && !digits.startsWith('00')) digits = digits.slice(1);
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  if (digits.length === 11 || digits.length === 10) return `55${digits}`;
  return null;
}

/** telefone em qualquer formato → "5521972246787@c.us" | null */
function chatIdFromPhone(phone) {
  const digits = normalizePhoneDigits(phone);
  return digits ? `${digits}@c.us` : null;
}

/** Chave canônica do lead no store: chatId se tem telefone, senão domain */
function keyFor(lead) {
  const chatId = lead.chatId || chatIdFromPhone(lead.whatsapp || lead.phone);
  if (chatId) return chatId;
  if (lead.domain) return `domain:${lead.domain}`;
  return null;
}

// ── Leitura ───────────────────────────────────────────────────────────────────

function get(key) {
  return load()[key] || null;
}

function getByDomain(domain) {
  if (!domain) return null;
  const state = load();
  return Object.values(state).find(c => c.domain === domain) || null;
}

/**
 * Já foi contactado? Checa por telefone E por domínio —
 * o mesmo negócio pode ter entrado por fontes diferentes.
 */
function isContacted({ phone, whatsapp, domain } = {}) {
  const state = load();
  const chatId = chatIdFromPhone(whatsapp || phone);

  if (chatId && state[chatId] && CONTACTED_STEPS.includes(state[chatId].step)) {
    return state[chatId];
  }
  if (domain) {
    const byDomain = Object.values(state).find(
      c => c.domain === domain && CONTACTED_STEPS.includes(c.step)
    );
    if (byDomain) return byDomain;
  }
  return null;
}

/** Existe no pipeline em qualquer step (inclusive pending_approval)? */
function exists({ phone, whatsapp, domain } = {}) {
  const state = load();
  const chatId = chatIdFromPhone(whatsapp || phone);
  if (chatId && state[chatId]) return state[chatId];
  if (domain) return Object.values(state).find(c => c.domain === domain) || null;
  return null;
}

// ── Escrita ───────────────────────────────────────────────────────────────────

function upsert(lead) {
  const key = keyFor(lead);
  if (!key) return null;

  const state = load();
  const now = new Date().toISOString();
  const existing = state[key] || {};

  state[key] = {
    chatId:    key.startsWith('domain:') ? null : key,
    name:      lead.name      || existing.name      || null,
    phone:     lead.phone     || existing.phone     || null,
    whatsapp:  normalizePhoneDigits(lead.whatsapp || lead.phone) || existing.whatsapp || null,
    domain:    lead.domain    || existing.domain    || null,
    website:   lead.website   || lead.url || existing.website || null,
    instagram: lead.instagram || existing.instagram || null,
    segment:   lead.segment   || existing.segment   || 'clinica',
    source:    existing.source || lead.source || 'scraper-v2',
    score:        lead.score        ?? existing.score        ?? null,
    label:        lead.label        ?? existing.label        ?? null,
    main_problem: lead.main_problem ?? existing.main_problem ?? null,
    tier:            existing.tier || lead.tier || 'mass',
    value:           lead.value           ?? existing.value           ?? null,
    planValue:       lead.planValue       ?? existing.planValue       ?? null,
    nextActionAt:    lead.nextActionAt    ?? existing.nextActionAt    ?? null,
    nextActionDraft: lead.nextActionDraft ?? existing.nextActionDraft ?? null,
    variant:         lead.variant         ?? existing.variant         ?? null,
    abStage:         lead.abStage         ?? existing.abStage         ?? null,
    step:           existing.step || lead.step || 'discovered',
    sentAt:         existing.sentAt         || lead.sentAt || null,
    lastOutboundAt: existing.lastOutboundAt || lead.sentAt || null,
    followupCount:  existing.followupCount  || 0,
    repliedAt:      existing.repliedAt      || null,
    history:        existing.history        || [],
    createdAt:      existing.createdAt      || now,
    updatedAt:      now,
  };

  save(state);
  return state[key];
}

function update(key, data) {
  const state = load();
  if (!state[key]) return null;
  state[key] = { ...state[key], ...data, updatedAt: new Date().toISOString() };
  save(state);
  return state[key];
}

function setStep(key, step, detail = null, meta = {}) {
  const state = load();
  if (!state[key]) return null;

  const now = new Date().toISOString();
  const contact = state[key];

  const entry = { at: now, from: contact.step, to: step, detail };
  if (meta.variant) {
    entry.variant = meta.variant;
    contact.variant = meta.variant;          // carimbo do A/B no lead
    if (meta.abStage) contact.abStage = meta.abStage;
  }

  contact.history = contact.history || [];
  contact.history.push(entry);
  contact.step = step;
  contact.updatedAt = now;

  if (step === 'sent') {
    contact.sentAt = contact.sentAt || now;
    contact.lastOutboundAt = now;
  }
  if (step === 'followup_1' || step === 'followup_2') {
    contact.lastOutboundAt = now;
    contact.followupCount = (contact.followupCount || 0) + 1;
  }
  if (step === 'replied') {
    contact.repliedAt = contact.repliedAt || now;
  }

  save(state);
  return contact;
}

// ── Consultas operacionais ────────────────────────────────────────────────────

/** Quantos envios de WhatsApp saíram hoje (primeiro contato + follow-ups) */
function sentToday(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return Object.values(load()).filter(c => {
    const last = c.lastOutboundAt || c.sentAt;
    return last && last.slice(0, 10) === today;
  }).length;
}

/**
 * Follow-ups devidos: D+2 após o primeiro contato (→ followup_1),
 * D+3 após o primeiro follow-up (→ followup_2, total D+5). Sem resposta.
 */
function dueFollowups(now = new Date()) {
  const DAY = 24 * 60 * 60 * 1000;
  const due = [];

  for (const [key, c] of Object.entries(load())) {
    if (!c.chatId) continue; // sem WhatsApp, sem follow-up

    if (c.step === 'sent' && c.sentAt) {
      if (now - new Date(c.sentAt) >= 2 * DAY) {
        due.push({ key, contact: c, next: 'followup_1' });
      }
    } else if (c.step === 'followup_1' && c.lastOutboundAt) {
      if (now - new Date(c.lastOutboundAt) >= 3 * DAY) {
        due.push({ key, contact: c, next: 'followup_2' });
      }
    }
  }

  return due;
}

/** Contatos que aguardam reconciliação de resposta (mensagem pode ter chegado offline) */
function awaitingReply() {
  return Object.entries(load())
    .filter(([, c]) => c.chatId && ['sent', 'followup_1', 'followup_2'].includes(c.step))
    .map(([key, contact]) => ({ key, contact }));
}

// Steps que tiram o negócio "do jogo" — não somam no valor em negociação
const CLOSED_STEPS = ['closed', 'dead'];

/** Soma do MRR (value) dos negócios ainda abertos — o "R$ em jogo" do funil */
function pipelineValue(now = new Date()) {
  const open = Object.values(load()).filter(c => !CLOSED_STEPS.includes(c.step));
  return {
    mrr:       open.reduce((sum, c) => sum + (Number(c.value) || 0), 0),
    planTotal: open.reduce((sum, c) => sum + (Number(c.planValue) || 0), 0),
    deals:     open.filter(c => Number(c.value) > 0).length,
  };
}

/**
 * High-touch cuja ação agendada já venceu (e que ainda não fechou nem morreu).
 * É o trilho manual: a faixa "Hoje" lê isto. Sai com o rascunho aprovável.
 */
function dueHighTouch(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const due = [];

  for (const [key, c] of Object.entries(load())) {
    if (c.tier !== 'high-touch') continue;
    if (CLOSED_STEPS.includes(c.step)) continue;
    if (c.nextActionAt && String(c.nextActionAt).slice(0, 10) <= today) {
      due.push({ key, contact: c });
    }
  }
  return due;
}

// ── Setters de negócio (tier, valor, ação agendada) ───────────────────────────

/** Promove/rebaixa o tier de um lead (mass ⇄ high-touch) */
function setTier(key, tier) {
  if (!['mass', 'high-touch'].includes(tier)) return null;
  return update(key, { tier });
}

/** Define o valor do negócio: value = MRR (R$/mês), planValue = total do plano */
function setValue(key, { value, planValue } = {}) {
  const patch = {};
  if (value !== undefined) patch.value = value;
  if (planValue !== undefined) patch.planValue = planValue;
  return Object.keys(patch).length ? update(key, patch) : get(key);
}

/** Agenda a próxima ação de um high-touch (data + rascunho aprovável) */
function setNextAction(key, { at, draft } = {}) {
  const patch = {};
  if (at !== undefined) patch.nextActionAt = at;
  if (draft !== undefined) patch.nextActionDraft = draft;
  return Object.keys(patch).length ? update(key, patch) : get(key);
}

// ── Importação (usada pela migração e pelo sync do bot) ───────────────────────

/** Importa agency/contacted/*.json — não sobrescreve quem já progrediu */
function importContactedDir(contactedDir) {
  let added = 0;
  if (!fs.existsSync(contactedDir)) return added;

  const state = load();
  const files = fs.readdirSync(contactedDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    let contacts;
    try {
      contacts = JSON.parse(fs.readFileSync(path.join(contactedDir, file), 'utf8'));
    } catch {
      continue;
    }

    for (const c of contacts) {
      const chatId = chatIdFromPhone(c.phone);
      if (!chatId || state[chatId]) continue;

      state[chatId] = {
        chatId,
        name: c.name || null,
        phone: c.phone || null,
        whatsapp: normalizePhoneDigits(c.phone),
        domain: c.website ? safeDomain(c.website) : null,
        website: c.website || null,
        instagram: null,
        segment: c.segment || 'clinica',
        source: `contacted:${file}`,
        score: null,
        label: null,
        main_problem: null,
        step: 'sent',
        sentAt: c.sentAt || null,
        lastOutboundAt: c.sentAt || null,
        followupCount: 0,
        repliedAt: null,
        history: [],
        createdAt: c.sentAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      added++;
    }
  }

  save(state);
  return added;
}

function safeDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

module.exports = {
  PIPELINE_FILE,
  CONTACTED_STEPS,
  load, save,
  normalizePhoneDigits, chatIdFromPhone, keyFor, safeDomain,
  get, getByDomain, isContacted, exists,
  upsert, update, setStep,
  sentToday, dueFollowups, awaitingReply,
  pipelineValue, dueHighTouch,
  setTier, setValue, setNextAction,
  CLOSED_STEPS,
  importContactedDir,
};
