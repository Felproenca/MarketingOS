#!/usr/bin/env node
'use strict';
/**
 * connect-session.js — Autenticação única da sessão WhatsApp do Discovery Engine.
 *
 * Uso (no terminal do seu PC, UMA vez):
 *   node scripts/discovery-engine/connect-session.js
 *
 * Ao rodar, um QR Code aparece no terminal: escaneie com o WhatsApp do número
 * da agência (Ajustes > Aparelhos conectados > Conectar aparelho).
 * A sessão fica salva em .whatsapp-session-discovery-engine/ e o envio real
 * (send-approved.js) passa a funcionar sem novo login.
 */
const path = require('path');
const { initWhatsApp, destroyWhatsApp, isRegistered } = require('../prospector/outreach-whatsapp');

const SESSION_PATH = path.resolve(__dirname, '../../.whatsapp-session-discovery-engine');

(async () => {
  console.log('Conectando WhatsApp (sessão Discovery Engine)...');
  console.log('QR Code abaixo — escaneie com o celular (o QR expira em ~30s e é regenerado):\n');
  await initWhatsApp(SESSION_PATH); // resolve no evento 'ready'
  console.log('\nSessão salva em:', SESSION_PATH);
  const check = await isRegistered('5521972256655');
  console.log('Número da Zorah tem WhatsApp ativo?', check.registered ? 'SIM' : 'NÃO (verificar)');
  await destroyWhatsApp();
  console.log('Concluído. Agora o envio real pode rodar.');
})().catch((err) => {
  console.error('\nFalha ao conectar:', err.message);
  process.exit(1);
});
