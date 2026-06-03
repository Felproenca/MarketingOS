const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 540, height: 540 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  const htmlPath = path.resolve('clients/toqueindiano/outputs/branding/apresentacao-identidade.html');
  await page.goto('file:///' + htmlPath.split('\\').join('/'));
  await page.waitForTimeout(2000);

  const outDir = path.resolve('clients/toqueindiano/outputs/branding/slides');
  fs.mkdirSync(outDir, { recursive: true });

  const slides = [
    ['s1', '01-abertura'],
    ['s2', '02-produto'],
    ['s3', '03-fundadora'],
    ['s4', '04-cliente'],
    ['s5', '05-transformacao'],
    ['s6', '06-tagline'],
    ['s7', '07-identidade'],
    ['s8', '08-comeco'],
  ];

  for (const [id, label] of slides) {
    const el = await page.$('#' + id);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await el.screenshot({ path: path.join(outDir, label + '.png') });
    console.log('ok: ' + label);
  }

  await browser.close();
  console.log('done — ' + slides.length + ' slides em ' + outDir);
})();
