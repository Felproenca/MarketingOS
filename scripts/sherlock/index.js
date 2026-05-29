#!/usr/bin/env node
'use strict';

/**
 * Sherlock — MarketingOS
 * Investigador de perfis com sessão persistente de navegador.
 *
 * Uso:
 *   node scripts/sherlock/index.js --slug <slug> --target <@handle|url> [--platform <platform>]
 *
 * Opções:
 *   --slug        Slug do cliente (obrigatório)
 *   --target      Handle (@usuario) ou URL do perfil (obrigatório)
 *   --platform    instagram | youtube | linkedin (auto-detectado se não informado)
 *   --dry-run     Exibe dados sem salvar arquivo
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { buildReport } = require('./reporter');

// ── Args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const get = key => { const i = args.indexOf(`--${key}`); return i !== -1 ? args[i + 1] : null; };
  const has = key => args.includes(`--${key}`);
  return {
    slug: get('slug'),
    target: get('target'),
    platform: get('platform'),
    dryRun: has('dry-run'),
  };
}

function detectPlatform(target) {
  if (!target) return null;
  if (/youtube\.com|youtu\.be/i.test(target)) return 'youtube';
  if (/linkedin\.com/i.test(target)) return 'linkedin';
  if (/instagram\.com/i.test(target)) return 'instagram';
  // Default for @handle with no URL
  return 'instagram';
}

// ── Paths ──────────────────────────────────────────────────────────────────

function outputPath(slug, target, date) {
  const base = path.resolve(__dirname, '../../clients', slug, 'outputs', 'inteligencia');
  fs.mkdirSync(base, { recursive: true });
  const safe = target.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
  return path.join(base, `${date}-sherlock-${safe}.md`);
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!args.slug || !args.target) {
    console.error('❌ Uso: node scripts/sherlock/index.js --slug <slug> --target <@handle|url>');
    process.exit(1);
  }

  const platform = args.platform || detectPlatform(args.target);

  console.log(`\n🔍 MarketingOS Sherlock`);
  console.log(`   Cliente  : ${args.slug}`);
  console.log(`   Alvo     : ${args.target}`);
  console.log(`   Plataforma: ${platform}`);
  if (args.dryRun) console.log('   ⚠️  DRY RUN — não salva arquivo');

  let runner;
  try {
    runner = require(`./platforms/${platform}`);
  } catch {
    console.error(`❌ Plataforma "${platform}" não suportada. Use: instagram, youtube, linkedin`);
    process.exit(1);
  }

  let data;
  try {
    data = await runner.run(args.target);
  } catch (err) {
    if (err.message === 'NOT_LOGGED_IN') {
      console.error(`\n❌ Não logado no ${platform}. Execute com --platform ${platform} para abrir o navegador e fazer login.`);
    } else {
      console.error(`\n❌ Erro durante investigação: ${err.message}`);
    }
    process.exit(1);
  }

  const date = new Date().toISOString().slice(0, 10);
  const report = buildReport(data, args.slug, args.target);

  if (args.dryRun) {
    console.log('\n── Relatório (dry-run) ─────────────────────────────');
    console.log(report.slice(0, 2000));
    if (report.length > 2000) console.log('\n[... relatório truncado no dry-run ...]');
    return;
  }

  const outPath = outputPath(args.slug, args.target, date);
  fs.writeFileSync(outPath, report, 'utf8');

  console.log(`\n✅ Relatório salvo em:`);
  console.log(`   ${outPath}`);
  console.log(`\n💡 Próximos passos:`);
  console.log(`   1. Abra o relatório e preencha as seções de Posicionamento e Gaps`);
  console.log(`   2. Salve padrões relevantes em intelligence/patterns.md`);
  console.log(`   3. Atualize intelligence/benchmarks.json com as métricas extraídas`);
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
