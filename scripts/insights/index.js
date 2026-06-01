#!/usr/bin/env node
'use strict';

/**
 * MarketingOS Insights — puxa a performance real dos posts publicados.
 *
 * Fecha o loop: o publisher grava o que foi publicado (published.json),
 * este script lê de volta a performance via Graph API e a grava no ledger
 * + agrega em metrics.json. É o que transforma atividade em aprendizado.
 *
 * Uso:
 *   node scripts/insights/index.js --slug <slug> [--min-age-hours 48] [--force] [--dry-run]
 *
 * Opções:
 *   --slug           Slug do cliente (obrigatório)
 *   --min-age-hours  Idade mínima do post para buscar insights (padrão: 48)
 *   --force          Ignora a idade mínima
 *   --dry-run        Busca e mostra, mas não grava no ledger/metrics
 *
 * Requer token com permissão instagram_manage_insights e conta Business/Creator.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../publisher/config');
const { validateToken, getMediaInfo, getMediaInsights } = require('../publisher/instagram');
const ledger = require('../publisher/ledger');

// ── Args ─────────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { slug: null, minAgeHours: 48, force: false, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--slug')               result.slug = args[++i];
    else if (a === '--min-age-hours') result.minAgeHours = Number(args[++i]);
    else if (a === '--force')         result.force = true;
    else if (a === '--dry-run')       result.dryRun = true;
  }
  return result;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function hoursSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

function computeEngagement(info, ins) {
  const reach = Number(ins.reach) || 0;
  const likes = Number(info.like_count) || 0;
  const comments = Number(info.comments_count) || 0;
  const saved = Number(ins.saved) || 0;
  const shares = Number(ins.shares) || 0;
  const interactions = ins.total_interactions != null
    ? Number(ins.total_interactions)
    : likes + comments + saved + shares;
  const engagement_rate = reach > 0 ? Number((interactions / reach).toFixed(4)) : 0;
  return { reach, likes, comments, saved, shares, interactions, engagement_rate };
}

// ── Agregação em metrics.json ────────────────────────────────────────────────

function aggregateMetrics(slug, posts) {
  const metricsPath = path.resolve(__dirname, '../../clients', slug, 'metrics.json');
  if (!fs.existsSync(metricsPath)) {
    console.log(`\n  ⚠️  clients/${slug}/metrics.json não existe — agregação pulada (ledger atualizado mesmo assim).`);
    return;
  }
  const withInsights = posts.filter(p => p.channel === 'instagram' && p.insights && p.insights.reach != null);
  if (withInsights.length === 0) return;

  const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  const ig = metrics.instagram_organic || (metrics.instagram_organic = {});

  const reachTotal = withInsights.reduce((s, p) => s + (p.insights.reach || 0), 0);
  const engAvg = withInsights.reduce((s, p) => s + (p.insights.engagement_rate || 0), 0) / withInsights.length;

  ig.enabled = true;
  ig.posts_published = withInsights.length;
  ig.reach_total = reachTotal;
  ig.avg_engagement_rate = Number(engAvg.toFixed(4));
  ig.top_posts = [...withInsights]
    .sort((a, b) => (b.insights.reach || 0) - (a.insights.reach || 0))
    .slice(0, 3)
    .map(p => ({
      id: p.mediaId,
      type: p.format || '',
      topic: p.theme || '',
      reach: p.insights.reach || 0,
      likes: p.insights.likes || 0,
      comments: p.insights.comments || 0,
      saves: p.insights.saved || 0,
      shares: p.insights.shares || 0,
      engagement_rate: p.insights.engagement_rate || 0,
    }));

  metrics.client = metrics.client || {};
  metrics.client.slug = metrics.client.slug || slug;
  metrics.client.updated_at = new Date().toISOString().slice(0, 10);

  fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2) + '\n', { encoding: 'utf8' });
  console.log(`  ✓ metrics.json > instagram_organic atualizado (${withInsights.length} posts, reach total ${reachTotal}).`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  if (!args.slug) {
    console.error('❌ Uso: node scripts/insights/index.js --slug <slug> [--min-age-hours 48] [--force] [--dry-run]');
    process.exit(1);
  }

  console.log('\n📈 MarketingOS Insights');
  console.log(`   Cliente : ${args.slug}`);
  console.log(`   Idade mín.: ${args.force ? 'ignorada (--force)' : args.minAgeHours + 'h'}`);
  if (args.dryRun) console.log('   ⚠️  DRY RUN — não grava');

  const cfg = loadConfig(args.slug);

  // Preflight: valida o token antes de iterar (mensagem clara se expirou).
  try {
    await validateToken(cfg.accessToken);
  } catch (e) {
    throw new Error(
      `Token inválido ou sem permissão: ${e.message}\n` +
      `   → O token da Meta expira em horas. Gere um novo no Graph API Explorer\n` +
      `     com instagram_manage_insights e atualize clients/${args.slug}/instagram-config.json.`
    );
  }

  const data = ledger.load(args.slug);
  const candidates = data.posts.filter(p =>
    p.channel === 'instagram' && !p.dryRun && p.mediaId &&
    (args.force || hoursSince(p.publishedAt) >= args.minAgeHours)
  );

  const skippedFb = data.posts.filter(p => p.channel === 'facebook' && !p.dryRun).length;
  const skippedYoung = data.posts.filter(p =>
    p.channel === 'instagram' && !p.dryRun && p.mediaId &&
    !(args.force || hoursSince(p.publishedAt) >= args.minAgeHours)
  ).length;

  console.log(`\n   Posts no ledger : ${data.posts.length}`);
  console.log(`   Elegíveis (IG)  : ${candidates.length}`);
  if (skippedYoung) console.log(`   Pulados (< ${args.minAgeHours}h): ${skippedYoung}`);
  if (skippedFb)    console.log(`   Pulados (Facebook — insights não suportado aqui): ${skippedFb}`);

  if (candidates.length === 0) {
    console.log('\n  Nada para buscar agora. Publique e volte após ~48h.');
    return;
  }

  let ok = 0, failed = 0;
  for (const post of candidates) {
    process.stdout.write(`\n  ${post.mediaId} (${post.format || '?'})...`);
    try {
      const info = await getMediaInfo(post.mediaId, cfg.accessToken);
      const ins = await getMediaInsights(post.mediaId, cfg.accessToken);
      const eng = computeEngagement(info, ins);
      post.insights = {
        fetchedAt: new Date().toISOString(),
        mediaType: info.media_product_type || info.media_type || null,
        ...eng,
      };
      ok++;
      console.log(` ✓ reach ${eng.reach} · interações ${eng.interactions} · eng ${(eng.engagement_rate * 100).toFixed(1)}%`);
    } catch (e) {
      failed++;
      console.log(` ✗ ${e.message}`);
    }
  }

  if (!args.dryRun) {
    ledger.save(args.slug, data);
    console.log(`\n  ✓ Ledger atualizado: clients/${args.slug}/published.json`);
    aggregateMetrics(args.slug, data.posts);
  } else {
    console.log('\n  [DRY-RUN] nada gravado.');
  }

  console.log(`\n✅ Concluído — ${ok} com insights, ${failed} falharam.`);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
