'use strict';

/**
 * message-builder.js — Gera rascunho de mensagem por lead (WhatsApp + LinkedIn).
 *
 * PLACEHOLDER DELIBERADO (decisão do Felipe, 2026-07-13): a oferta/proposta de
 * valor real pra leads de CORBAN ainda não foi definida — construir a
 * infraestrutura de draft+aprovação+envio agora, plugar a copy de verdade
 * depois. Nunca inventar oferta, ICP, ticket ou objeção como se fosse fato
 * (regra do CLAUDE.md) — por isso a mensagem abaixo é estruturalmente
 * personalizada (nome, observação real do lead) mas o CORPO da proposta é
 * marcado como placeholder, impossível de confundir com copy pronta.
 *
 * Quando a oferta for definida: trocar `buildPlaceholderPitch()` por uma
 * chamada real (ex.: Claude com um system prompt equivalente ao de
 * scripts/scraper/message-builder.js, adaptado pro protocolo de aquisição
 * de CORBAN) — a assinatura de `build(lead, nicheProfile)` não muda.
 */

const PLACEHOLDER_TAG = '[RASCUNHO — oferta ainda não definida, não enviar como está]';

/**
 * build(lead, nicheProfile) → { whatsapp_message, linkedin_draft }
 */
async function build(lead, nicheProfile) {
  const observation = pickObservation(lead);

  return {
    whatsapp_message: buildWhatsappPlaceholder(lead, nicheProfile, observation),
    linkedin_draft: buildLinkedinPlaceholder(lead, nicheProfile, observation),
    is_placeholder: true,
  };
}

/** Pega algo real e verificável sobre o lead pra ancorar a mensagem — nunca inventa. */
function pickObservation(lead) {
  if (lead.places?.rating && lead.places?.num_avaliacoes) {
    return `nota ${lead.places.rating} com ${lead.places.num_avaliacoes} avaliações no Google`;
  }
  if (lead.website?.redes_sociais_linkadas?.instagram) {
    return 'presença ativa no Instagram';
  }
  if (lead.cnpj_enrichment?.meses_desde_abertura) {
    const anos = Math.floor(lead.cnpj_enrichment.meses_desde_abertura / 12);
    return anos > 0 ? `${anos} ano(s) de CNPJ ativo` : 'CNPJ ativo recente';
  }
  return 'presença digital observada';
}

function buildWhatsappPlaceholder(lead, nicheProfile, observation) {
  const name = lead.places?.name || lead.name || 'aí';
  return [
    PLACEHOLDER_TAG,
    '',
    `Oi! Vi que vocês (${name}) têm ${observation} — [AQUI ENTRA A OBSERVAÇÃO REAL + PERGUNTA DO PROTOCOLO DE PRIMEIRO CONTATO, ver skills/aquisicao/skill-offer-positioning.md quando a oferta de ${nicheProfile.niche_label} estiver definida].`,
  ].join('\n');
}

function buildLinkedinPlaceholder(lead, nicheProfile, observation) {
  const name = lead.places?.name || lead.name || 'aí';
  return [
    PLACEHOLDER_TAG,
    '(InMail — envio manual, individual. Nunca automatizar disparo em massa aqui — compliance do niche_profile.)',
    '',
    `Assunto: [placeholder]`,
    `Corpo: Oi, vi o trabalho de vocês na ${name} (${observation}) — [AQUI ENTRA A PROPOSTA REAL de ${nicheProfile.niche_label}, ainda não definida].`,
  ].join('\n');
}

module.exports = { build, PLACEHOLDER_TAG };
