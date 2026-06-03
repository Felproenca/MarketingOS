#!/usr/bin/env node
'use strict';

/**
 * Scraper Inteligente v2 — MarketingOS
 *
 * Pipeline: Discovery → Analysis → Qualification → Message → Outreach
 *
 * Uso:
 *   node scripts/scraper/index.js "clínica estética Rio de Janeiro" [opções]
 *
 * Opções:
 *   --max=N      Máximo de leads qualificados (padrão: 10)
 *   --score=N    Score mínimo para abordar 0-10 (padrão: 6)
 *   --dry-run    Gera mensagens mas não envia
 *   --channel=X  email | whatsapp | both (padrão: email)
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

const Discovery      = require('./discovery');
const Analyzer       = require('./analyzer');
const Qualifier      = require('./qualifier');
const MessageBuilder = require('./message-builder');
const Outreach       = require('./outreach');

const LEADS_FILE = path.join(__dirname, 'leads.json');

// ── Orquestrador ──────────────────────────────────────────────────────────────

async function run(searchQuery, options = {}) {
  const {
    maxLeads = 10,
    minScore = 6,
    dryRun   = false,
    channel  = 'email',
  } = options;

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  MarketingOS — Scraper Inteligente v2`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`  Busca   : "${searchQuery}"`);
  console.log(`  Máx.    : ${maxLeads} leads qualificados`);
  console.log(`  Score   : mínimo ${minScore}/10`);
  console.log(`  Canal   : ${channel}`);
  if (dryRun) console.log(`  ⚠  DRY RUN — nenhuma mensagem será enviada`);
  console.log(`${'─'.repeat(50)}\n`);

  // ── 1. DISCOVERY ────────────────────────────────────────────────────────────
  const rawLeads = await Discovery.search(searchQuery, maxLeads * 3);
  console.log(`✓ ${rawLeads.length} resultados encontrados\n`);

  // ── 2. ANALYSIS + QUALIFICATION ─────────────────────────────────────────────
  const qualifiedLeads = [];

  for (const lead of rawLeads) {
    if (qualifiedLeads.length >= maxLeads) break;

    process.stdout.write(`  Analisando ${(lead.domain || lead.url || '?').padEnd(35)}`);

    try {
      const analysis      = await Analyzer.analyze(lead);
      const qualification = Qualifier.score(analysis);

      lead.analysis      = analysis;
      lead.qualification = qualification;

      if (qualification.score >= minScore) {
        qualifiedLeads.push(lead);
        console.log(`✓ ${qualification.score}/10 — ${qualification.label}`);
      } else {
        console.log(`✗ ${qualification.score}/10 — descartado`);
      }

    } catch (err) {
      console.log(`⚠ ${err.message}`);
    }

    await sleep(parseInt(process.env.SCRAPER_DELAY_MS || '2000', 10));
  }

  console.log(`\n✓ ${qualifiedLeads.length} leads qualificados\n`);

  if (qualifiedLeads.length === 0) {
    console.log('Nenhum lead atingiu o score mínimo. Tente reduzir --score ou ampliar o termo de busca.\n');
    return [];
  }

  // ── 3. MESSAGE + OUTREACH ───────────────────────────────────────────────────
  const results = [];

  for (const lead of qualifiedLeads) {
    const message = await MessageBuilder.build(lead);
    lead.message  = message;

    console.log(`\n${'─'.repeat(50)}`);
    console.log(`  ${lead.domain}`);
    console.log(`  Score   : ${lead.qualification.score}/10 — ${lead.qualification.label}`);
    console.log(`  Problema: ${lead.qualification.main_problem}`);
    console.log(`  Email   : ${lead.email || '—'}`);
    console.log(`  WhatsApp: ${lead.whatsapp || '—'}`);
    console.log(`\n  Assunto : ${message.subject}`);
    console.log(`  Preview : ${message.body.substring(0, 120)}...`);

    if (!dryRun) {
      const sent    = await Outreach.send(lead, message, channel);
      lead.outreach = sent;
    }

    results.push(lead);
    saveLead(lead);

    await sleep(3000);
  }

  printReport(results, dryRun);
  return results;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function saveLead(lead) {
  let leads = [];
  if (fs.existsSync(LEADS_FILE)) {
    try { leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch { leads = []; }
  }
  const idx = leads.findIndex(l => l.domain === lead.domain);
  if (idx >= 0) leads[idx] = lead;
  else leads.push(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function printReport(results, dryRun) {
  const sent    = results.filter(r => r.outreach?.sent).length;
  const noEmail = results.filter(r => !r.email).length;
  const waReady = results.filter(r => r.outreach?.whatsapp_ready).length;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  RELATÓRIO FINAL`);
  console.log(`${'='.repeat(50)}`);
  console.log(`  Leads qualificados : ${results.length}`);

  if (!dryRun) {
    console.log(`  Emails enviados    : ${sent}`);
    if (waReady) console.log(`  WhatsApp (manual)  : ${waReady}`);
    console.log(`  Sem email          : ${noEmail}`);
  } else {
    console.log(`  Modo dry-run: nenhuma mensagem enviada`);
  }

  console.log(`  Salvo em           : scripts/scraper/leads.json`);
  console.log(`${'='.repeat(50)}\n`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const query = args.find(arg => !arg.startsWith('--'));

if (!query) {
  console.error('Uso: node scripts/scraper/index.js "termo de busca" [--max=10] [--score=6] [--dry-run] [--channel=email]');
  process.exit(1);
}

const getArg = prefix => args.find(a => a.startsWith(prefix))?.split('=')[1];

const opts = {
  maxLeads: parseInt(getArg('--max=')    || process.env.SCRAPER_MAX_LEADS || '10', 10),
  minScore: parseInt(getArg('--score=')  || '6',     10),
  dryRun:   args.includes('--dry-run'),
  channel:  getArg('--channel=')         || 'email',
};

run(query, opts).catch(err => {
  console.error('\n✗ Erro fatal:', err.message);
  process.exit(1);
});
