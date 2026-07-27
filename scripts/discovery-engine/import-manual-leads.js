#!/usr/bin/env node
'use strict';

/**
 * import-manual-leads.js — Importa leads achados manualmente (ex.: busca
 * assistida no LinkedIn Sales Navigator, ver discovery-linkedin-assisted.js)
 * e roda o MESMO pipeline de enriquecimento/qualificação/roteamento usado
 * pros leads do Google Places. Nenhuma automação de coleta — o CSV é
 * preenchido à mão pelo humano depois da busca manual.
 *
 * CSV esperado (com cabeçalho): name,domain,linkedin_url
 * (domain e linkedin_url são opcionais, mas sem nenhum dos dois o lead não
 * tem como ser enriquecido/qualificado de verdade)
 *
 * Uso:
 *   node scripts/discovery-engine/import-manual-leads.js --niche=corban_2026 --file=leads.csv
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const enrichmentWebsite = require('./modules/enrichment-website');
const enrichmentCnpj = require('./modules/enrichment-cnpj');
const qualificationScorer = require('./modules/qualification-scorer');
const contactRouter = require('./modules/contact-router');

function loadNicheProfile(nicheId) {
  const file = path.resolve(__dirname, 'niche-profiles', `${nicheId.replace(/_/g, '-')}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** Parser de CSV simples — sem dependência externa. Não lida com vírgula dentro de campo entre aspas complexo, suficiente pro caso de uso (nome, domínio, url). */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim());
    const row = {};
    header.forEach((h, i) => { row[h] = cols[i] || null; });
    return row;
  });
}

async function run(nicheId, filePath) {
  const nicheProfile = loadNicheProfile(nicheId);
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Importar Leads Manuais — ${nicheProfile.niche_label}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  ${rows.length} linha(s) no CSV\n`);

  const results = { imported: 0, skippedLegacy: 0, qualified: 0, routed: 0 };

  for (const row of rows) {
    if (!row.name) continue;
    process.stdout.write(`  ${row.name.slice(0, 40).padEnd(42)}`);

    const lead = {
      name: row.name,
      domain: row.domain || null,
      source: 'linkedin_manual_search',
    };

    if (row.linkedin_url) {
      lead.website = lead.website || {};
      lead.website.redes_sociais_linkadas = { linkedin: row.linkedin_url };
    }

    // Enriquecimento de site (mesmo módulo usado pro Places)
    if (row.domain) {
      const url = row.domain.startsWith('http') ? row.domain : `https://${row.domain}`;
      const siteData = await enrichmentWebsite.enrich(url, {
        respectRobots: nicheProfile.enrichment.respect_robots_txt,
        timeoutSeconds: nicheProfile.enrichment.timeout_seconds,
      });
      lead.website = {
        ...siteData,
        url,
        loads: !siteData.error,
        redes_sociais_linkadas: { ...siteData.redes_sociais_linkadas, ...(lead.website?.redes_sociais_linkadas || {}) },
      };

      const cnpjCandidate = siteData.cnpj_candidates?.[0] || null;
      if (cnpjCandidate) lead.cnpj = await enrichmentCnpj.lookup(cnpjCandidate);
    }

    // Sem dado de Places (rating/num_avaliacoes) pra leads manuais — o sinal
    // volume_operacao_aparente honestamente fica sem valor aqui, a menos que
    // o CSV traga essa info no futuro. Não fabricar número.
    lead.places = { name: row.name, num_avaliacoes: null, categoria: null };

    lead.qualification = qualificationScorer.score(lead, nicheProfile);

    const routed = contactRouter.route(nicheId, lead, nicheProfile);

    if (routed?.skipped) {
      results.skippedLegacy++;
      console.log('⊘ já no pipeline de outreach');
    } else if (!lead.qualification.tier) {
      console.log(`✗ score ${lead.qualification.score} — sem tier`);
    } else {
      results.qualified++;
      if (routed?.suggested_channel) results.routed++;
      console.log(`✓ tier ${lead.qualification.tier} (${lead.qualification.score}/100) — canal: ${routed?.suggested_channel?.channel || 'nenhum'}`);
    }

    results.imported++;
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Importados: ${results.imported} | Já no legado: ${results.skippedLegacy} | Qualificados: ${results.qualified} | Roteados: ${results.routed}`);
  console.log(`${'='.repeat(60)}\n`);
}

const args = process.argv.slice(2);
const getArg = (prefix) => args.find((a) => a.startsWith(prefix))?.split('=')[1];
const nicheId = getArg('--niche=');
const file = getArg('--file=');

if (!nicheId || !file) {
  console.error('Uso: node scripts/discovery-engine/import-manual-leads.js --niche=<niche_id> --file=<caminho.csv>');
  process.exit(1);
}

run(nicheId, path.resolve(file)).catch((err) => {
  console.error('\n✗ Erro fatal:', err.message);
  process.exit(1);
});
