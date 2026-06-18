#!/usr/bin/env node
'use strict';

/**
 * long-lived-token.js — Troca o token curto da Graph API pelo de longa duração (~60 dias).
 *
 * O token do Graph API Explorer expira em ~1h. Para qualquer coisa que rode
 * sozinha (DM engine, insights, publisher agendado), isso é inviável. Este
 * helper faz o câmbio fb_exchange_token e mostra a nova validade.
 *
 * Uso:
 *   node scripts/publisher/long-lived-token.js --slug felipe-proenca [--save]
 *   (token curto vem do instagram-config.json; --save grava o longo de volta)
 *
 * Requer no ambiente (do app no Meta Dashboard):
 *   META_APP_ID, META_APP_SECRET
 *
 * REGRA "tudo é verdade": sem credenciais ou se a Meta recusar, falha honesta
 * e NÃO grava nada.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { apiGet } = require('./instagram');
const { loadConfig } = require('./config');

function arg(name) {
  const i = process.argv.indexOf(name);
  return i !== -1 ? (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : true) : null;
}

async function main() {
  const slug = arg('--slug') || 'felipe-proenca';
  const save = !!arg('--save');
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    console.error('❌ Faltam META_APP_ID e/ou META_APP_SECRET no ambiente.');
    console.error('   Pegue em developers.facebook.com → seu app → Configurações → Básico.');
    console.error('   Defina no .env e rode de novo. Nada foi alterado.');
    process.exit(1);
  }

  const cfg = loadConfig(slug);
  if (!cfg.accessToken) { console.error(`❌ Sem accessToken em clients/${slug}/instagram-config.json.`); process.exit(1); }

  console.log(`\n🔑 Trocando token curto por longo (~60 dias) — ${slug}`);
  let data;
  try {
    data = await apiGet('/oauth/access_token', {
      grant_type: 'fb_exchange_token',
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: cfg.accessToken,
    });
  } catch (e) {
    console.error(`\n❌ Meta recusou o câmbio: ${e.message}`);
    console.error('   (Token curto já expirado? Gere um novo no Graph API Explorer e tente de novo.)');
    process.exit(2);
  }

  const token = data.access_token;
  const days = data.expires_in ? Math.round(data.expires_in / 86400) : null;
  if (!token) { console.error('\n❌ Resposta sem access_token. Nada alterado.'); process.exit(2); }

  console.log(`   ✓ Novo token obtido. Validade: ${days != null ? days + ' dias' : 'longa (não informada)'}.`);
  console.log(`   ${token.slice(0, 12)}…${token.slice(-6)} (${token.length} chars)`);

  if (!save) {
    console.log('\n   Para gravar no config, rode de novo com --save.');
    console.log('   (Ou cole manualmente em accessToken do instagram-config.json.)');
    return;
  }

  const configPath = path.resolve(__dirname, '../../clients', slug, 'instagram-config.json');
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  raw.accessToken = token;
  raw.tokenObtainedAt = new Date().toISOString();
  if (days != null) raw.tokenExpiresInDays = days;
  fs.writeFileSync(configPath, JSON.stringify(raw, null, 2), 'utf8');
  console.log(`\n   ✓ Gravado em clients/${slug}/instagram-config.json (accessToken atualizado).`);
}

main().catch(e => { console.error(`\n❌ ${e.message}`); process.exit(1); });
