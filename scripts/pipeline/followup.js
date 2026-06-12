#!/usr/bin/env node
'use strict';

/**
 * followup.js — O funil não morre mais em "sent".
 *
 * Faz duas coisas:
 *   1. RECONCILIA respostas — varre as conversas dos contatos em
 *      sent/followup_* e marca como "replied" quem respondeu enquanto
 *      o bot estava offline (o bot ao vivo cuida do resto).
 *   2. ENVIA follow-ups — D+2 sem resposta → followup_1,
 *      D+5 sem resposta → followup_2. Depois disso, silêncio (não insistir).
 *
 * Uso:
 *   npm run followup              → mostra o plano, NÃO envia (aprovação manual)
 *   npm run followup -- --enviar  → envia de verdade (rodar é o ato de aprovação)
 *   --fora-do-horario             → ignora janela 9h–18h
 *
 * Anti-ban: respeita teto diário e intervalo aleatório (pipeline/guard.js).
 */

require('dotenv').config();

const store = require('./store');
const guard = require('./guard');
const { initWhatsApp, sendWhatsApp, destroyWhatsApp, getClient } = require('../prospector/outreach-whatsapp');

const path = require('path');
const SESSION = path.resolve(__dirname, '../../.whatsapp-session');

// ── Templates de follow-up ────────────────────────────────────────────────────
// Curtos, humanos, sem pitch — mesma régua do primeiro contato.
// followup_2 fecha a porta com elegância: gancho elegante, nunca pressão.

function shortName(fullName) {
  if (!fullName) return 'vocês';
  return fullName.split(/[,\-\|(\[]/)[0].trim().split(' ').slice(0, 3).join(' ');
}

const TEMPLATES = {
  followup_1: name =>
    `Oi! Te mandei uma mensagem há uns dias sobre a ${name} — chegou a ver?\n\nSei que a rotina aí não para, então só estou trazendo pra cima de novo 🙂`,

  followup_2: name =>
    `Prometo que é a última vez que apareço por aqui 🙂\n\nSe fizer sentido ver o que preparei pra ${name}, é só responder essa mensagem. Se não for o momento, tudo certo também — sucesso por aí!`,
};

// ── 1. Reconciliação de respostas ─────────────────────────────────────────────

async function reconcileReplies(client) {
  const waiting = store.awaitingReply();
  let found = 0;

  console.log(`\n─ Reconciliando respostas (${waiting.length} contatos aguardando) ─\n`);

  for (const { key, contact } of waiting) {
    try {
      const chat = await client.getChatById(contact.chatId);
      const messages = await chat.fetchMessages({ limit: 20 });

      const lastOutbound = new Date(contact.lastOutboundAt || contact.sentAt || 0).getTime();

      const reply = messages.find(m =>
        !m.fromMe && (m.timestamp * 1000) > lastOutbound
      );

      if (reply) {
        store.setStep(key, 'replied', `reconciliado: "${(reply.body || '').slice(0, 80)}"`);
        console.log(`  ✓ RESPONDEU: ${contact.name} — "${(reply.body || '').slice(0, 60)}"`);
        found++;
      }
    } catch {
      // chat inexistente ou número inválido — segue
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  if (found === 0) console.log('  Nenhuma resposta nova encontrada.');
  else console.log(`\n  ${found} contato(s) marcados como replied — responda-os HOJE (manualmente ou via bot).`);

  return found;
}

// ── 2. Envio de follow-ups ────────────────────────────────────────────────────

async function sendFollowups({ enviar, ignoreHours }) {
  const due = store.dueFollowups();

  console.log(`\n─ Follow-ups devidos: ${due.length} ─\n`);

  if (due.length === 0) {
    console.log('  Ninguém no ponto de follow-up hoje.');
    return;
  }

  const remaining = guard.remainingToday();
  const plan = due.slice(0, remaining);

  for (const { contact, next } of due) {
    const days = next === 'followup_1' ? 'D+2' : 'D+5';
    console.log(`  ${days} → ${contact.name} (${contact.whatsapp})`);
  }

  if (due.length > remaining) {
    console.log(`\n  ⚠ Teto diário permite só ${remaining} envio(s) hoje — os demais ficam para amanhã.`);
  }

  if (!enviar) {
    console.log(`\n  Modo plano (nada enviado). Para enviar de verdade:`);
    console.log(`    npm run followup -- --enviar\n`);
    return;
  }

  const gate = guard.canSend({ ignoreHours });
  if (!gate.ok) {
    console.log(`\n  ✗ ${gate.reason}\n`);
    return;
  }

  console.log('');
  let sent = 0;

  for (const { key, contact, next } of plan) {
    const gateNow = guard.canSend({ ignoreHours });
    if (!gateNow.ok) {
      console.log(`  ✗ ${gateNow.reason}`);
      break;
    }

    const message = TEMPLATES[next](shortName(contact.name));
    const res = await sendWhatsApp(contact.whatsapp, message, 2000);

    if (res.success) {
      store.setStep(key, next, 'follow-up automático');
      console.log(`  ✓ ${next} enviado → ${contact.name}`);
      sent++;
    } else {
      console.log(`  ✗ Falha → ${contact.name}: ${res.error}`);
    }

    if (sent < plan.length) await guard.waitRandomDelay();
  }

  console.log(`\n  ${sent} follow-up(s) enviado(s). Restante do teto hoje: ${guard.remainingToday()}\n`);
}

// ── Run ───────────────────────────────────────────────────────────────────────

async function run() {
  const args = process.argv.slice(2);
  const enviar = args.includes('--enviar');
  const ignoreHours = args.includes('--fora-do-horario');

  console.log(`\n${'─'.repeat(50)}`);
  console.log('  MarketingOS — Follow-up Engine');
  console.log(`${'─'.repeat(50)}`);
  console.log(`  Pipeline : ${Object.keys(store.load()).length} contatos`);
  console.log(`  Teto hoje: ${guard.remainingToday()}/${guard.DAILY_CAP} envios disponíveis`);
  if (!enviar) console.log(`  ⚠ MODO PLANO — nenhuma mensagem será enviada`);

  console.log('\n  Conectando WhatsApp...');
  await initWhatsApp(SESSION);

  try {
    await reconcileReplies(getClient());
    await sendFollowups({ enviar, ignoreHours });
  } finally {
    await destroyWhatsApp();
  }
}

run().catch(err => {
  console.error('\n✗ Erro fatal:', err.message);
  process.exit(1);
});
