'use strict';
const path = require('path');

let Client, LocalAuth, qrcode;
let client = null;

function loadDeps() {
  if (!Client) {
    ({ Client, LocalAuth } = require('whatsapp-web.js'));
    qrcode = require('qrcode-terminal');
  }
}

async function initWhatsApp(sessionPath) {
  loadDeps();
  client = new Client({
    authStrategy: new LocalAuth({ dataPath: sessionPath }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    },
  });

  return new Promise((resolve, reject) => {
    client.on('qr', qr => {
      console.log('\n📱 Escaneie o QR Code com seu WhatsApp:\n');
      qrcode.generate(qr, { small: true });
      console.log('\nAguardando autenticação...\n');
    });

    client.on('ready', () => {
      console.log('✅ WhatsApp conectado!\n');
      resolve(client);
    });

    client.on('auth_failure', msg => {
      console.error('❌ Falha de autenticação:', msg);
      reject(new Error(msg));
    });

    client.initialize();
  });
}

function normalizePhone(phone) {
  let digits = String(phone).replace(/\D/g, '');
  // Remove zero de discagem nacional (ex: 011... → 11...)
  if (digits.startsWith('0') && !digits.startsWith('00')) digits = digits.slice(1);
  // Já tem código do país
  if (digits.startsWith('55') && digits.length >= 12) return `${digits}@c.us`;
  // DDD + número (11 dígitos celular ou 10 fixo)
  if (digits.length === 11 || digits.length === 10) return `55${digits}@c.us`;
  return null;
}

async function sendWhatsApp(phone, message, delayMs = 3000) {
  if (!client) throw new Error('WhatsApp não inicializado. Chame initWhatsApp() primeiro.');

  const chatId = normalizePhone(phone);
  if (!chatId) return { success: false, error: 'Número inválido', phone };

  await new Promise(r => setTimeout(r, delayMs));

  try {
    await client.sendMessage(chatId, message);
    return { success: true, chatId, phone };
  } catch (err) {
    return { success: false, error: err.message, phone };
  }
}

async function destroyWhatsApp() {
  if (client) {
    await client.destroy().catch(() => {});
    client = null;
  }
}

module.exports = { initWhatsApp, sendWhatsApp, destroyWhatsApp };
