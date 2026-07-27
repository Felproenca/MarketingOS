#!/usr/bin/env node
'use strict';

/**
 * send-approved.js — Envia WhatsApp SÓ pra leads marcados approved:true
 * manualmente pelo operador. NUNCA envia LinkedIn (compliance: InMail é
 * sempre manual/individual, ver outreach-linkedin.js).
 *
 * Uso:
 *   node scripts/discovery-engine/send-approved.js --niche=corban_2026 [--dry-run] [--fora-do-horario]
 *
 * Rodar este comando É a aprovação de envio (mesma convenção do scraper v3) —
 * mas só manda quem já tem approved:true escrito no arquivo do nicho.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const store = require('./lib/store');
const guard = require('./lib/guard');
const outreachWhatsapp = require('./modules/outreach-whatsapp');

function loadNicheProfile(nicheId) {
  const file = path.resolve(__dirname, 'niche-profiles', `${nicheId.replace(/_/g, '-')}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function run(nicheId, { dryRun = false, ignoreHours = false } = {}) {
  const nicheProfile = loadNicheProfile(nicheId);
  const approved = store.listApprovedUnsent(nicheId);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Send Approved — ${nicheProfile.niche_label}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  Aprovados p/ envio : ${approved.length}`);
  console.log(`  Teto hoje          : ${guard.remainingToday()}/${guard.DAILY_CAP}`);
  if (dryRun) console.log(`  ⚠ DRY RUN — nenhuma mensagem será enviada de verdade`);
  console.log(`${'─'.repeat(60)}\n`);

  if (approved.length === 0) {
    console.log('  Nenhum lead aprovado. Marque approved:true em agency/discovery-leads/' + nicheId + '.json primeiro\n');
    console.log('  (ou rode prepare-outreach.js se ainda não gerou os drafts)\n');
    return;
  }

  let sentCount = 0;

  for (let i = 0; i < approved.length; i++) {
    const { key, lead } = approved[i];

    if (lead.is_placeholder_message) {
      console.log(`  ⊘ ${lead.name} — mensagem ainda é PLACEHOLDER, não enviar até a oferta real ser definida`);
      continue;
    }

    const phone = lead.places?.phone;
    if (!phone) {
      console.log(`  ⊘ ${lead.name} — sem telefone, não dá pra mandar WhatsApp`);
      continue;
    }

    if (!dryRun) {
      const gate = guard.canSend({ ignoreHours });
      if (!gate.ok) {
        console.log(`\n  ✗ ${gate.reason}`);
        console.log(`    ${approved.length - sentCount} lead(s) permanecem aprovados pra depois.`);
        break;
      }
    }

    console.log(`\n  → ${lead.name} (${phone})`);

    if (dryRun) {
      console.log(`    [dry-run] ${lead.whatsapp_message.split('\n')[0]}...`);
      continue;
    }

    const res = await outreachWhatsapp.send(phone, lead.whatsapp_message);

    if (res.sent) {
      sentCount++;
      guard.recordSend(nicheId, key);
      store.setStep(nicheId, key, 'sent', 'via Discovery Engine send-approved');
      console.log(`    ✓ enviado`);
    } else {
      console.log(`    ✗ falhou: ${res.error}`);
      store.setStep(nicheId, key, 'dead', res.error);
    }

    const isLast = i === approved.length - 1;
    if (!isLast && res.sent) await guard.waitRandomDelay();
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Enviados: ${sentCount} | Teto restante hoje: ${guard.remainingToday()}`);
  console.log(`${'='.repeat(60)}\n`);

  await outreachWhatsapp.cleanup();
}

const args = process.argv.slice(2);
const getArg = (prefix) => args.find((a) => a.startsWith(prefix))?.split('=')[1];
const nicheId = getArg('--niche=');

if (!nicheId) {
  console.error('Uso: node scripts/discovery-engine/send-approved.js --niche=<niche_id> [--dry-run] [--fora-do-horario]');
  process.exit(1);
}

run(nicheId, {
  dryRun: args.includes('--dry-run'),
  ignoreHours: args.includes('--fora-do-horario'),
}).catch((err) => {
  console.error('\n✗ Erro fatal:', err.message);
  process.exit(1);
});
