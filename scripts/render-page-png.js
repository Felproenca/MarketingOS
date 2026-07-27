'use strict';

const path = require('path');
const { chromium } = require('playwright');

async function main() {
  const input = process.argv[2];
  const output = process.argv[3];
  const selector = process.argv[4] || '.page';

  if (!input || !output) {
    throw new Error('Uso: node scripts/render-page-png.js <input.html> <output.png> [selector]');
  }

  const executablePath = process.env.CHROMIUM_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  const url = `file:///${path.resolve(input).split(path.sep).join('/')}`;

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const element = page.locator(selector).first();
  await element.screenshot({ path: path.resolve(output) });
  await browser.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
