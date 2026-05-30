'use strict';
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlFile = process.argv[2];
  if (!htmlFile) { console.error('Usage: node render.js <file.html>'); process.exit(1); }

  const htmlPath = path.resolve(htmlFile);
  const outDir = htmlPath.replace(/\.html$/, '');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 5400, height: 1080 });

  const fileUrl = 'file:///' + htmlPath.split(path.sep).join('/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  for (let i = 0; i < 5; i++) {
    const out = path.join(outDir, `slide-${i + 1}.png`);
    await page.screenshot({ path: out, clip: { x: i * 1080, y: 0, width: 1080, height: 1080 } });
    console.log(`✓ slide-${i + 1}.png`);
  }

  await browser.close();
  console.log('\n✅ Salvo em:', outDir);
})().catch(err => { console.error('❌', err.message); process.exit(1); });
