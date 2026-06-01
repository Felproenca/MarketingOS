'use strict';

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '../../agency/bot-state.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function save(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
}

function get(chatId) {
  return load()[chatId] || null;
}

function set(chatId, data) {
  const state = load();
  state[chatId] = { ...state[chatId], ...data, updatedAt: new Date().toISOString() };
  save(state);
}

// Importa todos os contatos enviados para o estado inicial
function syncContacted(contactedDir) {
  const state = load();
  let added = 0;

  const files = fs.readdirSync(contactedDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const contacts = JSON.parse(fs.readFileSync(path.join(contactedDir, file), 'utf8'));
    for (const c of contacts) {
      const digits = String(c.phone || '').replace(/\D/g, '').replace(/^0/, '');
      const chatId = digits.startsWith('55') && digits.length >= 12
        ? `${digits}@c.us`
        : digits.length >= 10 ? `55${digits}@c.us` : null;

      if (!chatId) continue;
      if (state[chatId]) continue;

      state[chatId] = {
        chatId,
        name: c.name,
        phone: c.phone,
        website: c.website || null,
        segment: c.segment || 'clinica',
        step: 'sent',
        sentAt: c.sentAt,
        updatedAt: c.sentAt,
      };
      added++;
    }
  }

  save(state);
  return added;
}

module.exports = { get, set, syncContacted };
