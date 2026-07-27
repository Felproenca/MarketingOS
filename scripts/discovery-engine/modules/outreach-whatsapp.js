'use strict';

/**
 * outreach-whatsapp.js — Envio real de WhatsApp pro Discovery Engine.
 *
 * Reusa scripts/prospector/outreach-whatsapp.js (mesma lib, já genérica —
 * aceita sessionPath por parâmetro) com uma sessão PRÓPRIA, separada do
 * scraper legado (decisão do Felipe, 2026-07-13: número/sessão isolados).
 */

const path = require('path');
const {
  initWhatsApp, sendWhatsApp, destroyWhatsApp, isRegistered,
} = require('../../prospector/outreach-whatsapp');

const SESSION_PATH = path.resolve(__dirname, '../../../.whatsapp-session-discovery-engine');

let initialized = false;

async function ensureReady() {
  if (initialized) return;
  await initWhatsApp(SESSION_PATH);
  initialized = true;
}

/**
 * send(phone, message) → { sent, error }
 * Valida número registrado no WhatsApp antes de mandar (getNumberId real,
 * não só presença de link wa.me).
 */
async function send(phone, message) {
  await ensureReady();

  const check = await isRegistered(phone);
  if (!check.registered) {
    return { sent: false, error: 'Número sem WhatsApp ativo' };
  }

  const res = await sendWhatsApp(phone, message, 4000);
  return { sent: res.success, error: res.error || null, chatId: res.chatId };
}

async function cleanup() {
  if (initialized) {
    await destroyWhatsApp();
    initialized = false;
  }
}

module.exports = { send, cleanup, SESSION_PATH };
