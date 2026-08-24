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
const crypto = require('crypto');
const { loadConfig } = require('../publisher/config');
const { validateToken, getMediaInfoRaw, getMediaInsightsRaw } = require('../publisher/instagram');
const ledger = require('../publisher/ledger');
const { writeInstagramSync } = require('../../../GrowthOS/data-now/src/instagram');

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

function decryptConnection(value) {
  const key = Buffer.from(process.env.DATA_ENCRYPTION_KEY || '', 'base64');
  const [ivText, tagText, dataText] = String(value || '').split('.');
  if (key.length !== 32 || !ivText || !tagText || !dataText) return null;
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64'));
    decipher.setAuthTag(Buffer.from(tagText, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(dataText, 'base64')), decipher.final()]).toString('utf8');
  } catch { return null; }
}

async function loadModernMetaConfig(slug) {
  const base = String(process.env.SUPABASE_URL || '').replace(/\/$/, '').replace(/\/rest\/v1$/, '');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !key) return null;
  const url = `${base}/rest/v1/connections?client_id=eq.${encodeURIComponent(slug)}&source=eq.meta&select=source_account_id,access_token_encrypted&limit=1`;
  try {
    const response = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    if (!response.ok) return null;
    const row = (await response.json())?.[0];
    if (row) {
      const accessToken = decryptConnection(row.access_token_encrypted);
      return accessToken && row.source_account_id
        ? { accessToken, igUserId: row.source_account_id, authSource: 'supabase-oauth' }
        : { unavailable: true, authSource: 'supabase-oauth' };
    }
    return null;
  } catch { return null; }
}

async function runRemoteSync(slug) {
  const cockpit = String(process.env.MARKETINGOS_COCKPIT_URL || '').replace(/\/$/, '');
  const secret = process.env.MEDIAOS_EXECUTION_INGEST_SECRET;
  if (!cockpit || !secret) return null;
  try {
    const response = await fetch(`${cockpit}/api/admin/operations`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-mediaos-execution-secret': secret }, body: JSON.stringify({ action: 'run_sync', clientId: slug, source: 'instagram' }) });
    const body = await response.json().catch(() => ({}));
    return response.ok ? body : null;
  } catch { return null; }
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

  const legacyCfg = loadConfig(args.slug);
  const modernCfg = await loadModernMetaConfig(args.slug);
  if (modernCfg?.unavailable) {
    const remote = await runRemoteSync(args.slug);
    if (remote?.ok) {
      console.log(`   Insights executados pelo backend OAuth: ${remote.rawRecords || 0} registro(s) bruto(s).`);
      return;
    }
  }
  const cfg = modernCfg && !modernCfg.unavailable ? modernCfg : legacyCfg;
  console.log(`   Fonte da conexão: ${cfg.authSource || 'arquivo local'}`);

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
  const rawResponses = [];
  for (const post of candidates) {
    process.stdout.write(`\n  ${post.mediaId} (${post.format || '?'})...`);
    try {
      const info = await getMediaInfoRaw(post.mediaId, cfg.accessToken);
      const rawInsights = await getMediaInsightsRaw(post.mediaId, cfg.accessToken);
      const ins = Object.fromEntries((rawInsights.data || []).map((item) => [item.name, item.values?.[0]?.value ?? null]));
      if (!args.dryRun) {
        rawResponses.push({ entity_id: post.mediaId, entity_type: 'content', endpoint: `/${post.mediaId}`, kind: 'media-info', payload: info, source_updated_at: info.timestamp, period_start: post.publishedAt, period_end: new Date().toISOString(), metrics: {} });
        rawResponses.push({ entity_id: post.mediaId, entity_type: 'content', endpoint: `/${post.mediaId}/insights`, kind: 'media-insights', payload: rawInsights, period_start: post.publishedAt, period_end: new Date().toISOString(), metrics: ins });
      }
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
    const dataNowStatus = writeInstagramSync({
      dataNowRoot: path.resolve(__dirname, '../../../GrowthOS/data-now'),
      clientId: args.slug,
      sourceAccountId: cfg.igUserId,
      observedAt: new Date().toISOString(),
      rawResponses,
      posts: data.posts,
    });
    console.log(`  DATA NOW: ${dataNowStatus.last_sync_status} (${dataNowStatus.normalized_records} registros normalizados).`);
  } else {
    console.log('\n  [DRY-RUN] nada gravado.');
  }

  console.log(`\n✅ Concluído — ${ok} com insights, ${failed} falharam.`);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
