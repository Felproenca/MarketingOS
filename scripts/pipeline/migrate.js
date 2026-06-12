#!/usr/bin/env node
'use strict';

/**
 * migrate.js — Consolida os stores antigos no pipeline unificado.
 *
 * Importa (nesta ordem — quem tem mais progresso vence):
 *   1. agency/bot-state.json        (steps evoluídos pelo bot de conversa)
 *   2. agency/contacted/*.json      (envios do demo pipeline)
 *   3. scripts/scraper/leads.json   (se existir — leads do scraper v2)
 *
 * Uso: npm run pipeline:migrate
 * Idempotente — rodar duas vezes não duplica nem regride steps.
 */

const fs = require('fs');
const path = require('path');
const store = require('./store');

const BOT_STATE_FILE = path.resolve(__dirname, '../../agency/bot-state.json');
const CONTACTED_DIR = path.resolve(__dirname, '../../agency/contacted');
const SCRAPER_LEADS = path.resolve(__dirname, '../../scripts/scraper/leads.json');

// Ordem de progresso — nunca regredir um step na migração
const STEP_RANK = {
  discovered: 0, qualified: 1, pending_approval: 2,
  sent: 3, followup_1: 4, followup_2: 5,
  replied: 6, demo_sent: 7, call_offered: 8, closed: 9, dead: 9,
};

function importBotState() {
  if (!fs.existsSync(BOT_STATE_FILE)) return 0;

  let botState;
  try {
    botState = JSON.parse(fs.readFileSync(BOT_STATE_FILE, 'utf8'));
  } catch {
    return 0;
  }

  const state = store.load();
  let added = 0;

  for (const [chatId, c] of Object.entries(botState)) {
    const existing = state[chatId];
    const incomingRank = STEP_RANK[c.step] ?? 0;
    const existingRank = existing ? (STEP_RANK[existing.step] ?? 0) : -1;

    if (existing && existingRank >= incomingRank) continue;

    state[chatId] = {
      chatId,
      name: c.name || existing?.name || null,
      phone: c.phone || existing?.phone || null,
      whatsapp: store.normalizePhoneDigits(c.phone) || existing?.whatsapp || null,
      domain: c.website ? store.safeDomain(c.website) : existing?.domain || null,
      website: c.website || existing?.website || null,
      instagram: existing?.instagram || null,
      segment: c.segment || existing?.segment || 'clinica',
      source: existing?.source || 'bot-state',
      score: existing?.score ?? null,
      label: existing?.label ?? null,
      main_problem: existing?.main_problem ?? null,
      step: c.step || 'sent',
      sentAt: c.sentAt || existing?.sentAt || null,
      lastOutboundAt: c.updatedAt || c.sentAt || existing?.lastOutboundAt || null,
      followupCount: existing?.followupCount || 0,
      repliedAt: c.lastReply ? (c.updatedAt || null) : existing?.repliedAt || null,
      history: existing?.history || [],
      createdAt: c.sentAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    added++;
  }

  store.save(state);
  return added;
}

function importScraperLeads() {
  if (!fs.existsSync(SCRAPER_LEADS)) return 0;

  let leads;
  try {
    leads = JSON.parse(fs.readFileSync(SCRAPER_LEADS, 'utf8'));
  } catch {
    return 0;
  }

  let added = 0;
  for (const lead of leads) {
    if (store.exists({ phone: lead.phone, whatsapp: lead.whatsapp, domain: lead.domain })) continue;

    store.upsert({
      name: lead.name,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      domain: lead.domain,
      website: lead.url,
      instagram: lead.instagram,
      source: 'scraper-leads.json',
      score: lead.qualification?.score,
      label: lead.qualification?.label,
      main_problem: lead.qualification?.main_problem,
      step: lead.outreach?.sent ? 'sent' : 'qualified',
      sentAt: lead.outreach?.timestamp || null,
    });
    added++;
  }
  return added;
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log('\n─ Migração para pipeline unificado ─\n');

const fromBot = importBotState();
console.log(`  bot-state.json      : ${fromBot} contatos importados/atualizados`);

const fromContacted = store.importContactedDir(CONTACTED_DIR);
console.log(`  contacted/*.json    : ${fromContacted} contatos importados`);

const fromScraper = importScraperLeads();
console.log(`  scraper/leads.json  : ${fromScraper} leads importados`);

const total = Object.keys(store.load()).length;
const bySteps = {};
for (const c of Object.values(store.load())) {
  bySteps[c.step] = (bySteps[c.step] || 0) + 1;
}

console.log(`\n  Pipeline total: ${total} contatos`);
for (const [step, n] of Object.entries(bySteps)) {
  console.log(`    ${step.padEnd(18)} ${n}`);
}
console.log(`\n  Salvo em: ${store.PIPELINE_FILE}\n`);
