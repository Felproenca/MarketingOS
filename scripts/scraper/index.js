#!/usr/bin/env node
'use strict';

/**
 * Scraper Inteligente v3 — MarketingOS
 *
 * Pipeline: Discovery → Dedupe → Analysis → Qualification → Message → APROVAÇÃO → Outreach
 *
 * Fluxo em duas etapas (regra do CLAUDE.md: nada é enviado sem aprovação):
 *
 *   1. Gerar lote para revisão:
 *      node scripts/scraper/index.js "clínica estética Tijuca" --max=10
 *      → salva em agency/leads/pending-approval.json
 *      → revise o arquivo: edite mensagens, delete leads ruins
 *
 *   2. Enviar o que sobrou no arquivo (rodar o comando É a aprovação):
 *      node scripts/scraper/index.js --send-approved
 *
 * Opções:
 *   --max=N            Máximo de leads qualificados (padrão: 10)
 *   --score=N          Score mínimo para entrar no lote 0-10 (padrão: 6)
 *   --channel=X        email | whatsapp | both (padrão: whatsapp)
 *   --send-approved    Envia o lote aprovado
 *   --dry-run          Com --send-approved: simula sem enviar
 *   --fora-do-horario  Ignora janela 9h–18h (não recomendado)
 *
 * Proteções (pipeline/guard.js):
 *   - Nunca contata quem já está no pipeline (dedupe por telefone E domínio)
 *   - Teto diário de envios (padrão 25, env WHATSAPP_DAILY_CAP)
 *   - Intervalo aleatório de 1–5 min entre envios
 */

require('dotenv').config();

const fs   = require('fs');
const path = require('path');

const Discovery      = require('./discovery');
const Analyzer       = require('./analyzer');
const Qualifier      = require('./qualifier');
const MessageBuilder = require('./message-builder');
const Outreach       = require('./outreach');

const store = require('../pipeline/store');
const guard = require('../pipeline/guard');

const PENDING_FILE = path.resolve(__dirname, '../../agency/leads/pending-approval.json');

// ── Etapa 1: gerar lote para aprovação ────────────────────────────────────────

async function generateBatch(searchQuery, options = {}) {
  const {
    maxLeads = 10,
    minScore = 4,
    channel  = 'whatsapp',
  } = options;

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  MarketingOS — Scraper Inteligente v3`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`  Busca   : "${searchQuery}"`);
  console.log(`  Máx.    : ${maxLeads} leads qualificados`);
  console.log(`  Score   : mínimo ${minScore}/10`);
  console.log(`  Canal   : ${channel}`);
  console.log(`  Pipeline: ${Object.keys(store.load()).length} contatos conhecidos (dedupe ativo)`);
  console.log(`${'─'.repeat(50)}\n`);

  // ── 1. DISCOVERY ──────────────────────────────────────────────────────────
  const rawLeads = await Discovery.search(searchQuery, maxLeads * 3);
  console.log(`✓ ${rawLeads.length} resultados encontrados\n`);

  // ── 2. DEDUPE + ANALYSIS + QUALIFICATION ──────────────────────────────────
  const qualifiedLeads = [];
  let skippedKnown = 0;

  for (const lead of rawLeads) {
    if (qualifiedLeads.length >= maxLeads) break;

    // Já está no pipeline (contactado ou em aprovação)? Nunca abordar de novo.
    const known = store.exists({ phone: lead.phone, domain: lead.domain });
    if (known) {
      skippedKnown++;
      console.log(`  ⊘ ${(lead.domain || lead.name || '?').padEnd(35)} já no pipeline (${known.step})`);
      continue;
    }

    process.stdout.write(`  Analisando ${(lead.domain || lead.url || lead.name || '?').padEnd(35)}`);

    try {
      const analysis      = await Analyzer.analyze(lead);
      const qualification = Qualifier.score(analysis);

      lead.analysis      = analysis;
      lead.qualification = qualification;

      // Telefone do Maps vira candidato a WhatsApp — validação real no envio
      if (!lead.whatsapp && lead.phone) {
        lead.whatsapp = store.normalizePhoneDigits(lead.phone);
      }

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

  if (skippedKnown) console.log(`\n  ${skippedKnown} lead(s) pulados — já estavam no pipeline`);
  console.log(`\n✓ ${qualifiedLeads.length} leads qualificados\n`);

  if (qualifiedLeads.length === 0) {
    console.log('Nenhum lead novo atingiu o score mínimo. Tente reduzir --score ou ampliar o termo de busca.\n');
    return [];
  }

  // ── 3. MENSAGEM + LOTE DE APROVAÇÃO ───────────────────────────────────────
  const pending = loadPending();

  for (const lead of qualifiedLeads) {
    const message = await MessageBuilder.build(lead);

    const entry = {
      name:         lead.name,
      domain:       lead.domain,
      website:      lead.url,
      phone:        lead.phone,
      whatsapp:     lead.whatsapp,
      email:        lead.email,
      instagram:    lead.instagram,
      score:        lead.qualification.score,
      label:        lead.qualification.label,
      main_problem: lead.qualification.main_problem,
      problems:     lead.qualification.problems,
      channel,
      message,
      createdAt:    new Date().toISOString(),
    };

    pending.push(entry);

    // Registra no pipeline para o dedupe valer desde já
    store.upsert({
      ...entry,
      url: lead.url,
      source: 'scraper-v3',
      step: 'pending_approval',
    });

    console.log(`${'─'.repeat(50)}`);
    console.log(`  ${lead.name || lead.domain}`);
    console.log(`  Score   : ${entry.score}/10 — ${entry.label}`);
    console.log(`  Problema: ${entry.main_problem}`);
    console.log(`  WhatsApp: ${entry.whatsapp || '—'} | Email: ${entry.email || '—'}`);
    console.log(`  Mensagem: ${message.whatsapp_version.split('\n')[0]}...`);
  }

  savePending(pending);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  LOTE GERADO — ${qualifiedLeads.length} mensagens aguardando aprovação`);
  console.log(`${'='.repeat(50)}`);
  console.log(`  1. Revise : ${PENDING_FILE}`);
  console.log(`     (edite mensagens, delete leads que não quer abordar)`);
  console.log(`  2. Envie  : node scripts/scraper/index.js --send-approved`);
  console.log(`${'='.repeat(50)}\n`);

  return qualifiedLeads;
}

// ── Etapa 2: enviar lote aprovado ─────────────────────────────────────────────

async function sendApproved(options = {}) {
  const { dryRun = false, ignoreHours = false } = options;

  const pending = loadPending();

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  MarketingOS — Envio do lote aprovado`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`  Lote     : ${pending.length} mensagens`);
  console.log(`  Teto hoje: ${guard.remainingToday()}/${guard.DAILY_CAP} envios disponíveis`);
  if (dryRun) console.log(`  ⚠ DRY RUN — nenhuma mensagem será enviada`);
  console.log(`${'─'.repeat(50)}\n`);

  if (pending.length === 0) {
    console.log('  Lote vazio. Gere um novo: node scripts/scraper/index.js "termo de busca"\n');
    return;
  }

  const gate = guard.canSend({ ignoreHours });
  if (!dryRun && !gate.ok) {
    console.log(`  ✗ ${gate.reason}\n`);
    return;
  }

  const results = [];
  const stillPending = [];
  let sentCount = 0;

  for (const entry of pending) {
    const key = store.keyFor(entry);

    // Estado pode ter mudado entre gerar e enviar (ex: bot já conversou)
    const contacted = store.isContacted({ phone: entry.phone, whatsapp: entry.whatsapp, domain: entry.domain });
    if (contacted) {
      console.log(`  ⊘ ${entry.name} — já contactado (${contacted.step}), removido do lote`);
      continue;
    }

    if (!dryRun) {
      const gateNow = guard.canSend({ ignoreHours });
      if (!gateNow.ok) {
        console.log(`\n  ✗ ${gateNow.reason}`);
        console.log(`    ${pending.length - results.length} mensagem(ns) permanecem no lote para depois.`);
        stillPending.push(entry, ...pending.slice(pending.indexOf(entry) + 1));
        break;
      }
    }

    console.log(`\n  → ${entry.name} (${entry.whatsapp || entry.email || '—'})`);

    if (dryRun) {
      console.log(`    [dry-run] ${entry.message.whatsapp_version.split('\n')[0]}...`);
      results.push(entry);
      continue;
    }

    const sent = await Outreach.send(entry, entry.message, entry.channel || 'whatsapp');
    entry.outreach = sent;
    results.push(entry);

    if (sent.sent) {
      sentCount++;
      if (key) store.setStep(key, 'sent', `canal: ${sent.channel}`);
    } else {
      // Falhou (sem WhatsApp ativo, erro) — registra e tira do lote
      if (key) store.update(key, { step: 'dead', deadReason: sent.error });
      console.log(`    ⊘ removido do pipeline: ${sent.error}`);
    }

    const isLast = pending.indexOf(entry) === pending.length - 1;
    if (!isLast && sent.sent) await guard.waitRandomDelay();
  }

  if (!dryRun) savePending(stillPending);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  RELATÓRIO FINAL`);
  console.log(`${'='.repeat(50)}`);
  if (dryRun) {
    console.log(`  Modo dry-run: ${results.length} mensagens simuladas, lote intacto`);
  } else {
    console.log(`  Enviadas           : ${sentCount}`);
    console.log(`  Restantes no lote  : ${stillPending.length}`);
    console.log(`  Teto restante hoje : ${guard.remainingToday()}`);
    console.log(`\n  Próximo passo: npm run followup (em D+2) — o funil não morre em sent.`);
  }
  console.log(`${'='.repeat(50)}\n`);

  await Outreach.cleanup?.();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadPending() {
  try {
    return JSON.parse(fs.readFileSync(PENDING_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function savePending(pending) {
  fs.mkdirSync(path.dirname(PENDING_FILE), { recursive: true });
  fs.writeFileSync(PENDING_FILE, JSON.stringify(pending, null, 2), 'utf8');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const query = args.find(arg => !arg.startsWith('--'));
const getArg = prefix => args.find(a => a.startsWith(prefix))?.split('=')[1];

if (args.includes('--send-approved')) {
  sendApproved({
    dryRun:      args.includes('--dry-run'),
    ignoreHours: args.includes('--fora-do-horario'),
  }).catch(err => {
    console.error('\n✗ Erro fatal:', err.message);
    process.exit(1);
  });
} else if (query) {
  generateBatch(query, {
    maxLeads: parseInt(getArg('--max=')   || process.env.SCRAPER_MAX_LEADS || '10', 10),
    minScore: parseInt(getArg('--score=') || '4', 10),
    channel:  getArg('--channel=')        || 'whatsapp',
  }).catch(err => {
    console.error('\n✗ Erro fatal:', err.message);
    process.exit(1);
  });
} else {
  console.error('Uso:');
  console.error('  Gerar lote : node scripts/scraper/index.js "termo de busca" [--max=10] [--score=6] [--channel=whatsapp]');
  console.error('  Enviar lote: node scripts/scraper/index.js --send-approved [--dry-run] [--fora-do-horario]');
  process.exit(1);
}
