#!/usr/bin/env node
'use strict';

/**
 * linkedin-search-brief.js — Gera o brief de busca assistida no Sales
 * Navigator pra um niche_profile. Não automatiza nada, ver módulo.
 *
 * Uso:
 *   node scripts/discovery-engine/linkedin-search-brief.js --niche=corban_2026
 */

const fs = require('fs');
const path = require('path');

const { buildSearchBrief } = require('./modules/discovery-linkedin-assisted');

function loadNicheProfile(nicheId) {
  const file = path.resolve(__dirname, 'niche-profiles', `${nicheId.replace(/_/g, '-')}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function run(nicheId) {
  const nicheProfile = loadNicheProfile(nicheId);
  const brief = buildSearchBrief(nicheProfile);

  console.log(`\n${brief.instructions}\n`);

  const outDir = path.resolve(__dirname, '../../agency/discovery-leads');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${nicheId}-linkedin-brief.md`);
  fs.writeFileSync(outFile, `# Brief LinkedIn — ${nicheProfile.niche_label}\n\n\`\`\`\n${brief.instructions}\n\`\`\`\n`, 'utf8');

  console.log(`Salvo em: ${outFile}\n`);
}

const args = process.argv.slice(2);
const getArg = (prefix) => args.find((a) => a.startsWith(prefix))?.split('=')[1];
const nicheId = getArg('--niche=');

if (!nicheId) {
  console.error('Uso: node scripts/discovery-engine/linkedin-search-brief.js --niche=<niche_id>');
  process.exit(1);
}

run(nicheId);
