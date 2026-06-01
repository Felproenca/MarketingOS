'use strict';

/**
 * ledger.js — Registro de publicações (published.json) por cliente.
 *
 * É a ponte do loop de aprendizado: o publisher grava o que foi publicado,
 * o `npm run insights` lê de volta e preenche a performance real.
 *
 * Formato de clients/[slug]/published.json:
 * {
 *   "_meta": { "slug", "updated_at", "count" },
 *   "posts": [ { publishedAt, channel, format, hook_type, theme,
 *                caption, mediaId, permalink, dryRun, insights } ]
 * }
 */

const fs = require('fs');
const path = require('path');

function ledgerPath(slug) {
  return path.resolve(__dirname, '../../clients', slug, 'published.json');
}

function load(slug) {
  const p = ledgerPath(slug);
  if (!fs.existsSync(p)) {
    return { _meta: { slug, updated_at: '', count: 0 }, posts: [] };
  }
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    if (!Array.isArray(data.posts)) data.posts = [];
    return data;
  } catch (e) {
    throw new Error(`published.json inválido para "${slug}": ${e.message}`);
  }
}

function save(slug, data) {
  data._meta = data._meta || { slug };
  data._meta.slug = slug;
  data._meta.updated_at = new Date().toISOString();
  data._meta.count = data.posts.length;
  // UTF-8 sem BOM, 2 espaços
  fs.writeFileSync(ledgerPath(slug), JSON.stringify(data, null, 2) + '\n', { encoding: 'utf8' });
}

/**
 * Adiciona uma publicação ao ledger.
 * entry: { channel, format, hook_type, theme, caption, mediaId, permalink, dryRun }
 * Retorna o caminho do arquivo gravado.
 */
function recordPublication(slug, entry) {
  const data = load(slug);
  data.posts.push({
    publishedAt: new Date().toISOString(),
    channel: entry.channel,
    format: entry.format || null,
    hook_type: entry.hook_type || null,
    theme: entry.theme || null,
    caption: (entry.caption || '').slice(0, 200),
    mediaId: entry.mediaId || null,
    permalink: entry.permalink || null,
    dryRun: !!entry.dryRun,
    insights: null, // preenchido por scripts/insights
  });
  save(slug, data);
  return ledgerPath(slug);
}

module.exports = { recordPublication, load, save, ledgerPath };
