const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const htmlFile = process.argv[2];
  const outFile  = process.argv[3] || htmlFile.replace('.html', '.png');
  const w = parseInt(process.argv[4] || '2560', 10);
  const h = parseInt(process.argv[5] || '1440', 10);

  const browser = await chromium.launch();
  const ctx  = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  const abs = path.resolve(htmlFile);
  await page.goto('file:///' + abs.split('\\').join('/'));
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1800);

  await page.screenshot({ path: outFile, fullPage: false });
  await browser.close();

  console.log('Banner salvo:', outFile);
})().catch(e => { console.error(e); process.exit(1); });
