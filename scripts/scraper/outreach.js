'use strict';

/**
 * outreach.js — Envia mensagem via WhatsApp (automático) ou email.
 * Canal padrão: whatsapp via whatsapp-web.js
 * Protocolo: Etapa 2 — mensagem curta, sem pitch, termina com pergunta.
 */

const { initEmail, verifyEmail, sendEmail } = require('../prospector/outreach-email');
const { initWhatsApp, sendWhatsApp, destroyWhatsApp } = require('../prospector/outreach-whatsapp');

const SESSION = require('path').resolve(__dirname, '../../.whatsapp-session');

let emailInitialized = false;
let whatsappInitialized = false;

async function send(lead, message, channel = 'whatsapp') {
  const result = {
    sent:      false,
    channel:   null,
    timestamp: null,
    error:     null,
  };

  try {
    if (channel === 'whatsapp' || channel === 'both') {
      if (lead.whatsapp) {
        await ensureWhatsAppReady();
        const res = await sendWhatsApp(lead.whatsapp, message.whatsapp_version, 4000);
        if (res.success) {
          result.sent    = true;
          result.channel = 'whatsapp';
          console.log(`    ✓ WhatsApp enviado para ${lead.whatsapp}`);
        } else {
          result.error = res.error;
          console.log(`    ✗ Falha no WhatsApp: ${res.error}`);
        }
      } else {
        console.log(`    ⚠ WhatsApp não encontrado — pulando`);
      }
    }

    if (channel === 'email' || channel === 'both') {
      if (lead.email) {
        await ensureEmailReady();
        const res = await sendEmail(lead.email, message.subject, buildHtml(message.body));
        if (res.success) {
          result.sent    = true;
          result.channel = result.channel ? 'both' : 'email';
          console.log(`    ✓ Email enviado para ${lead.email}`);
        } else {
          result.error = res.error;
          console.log(`    ✗ Falha no email: ${res.error}`);
        }
      } else {
        console.log(`    ⚠ Email não encontrado — pulando`);
      }
    }

    result.timestamp = new Date().toISOString();

  } catch (err) {
    result.error = err.message;
    console.log(`    ✗ Erro no envio: ${err.message}`);
  }

  return result;
}

async function ensureWhatsAppReady() {
  if (whatsappInitialized) return;
  await initWhatsApp(SESSION);
  whatsappInitialized = true;
}

async function ensureEmailReady() {
  if (emailInitialized) return;

  const user = process.env.EMAIL_USER || process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Email não configurado. Defina EMAIL_USER e EMAIL_PASS no .env');
  }

  initEmail({ user, pass, from: `Felipe Proença <${user}>` });
  await verifyEmail();
  emailInitialized = true;
}

async function cleanup() {
  if (whatsappInitialized) {
    await destroyWhatsApp();
    whatsappInitialized = false;
  }
}

function buildHtml(body) {
  return `<p>${body.replace(/\n/g, '<br>')}</p>`;
}

module.exports = { send, cleanup };
