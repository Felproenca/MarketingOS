'use strict';

/**
 * state-store.js — Adaptador para o pipeline unificado.
 *
 * O bot lia/escrevia agency/bot-state.json. Agora tudo vive em
 * agency/leads/pipeline.json (scripts/pipeline/store.js) — o mesmo store
 * que o scraper e o follow-up consultam. Um contato, um estado, um funil.
 *
 * Migração dos dados antigos: npm run pipeline:migrate
 */

const pipeline = require('../pipeline/store');

function get(chatId) {
  return pipeline.get(chatId);
}

function set(chatId, data) {
  // step muda via setStep (mantém histórico e timestamps do funil)
  const { step, ...rest } = data;

  if (Object.keys(rest).length > 0) pipeline.update(chatId, rest);

  const current = pipeline.get(chatId);
  if (step && current && current.step !== step) {
    pipeline.setStep(chatId, step, 'bot de conversa');
  }
}

// Importa contatos antigos do diretório contacted/ que ainda não estejam no pipeline
function syncContacted(contactedDir) {
  return pipeline.importContactedDir(contactedDir);
}

module.exports = { get, set, syncContacted };
