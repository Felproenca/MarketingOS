#!/usr/bin/env node
'use strict';

/**
 * prepare-outreach.js — Gera rascunho de mensagem (WhatsApp + LinkedIn) pra
 * cada lead em pending_approval de um nicho. NÃO envia nada.
 *
 * Uso:
 *   node scripts/discovery-engine/prepare-outreach.js --niche=corban_2026
 *
 * Depois de rodar:
 *   1. Abrir agency/discovery-leads/<niche_id>.json
 *   2. Revisar whatsapp_message / linkedin_draft de cada lead
 *   3. Editar a mensagem se precisar, deletar leads que não quer abordar
 *   4. Marcar approved: true nos que quer enviar (só vale pra WhatsApp —
 *      LinkedIn nunca é enviado por automação, ver outreach-linkedin.js)
 *   5. Rodar: node scripts/discovery-engine/send-approved.js --niche=<id>
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const store = require('./lib/store');
const messageBuilder = require('./modules/message-builder');
const outreachLinkedin = require('./modules/outreach-linkedin');

function loadNicheProfile(nicheId) {
  const file = path.resolve(__dirname, 'niche-profiles', `${nicheId.replace(/_/g, '-')}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function run(nicheId) {
  const nicheProfile = loadNicheProfile(nicheId);
  const pending = store.listByStep(nicheId, 'pending_approval');

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Prepare Outreach — ${nicheProfile.niche_label}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  ${pending.length} lead(s) em pending_approval\n`);

  if (pending.length === 0) {
    console.log('  Nada pra preparar. Rode o discovery primeiro: node scripts/discovery-engine/index.js --niche=' + nicheId + '\n');
    return;
  }

  for (const { key, lead } of pending) {
    process.stdout.write(`  ${(lead.name || key).slice(0, 40).padEnd(42)}`);

    const drafts = await messageBuilder.build(lead, nicheProfile);

    store.update(nicheId, key, {
      whatsapp_message: drafts.whatsapp_message,
      linkedin_draft: drafts.linkedin_draft,
      is_placeholder_message: drafts.is_placeholder,
    });

    if (lead.website_enrichment?.redes_sociais_linkadas?.linkedin || lead.suggested_channel?.channel === 'linkedin_sales_navigator') {
      outreachLinkedin.markReadyForManualSend(nicheId, key);
    }

    console.log('✓ draft gerado' + (drafts.is_placeholder ? ' (PLACEHOLDER — oferta não definida ainda)' : ''));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${pending.length} draft(s) gerado(s) — nada foi enviado`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  1. Revise: agency/discovery-leads/${nicheId}.json`);
  console.log(`  2. Marque approved:true nos leads que quer enviar por WhatsApp`);
  console.log(`  3. Envie : node scripts/discovery-engine/send-approved.js --niche=${nicheId}`);
  console.log(`     (LinkedIn nunca é enviado por automação — copie o linkedin_draft manualmente)`);
  console.log(`${'='.repeat(60)}\n`);
}

const args = process.argv.slice(2);
const getArg = (prefix) => args.find((a) => a.startsWith(prefix))?.split('=')[1];
const nicheId = getArg('--niche=');

if (!nicheId) {
  console.error('Uso: node scripts/discovery-engine/prepare-outreach.js --niche=<niche_id>');
  process.exit(1);
}

run(nicheId).catch((err) => {
  console.error('\n✗ Erro fatal:', err.message);
  process.exit(1);
});
