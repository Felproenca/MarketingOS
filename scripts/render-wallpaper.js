const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlFile = process.argv[2] || 'clients/felipe-proenca/outputs/wallpaper-desktop.html';
  const outFile  = process.argv[3] || htmlFile.replace('.html', '.png');

  const htmlPath = path.resolve(htmlFile);
  const outPath  = path.resolve(outFile);

  if (!fs.existsSync(htmlPath)) {
    console.error('HTML não encontrado:', htmlPath);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2   // → PNG 3840×2160 (retina / 4K)
  });
  const page = await ctx.newPage();

  await page.goto('file:///' + htmlPath.split('\\').join('/'));

  // aguarda fontes
  await page.waitForFunction(() => window.__WALLPAPER_READY === true, { timeout: 10000 })
    .catch(() => page.waitForTimeout(3000));

  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();

  console.log('wallpaper gerado:', outPath);
  console.log('resolução: 3840×2160 (renderizado a deviceScaleFactor 2)');
})();
