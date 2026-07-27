#!/usr/bin/env node
'use strict';

/**
 * Discovery Engine — MarketingOS
 *
 * Pipeline: discovery-places → enrichment-website → enrichment-cnpj
 *           → qualification-scorer → contact-router (human-in-the-loop)
 *
 * Uso:
 *   node scripts/discovery-engine/index.js --niche=corban_2026 [--max=20]
 *
 * Nada é enviado por este script — ele só descobre, enriquece, qualifica e
 * deixa o lead em pending_approval no próprio pipeline do nicho
 * (agency/discovery-leads/<niche_id>.json). Aprovação e disparo continuam
 * manuais, fora daqui.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const discoveryPlaces = require('./modules/discovery-places');
const enrichmentWebsite = require('./modules/enrichment-website');
const enrichmentCnpj = require('./modules/enrichment-cnpj');
const qualificationScorer = require('./modules/qualification-scorer');
const contactRouter = require('./modules/contact-router');
const store = require('./lib/store');

function loadNicheProfile(nicheId) {
  const file = path.resolve(__dirname, 'niche-profiles', `${nicheId.replace(/_/g, '-')}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`niche_profile não encontrado: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function run(nicheId, { maxResults } = {}) {
  const nicheProfile = loadNicheProfile(nicheId);

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Discovery Engine — ${nicheProfile.niche_label}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  niche_id : ${nicheProfile.niche_id}`);
  console.log(`  status   : ${nicheProfile.status}`);
  console.log(`  fontes   : Google Places (discovery) + BrasilAPI/ReceitaWS (validação CNPJ) + site institucional`);
  console.log(`${'─'.repeat(60)}\n`);

  // ── 1. DISCOVERY (Google Places) ─────────────────────────────────────────
  console.log('▶ Etapa 1 — Discovery (Google Places)');
  const rawResults = await discoveryPlaces.search(nicheProfile, { maxResults });
  console.log(`  ✓ ${rawResults.length} locais encontrados\n`);

  if (rawResults.length === 0) {
    console.log('Nenhum resultado. Verifique GOOGLE_PLACES_API_KEY e os termos em niche_profile.discovery.\n');
    return;
  }

  const results = { discovered: 0, skippedLegacy: 0, qualified: 0, routed: 0 };

  for (const place of rawResults) {
    process.stdout.write(`  ${(place.name || '?').slice(0, 40).padEnd(42)}`);

    // Enriquecer com telefone/site do Places Details
    const details = await discoveryPlaces.enrichDetails(place.place_id);
    place.phone = details.phone;
    place.opening_hours = details.opening_hours;

    const lead = { places: place, domain: details.website ? safeDomain(details.website) : null };

    // ── 2. WEBSITE ENRICHMENT ────────────────────────────────────────────
    if (details.website) {
      lead.website = await enrichmentWebsite.enrich(details.website, {
        respectRobots: nicheProfile.enrichment.respect_robots_txt,
        timeoutSeconds: nicheProfile.enrichment.timeout_seconds,
      });
      lead.website.url = details.website;
      lead.website.loads = !lead.website.error;
    }

    // ── 3. CNPJ ENRICHMENT (se algum CNPJ foi encontrado no site) ────────
    const cnpjCandidate = lead.website?.cnpj_candidates?.[0] || null;
    if (cnpjCandidate) {
      lead.cnpj = await enrichmentCnpj.lookup(cnpjCandidate);
    }

    // ── 4. QUALIFICATION ──────────────────────────────────────────────────
    const qualification = qualificationScorer.score(lead, nicheProfile);
    lead.qualification = qualification;

    // ── 5. CONTACT ROUTING ────────────────────────────────────────────────
    const routed = contactRouter.route(nicheId, lead, nicheProfile);

    if (routed?.skipped) {
      results.skippedLegacy++;
      console.log(`⊘ já no pipeline de outreach`);
    } else if (!qualification.tier) {
      console.log(`✗ score ${qualification.score} — sem tier`);
    } else {
      results.qualified++;
      if (routed?.suggested_channel) results.routed++;
      console.log(`✓ tier ${qualification.tier} (${qualification.score}/100) — canal: ${routed?.suggested_channel?.channel || 'nenhum'}`);
    }

    results.discovered++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  RESUMO — ${nicheProfile.niche_label}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  Descobertos          : ${results.discovered}`);
  console.log(`  Já no pipeline legado: ${results.skippedLegacy}`);
  console.log(`  Qualificados (tier)  : ${results.qualified}`);
  console.log(`  Roteados p/ canal    : ${results.routed}`);
  console.log(`  Arquivo              : agency/discovery-leads/${nicheId}.json`);
  console.log(`${'='.repeat(60)}\n`);
  console.log('  Próximo passo: revisar os leads em pending_approval antes de qualquer contato.\n');
}

function safeDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (prefix) => args.find((a) => a.startsWith(prefix))?.split('=')[1];
const nicheId = getArg('--niche=');

if (!nicheId) {
  console.error('Uso: node scripts/discovery-engine/index.js --niche=<niche_id> [--max=N]');
  console.error('Exemplo: node scripts/discovery-engine/index.js --niche=corban_2026 --max=20');
  process.exit(1);
}

run(nicheId, { maxResults: parseInt(getArg('--max=') || '0', 10) || undefined }).catch((err) => {
  console.error('\n✗ Erro fatal:', err.message);
  process.exit(1);
});
