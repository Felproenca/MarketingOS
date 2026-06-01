#!/usr/bin/env node
'use strict';

/**
 * aggregate.js — MarketingOS Intelligence
 *
 * Fecha o loop de aprendizado: lê os ledgers de todos os clientes (published.json),
 * agrega a performance real e recalcula intelligence/benchmarks.json.
 *
 * Roda depois que npm run insights populou os dados de pelo menos 1 cliente.
 *
 * Uso:
 *   node scripts/intelligence/aggregate.js [--dry-run] [--verbose]
 *
 * --dry-run   Mostra o que seria gravado sem alterar benchmarks.json
 * --verbose   Exibe detalhe por post e por formato
 */

const fs   = require('fs');
const path = require('path');

const CLIENTS_DIR      = path.resolve(__dirname, '../../clients');
const BENCHMARKS_PATH  = path.resolve(__dirname, '../../intelligence/benchmarks.json');

// ── Args ─────────────────────────────────────────────────────────────────────

const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');

// ── Ledger loader ─────────────────────────────────────────────────────────────

function loadAllPosts() {
  if (!fs.existsSync(CLIENTS_DIR)) return [];
  const posts = [];
  const slugs = fs.readdirSync(CLIENTS_DIR).filter(d => {
    if (d.startsWith('_')) return false;
    return fs.statSync(path.join(CLIENTS_DIR, d)).isDirectory();
  });

  for (const slug of slugs) {
    const ledgerPath = path.join(CLIENTS_DIR, slug, 'published.json');
    if (!fs.existsSync(ledgerPath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
      for (const post of data.posts || []) {
        if (post.dryRun) continue;
        if (!post.insights || post.insights.reach == null) continue;
        posts.push({ ...post, _slug: slug });
      }
    } catch (e) {
      console.warn(`  ⚠️  ${slug}/published.json inválido: ${e.message}`);
    }
  }
  return posts;
}

// ── Aggregation helpers ───────────────────────────────────────────────────────

function avg(arr) {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function round4(n) { return Math.round(n * 10000) / 10000; }

// Normalise format names from the ledger to benchmarks.json keys
function formatKey(format) {
  const f = (format || 'feed').toLowerCase();
  if (f === 'carousel')   return 'carousel';
  if (f === 'reel')       return 'reels';
  if (f === 'story')      return 'stories';
  return 'feed_image';
}

/**
 * Returns the hook_type with the highest average engagement_rate
 * among posts that have a hook_type set.
 */
function bestHook(posts) {
  const byHook = {};
  for (const p of posts) {
    if (!p.hook_type) continue;
    if (!byHook[p.hook_type]) byHook[p.hook_type] = [];
    byHook[p.hook_type].push(p.insights.engagement_rate || 0);
  }
  if (!Object.keys(byHook).length) return '';
  return Object.entries(byHook)
    .sort(([, a], [, b]) => avg(b) - avg(a))[0][0];
}

// ── Main ─────────────────────────────────────────────────────────────────────

function aggregate() {
  console.log('\n🧠 MarketingOS Intelligence — Aggregate');
  if (DRY_RUN) console.log('   ⚠️  DRY RUN — não grava');

  const posts = loadAllPosts();
  const clientSlugs = [...new Set(posts.map(p => p._slug))];

  console.log(`\n   Posts com insights reais: ${posts.length}`);
  console.log(`   Clientes cobertos:        ${clientSlugs.length}`);

  if (posts.length === 0) {
    console.log('\n  Nenhum dado real ainda. Rode "npm run insights -- --slug <slug>" primeiro.');
    return;
  }

  // ── Group by format key ───────────────────────────────────────────────────

  const byFormat = {};
  for (const post of posts) {
    const key = formatKey(post.format);
    if (!byFormat[key]) byFormat[key] = [];
    byFormat[key].push(post);
  }

  if (VERBOSE) {
    for (const [fmt, ps] of Object.entries(byFormat)) {
      console.log(`\n   ${fmt}: ${ps.length} posts`);
      ps.forEach(p => {
        const ins = p.insights;
        console.log(`     ${p._slug} · eng ${((ins.engagement_rate||0)*100).toFixed(1)}% · reach ${ins.reach} · saves ${ins.saved||0} · hook: ${p.hook_type||'—'}`);
      });
    }
  }

  // ── Load benchmarks ───────────────────────────────────────────────────────

  if (!fs.existsSync(BENCHMARKS_PATH)) {
    console.error(`\n❌ ${BENCHMARKS_PATH} não encontrado.`);
    process.exit(1);
  }
  const benchmarks = JSON.parse(fs.readFileSync(BENCHMARKS_PATH, 'utf8'));

  // ── Compute content_performance ────────────────────────────────────────────

  const cp = benchmarks.content_performance || {};

  const FORMAT_FIELDS = {
    carousel:   ['avg_engagement_rate', 'avg_saves_rate', 'best_hook_type'],
    reels:      ['avg_reach_multiplier', 'avg_engagement_rate', 'best_hook_type'],
    feed_image: ['avg_engagement_rate', 'best_hook_type'],
    stories:    ['avg_engagement_rate', 'best_hook_type'],
  };

  for (const [fmt, ps] of Object.entries(byFormat)) {
    if (!FORMAT_FIELDS[fmt]) continue;
    const fields = FORMAT_FIELDS[fmt];
    const block  = cp[fmt] || {};

    const engRates  = ps.map(p => p.insights.engagement_rate || 0);
    const saveRates = ps.map(p => {
      const reach = p.insights.reach || 0;
      return reach > 0 ? (p.insights.saved || 0) / reach : 0;
    });
    const hook = bestHook(ps);

    if (fields.includes('avg_engagement_rate')) {
      block.avg_engagement_rate = round4(avg(engRates));
    }
    if (fields.includes('avg_saves_rate')) {
      block.avg_saves_rate = round4(avg(saveRates));
    }
    if (fields.includes('avg_reach_multiplier')) {
      // For reels, reach multiplier = reach / followers (we don't have followers here — skip)
      block.avg_reach_multiplier = block.avg_reach_multiplier || 0;
    }
    if (fields.includes('best_hook_type') && hook) {
      block.best_hook_type = hook;
    }

    block._posts_count  = ps.length;
    block._source       = 'interno';
    block._updated_at   = new Date().toISOString().slice(0, 10);
    cp[fmt] = block;

    console.log(`\n   ${fmt}:`);
    console.log(`     posts          : ${ps.length}`);
    if (block.avg_engagement_rate != null) console.log(`     eng rate avg   : ${(block.avg_engagement_rate * 100).toFixed(2)}%`);
    if (block.avg_saves_rate     != null) console.log(`     saves rate avg : ${(block.avg_saves_rate * 100).toFixed(2)}%`);
    if (hook)                             console.log(`     best hook      : ${hook}`);
  }

  benchmarks.content_performance = cp;

  // ── channel_rankings: instagram organic by engagement ────────────────────

  const igPosts = posts.filter(p => p.channel === 'instagram');
  if (igPosts.length >= 3) {
    const igEng = round4(avg(igPosts.map(p => p.insights.engagement_rate || 0)));
    benchmarks.channel_rankings = benchmarks.channel_rankings || {};
    benchmarks.channel_rankings.by_engagement = [
      { channel: 'instagram_organic', avg_engagement_rate: igEng, posts: igPosts.length, source: 'interno' },
    ];
    console.log(`\n   channel_rankings: instagram_organic avg eng ${(igEng * 100).toFixed(2)}%`);
  }

  // ── _meta ─────────────────────────────────────────────────────────────────

  benchmarks._meta          = benchmarks._meta || {};
  benchmarks._meta.updated_at    = new Date().toISOString().slice(0, 10);
  benchmarks._meta.total_clients = clientSlugs.length;
  benchmarks._meta.total_posts   = posts.length;

  // ── Write ─────────────────────────────────────────────────────────────────

  if (!DRY_RUN) {
    fs.writeFileSync(BENCHMARKS_PATH, JSON.stringify(benchmarks, null, 2) + '\n', { encoding: 'utf8' });
    console.log(`\n✅ intelligence/benchmarks.json atualizado — ${posts.length} posts de ${clientSlugs.length} cliente(s).`);
    console.log('   Skills leem esse arquivo no próximo /abrir — nenhuma ação manual necessária.');
  } else {
    console.log('\n[DRY-RUN] benchmarks.json não foi alterado.');
    console.log('   Rode sem --dry-run para aplicar.');
  }
}

aggregate();
