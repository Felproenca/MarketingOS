#!/usr/bin/env node
'use strict';

/**
 * MarketingOS WhatsApp Bot
 *
 * Escuta respostas dos prospectos e conduz a conversa automaticamente:
 *   sent → replied → demo_sent → call_offered
 *
 * Uso:
 *   node scripts/whatsapp-bot/index.js
 *   node scripts/whatsapp-bot/index.js --sync   (força re-sync dos contactados)
 */

require('dotenv').config();
const path = require('path');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const store = require('./state-store');
const { handleReply } = require('./conversation');

const SESSION_PATH = path.resolve(__dirname, '../../.whatsapp-session');
const CONTACTED_DIR = path.resolve(__dirname, '../../agency/contacted');

// ── Init ───────────────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: SESSION_PATH }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  },
});

client.on('qr', qr => {
  console.log('\n📱 Escaneie o QR Code:\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot conectado!\n');

  // Sincroniza contatos enviados
  try {
    const added = store.syncContacted(CONTACTED_DIR);
    if (added > 0) console.log(`📋 ${added} contatos sincronizados\n`);
  } catch (err) {
    console.log(`⚠️  Sync: ${err.message}\n`);
  }

  console.log('👂 Aguardando respostas...\n');
});

client.on('auth_failure', msg => {
  console.error('❌ Falha de autenticação:', msg);
  process.exit(1);
});

// ── Message listener ───────────────────────────────────────────────────────

client.on('message', async msg => {
  // Só processa mensagens recebidas (não as que o bot enviou)
  if (msg.fromMe) return;

  const chatId = msg.from;
  const contact = store.get(chatId);

  // Não está na lista de prospectados — ignora
  if (!contact) return;

  // Já encerrou — não responde mais
  if (contact.step === 'call_offered') return;

  const text = msg.body || '';
  console.log(`\n📩 [${contact.name}] "${text.slice(0, 60)}"`);

  // Função de envio que aceita string ou MessageMedia
  async function sendFn(content) {
    await new Promise(r => setTimeout(r, 2000));
    await client.sendMessage(chatId, content);
  }

  try {
    const { action, nextStep } = await handleReply(contact, text, sendFn);
    store.set(chatId, { step: nextStep, lastReply: text, lastAction: action });
    console.log(`   → ${action} | step: ${nextStep}`);
  } catch (err) {
    console.error(`   ✗ Erro: ${err.message}`);
  }
});

// ── Start ──────────────────────────────────────────────────────────────────

console.log('\n🤖 MarketingOS WhatsApp Bot');
console.log('   Iniciando...\n');

client.initialize();

process.on('SIGINT', async () => {
  console.log('\n\nEncerrando bot...');
  await client.destroy().catch(() => {});
  process.exit(0);
});
