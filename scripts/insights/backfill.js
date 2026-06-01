#!/usr/bin/env node
'use strict';

/**
 * backfill.js — Popula o ledger com posts já publicados na conta Instagram.
 *
 * Usa /{igUserId}/media para listar posts existentes e os adiciona ao
 * published.json com dryRun: false, para que o `npm run insights` os processe.
 *
 * Uso:
 *   node scripts/insights/backfill.js --slug <slug> [--limit 25] [--dry-run]
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { loadConfig }   = require('../publisher/config');
const { validateToken } = require('../publisher/instagram');
const ledger = require('../publisher/ledger');

const BASE = 'https://graph.facebook.com/v19.0';

async function apiGet(endpoint, params = {}) {
  const url = new URL(`${BASE}${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res  = await fetch(url.toString());
  const data = await res.json();
  if (data.error) throw new Error(`Meta API: ${data.error.message} (code ${data.error.code})`);
  return data;
}

function parseArgs() {
  const args  = process.argv.slice(2);
  const get   = k => { const i = args.indexOf(`--${k}`); return i !== -1 ? args[i + 1] : null; };
  const has   = k => args.includes(`--${k}`);
  return { slug: get('slug'), limit: parseInt(get('limit') || '25', 10), dryRun: has('dry-run') };
}

function formatKey(mediaType, mediaProductType) {
  const t = (mediaProductType || mediaType || '').toUpperCase();
  if (t === 'REELS')    return 'reel';
  if (t === 'CAROUSEL_ALBUM') return 'carousel';
  if (t === 'IMAGE')    return 'feed';
  if (t === 'STORY' || t === 'STORIES') return 'story';
  return 'feed';
}

async function main() {
  const args = parseArgs();
  if (!args.slug) {
    console.error('❌ Uso: node scripts/insights/backfill.js --slug <slug> [--limit 25] [--dry-run]');
    process.exit(1);
  }

  console.log('\n🔄 MarketingOS Insights — Backfill');
  console.log(`   Cliente : ${args.slug}`);
  console.log(`   Limite  : ${args.limit} posts`);
  if (args.dryRun) console.log('   ⚠️  DRY RUN — não grava no ledger');

  const cfg = loadConfig(args.slug);
  await validateToken(cfg.accessToken);
  console.log('   Token   : ✓ válido');

  // Busca lista de media da conta
  const media = await apiGet(`/${cfg.igUserId}/media`, {
    fields: 'id,media_type,media_product_type,timestamp,permalink,caption',
    limit:  String(args.limit),
    access_token: cfg.accessToken,
  });

  const posts = media.data || [];
  console.log(`\n   Posts encontrados na conta: ${posts.length}`);

  if (posts.length === 0) {
    console.log('   Conta sem posts ou sem permissão de leitura.');
    return;
  }

  // Carrega ledger existente para evitar duplicatas
  const data    = ledger.load(args.slug);
  const existing = new Set(data.posts.map(p => p.mediaId).filter(Boolean));

  let added = 0, skipped = 0;
  for (const post of posts) {
    if (existing.has(post.id)) { skipped++; continue; }

    const entry = {
      publishedAt: post.timestamp,
      channel:     'instagram',
      format:      formatKey(post.media_type, post.media_product_type),
      hook_type:   null,
      theme:       null,
      caption:     (post.caption || '').slice(0, 200),
      mediaId:     post.id,
      permalink:   post.permalink || null,
      dryRun:      false,
      insights:    null,
    };

    console.log(`   + ${post.id} · ${entry.format} · ${post.timestamp.slice(0, 10)}`);
    if (!args.dryRun) data.posts.push(entry);
    added++;
  }

  if (!args.dryRun && added > 0) {
    ledger.save(args.slug, data);
    console.log(`\n✅ ${added} posts adicionados ao ledger (${skipped} já existiam).`);
    console.log(`   Agora rode: npm run insights -- --slug ${args.slug} --force`);
    console.log(`   (--force ignora a janela de 48h para posts mais antigos)`);
  } else if (args.dryRun) {
    console.log(`\n[DRY-RUN] ${added} posts seriam adicionados (${skipped} já existiam). Nada gravado.`);
  } else {
    console.log(`\n   Nenhum post novo para adicionar.`);
  }
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
