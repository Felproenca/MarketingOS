'use strict';

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TEMPLATE_DIR = path.join(__dirname, 'templates');

// Gera HTML preenchido com dados da marca
function buildHtml(segment, brand) {
  const templateFile = path.join(TEMPLATE_DIR, `${segment}.html`);
  if (!fs.existsSync(templateFile)) {
    throw new Error(`Template não encontrado: ${segment}.html`);
  }

  let html = fs.readFileSync(templateFile, 'utf8');
  const name = brand.name || 'Sua Empresa';
  const color = brand.color || '#2563eb';
  const logoTag = brand.logoUrl
    ? `<img src="${brand.logoUrl}" alt="${name}" />`
    : '';

  html = html.replace(/\{\{NAME\}\}/g, name);
  html = html.replace(/\{\{COLOR\}\}/g, color);
  html = html.replace(/\{\{LOGO_TAG\}\}/g, logoTag);

  return html;
}

// Renderiza o HTML (3 slides lado a lado) e salva 3 PNGs separados
async function renderDemo(html, outputDir, prefix) {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Viewport: 3 slides de 1080px cada
  await page.setViewportSize({ width: 3240, height: 1080 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const files = [];
  for (let i = 0; i < 3; i++) {
    const outPath = path.join(outputDir, `${prefix}-slide-${i + 1}.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: i * 1080, y: 0, width: 1080, height: 1080 },
    });
    files.push(outPath);
  }

  await browser.close();
  return files;
}

async function generateDemo(segment, brand, outputDir, prefix) {
  const html = buildHtml(segment, brand);
  return renderDemo(html, outputDir, prefix);
}

module.exports = { generateDemo };
