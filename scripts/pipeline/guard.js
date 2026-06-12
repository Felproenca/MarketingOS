'use strict';

/**
 * guard.js — Proteção anti-ban para envios de WhatsApp.
 *
 * Regras:
 *   - Teto diário de envios (primeiro contato + follow-ups somados)
 *   - Janela de horário comercial (clínica não responde 23h — e rajada
 *     fora de horário é padrão clássico de spam)
 *   - Intervalo aleatório entre envios (intervalo fixo = assinatura de bot)
 *
 * Env (opcionais):
 *   WHATSAPP_DAILY_CAP   — padrão 25
 *   SEND_DELAY_MIN_MS    — padrão 60000  (1 min)
 *   SEND_DELAY_MAX_MS    — padrão 300000 (5 min)
 */

const store = require('./store');

const DAILY_CAP = parseInt(process.env.WHATSAPP_DAILY_CAP || '25', 10);
const DELAY_MIN = parseInt(process.env.SEND_DELAY_MIN_MS || '60000', 10);
const DELAY_MAX = parseInt(process.env.SEND_DELAY_MAX_MS || '300000', 10);

const HOUR_START = 9;
const HOUR_END = 18;

function withinBusinessHours(now = new Date()) {
  const hour = now.getHours();
  const day = now.getDay(); // 0 = domingo
  return day !== 0 && hour >= HOUR_START && hour < HOUR_END;
}

function remainingToday(now = new Date()) {
  return Math.max(0, DAILY_CAP - store.sentToday(now));
}

/**
 * Pode enviar agora? Retorna { ok, reason }.
 * options.ignoreHours — flag --fora-do-horario
 */
function canSend({ ignoreHours = false, now = new Date() } = {}) {
  if (remainingToday(now) <= 0) {
    return { ok: false, reason: `Teto diário atingido (${DAILY_CAP} envios). Continue amanhã.` };
  }
  if (!ignoreHours && !withinBusinessHours(now)) {
    return { ok: false, reason: `Fora do horário comercial (${HOUR_START}h–${HOUR_END}h, seg–sáb). Use --fora-do-horario para forçar.` };
  }
  return { ok: true, reason: null };
}

function randomDelayMs() {
  return DELAY_MIN + Math.floor(Math.random() * (DELAY_MAX - DELAY_MIN));
}

async function waitRandomDelay(log = true) {
  const ms = randomDelayMs();
  if (log) {
    console.log(`    ⏳ aguardando ${Math.round(ms / 1000)}s antes do próximo envio (anti-ban)`);
  }
  await new Promise(r => setTimeout(r, ms));
}

module.exports = {
  DAILY_CAP, HOUR_START, HOUR_END,
  withinBusinessHours, remainingToday, canSend,
  randomDelayMs, waitRandomDelay,
};
