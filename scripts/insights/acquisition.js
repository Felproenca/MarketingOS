#!/usr/bin/env node
'use strict';

/**
 * MarketingOS — Métricas de Aquisição (grafo de interesse).
 *
 * Operacionaliza a "camada de métricas" da Doutrina de Aquisição 2026
 * (intelligence/doctrine-aquisicao-2026.md). NORTH STAR: aquisição observável.
 *
 * REGRA INEGOCIÁVEL — TUDO É VERDADE:
 *   Todo número vem da Graph API real ou de um ledger interno real.
 *   O que a API não entrega vira { value: null, source: 'indisponivel', note }.
 *   NUNCA estima, NUNCA inventa, NUNCA preenche lacuna com palpite.
 *   Cada valor carrega sua proveniência (de onde veio) e quando foi puxado.
 *
 * Uso:
 *   node scripts/insights/acquisition.js --slug <slug> [--reels 8] [--dry-run]
 *
 * Requer token com instagram_manage_insights + conta Business/Creator.
 * Reaproveita a plumbing real do publisher (config + apiGet + validateToken).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { loadConfig } = require('../publisher/config');
const { apiGet, validateToken, getMediaInfo } = require('../publisher/instagram');
const { writeInstagramSync } = require('../../../GrowthOS/data-now/src/instagram');

const NOW = () => new Date().toISOString();

function parseArgs() {
  const a = process.argv.slice(2);
  const r = { slug: null, reels: 8, dryRun: false };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--slug') r.slug = a[++i];
    else if (a[i] === '--reels') r.reels = Number(a[++i]) || 8;
    else if (a[i] === '--dry-run') r.dryRun = true;
    // Slug solto (ex.: `npm run insights:aquisicao felipe-proenca`, onde o npm
    // engole o --slug). Aceita o 1º arg que não seja flag.
    else if (!r.slug && !a[i].startsWith('--')) r.slug = a[i];
  }
  return r;
}

// Marca de proveniência — a espinha dorsal da regra "tudo é verdade".
const real = (value, source, extra = {}) => ({ value, source, fetchedAt: NOW(), ...extra });
const gap = (note) => ({ value: null, source: 'indisponivel', fetchedAt: NOW(), note });
const notInstrumented = (note) => ({ value: null, source: 'nao-instrumentado', fetchedAt: NOW(), note });

// Extrai valor de uma resposta de insights, lidando com os dois formatos da API:
// moderno (total_value + breakdowns) e legado (values[0].value).
function readInsight(dataItem) {
  if (!dataItem) return null;
  if (dataItem.total_value && dataItem.total_value.value != null) {
    return { total: dataItem.total_value.value, breakdowns: dataItem.total_value.breakdowns || null };
  }
  const v = dataItem.values && dataItem.values[0] ? dataItem.values[0].value : null;
  return v != null ? { total: v, breakdowns: null } : null;
}

function breakdownValue(insight, dimension, matchValue) {
  if (!insight || !insight.breakdowns) return null;
  for (const b of insight.breakdowns) {
    const idx = (b.dimension_keys || []).indexOf(dimension);
    if (idx === -1) continue;
    for (const res of b.results || []) {
      const dv = (res.dimension_values || [])[idx];
      if (String(dv).toUpperCase() === String(matchValue).toUpperCase()) return res.value;
    }
  }
  return null;
}

// Tenta uma chamada de insights; devolve o item bruto ou null (degrada sem quebrar).
async function tryInsight(nodePath, params, token) {
  try {
    const data = await apiGet(nodePath, { ...params, access_token: token });
    return (data.data && data.data[0]) || null;
  } catch (e) {
    return { __error: e.message };
  }
}

// ── Conta (grafo de interesse no nível do perfil) ────────────────────────────
// A Meta exige metric_type=total_value + period=day para estas métricas
// (days_28 é incompatível). Janela de 28d via since/until — total agregado real.
async function accountMetrics(igUserId, token) {
  const out = {};
  const DAY = 86400;
  const until = Math.floor(Date.now() / 1000);
  const since = until - 28 * DAY;
  const window = { metric_type: 'total_value', period: 'day', since, until };
  out._window = { since: new Date(since * 1000).toISOString(), until: new Date(until * 1000).toISOString(), days: 28 };

  // Follower count — nó do usuário, sempre confiável.
  try {
    const u = await apiGet(`/${igUserId}`, { fields: 'followers_count,media_count', access_token: token });
    out.followers = real(u.followers_count ?? null, 'graph:user-node', { metric: 'followers_count' });
    out.media_count = real(u.media_count ?? null, 'graph:user-node', { metric: 'media_count' });
  } catch (e) {
    out.followers = gap(`user-node falhou: ${e.message}`);
  }

  // Alcance + quebra por tipo de seguidor numa só chamada (total + não-seguidor).
  const reach = readInsight(await tryInsight(`/${igUserId}/insights`,
    { metric: 'reach', breakdown: 'follow_type', ...window }, token));
  if (reach) {
    out.reach_28d = real(reach.total, 'graph:account-insights', { metric: 'reach', period: 'days(since/until 28d)' });
    const nonFollower = breakdownValue(reach, 'follow_type', 'NON_FOLLOWER');
    out.reach_non_followers_28d = nonFollower != null
      ? real(nonFollower, 'graph:account-insights', { metric: 'reach/follow_type=NON_FOLLOWER', period: '28d' })
      : gap('reach veio sem breakdown follow_type nesta janela.');
  } else {
    out.reach_28d = gap('reach indisponível nesta janela.');
    out.reach_non_followers_28d = gap('depende de reach, que ficou indisponível.');
  }

  // Visitas ao perfil e toques no link da bio (o "checkout" do perfil).
  for (const [key, metric] of [['profile_views', 'profile_views'], ['bio_link_clicks', 'website_clicks']]) {
    const item = await tryInsight(`/${igUserId}/insights`, { metric, ...window }, token);
    const v = readInsight(item);
    out[key] = v
      ? real(v.total, 'graph:account-insights', { metric, period: '28d' })
      : gap(`${metric} indisponível: ${item && item.__error ? item.__error : 'sem dado'}`);
  }

  return out;
}

// ── Reels (atração de estranhos via grafo de interesse) ──────────────────────
async function reelMetrics(posts, token, limit) {
  const igPosts = posts.filter(p => p.channel === 'instagram' && !p.dryRun && p.mediaId)
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  const reels = [];
  for (const p of igPosts) {
    if (reels.length >= limit) break;
    let info;
    try { info = await getMediaInfo(p.mediaId, token); } catch { continue; }
    const isReel = (info.media_product_type || '').toUpperCase() === 'REELS' || (p.format || '').toLowerCase() === 'reel';
    if (!isReel) continue;

    const row = { mediaId: p.mediaId, permalink: info.permalink || p.permalink || null, publishedAt: p.publishedAt || info.timestamp || null };

    // Tempo médio de visualização — o sinal real mais próximo do "teste dos 5s".
    const watch = readInsight(await tryInsight(`/${p.mediaId}/insights`, { metric: 'ig_reels_avg_watch_time' }, token));
    row.avg_watch_time_ms = watch
      ? real(watch.total, 'graph:media-insights', { metric: 'ig_reels_avg_watch_time', doctrine: 'proxy real do teste de retenção de 5s' })
      : gap('ig_reels_avg_watch_time indisponível para este reel.');

    // Alcance e quebra por não-seguidores neste reel (mídia: sem period).
    let rItem = await tryInsight(`/${p.mediaId}/insights`, { metric: 'reach', breakdown: 'follow_type', metric_type: 'total_value' }, token);
    if (rItem && rItem.__error) rItem = await tryInsight(`/${p.mediaId}/insights`, { metric: 'reach' }, token);
    const r = readInsight(rItem);
    row.reach = r ? real(r.total, 'graph:media-insights', { metric: 'reach' }) : gap('reach indisponível para este reel.');
    const nf = breakdownValue(r, 'follow_type', 'NON_FOLLOWER');
    row.reach_non_followers = nf != null
      ? real(nf, 'graph:media-insights', { metric: 'reach/follow_type=NON_FOLLOWER' })
      : gap('sem breakdown follow_type para este reel.');

    reels.push(row);
  }
  return reels;
}

// ── Métricas internas (verdade interna, não da API) ──────────────────────────
function internalMetrics(slug) {
  const out = {};

  // Volume do Proof Stack — conta provas reais salvas, sem inventar.
  const proofDir = path.resolve(__dirname, '../../clients', slug, 'outputs', 'proof');
  if (fs.existsSync(proofDir)) {
    const n = fs.readdirSync(proofDir).filter(f => !f.startsWith('.')).length;
    out.proof_stack_volume = real(n, 'ledger-interno:outputs/proof');
  } else {
    out.proof_stack_volume = notInstrumented(`Crie clients/${slug}/outputs/proof/ e salve prints/depoimentos reais. Sem pasta = sem prova contável (não estimamos).`);
  }

  const dmLogPath = path.resolve(__dirname, '../../clients', slug, 'leads', 'dm-engine-log.json');
  if (fs.existsSync(dmLogPath)) {
    const logs = JSON.parse(fs.readFileSync(dmLogPath, 'utf8'));
    const keywordHits = logs.filter(e => e.event === 'comment.keyword_hit').length;
    const queued = logs.filter(e => e.event === 'dm.queued').length;
    const sent = logs.filter(e => e.event === 'dm.sent').length;
    const captured = logs.filter(e => e.event === 'lead.captured').length;
    out.keyword_comments = real(keywordHits, 'ledger-interno:leads/dm-engine-log.json', {
      queued,
      sent,
      captured,
      keyword: logs.find(e => e.event === 'comment.keyword_hit')?.keyword || null,
    });
  } else {
    out.keyword_comments = notInstrumented(`Motor de DM sem ledger ainda em clients/${slug}/leads/dm-engine-log.json.`);
  }

  return out;
}

async function main() {
  const args = parseArgs();
  if (!args.slug) {
    console.error('❌ Uso: node scripts/insights/acquisition.js --slug <slug> [--reels 8] [--dry-run]');
    process.exit(1);
  }

  console.log('\n🎯 MarketingOS — Métricas de Aquisição (grafo de interesse)');
  console.log(`   Cliente: ${args.slug}`);
  if (args.dryRun) console.log('   ⚠️  DRY RUN — não grava');

  const cfg = loadConfig(args.slug);

  // Preflight de token — se expirou, paramos. Não gravamos nada falso.
  try {
    const me = await validateToken(cfg.accessToken);
    console.log(`   Token: válido (conta ${me.name || me.id}).`);
  } catch (e) {
    console.error(`\n❌ Token inválido/expirado: ${e.message}`);
    console.error('   → Gere um novo no Graph API Explorer (instagram_manage_insights) e atualize');
    console.error(`     clients/${args.slug}/instagram-config.json. NADA foi gravado (tudo é verdade).`);
    process.exit(2);
  }

  const ledgerPath = path.resolve(__dirname, '../../clients', args.slug, 'published.json');
  const posts = fs.existsSync(ledgerPath) ? (JSON.parse(fs.readFileSync(ledgerPath, 'utf8')).posts || []) : [];

  console.log('\n   Puxando métricas de conta...');
  const account = await accountMetrics(cfg.igUserId, cfg.accessToken);
  console.log('   Puxando métricas de reels...');
  const reels = await reelMetrics(posts, cfg.accessToken, args.reels);
  const internal = internalMetrics(args.slug);

  const report = {
    slug: args.slug,
    generatedAt: NOW(),
    doctrine: 'intelligence/doctrine-aquisicao-2026.md',
    truth_rule: 'Todo valor tem source. source=indisponivel/nao-instrumentado significa SEM dado real — nunca estimado.',
    account,
    reels,
    internal,
  };

  // Resumo honesto no console.
  const fmt = (m) => m && m.value != null ? m.value : `— (${m ? m.source : 'n/a'})`;
  console.log('\n   ── Conta (28d) ──');
  console.log(`   Seguidores         : ${fmt(account.followers)}`);
  console.log(`   Alcance            : ${fmt(account.reach_28d)}`);
  console.log(`   Alcance não-seg.   : ${fmt(account.reach_non_followers_28d)}`);
  console.log(`   Visitas ao perfil  : ${fmt(account.profile_views)}`);
  console.log(`   Cliques link bio   : ${fmt(account.bio_link_clicks)}`);
  console.log(`   Reels analisados   : ${reels.length}`);
  console.log(`   Proof stack        : ${fmt(internal.proof_stack_volume)}`);
  console.log(`   Comentários-chave  : ${fmt(internal.keyword_comments)}`);

  if (args.dryRun) {
    console.log('\n   [DRY-RUN] nada gravado.');
    return;
  }

  const outPath = path.resolve(__dirname, '../../clients', args.slug, 'acquisition-metrics.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  const dataNowStatus = writeInstagramSync({
    dataNowRoot: path.resolve(__dirname, '../../../GrowthOS/data-now'),
    clientId: args.slug,
    sourceAccountId: cfg.igUserId,
    observedAt: report.generatedAt,
    acquisition: report,
  });
  console.log(`DATA NOW: ${dataNowStatus.last_sync_status} (${dataNowStatus.normalized_records} registros normalizados).`);
  console.log(`\n   ✓ Gravado: clients/${args.slug}/acquisition-metrics.json`);
}

main().catch(e => { console.error(`\n❌ ${e.message}`); process.exit(1); });
