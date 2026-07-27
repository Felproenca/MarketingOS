'use strict';

/**
 * outreach-linkedin.js — NUNCA envia nada sozinho.
 *
 * niche_profile.contact_channels declara linkedin_sales_navigator como
 * "InMail individual, sem automação de disparo" / automation_level:
 * human_in_the_loop. Isso não é um detalhe de implementação — é a linha de
 * compliance do sistema (niche_profile.compliance.excluded_sources inclui
 * "automacao_inmail_massa"). Não existe, e não deve existir, uma função
 * send() aqui. Automatizar isso violaria ToS do LinkedIn em escala e usaria
 * dado de perfil pessoal sem base legal — exatamente o que o spec original
 * excluiu por design.
 *
 * O que este módulo faz: prepara o draft (já gerado por message-builder.js)
 * pra cópia manual — formata pra ficar fácil de colar no Sales Navigator, e
 * marca o lead como "pronto pra envio manual" no store.
 */

const store = require('../lib/store');

/**
 * markReadyForManualSend(nicheId, key) → marca o lead com um flag de
 * apresentação (não é um "step" novo — o step continua pending_approval até
 * aprovação humana explícita; isso só ajuda a listar quem já tem draft pronto).
 */
function markReadyForManualSend(nicheId, key) {
  return store.update(nicheId, key, { linkedin_draft_ready: true });
}

/**
 * formatForCopyPaste(linkedinDraft) → string pronta pra colar no Sales
 * Navigator, sem nenhuma tag de placeholder/instrução interna.
 */
function formatForCopyPaste(linkedinDraft) {
  return linkedinDraft
    .split('\n')
    .filter((line) => !line.startsWith('[RASCUNHO') && !line.startsWith('(InMail'))
    .join('\n')
    .trim();
}

module.exports = { markReadyForManualSend, formatForCopyPaste };
