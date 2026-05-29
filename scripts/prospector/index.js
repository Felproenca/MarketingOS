#!/usr/bin/env node
'use strict';

/**
 * Prospector — MarketingOS
 *
 * Uso:
 *   node scripts/prospector/index.js --slug <slug> --query <busca> --city <cidade> [opções]
 *
 * Opções:
 *   --slug       Slug do cliente (obrigatório)
 *   --query      Termo de busca, ex: "salão de beleza"
 *   --city       Cidade, ex: "São Paulo"
 *   --max        Máximo de leads por fonte (padrão: 20)
 *   --channels   Canais separados por vírgula: whatsapp,email (padrão: ambos)
 *   --sources    Fontes: maps,search (padrão: ambas)
 *   --dry-run    Mostra leads sem enviar mensagens
 *   --enrich     Visita sites para extrair email/telefone (padrão: true)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { scrapeGoogleMaps, scrapeGoogleSearch } = require('./scraper');
const { enrichLeads } = require('./enricher');
const { initWhatsApp, sendWhatsApp, destroyWhatsApp } = require('./outreach-whatsapp');
const { initEmail, verifyEmail, sendEmail } = require('./outreach-email');
const { render, DEFAULT_WHATSAPP, DEFAULT_EMAIL_SUBJECT, DEFAULT_EMAIL_HTML } = require('./templates');

// ── Argumentos ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get = key => {
    const idx = args.indexOf(`--${key}`);
    return idx !== -1 ? args[idx + 1] : null;
  };
  const has = key => args.includes(`--${key}`);

  return {
    slug: get('slug'),
    query: get('query'),
    city: get('city'),
    max: parseInt(get('max') || '20', 10),
    channels: (get('channels') || 'whatsapp,email').split(',').map(s => s.trim()),
    sources: (get('sources') || 'maps,search').split(',').map(s => s.trim()),
    dryRun: has('dry-run'),
    enrich: !has('no-enrich'),
  };
}

// ── Paths ──────────────────────────────────────────────────────────────────

function clientPaths(slug) {
  const base = path.resolve(__dirname, '../../clients', slug);
  const intel = path.join(base, 'outputs', 'inteligencia');
  const session = path.join(base, '.whatsapp-session');
  const config = path.join(base, 'prospector-config.json');
  return { base, intel, session, config };
}

function loadConfig(configPath) {
  if (fs.existsSync(configPath)) return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return {};
}

function loadContacted(intelPath) {
  const f = path.join(intelPath, 'contacted.json');
  if (fs.existsSync(f)) return new Set(JSON.parse(fs.readFileSync(f, 'utf8')));
  return new Set();
}

function saveContacted(intelPath, set) {
  fs.mkdirSync(intelPath, { recursive: true });
  fs.writeFileSync(path.join(intelPath, 'contacted.json'), JSON.stringify([...set], null, 2));
}

function saveLeads(intelPath, leads) {
  fs.mkdirSync(intelPath, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(intelPath, `leads-${date}.json`);
  fs.writeFileSync(file, JSON.stringify(leads, null, 2));
  console.log(`\n💾 Leads salvos em: ${file}`);
  return file;
}

// ── Deduplicação ───────────────────────────────────────────────────────────

function deduplicateLeads(leads) {
  const seen = new Set();
  return leads.filter(l => {
    const key = (l.name || '') + (l.website || '') + (l.phone || '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!args.slug || !args.query || !args.city) {
    console.error('❌ Uso: node scripts/prospector/index.js --slug <slug> --query <busca> --city <cidade>');
    process.exit(1);
  }

  const paths = clientPaths(args.slug);
  const config = loadConfig(paths.config);
  const contacted = loadContacted(paths.intel);

  console.log(`\n🚀 MarketingOS Prospector`);
  console.log(`   Cliente : ${args.slug}`);
  console.log(`   Busca   : "${args.query}" em ${args.city}`);
  console.log(`   Fontes  : ${args.sources.join(', ')}`);
  console.log(`   Canais  : ${args.channels.join(', ')}`);
  if (args.dryRun) console.log(`   ⚠️  DRY RUN — nenhuma mensagem será enviada`);

  // ── Scraping ──

  let rawLeads = [];

  if (args.sources.includes('maps')) {
    const mapsLeads = await scrapeGoogleMaps(args.query, args.city, args.max);
    rawLeads.push(...mapsLeads);
  }

  if (args.sources.includes('search')) {
    const searchLeads = await scrapeGoogleSearch(args.query, args.city, args.max);
    rawLeads.push(...searchLeads);
  }

  rawLeads = deduplicateLeads(rawLeads);
  console.log(`\n📋 ${rawLeads.length} leads únicos encontrados`);

  // ── Enriquecimento ──

  let leads = rawLeads;
  if (args.enrich) {
    leads = await enrichLeads(rawLeads);
  }

  // Adiciona cidade ao lead
  leads = leads.map(l => ({ ...l, city: args.city }));

  // Salva todos os leads (independente de contato)
  saveLeads(paths.intel, leads);

  if (args.dryRun) {
    console.log('\n── Leads encontrados (dry-run) ────────────────────');
    leads.forEach((l, i) => {
      console.log(`${i + 1}. ${l.name || l.website}`);
      if (l.phone || l.phones?.length) console.log(`   📞 ${l.phone || l.phones[0]}`);
      if (l.email) console.log(`   📧 ${l.email}`);
      if (l.website) console.log(`   🌐 ${l.website}`);
    });
    return;
  }

  // ── Templates ──

  const waTpl = config.templates?.whatsapp || DEFAULT_WHATSAPP;
  const emailSubjectTpl = config.templates?.emailSubject || DEFAULT_EMAIL_SUBJECT;
  const emailBodyTpl = config.templates?.emailBody || DEFAULT_EMAIL_HTML;

  // ── WhatsApp ──

  let waClient = null;
  if (args.channels.includes('whatsapp')) {
    const leadsWithPhone = leads.filter(l => {
      const phone = l.phone || l.phones?.[0];
      return phone && !contacted.has(`wa:${phone}`);
    });

    if (leadsWithPhone.length === 0) {
      console.log('\n📵 Nenhum lead novo com telefone para WhatsApp.');
    } else {
      console.log(`\n📱 Enviando WhatsApp para ${leadsWithPhone.length} leads...`);
      try {
        waClient = await initWhatsApp(paths.session);
        const dailyLimit = config.limits?.whatsappPerDay || 50;
        let sent = 0;

        for (const lead of leadsWithPhone) {
          if (sent >= dailyLimit) {
            console.log(`⚠️  Limite diário de ${dailyLimit} mensagens atingido.`);
            break;
          }
          const phone = lead.phone || lead.phones[0];
          const msg = render(waTpl, lead, { city: args.city });
          const result = await sendWhatsApp(phone, msg, 4000 + Math.random() * 2000);

          if (result.success) {
            contacted.add(`wa:${phone}`);
            console.log(`  ✅ ${lead.name || phone}`);
            sent++;
          } else {
            console.log(`  ❌ ${lead.name || phone} — ${result.error}`);
          }
        }
      } catch (err) {
        console.error('❌ Erro no WhatsApp:', err.message);
      } finally {
        await destroyWhatsApp();
      }
    }
  }

  // ── Email ──

  if (args.channels.includes('email')) {
    const emailConfig = config.email || {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_FROM,
    };

    const leadsWithEmail = leads.filter(l => l.email && !contacted.has(`email:${l.email}`));

    if (!emailConfig.user || !emailConfig.pass) {
      console.log('\n⚠️  Email não configurado. Defina EMAIL_USER e EMAIL_PASS no .env ou em prospector-config.json.');
    } else if (leadsWithEmail.length === 0) {
      console.log('\n📭 Nenhum lead novo com email.');
    } else {
      console.log(`\n📧 Enviando email para ${leadsWithEmail.length} leads...`);
      initEmail(emailConfig);

      try {
        await verifyEmail();
        const dailyLimit = config.limits?.emailsPerDay || 100;
        let sent = 0;

        for (const lead of leadsWithEmail) {
          if (sent >= dailyLimit) break;
          const subject = render(emailSubjectTpl, lead, { city: args.city });
          const html = render(emailBodyTpl, lead, { city: args.city });
          const result = await sendEmail(lead.email, subject, html, 2000 + Math.random() * 1000);

          if (result.success) {
            contacted.add(`email:${lead.email}`);
            console.log(`  ✅ ${lead.name || lead.email}`);
            sent++;
          } else {
            console.log(`  ❌ ${lead.name || lead.email} — ${result.error}`);
          }
        }
      } catch (err) {
        console.error('❌ Erro no email:', err.message);
      }
    }
  }

  // ── Salva contacted atualizado ──

  saveContacted(paths.intel, contacted);

  const totalWa = [...contacted].filter(k => k.startsWith('wa:')).length;
  const totalEmail = [...contacted].filter(k => k.startsWith('email:')).length;
  console.log(`\n✅ Sessão concluída. Total contatados: ${totalWa} WhatsApp / ${totalEmail} Email`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
