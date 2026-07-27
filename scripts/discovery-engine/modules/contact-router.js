'use strict';

/**
 * contact-router.js — Etapa 5 (ContactRouter, human-in-the-loop).
 *
 * Não envia nada. Só decide, com base no niche_profile.contact_channels e no
 * tier do QualificationScorer, qual canal um lead qualificado deveria usar —
 * e coloca em pending_approval no store. Disparo real exige aprovação humana
 * fora deste módulo (mesma regra do resto do sistema: nada publica/envia
 * sozinho).
 */

const store = require('../lib/store');

/**
 * route(nicheId, lead, nicheProfile) → lead atualizado com step + canal
 * sugerido, ou { skipped: true, reason } se já estava no pipeline legado.
 */
function route(nicheId, lead, nicheProfile) {
  const tier = lead.qualification?.tier;

  if (!tier) {
    // Sem tier (abaixo do threshold C) — não entra na fila de contato.
    const saved = store.upsert(nicheId, lead);
    if (saved && !saved.skipped) store.setStep(nicheId, store.keyFor(lead), 'discarded', 'score abaixo do tier C');
    return saved;
  }

  const channel = pickChannel(lead, nicheProfile);

  const saved = store.upsert(nicheId, lead);
  if (!saved || saved.skipped) return saved;

  const key = store.keyFor(lead);
  store.setStep(nicheId, key, 'pending_approval', `canal sugerido: ${channel ? channel.channel : 'nenhum disponível'}`);

  return { ...saved, suggested_channel: channel, step: 'pending_approval' };
}

/**
 * Escolhe o primeiro canal do niche_profile cuja condição de disponibilidade
 * é satisfeita pelos dados coletados do lead. Nunca escolhe um canal cuja
 * automation_level permita disparo sem aprovação — o schema já garante isso
 * (só "manual_approval_required" ou "human_in_the_loop" são aceitos).
 */
function pickChannel(lead, nicheProfile) {
  for (const channelDef of nicheProfile.contact_channels || []) {
    if (isChannelAvailable(channelDef.channel, lead)) return channelDef;
  }
  return null;
}

function isChannelAvailable(channel, lead) {
  if (channel === 'whatsapp_business') {
    return Boolean(lead.website?.whatsapp_business_link || lead.places?.phone);
  }
  if (channel === 'formulario_site') {
    return Boolean(lead.website?.formulario_contato);
  }
  if (channel === 'linkedin_sales_navigator') {
    return Boolean(lead.website?.redes_sociais_linkadas?.linkedin);
  }
  return false;
}

module.exports = { route, pickChannel, isChannelAvailable };
