'use strict';
// Renderer genérico: le a largura/altura do primeiro .slide via getBoundingClientRect
// e tira screenshot de cada .slide encontrado no HTML. Funciona para post (1080x1350),
// story (1080x1920) ou qualquer outro formato definido no próprio HTML.
const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

async function render() {
  const htmlFile = process.argv[2];
  if (!htmlFile) { console.error('Uso: node render-slide-generic.js <file.html> [outDirName]'); process.exit(1); }

  const htmlPath = path.resolve(htmlFile);
  const outName  = process.argv[3] || 'instagram';
  const outDir   = path.join(path.dirname(htmlPath), outName);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: ['--disable-lcd-text', '--font-render-hinting=none'] });
  const context = await browser.newContext();
  const page    = await context.newPage();
  const fileUrl = 'file:///' + htmlPath.split(path.sep).join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const dims = await page.evaluate(() => {
    const el = document.querySelector('.slide');
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  await page.setViewportSize({ width: dims.w, height: dims.h });
  await page.waitForTimeout(400);

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('Slides:', total, dims);

  for (let i = 0; i < total; i++) {
    const slides = await page.$$('.slide');
    const out = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: out });
    console.log('  slide', i + 1, '->', out.split(path.sep).pop());
  }

  await context.close();
  await browser.close();
  console.log('\nPNGs em:', outDir);
}

render().catch(e => { console.error(e.message); process.exit(1); });
