#!/usr/bin/env node
'use strict';

/**
 * MarketingOS — Site Prospect
 *
 * Fluxo: URL → extrai marca + contatos → gera demo personalizado → envia outreach
 * Entrada: URL única (prospecção cirúrgica — 1 lead, sem busca no Maps)
 *
 * Uso:
 *   node scripts/demo-pipeline/from-url.js --url https://clinica.com.br --segment clinica
 *   node scripts/demo-pipeline/from-url.js --url https://escritorio.com.br --segment b2b --dry-run
 *
 * Opções:
 *   --url        URL do site do prospecto (obrigatório)
 *   --segment    clinica | b2b | diagnostico (padrão: clinica)
 *   --name       Nome da empresa (opcional — extraído automaticamente)
 *   --phone      Telefone WhatsApp (opcional — extraído automaticamente)
 *   --email      Email de contato (opcional — extraído automaticamente)
 *   --channels   whatsapp,email (padrão: whatsapp)
 *   --dry-run    Gera demo e exibe outreach sem enviar
 *   --only-demo  Salva demo localmente, não envia nada
 *   --slug       Salva em clients/[slug]/outputs/demos/ em vez de agency/demos/
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

const { extractBrand }    = require('./brand-extractor');
const { enrichLeads }     = require('../prospector/enricher');
const { generateDemo }    = require('./demo-generator');
const { resolveUrl }      = require('../publisher/uploader');
const { whatsappMessage } = require('./diagnostic-analyzer');

// ── Args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get = k => { const i = args.indexOf(`--${k}`); return i !== -1 ? args[i + 1] : null; };
  const has = k => args.includes(`--${k}`);
  return {
    url:      get('url'),
    segment:  get('segment') || 'clinica',
    name:     get('name'),
    phone:    get('phone'),
    email:    get('email'),
    channels: (get('channels') || 'whatsapp').split(',').map(s => s.trim()),
    dryRun:   has('dry-run'),
    onlyDemo: has('only-demo'),
    slug:     get('slug'),
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function outputBase(slug) {
  const base = slug
    ? path.resolve(__dirname, '../../clients', slug, 'outputs', 'demos')
    : path.resolve(__dirname, '../../agency', 'demos');
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function contactedBase(slug) {
  const base = slug
    ? path.resolve(__dirname, '../../clients', slug, 'outputs', 'inteligencia')
    : path.resolve(__dirname, '../../agency', 'contacted');
  fs.mkdirSync(base, { recursive: true });
  return base;
}

function safeSlug(str) {
  return (str || 'lead')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}

function loadImgbbKey(slug) {
  const configPath = slug
    ? path.resolve(__dirname, '../../clients', slug, 'instagram-config.json')
    : path.resolve(__dirname, '../../agency', 'instagram-config.json');
  try {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return process.env.IMGBB_API_KEY || cfg.imgbbApiKey || null;
  } catch {
    return process.env.IMGBB_API_KEY || null;
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!args.url) {
    console.error('❌ Uso: npm run site-prospect -- --url <url> [--segment clinica|b2b|diagnostico] [--dry-run]');
    process.exit(1);
  }

  const validSegments = ['clinica', 'b2b', 'diagnostico'];
  if (!validSegments.includes(args.segment)) {
    console.error(`❌ --segment deve ser: ${validSegments.join(' | ')}`);
    process.exit(1);
  }

  console.log('\n🎯 MarketingOS — Site Prospect');
  console.log(`   URL      : ${args.url}`);
  console.log(`   Segmento : ${args.segment}`);
  console.log(`   Canais   : ${args.channels.join(', ')}`);
  if (args.dryRun)   console.log('   ⚠️  DRY RUN — não envia');
  if (args.onlyDemo) console.log('   ⚠️  ONLY DEMO — salva localmente');

  // ── 1. Extrai identidade visual ──────────────────────────────────────────
  console.log('\n🎨 [1/3] Extraindo identidade visual...');
  const brand = await extractBrand(args.url);
  brand.name = args.name || brand.name;

  console.log(`   Nome  : ${brand.name || '(não detectado)'}`);
  console.log(`   Cor   : ${brand.color}`);
  console.log(`   Extra : ${brand.extracted ? '✓ extraído' : 'fallback padrão'}`);
  if (brand.content?.h1)      console.log(`   H1    : ${brand.content.h1.slice(0, 60)}`);
  if (brand.signals)          console.log(`   Sinais: IG=${brand.signals.hasInstagram ? '✓' : '✗'} WA=${brand.signals.hasWhatsapp ? '✓' : '✗'} form=${brand.signals.hasContactForm ? '✓' : '✗'}`);

  // ── 2. Extrai contatos ───────────────────────────────────────────────────
  console.log('\n📋 [2/3] Extraindo contatos...');
  const seedLead = { name: brand.name, website: args.url };
  const [enriched] = await enrichLeads([seedLead]);

  const lead = {
    name:           brand.name || enriched.name || 'Prospecto',
    website:        args.url,
    phone:          args.phone  || enriched.phones?.[0] || null,
    email:          args.email  || enriched.email  || null,
    instagram:      enriched.instagram || null,
    hasWhatsappCta: enriched.hasWhatsappCta || brand.signals?.hasWhatsapp || false,
    category:       args.segment,
  };

  console.log(`   Email    : ${lead.email    || '(não encontrado)'}`);
  console.log(`   Telefone : ${lead.phone    || '(não encontrado)'}`);
  console.log(`   Instagram: ${lead.instagram || '(não encontrado)'}`);
  console.log(`   WA no site: ${lead.hasWhatsappCta ? 'sim' : 'não'}`);

  if (!lead.phone && !lead.email && !args.dryRun && !args.onlyDemo) {
    console.log('\n⚠️  Nenhum contato encontrado automaticamente.');
    console.log('   Use --phone <número> ou --email <endereço> para forçar o envio,');
    console.log('   ou --only-demo para apenas salvar o demo localmente.');
  }

  // ── 3. Gera demo ─────────────────────────────────────────────────────────
  console.log('\n🖼  [3/3] Gerando demo personalizado...');
  const base    = outputBase(args.slug);
  const date    = new Date().toISOString().slice(0, 10);
  const slug    = safeSlug(lead.name);
  const prefix  = `${date}-demo-${slug}`;
  const demoDir = path.join(base, slug);

  let slideFiles;
  try {
    slideFiles = await generateDemo(args.segment, brand, demoDir, prefix, lead);
    console.log(`   ✓ ${slideFiles.length} slide(s) salvo(s)`);
    slideFiles.forEach(f => console.log(`   → ${f}`));
  } catch (err) {
    console.error(`   ✗ Erro ao gerar demo: ${err.message}`);
    process.exit(1);
  }

  if (args.onlyDemo) {
    console.log('\n💾 Demo salvo. Nenhuma mensagem enviada.');
    return;
  }

  // Upload imgbb (para email com imagem inline)
  const imgbbKey  = loadImgbbKey(args.slug);
  let   slide1Url = null;
  if (imgbbKey) {
    try {
      process.stdout.write('   Upload imgbb...');
      slide1Url = await resolveUrl(slideFiles[0], imgbbKey);
      console.log(' ✓');
    } catch (err) {
      console.log(` ✗ ${err.message}`);
    }
  }

  // Mensagem de outreach
  const msg = args.segment === 'diagnostico'
    ? whatsappMessage(lead)
    : `Fiz isso com a identidade de vocês 👇\n\nPosso mostrar como funciona em 15 minutos?`;

  // ── Dry-run ──────────────────────────────────────────────────────────────
  if (args.dryRun) {
    console.log('\n📤 [DRY-RUN] Outreach simulado:');
    if (args.channels.includes('whatsapp')) {
      console.log(`\n   WhatsApp → ${lead.phone || '(sem telefone)'}`);
      console.log('   ─────────────────────────────────────');
      console.log(`   ${msg.replace(/\n/g, '\n   ')}`);
      console.log('   ─────────────────────────────────────');
      console.log(`   + ${slideFiles.length} slide(s): ${slideFiles.map(f => path.basename(f)).join(', ')}`);
    }
    if (args.channels.includes('email')) {
      console.log(`\n   Email → ${lead.email || '(sem email)'}`);
      console.log(`   Assunto: Fiz uma demonstração com a identidade da ${lead.name}`);
    }
    console.log('\n✅ Dry-run concluído. Nenhuma mensagem enviada.');
    return;
  }

  // ── Envio real ───────────────────────────────────────────────────────────
  const contacted = [];

  if (args.channels.includes('whatsapp')) {
    if (!lead.phone) {
      console.log('\n⚠️  Sem telefone para WhatsApp. Use --phone <número>.');
    } else {
      const { initWhatsApp, sendWhatsAppWithMedia, destroyWhatsApp } = require('../prospector/outreach-whatsapp');
      const sessionPath = path.resolve(__dirname, '../../.whatsapp-session');
      await initWhatsApp(sessionPath);
      const result = await sendWhatsAppWithMedia(lead.phone, msg, slideFiles, 4000);
      if (result.success) {
        console.log(`\n✓ WhatsApp enviado → ${result.chatId}`);
        contacted.push({ ...lead, channel: 'whatsapp', sentAt: new Date().toISOString() });
      } else {
        console.log(`\n✗ WhatsApp falhou: ${result.error}`);
      }
      await destroyWhatsApp();
    }
  }

  if (args.channels.includes('email')) {
    if (!lead.email) {
      console.log('\n⚠️  Sem email. Use --email <endereço>.');
    } else {
      const { initEmail, sendEmail } = require('../prospector/outreach-email');
      initEmail({});
      const subject = `Fiz uma demonstração com a identidade da ${lead.name}`;
      const body    = `<p>Fiz uma demonstração com a identidade da <strong>${lead.name}</strong>.</p>`
        + `<p>Posso mostrar como funciona em 15 minutos?</p>`
        + (slide1Url ? `<br><img src="${slide1Url}" style="max-width:600px" alt="Demo ${lead.name}" />` : '');
      await sendEmail(lead.email, subject, body, 5000);
      console.log(`\n✓ Email enviado → ${lead.email}`);
      contacted.push({ ...lead, channel: 'email', sentAt: new Date().toISOString() });
    }
  }

  // Salva log de contactados
  if (contacted.length > 0) {
    const contactedDir = contactedBase(args.slug);
    const logPath = path.join(contactedDir, `${date}-contacted.json`);
    let existing = [];
    if (fs.existsSync(logPath)) {
      try { existing = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch {}
    }
    existing.push(...contacted);
    fs.writeFileSync(logPath, JSON.stringify(existing, null, 2), 'utf8');
    console.log(`\n📁 Log: ${logPath}`);
  }

  console.log('\n✅ Concluído!');
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
