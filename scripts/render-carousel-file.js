'use strict';
const { chromium } = require('playwright');
const fs   = require('fs');
const path = require('path');

async function render() {
  const htmlFile = process.argv[2];
  if (!htmlFile) { console.error('Uso: node render-carousel-file.js <file.html>'); process.exit(1); }

  const htmlPath = path.resolve(htmlFile);
  const name     = path.basename(htmlPath, '.html');
  const outDir   = path.join(path.dirname(htmlPath), name);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();
  await page.setViewportSize({ width: 1080, height: 1080 });
  const fileUrl = 'file:///' + htmlPath.split(path.sep).join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  const total = await page.evaluate(() => document.querySelectorAll('.slide').length);
  console.log('Slides:', total);

  for (let i = 0; i < total; i++) {
    await page.evaluate(n => {
      document.querySelectorAll('.slide').forEach((el, idx) => {
        el.classList.toggle('active', idx === n);
      });
    }, i);
    await page.waitForTimeout(300);
    const out = path.join(outDir, `slide-${String(i + 1).padStart(2, '0')}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1080, height: 1080 } });
    console.log('  slide', i + 1, '->', out.split(path.sep).pop());
  }

  await context.close();
  await browser.close();
  console.log('\nPNGs em:', outDir);
}

render().catch(e => { console.error(e.message); process.exit(1); });
