const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const abs = path.resolve(__dirname, 'cockpit-v2.html');
  const file = 'file://' + abs.split(path.sep).join('/');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1320, height: 980 }, deviceScaleFactor: 2 });
  await p.goto(file, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(__dirname, 'cockpit-v2-desktop.png') });
  const m = await b.newPage({ viewport: { width: 390, height: 1600 }, deviceScaleFactor: 2 });
  await m.goto(file, { waitUntil: 'networkidle' });
  await m.waitForTimeout(1200);
  await m.screenshot({ path: path.join(__dirname, 'cockpit-v2-mobile.png'), fullPage: true });
  await b.close();
  console.log('done');
})();
