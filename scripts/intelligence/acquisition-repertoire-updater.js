#!/usr/bin/env node
'use strict';

/**
 * acquisition-repertoire-updater.js - MarketingOS acquisition lens
 *
 * Reads the consolidated repertoire inventory and extracts only the pieces
 * related to client acquisition: prospecting, outbound, paid acquisition,
 * demand generation, funnels, CRO, lead capture, sales enablement, RevOps,
 * partnerships, referrals, social proof, and proposal flow.
 *
 * Usage:
 *   node scripts/intelligence/acquisition-repertoire-updater.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const INVENTORY_PATH = path.join(ROOT, 'intelligence', 'repertoire-updaters', 'inventory.json');
const OUT_PATH = path.join(ROOT, 'intelligence', 'repertoire-updaters', 'acquisition.md');
const DRY_RUN = process.argv.includes('--dry-run');

const KEYWORDS = [
  'acquisition',
  'demand',
  'prospect',
  'outreach',
  'cold',
  'lead',
  'sales',
  'pipeline',
  'revops',
  'ads',
  'paid',
  'campaign',
  'funnel',
  'cro',
  'conversion',
  'landing',
  'proposal',
  'competitor',
  'competitive',
  'directory',
  'referral',
  'affiliate',
  'partner',
  'partnership',
  'webinar',
  'case study',
  'testimonial',
  'social proof',
  'linkedin',
  'authority',
  'discoverability',
  'seo',
  'capture',
  'signup',
  'demo',
  'pricing',
  'objection',
];

function loadInventory() {
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error(`Inventario nao encontrado: ${INVENTORY_PATH}`);
    console.error('Rode primeiro: npm run repertoire:update');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
}

function scoreText(text) {
  const normalized = text.toLowerCase();
  return KEYWORDS.reduce((score, keyword) => {
    return normalized.includes(keyword.toLowerCase()) ? score + 1 : score;
  }, 0);
}

function classify(item) {
  const text = `${item.path || ''} ${item.title || ''} ${item.description || ''} ${(item.headings || []).join(' ')}`;
  const lower = text.toLowerCase();

  if (/prospect|outreach|cold|sdr|lead gen|find leads|lead list/.test(lower)) return 'Outbound e prospeccao';
  if (/ads|paid|ppc|roas|cpa|campaign|retarget/.test(lower)) return 'Midia paga e campanhas';
  if (/cro|conversion|landing|funnel|signup|popup|paywall|form/.test(lower)) return 'Conversao e funil';
  if (/revops|pipeline|mql|sql|lead scoring|routing|forecast|commercial/.test(lower)) return 'RevOps e pipeline';
  if (/sales enablement|proposal|pitch|deck|objection|demo script|case study|testimonial|social proof/.test(lower)) return 'Prova e fechamento';
  if (/seo|directory|discoverability|ai search|programmatic|content strategy|authority|linkedin/.test(lower)) return 'Aquisicao organica e autoridade';
  if (/partner|partnership|referral|affiliate|co-marketing|webinar/.test(lower)) return 'Parcerias e indicacao';
  return 'Aquisicao - geral';
}

function extractItems(source) {
  const groups = [];

  for (const skill of source.skills || []) {
    const text = `${skill.path} ${skill.title} ${skill.description} ${(skill.headings || []).join(' ')}`;
    const score = scoreText(text);
    if (score > 0) groups.push({ type: 'skill', score, category: classify(skill), ...skill });
  }

  for (const reference of source.references || []) {
    const score = scoreText(reference);
    if (score > 0) groups.push({ type: 'reference', score, category: classify({ path: reference }), path: reference });
  }

  for (const script of source.scriptsAndTools || []) {
    const score = scoreText(script);
    if (score > 0) groups.push({ type: 'script/tool', score, category: classify({ path: script }), path: script });
  }

  for (const agent of source.agents || []) {
    const score = scoreText(agent);
    if (score > 0) groups.push({ type: 'agent', score, category: classify({ path: agent }), path: agent });
  }

  return groups.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
}

function table(items, max = 120) {
  if (!items.length) return '| Tipo | Categoria | Item | Leitura |\n|---|---|---|---|\n| - | - | - | Nada detectado |';
  const rows = items.slice(0, max).map((item) => {
    const label = item.title ? `${item.title} (${item.path})` : item.path;
    const note = item.description || (item.headings || []).slice(0, 4).join('; ') || `score ${item.score}`;
    return `| ${item.type} | ${item.category} | \`${label.replace(/\|/g, '/')}\` | ${note.replace(/\|/g, '/').slice(0, 240)} |`;
  });
  if (items.length > max) rows.push(`| ... | ... | ... | mais ${items.length - max} itens no inventory.json |`);
  return ['| Tipo | Categoria | Item | Leitura |', '|---|---|---|---|', ...rows].join('\n');
}

function categorySummary(allItems) {
  const counts = {};
  for (const item of allItems) counts[item.category] = (counts[item.category] || 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => `- ${category}: ${count}`)
    .join('\n');
}

function main() {
  const inventory = loadInventory();
  const sources = inventory.sources || {};
  const blocks = [];
  const allItems = [];

  for (const [id, source] of Object.entries(sources)) {
    const items = extractItems(source);
    allItems.push(...items.map((item) => ({ ...item, source: id })));
    blocks.push(`## ${source.name}

Fonte: ${source.url.replace(/\.git$/, '')}
Commit analisado: ${source.commit}
Itens de aquisicao detectados: ${items.length}

${table(items)}
`);
  }

  const body = `# Updater programado - Aquisicao de Clientes

Atualizado em: ${new Date().toISOString()}
Depende de: \`npm run repertoire:update\`
Rodar depois da Etapa 1 geral.

## Objetivo
Extrair dos quatro repertorios apenas o que melhora aquisicao real de cliente para o MarketingOS: encontrar leads, diagnosticar oportunidade, gerar abordagem, criar prova, converter conversa e alimentar pipeline.

## Regra MarketingOS
Nao importar marketing generico. Toda peca precisa responder:
- Qual medo do prospect isso nomeia?
- Qual desejo de crescimento isso ativa?
- Qual proxima acao comercial isso torna mais facil?
- Qual dado, sinal ou prova sustenta a abordagem?
- Isso vende IA aplicada ao negocio ou volta para linguagem de agencia?

## Mapa por categoria
${categorySummary(allItems)}

## Ordem de aplicacao recomendada
1. Prospecção e sinais: fortalecer \`skills/aquisicao/skill-prospecting-agent.md\` e scripts de scraper/demo.
2. Oferta e abordagem: fortalecer \`skills/aquisicao/skill-offer-positioning.md\` e \`skills/venda/skill-venda.md\`.
3. Prova e fechamento: criar biblioteca de cases, testimonials, demos e objeções.
4. Conversão: revisar landing, captura, CTA, funil e tracking.
5. Escala: SEO programático, diretórios, ads, parcerias e referral.

## Alvos internos
- \`skills/aquisicao/skill-market-analyzer.md\`
- \`skills/aquisicao/skill-prospector.md\`
- \`skills/aquisicao/skill-prospecting-agent.md\`
- \`skills/aquisicao/skill-offer-positioning.md\`
- \`skills/aquisicao/skill-lead-capture.md\`
- \`skills/aquisicao/skill-anuncio.md\`
- \`skills/venda/skill-venda.md\`
- \`scripts/scraper/\`
- \`scripts/prospector/\`
- \`scripts/demo-pipeline/\`
- \`agency/icp.md\`
- \`agency/strategy.md\`

${blocks.join('\n')}
`;

  if (!DRY_RUN) fs.writeFileSync(OUT_PATH, body, 'utf8');
  console.log(`${DRY_RUN ? '[dry-run] ' : ''}acquisition: ${allItems.length} itens -> ${path.relative(ROOT, OUT_PATH)}`);
}

main();
