#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      continue;
    }
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      result[key] = 'true';
      continue;
    }
    result[key] = value;
    i += 1;
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const htmlPath = args.html ? path.resolve(args.html) : null;
  const outDir = args.out ? path.resolve(args.out) : null;
  const slides = Number(args.slides || 7);

  if (!htmlPath || !outDir) {
    fail('Uso: node scripts/render-carousel.js --html [arquivo.html] --out [pasta] [--slides 7]');
  }

  if (!fs.existsSync(htmlPath)) {
    fail(`HTML nao encontrado: ${htmlPath}`);
  }

  ensureDir(outDir);

  let chromium;
  try {
    ({ chromium } = require('playwright'));
  } catch {
    fail('Playwright nao encontrado. Rode: npm i -D playwright');
  }

  const browser = await chromium.launch({ args: ['--disable-lcd-text', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);

  for (let i = 1; i <= slides; i += 1) {
    const selector = `#slide-${i}`;
    const el = page.locator(selector).first();
    const count = await el.count();
    if (count === 0) {
      console.warn(`Slide ausente no HTML: ${selector}`);
      continue;
    }
    const fileName = `slide-${String(i).padStart(2, '0')}.png`;
    const outPath = path.join(outDir, fileName);
    await el.screenshot({ path: outPath });
    console.log(`Renderizado: ${outPath}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
