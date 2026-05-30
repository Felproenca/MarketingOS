#!/usr/bin/env node
'use strict';

/**
 * MarketingOS Publisher — Instagram via Meta Graph API
 *
 * Uso:
 *   node scripts/publisher/index.js --slug <slug> --file <url|path> [--file ...] \
 *     --caption "texto" [--format feed|carousel|reel] [--dry-run]
 *
 * Opções:
 *   --slug      Slug do cliente (obrigatório)
 *   --file      URL pública ou path local de imagem/vídeo (repetível para carrossel)
 *   --caption   Legenda do post (obrigatório, exceto dry-run)
 *   --format    feed | carousel | reel  (auto-detectado se --file repetido)
 *   --dry-run   Valida config e arquivos sem publicar
 *
 * Config: clients/[slug]/instagram-config.json
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { resolveUrl } = require('./uploader');
const {
  validateToken,
  createFeedContainer,
  createCarouselItem,
  createCarouselContainer,
  createReelContainer,
  publishContainer,
  waitForContainer,
  getPermalink,
} = require('./instagram');

// ── Args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const files = [];
  const result = { slug: null, caption: '', format: null, dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--slug')    result.slug = args[++i];
    else if (a === '--file')    files.push(args[++i]);
    else if (a === '--caption') result.caption = args[++i];
    else if (a === '--format')  result.format = args[++i];
    else if (a === '--dry-run') result.dryRun = true;
  }

  result.files = files;

  // Auto-detect format
  if (!result.format) {
    if (files.length > 1) result.format = 'carousel';
    else if (files.some(f => /\.(mp4|mov)$/i.test(f))) result.format = 'reel';
    else result.format = 'feed';
  }

  return result;
}

// ── Config ─────────────────────────────────────────────────────────────────

function loadConfig(slug) {
  const configPath = path.resolve(__dirname, '../../clients', slug, 'instagram-config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `Config não encontrado: clients/${slug}/instagram-config.json\n\n` +
      `Copie o template:\n` +
      `  cp clients/_template/instagram-config.json clients/${slug}/instagram-config.json\n` +
      `\nPreencha com:\n` +
      `  accessToken — Graph API Explorer com permissões instagram_content_publish\n` +
      `  igUserId    — ID numérico da conta Instagram Business`
    );
  }

  const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  return {
    accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || raw.accessToken,
    igUserId:    process.env.INSTAGRAM_USER_ID      || raw.igUserId,
    imgbbApiKey: process.env.IMGBB_API_KEY          || raw.imgbbApiKey || null,
  };
}

// ── Publish flows ──────────────────────────────────────────────────────────

async function publishFeed(cfg, imageUrl, caption) {
  process.stdout.write('\n  Criando container...');
  const { id: containerId } = await createFeedContainer(cfg.igUserId, imageUrl, caption, cfg.accessToken);
  console.log(` ✓ ${containerId}`);

  process.stdout.write('  Aguardando processamento...');
  await waitForContainer(containerId, cfg.accessToken);
  console.log(' ✓');

  process.stdout.write('  Publicando...');
  const { id: mediaId } = await publishContainer(cfg.igUserId, containerId, cfg.accessToken);
  console.log(` ✓ ${mediaId}`);

  return mediaId;
}

async function publishCarousel(cfg, imageUrls, caption) {
  const childIds = [];

  for (let i = 0; i < imageUrls.length; i++) {
    process.stdout.write(`\n  Item ${i + 1}/${imageUrls.length}...`);
    const { id } = await createCarouselItem(cfg.igUserId, imageUrls[i], cfg.accessToken);
    childIds.push(id);
    console.log(` ✓ ${id}`);
    if (i < imageUrls.length - 1) await new Promise(r => setTimeout(r, 1500));
  }

  process.stdout.write('\n  Criando carrossel...');
  const { id: containerId } = await createCarouselContainer(cfg.igUserId, childIds, caption, cfg.accessToken);
  console.log(` ✓ ${containerId}`);

  process.stdout.write('  Aguardando processamento...');
  await waitForContainer(containerId, cfg.accessToken);
  console.log(' ✓');

  process.stdout.write('  Publicando...');
  const { id: mediaId } = await publishContainer(cfg.igUserId, containerId, cfg.accessToken);
  console.log(` ✓ ${mediaId}`);

  return mediaId;
}

async function publishReel(cfg, videoUrl, caption) {
  process.stdout.write('\n  Criando container de Reel...');
  const { id: containerId } = await createReelContainer(cfg.igUserId, videoUrl, caption, cfg.accessToken);
  console.log(` ✓ ${containerId}`);

  process.stdout.write('  Aguardando encode do vídeo');
  await waitForContainer(containerId, cfg.accessToken, 600000); // 10min max
  console.log(' ✓');

  process.stdout.write('  Publicando...');
  const { id: mediaId } = await publishContainer(cfg.igUserId, containerId, cfg.accessToken);
  console.log(` ✓ ${mediaId}`);

  return mediaId;
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  if (!args.slug || args.files.length === 0) {
    console.error(
      '❌ Uso: node scripts/publisher/index.js --slug <slug> --file <url|path> [--file ...] --caption "texto" [--format feed|carousel|reel] [--dry-run]'
    );
    process.exit(1);
  }

  console.log('\n📤 MarketingOS Publisher');
  console.log(`   Cliente   : ${args.slug}`);
  console.log(`   Formato   : ${args.format}`);
  console.log(`   Arquivos  : ${args.files.length}`);
  console.log(`   Caption   : ${args.caption.slice(0, 60)}${args.caption.length > 60 ? '…' : ''}`);
  if (args.dryRun) console.log('   ⚠️  DRY RUN — não publica');

  const cfg = loadConfig(args.slug);

  // Validate token
  if (!args.dryRun) {
    process.stdout.write('\n  Validando token...');
    const me = await validateToken(cfg.accessToken);
    console.log(` ✓ (${me.name || me.id})`);
  }

  // Resolve local files → public URLs
  console.log('\n  Resolvendo arquivos...');
  const urls = [];
  for (const f of args.files) {
    if (args.dryRun && !/^https?:\/\//i.test(f)) {
      console.log(`  [DRY-RUN] ${f} (local, seria enviado para imgbb)`);
      urls.push(f);
    } else {
      urls.push(await resolveUrl(f, cfg.imgbbApiKey));
    }
  }

  if (args.dryRun) {
    console.log('\n✅ [DRY-RUN] Tudo ok. Rodaria com:');
    console.log(`   Formato : ${args.format}`);
    urls.forEach((u, i) => console.log(`   Arquivo ${i + 1}: ${u}`));
    console.log(`   Caption : ${args.caption}`);
    return;
  }

  let mediaId;
  if (args.format === 'carousel') {
    mediaId = await publishCarousel(cfg, urls, args.caption);
  } else if (args.format === 'reel') {
    mediaId = await publishReel(cfg, urls[0], args.caption);
  } else {
    mediaId = await publishFeed(cfg, urls[0], args.caption);
  }

  const permalink = await getPermalink(mediaId, cfg.accessToken);

  console.log('\n✅ Publicado!');
  if (permalink) console.log(`   Link : ${permalink}`);
  console.log(`   ID   : ${mediaId}`);
  console.log('\n💡 Registre em campaigns.md:');
  console.log(`   Link: ${permalink || 'https://www.instagram.com/p/<id>/'}`);
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
