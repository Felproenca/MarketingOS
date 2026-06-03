'use strict';

/**
 * outreach.js — Envia mensagem via email.
 * WhatsApp: prepara payload para envio manual ou Evolution API.
 * Reutiliza outreach-email.js existente.
 */

const { initEmail, verifyEmail, sendEmail } = require('../prospector/outreach-email');

let emailInitialized = false;

async function send(lead, message, channel = 'email') {
  const result = {
    sent:      false,
    channel:   null,
    timestamp: null,
    error:     null,
  };

  try {
    if (channel === 'email' || channel === 'both') {
      if (lead.email) {
        await ensureEmailReady();
        const res = await sendEmail(lead.email, message.subject, buildHtml(message.body));
        if (res.success) {
          result.sent    = true;
          result.channel = 'email';
          console.log(`    ✓ Email enviado para ${lead.email}`);
        } else {
          result.error = res.error;
          console.log(`    ✗ Falha no email: ${res.error}`);
        }
      } else {
        console.log(`    ⚠ Email não encontrado — pulando`);
      }
    }

    if (channel === 'whatsapp' || channel === 'both') {
      if (lead.whatsapp) {
        result.whatsapp_ready = {
          number:  lead.whatsapp,
          message: message.whatsapp_version,
        };
        console.log(`    ℹ WhatsApp pronto para envio manual: ${lead.whatsapp}`);
      }
    }

    result.timestamp = new Date().toISOString();

  } catch (err) {
    result.error = err.message;
    console.log(`    ✗ Erro no envio: ${err.message}`);
  }

  return result;
}

async function ensureEmailReady() {
  if (emailInitialized) return;

  const user = process.env.EMAIL_USER || process.env.EMAIL_FROM;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error(
      'Email não configurado. Defina EMAIL_USER (ou EMAIL_FROM) e EMAIL_PASS no .env'
    );
  }

  initEmail({
    user,
    pass,
    from: `Felipe Proença <${user}>`,
  });

  await verifyEmail();
  emailInitialized = true;
}

function buildHtml(body) {
  return `<p>${body.replace(/\n/g, '<br>')}</p>`;
}

module.exports = { send };
