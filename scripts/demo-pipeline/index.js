#!/usr/bin/env node
'use strict';

/**
 * MarketingOS Demo Pipeline
 *
 * Fluxo: scrape leads → extrai marca → gera demo com a marca deles → envia outreach
 * Outputs vão para agency/ (operação interna) ou clients/[slug]/ (se --slug informado)
 *
 * Uso:
 *   node scripts/demo-pipeline/index.js --query "clínica estética" --city "São Paulo" --segment clinica
 *   node scripts/demo-pipeline/index.js --query "escritório contabilidade" --city "Curitiba" --segment b2b
 *   node scripts/demo-pipeline/index.js --slug meu-cliente --query "..." --city "..." --segment clinica
 *
 * Opções:
 *   --query      Termo de busca no Google Maps (obrigatório)
 *   --city       Cidade alvo (obrigatório)
 *   --segment    clinica | b2b (obrigatório)
 *   --slug       Se informado, grava em clients/[slug]/outputs/demos/ (uso para cliente)
 *   --max        Máximo de leads (padrão: 10)
 *   --channels   whatsapp,email (padrão: whatsapp)
 *   --dry-run    Gera demos mas não envia outreach
 *   --only-demo  Gera e salva demos localmente, não envia nada
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { scrapeGoogleMaps } = require('../prospector/scraper');
const { enrichLeads }      = require('../prospector/enricher');
const { extractBrand }     = require('./brand-extractor');
const { generateDemo }     = require('./demo-generator');
const { resolveUrl }       = require('../publisher/uploader');
const { whatsappMessage }  = require('./diagnostic-analyzer');

// ── Args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get = k => { const i = args.indexOf(`--${k}`); return i !== -1 ? args[i + 1] : null; };
  const has = k => args.includes(`--${k}`);
  return {
    slug:      get('slug'),
    query:     get('query'),
    city:      get('city'),
    segment:   get('segment') || 'clinica',
    max:       parseInt(get('max') || '10', 10),
    channels:  (get('channels') || 'whatsapp').split(',').map(s => s.trim()),
    dryRun:    has('dry-run'),
    onlyDemo:  has('only-demo'),
  };
}

// ── Outreach message templates ─────────────────────────────────────────────

// Extrai nome curto — só até a primeira vírgula, traço ou parêntese
function shortName(fullName) {
  if (!fullName) return 'vocês';
  return fullName.split(/[,\-\|(\[]/)[0].trim().slice(0, 40);
}

const WHATSAPP_TEMPLATE = {
  clinica:     `Fiz isso com a identidade de vocês 👇\n\nPosso mostrar como funciona em 15 minutos?`,
  b2b:         `Fiz isso com a identidade de vocês 👇\n\nPosso mostrar como funciona em 15 minutos?`,
  // diagnostico: mensagem gerada dinamicamente por diagnostic-analyzer.whatsappMessage(lead)
};

const EMAIL_SUBJECT = {
  clinica: 'Fiz uma demonstração com a identidade da {{nome}}',
  b2b:     'Demonstração de presença digital para {{nome}}',
};

const EMAIL_HTML = {
  clinica: `<p>Oi,</p>
<p>Fiz uma demonstração com a identidade da <strong>{{nome}}</strong>.</p>
<p>Posso mostrar como funciona em 15 minutos?</p>`,
  b2b: `<p>Oi,</p>
<p>Fiz uma demonstração com a identidade do <strong>{{nome}}</strong>.</p>
<p>Posso mostrar como funciona em 15 minutos?</p>`,
};

function renderTemplate(template, lead) {
  return template.replace(/\{\{nome\}\}/g, shortName(lead.name));
}

// ── Helpers ────────────────────────────────────────────────────────────────

function outputBase(slug) {
  // Sem slug → operação da agência → agency/demos/
  // Com slug → operação para cliente → clients/[slug]/outputs/demos/
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
  return (str || 'lead').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
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

  if (!args.query || !args.city) {
    console.error('❌ Uso: node scripts/demo-pipeline/index.js --query "<busca>" --city "<cidade>" --segment clinica|b2b [--slug <cliente>]');
    process.exit(1);
  }

  const validSegments = ['clinica', 'b2b', 'diagnostico'];
  if (!validSegments.includes(args.segment)) {
    console.error(`❌ --segment deve ser: ${validSegments.join(' | ')}`);
    process.exit(1);
  }

  console.log('\n🎯 MarketingOS Demo Pipeline');
  console.log(`   Busca    : ${args.query} em ${args.city}`);
  console.log(`   Segmento : ${args.segment}`);
  console.log(`   Máx leads: ${args.max}`);
  console.log(`   Canais   : ${args.channels.join(', ')}`);
  if (args.dryRun)   console.log('   ⚠️  DRY RUN — não envia outreach');
  if (args.onlyDemo) console.log('   ⚠️  ONLY DEMO — salva localmente, não envia nada');

  const base = outputBase(args.slug);
  const contactedDir = contactedBase(args.slug);
  const imgbbKey = loadImgbbKey(args.slug);
  const date = new Date().toISOString().slice(0, 10);

  // ── 1. Scrape leads ──────────────────────────────────────────────────────
  console.log('\n🔍 [1/4] Buscando leads...');
  let leads = await scrapeGoogleMaps(args.query, args.city, args.max);
  console.log(`   ${leads.length} leads encontrados`);

  if (leads.length === 0) {
    console.log('   Nenhum lead encontrado. Tente um termo mais amplo.');
    process.exit(0);
  }

  // ── 2. Enrich (extrai site/email/telefone) ───────────────────────────────
  console.log('\n📋 [2/4] Enriquecendo leads...');
  leads = await enrichLeads(leads);

  // ── 3. Para cada lead: extrai marca + gera demo ──────────────────────────
  console.log('\n🎨 [3/4] Gerando demos personalizados...');

  const results = [];

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    console.log(`\n   [${i + 1}/${leads.length}] ${lead.name || 'Lead'}`);

    // Extrai marca do site (pulada no modo diagnostico — o foco é o achado, não a marca)
    let brand = { name: lead.name, color: '#2563eb', logoUrl: null, extracted: false };
    if (lead.website && args.segment !== 'diagnostico') {
      process.stdout.write(`     Extraindo marca de ${lead.website}...`);
      brand = await extractBrand(lead.website);
      brand.name = brand.name || lead.name;
      console.log(brand.extracted ? ` ✓ cor: ${brand.color}` : ' (fallback padrão)');
    } else if (args.segment === 'diagnostico') {
      const igInfo = lead.instagram ? ` · Instagram: ${lead.instagram}` : ' · sem Instagram detectado';
      const waInfo = lead.hasWhatsappCta ? ' · WhatsApp no site: sim' : ' · WhatsApp no site: não';
      console.log(`     Sinais detectados:${igInfo}${waInfo}`);
    }

    // Gera demo
    const prefix = `${date}-demo-${safeSlug(lead.name)}`;
    const demoDir = path.join(base, safeSlug(lead.name));

    let slideFiles;
    try {
      process.stdout.write(`     Renderizando demo...`);
      slideFiles = await generateDemo(args.segment, brand, demoDir, prefix, lead);
      console.log(` ✓ ${slideFiles.length} slides`);
    } catch (err) {
      console.log(` ✗ Erro: ${err.message}`);
      continue;
    }

    // Upload slide 1 para imgbb (para envio via WhatsApp/email)
    let slide1Url = null;
    if (!args.onlyDemo && imgbbKey) {
      try {
        process.stdout.write(`     Upload imgbb...`);
        slide1Url = await resolveUrl(slideFiles[0], imgbbKey);
        console.log(` ✓`);
      } catch (err) {
        console.log(` ✗ ${err.message}`);
      }
    }

    results.push({ lead, brand, slideFiles, slide1Url });
  }

  console.log(`\n   ✅ ${results.length} demos gerados`);

  if (args.onlyDemo) {
    console.log('\n💾 Demos salvos em:', base);
    return;
  }

  // ── 4. Outreach ──────────────────────────────────────────────────────────
  console.log('\n📤 [4/4] Enviando outreach...');

  const contacted = [];
  const whatsappChannel = args.channels.includes('whatsapp');
  const emailChannel = args.channels.includes('email');

  // dry-run: apenas exibe o que seria enviado, sem iniciar conexões
  if (args.dryRun) {
    for (const { lead, slideFiles } of results) {
      if (whatsappChannel && lead.phone) {
        const dryMsg = args.segment === 'diagnostico'
          ? whatsappMessage(lead)
          : WHATSAPP_TEMPLATE[args.segment];
        console.log(`   [DRY-RUN] WhatsApp → ${lead.phone} (${shortName(lead.name)})`);
        console.log(`             "${dryMsg}" + ${slideFiles.length} slides`);
        if (args.segment === 'diagnostico') {
          console.log(`             Instagram detectado: ${lead.instagram || '(nenhum)'} | WhatsApp CTA: ${lead.hasWhatsappCta ? 'sim' : 'não'}`);
        }
      }
      if (emailChannel && lead.email) {
        const subject = renderTemplate(EMAIL_SUBJECT[args.segment], lead);
        console.log(`   [DRY-RUN] Email → ${lead.email}: ${subject}`);
      }
      if (!lead.phone && !lead.email) {
        console.log(`   [DRY-RUN] ${lead.name}: sem contato extraído`);
      }
    }
    console.log('\n✅ Dry-run concluído. Nenhuma mensagem enviada.');
    return;
  }

  if (whatsappChannel) {
    const { initWhatsApp, sendWhatsAppWithMedia, destroyWhatsApp } = require('../prospector/outreach-whatsapp');
    const sessionPath = path.resolve(__dirname, '../../.whatsapp-session');
    await initWhatsApp(sessionPath);

    for (const { lead, slideFiles } of results) {
      if (!lead.phone) { console.log(`   ⚠️  ${lead.name}: sem telefone`); continue; }

      const msg = args.segment === 'diagnostico'
        ? whatsappMessage(lead)
        : WHATSAPP_TEMPLATE[args.segment];

      const result = await sendWhatsAppWithMedia(lead.phone, msg, slideFiles, 4000);

      if (result.success) {
        console.log(`   ✓ WhatsApp → ${result.chatId}`);
        contacted.push({ ...lead, channel: 'whatsapp', sentAt: new Date().toISOString() });
      } else {
        console.log(`   ✗ WhatsApp → ${lead.phone}: ${result.error}`);
      }
    }

    await destroyWhatsApp();
  }

  if (emailChannel) {
    const { initEmail, sendEmail } = require('../prospector/outreach-email');
    initEmail({});

    for (const { lead, slide1Url } of results) {
      if (!lead.email) { console.log(`   ⚠️  ${lead.name}: sem email`); continue; }
      const subject = renderTemplate(EMAIL_SUBJECT[args.segment], lead);
      const body = renderTemplate(EMAIL_HTML[args.segment], lead)
        + (slide1Url ? `<br><br><img src="${slide1Url}" style="max-width:600px" alt="Demo" />` : '');
      await sendEmail(lead.email, subject, body, 5000);
      console.log(`   ✓ Email → ${lead.email}`);
      contacted.push({ ...lead, channel: 'email', sentAt: new Date().toISOString() });
    }
  }

  // Salva log
  if (!args.dryRun && contacted.length > 0) {
    const logPath = path.join(contactedDir, `${date}-contacted.json`);
    fs.writeFileSync(logPath, JSON.stringify(contacted, null, 2), 'utf8');
    console.log(`\n📁 Log salvo: ${logPath}`);
  }

  // Atualiza stats do site
  try {
    const { updateStats } = require('../update-stats');
    updateStats({ leads: leads.length, demos: results.length, whatsapp: contacted.filter(c => c.channel === 'whatsapp').length });
  } catch {}

  console.log('\n✅ Pipeline concluído!');
  console.log(`   Demos: ${results.length} | Enviados: ${contacted.length}`);
  console.log(`\n💡 Próximo passo: aguarde respostas e marque calls.`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
