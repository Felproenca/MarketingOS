#!/usr/bin/env node
'use strict';

// Grava animação HTML como vídeo usando Playwright
// Uso: node scripts/render-reel.js --html <arquivo.html> --out <saida.webm> [--duration 30000]
// Converte para MP4: ffmpeg -i saida.webm -c:v libx264 -pix_fmt yuv420p saida.mp4

const path = require('path');
const fs   = require('fs');
const { chromium } = require('playwright');

function getArg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : null;
}

const htmlArg    = getArg('html');
const outArg     = getArg('out');
const durationMs = parseInt(getArg('duration') || '30000', 10);

if (!htmlArg || !outArg) {
  console.error('Uso: node scripts/render-reel.js --html <arquivo.html> --out <saida.webm> [--duration 30000]');
  process.exit(1);
}

const htmlPath = path.resolve(htmlArg);
const outPath  = path.resolve(outArg);
const outDir   = path.dirname(outPath);

if (!fs.existsSync(htmlPath)) {
  console.error(`HTML não encontrado: ${htmlPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log('\n🎬 MarketingOS — Render de Reel');
  console.log(`   HTML     : ${htmlPath}`);
  console.log(`   Saída    : ${outPath}`);
  console.log(`   Duração  : ${durationMs / 1000}s`);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport:        { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir:  outDir,
      size: { width: 1080, height: 1920 },
    },
  });

  const page = await ctx.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  console.log('\n   ⏺  Gravando...');
  await page.waitForTimeout(durationMs);

  await ctx.close();
  await browser.close();

  // Playwright salva com nome gerado — renomear para o caminho desejado
  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    console.error('\n❌ Nenhum .webm gerado. Verifique o Playwright.');
    process.exit(1);
  }

  const generated = path.join(outDir, files[files.length - 1]);
  if (generated !== outPath) {
    fs.renameSync(generated, outPath);
  }

  console.log(`\n✅ Vídeo salvo: ${outPath}`);
  console.log('\n   Para converter para MP4:');
  console.log(`   ffmpeg -i "${outPath}" -c:v libx264 -pix_fmt yuv420p "${outPath.replace('.webm', '.mp4')}"\n`);
})().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
