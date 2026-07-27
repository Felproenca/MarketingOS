'use strict';

/**
 * lib/guard.js — Proteção anti-ban do Discovery Engine.
 *
 * Independente de scripts/pipeline/guard.js (scraper legado) por decisão do
 * Felipe (2026-07-13): sessão/número de WhatsApp separados, então o teto e o
 * contador de envio também são separados — cada número tem seu próprio risco.
 *
 * Contador: agency/discovery-leads/_sent-log.json — [{ at, niche_id, key }]
 * (log simples, não por nicho, porque o número de WhatsApp é único pra todo
 * o Discovery Engine, então o teto diário é do NÚMERO, não do nicho)
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.resolve(__dirname, '../../../agency/discovery-leads/_sent-log.json');

const DAILY_CAP = parseInt(process.env.DISCOVERY_WHATSAPP_DAILY_CAP || '25', 10);
const DELAY_MIN = parseInt(process.env.DISCOVERY_SEND_DELAY_MIN_MS || '60000', 10);
const DELAY_MAX = parseInt(process.env.DISCOVERY_SEND_DELAY_MAX_MS || '300000', 10);
const HOUR_START = 9;
const HOUR_END = 18;

function loadLog() {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveLog(log) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2), 'utf8');
}

function recordSend(nicheId, key) {
  const log = loadLog();
  log.push({ at: new Date().toISOString(), niche_id: nicheId, key });
  saveLog(log);
}

function sentToday(now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return loadLog().filter((e) => e.at.slice(0, 10) === today).length;
}

function withinBusinessHours(now = new Date()) {
  const hour = now.getHours();
  const day = now.getDay();
  return day !== 0 && hour >= HOUR_START && hour < HOUR_END;
}

function remainingToday(now = new Date()) {
  return Math.max(0, DAILY_CAP - sentToday(now));
}

function canSend({ ignoreHours = false, now = new Date() } = {}) {
  if (remainingToday(now) <= 0) {
    return { ok: false, reason: `Teto diário do Discovery Engine atingido (${DAILY_CAP} envios). Continue amanhã.` };
  }
  if (!ignoreHours && !withinBusinessHours(now)) {
    return { ok: false, reason: `Fora do horário comercial (${HOUR_START}h–${HOUR_END}h, seg–sáb).` };
  }
  return { ok: true, reason: null };
}

function randomDelayMs() {
  return DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));
}

async function waitRandomDelay(log = true) {
  const ms = randomDelayMs();
  if (log) console.log(`    ⏳ aguardando ${Math.round(ms / 1000)}s antes do próximo envio (anti-ban)`);
  await new Promise((r) => setTimeout(r, ms));
}

module.exports = {
  DAILY_CAP, HOUR_START, HOUR_END,
  recordSend, sentToday, withinBusinessHours, remainingToday, canSend,
  randomDelayMs, waitRandomDelay,
};
