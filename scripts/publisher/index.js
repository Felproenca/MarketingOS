#!/usr/bin/env node
'use strict';

/**
 * MarketingOS Publisher — Instagram + Facebook via Meta Graph API
 *
 * Uso:
 *   node scripts/publisher/index.js --slug <slug> --file <url|path> [--file ...] \
 *     --caption "texto" [--format feed|carousel|reel] [--channel instagram|facebook|all] [--dry-run]
 *
 * Opções:
 *   --slug      Slug do cliente (obrigatório)
 *   --file      URL pública ou path local de imagem/vídeo (repetível para carrossel)
 *   --caption   Legenda do post (obrigatório, exceto dry-run)
 *   --format    feed | carousel | reel  (auto-detectado se --file repetido)
 *   --channel   instagram | facebook | all  (padrão: instagram)
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
  createStoryContainer,
  publishContainer,
  waitForContainer,
  getPermalink: getIgPermalink,
} = require('./instagram');
const {
  validatePageAccess,
  publishPhotoPost,
  publishAlbumPost,
  getPermalink: getFbPermalink,
} = require('./facebook');

// ── Args ───────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const files = [];
  const result = { slug: null, caption: '', format: null, channel: 'instagram', dryRun: false };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--slug')    result.slug = args[++i];
    else if (a === '--channel') result.channel = args[++i];
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
    pageId:      process.env.FACEBOOK_PAGE_ID       || raw.pageId      || null,
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

async function publishStory(cfg, imageUrl) {
  process.stdout.write('\n  Criando container de Story...');
  const { id: containerId } = await createStoryContainer(cfg.igUserId, imageUrl, cfg.accessToken);
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

  const doInstagram = args.channel === 'instagram' || args.channel === 'all';
  const doFacebook  = args.channel === 'facebook'  || args.channel === 'all';

  console.log('\n📤 MarketingOS Publisher');
  console.log(`   Cliente   : ${args.slug}`);
  console.log(`   Canal     : ${args.channel}`);
  console.log(`   Formato   : ${args.format}`);
  console.log(`   Arquivos  : ${args.files.length}`);
  console.log(`   Caption   : ${args.caption.slice(0, 60)}${args.caption.length > 60 ? '…' : ''}`);
  if (args.dryRun) console.log('   ⚠️  DRY RUN — não publica');

  const cfg = loadConfig(args.slug);

  // Valida token e acesso
  if (!args.dryRun) {
    if (doInstagram) {
      process.stdout.write('\n  Instagram — validando token...');
      const me = await validateToken(cfg.accessToken);
      console.log(` ✓ (${me.name || me.id})`);
    }
    if (doFacebook) {
      if (!cfg.pageId) throw new Error('pageId não configurado em instagram-config.json');
      process.stdout.write('  Facebook  — validando acesso à Página...');
      const { name, pageToken } = await validatePageAccess(cfg.pageId, cfg.accessToken);
      cfg.pageToken = pageToken;
      console.log(` ✓ (${name})`);
    }
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
    console.log(`   Canal   : ${args.channel}`);
    console.log(`   Formato : ${args.format}`);
    urls.forEach((u, i) => console.log(`   Arquivo ${i + 1}: ${u}`));
    console.log(`   Caption : ${args.caption}`);
    return;
  }

  // ── Instagram ──────────────────────────────────────────────────────────────
  if (doInstagram) {
    console.log('\n📸 Instagram...');
    let igMediaId;
    if (args.format === 'carousel') {
      igMediaId = await publishCarousel(cfg, urls, args.caption);
    } else if (args.format === 'reel') {
      igMediaId = await publishReel(cfg, urls[0], args.caption);
    } else if (args.format === 'story') {
      igMediaId = await publishStory(cfg, urls[0]);
    } else {
      igMediaId = await publishFeed(cfg, urls[0], args.caption);
    }
    const igLink = await getIgPermalink(igMediaId, cfg.accessToken);
    console.log(`\n  ✅ Instagram publicado!`);
    if (igLink) console.log(`     Link : ${igLink}`);
    console.log(`     ID   : ${igMediaId}`);
  }

  // ── Facebook ───────────────────────────────────────────────────────────────
  if (doFacebook) {
    console.log('\n📘 Facebook...');
    let fbPost;
    if (urls.length > 1) {
      fbPost = await publishAlbumPost(cfg.pageId, cfg.pageToken, urls, args.caption);
    } else if (urls.length === 1) {
      fbPost = await publishPhotoPost(cfg.pageId, cfg.pageToken, urls[0], args.caption);
    } else {
      throw new Error('Nenhum arquivo para publicar no Facebook');
    }
    const fbLink = await getFbPermalink(fbPost.id || fbPost.post_id, cfg.pageToken);
    console.log(`\n  ✅ Facebook publicado!`);
    if (fbLink) console.log(`     Link : ${fbLink}`);
    console.log(`     ID   : ${fbPost.id || fbPost.post_id}`);
  }

  console.log('\n💡 Registre em campaigns.md.');
}

main().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
