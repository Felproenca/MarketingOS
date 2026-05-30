'use strict';

const { chromium } = require('playwright');

// Tenta extrair a cor primária de elementos comuns
async function extractPrimaryColor(page) {
  return page.evaluate(() => {
    // 1. meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta?.content && meta.content !== '#ffffff' && meta.content !== '#000000') {
      return meta.content;
    }

    // 2. Cor de fundo de header, nav, ou botão principal
    const candidates = [
      'header', 'nav', '.header', '#header',
      'button[type="submit"]', '.btn-primary', '.btn',
      'a.button', '[class*="primary"]',
    ];
    for (const sel of candidates) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const bg = getComputedStyle(el).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' && bg !== 'rgb(255, 255, 255)') {
        return bg;
      }
    }

    // 3. Cor de links
    const link = document.querySelector('a');
    if (link) {
      const c = getComputedStyle(link).color;
      if (c && c !== 'rgb(0, 0, 0)' && c !== 'rgb(255, 255, 255)') return c;
    }

    return null;
  });
}

// Converte rgb(...) para hex
function rgbToHex(rgb) {
  if (!rgb) return null;
  if (rgb.startsWith('#')) return rgb;
  const match = rgb.match(/\d+/g);
  if (!match || match.length < 3) return null;
  const [r, g, b] = match.map(Number);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Rejeita cores muito claras (luminância > 0.55) ou muito neutras (quase preto/branco)
function isColorUnusable(hex) {
  if (!hex || hex.length < 7) return true;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Muito claro (branco, off-white, bege) ou muito escuro (quase preto)
  if (lum > 0.55 || lum < 0.08) return true;
  // Muito dessaturada (cinza)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  if (saturation < 0.2) return true;
  return false;
}

// Tenta encontrar URL do logo
async function extractLogoUrl(page, baseUrl) {
  return page.evaluate((base) => {
    const selectors = [
      'img[src*="logo"]', 'img[alt*="logo"]', 'img[alt*="Logo"]',
      'header img', '.logo img', '#logo img',
      'nav img', '.navbar-brand img',
      'a[href="/"] img',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el?.src && !el.src.includes('data:')) {
        try { return new URL(el.src, base).href; } catch { continue; }
      }
    }
    // SVG logo
    const svg = document.querySelector('header svg, .logo svg, nav svg');
    if (svg) return null; // SVG inline — não extraível como URL

    return null;
  }, baseUrl);
}

// Extrai nome do negócio do título ou h1
async function extractName(page) {
  return page.evaluate(() => {
    // og:site_name primeiro
    const og = document.querySelector('meta[property="og:site_name"]');
    if (og?.content) return og.content.trim();

    // título da página (sem sufixo)
    const title = document.title?.split(/[-|–|•]/)[0].trim();
    if (title && title.length < 60) return title;

    // h1
    const h1 = document.querySelector('h1');
    if (h1?.textContent) return h1.textContent.trim().slice(0, 50);

    return null;
  });
}

async function extractBrand(websiteUrl) {
  if (!websiteUrl || !/^https?:\/\//i.test(websiteUrl)) {
    return { name: null, color: '#2563eb', logoUrl: null, extracted: false };
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const [name, rawColor, logoUrl] = await Promise.all([
      extractName(page),
      extractPrimaryColor(page),
      extractLogoUrl(page, websiteUrl),
    ]);

    const hexColor = rgbToHex(rawColor);
    const color = (!hexColor || isColorUnusable(hexColor)) ? '#2563eb' : hexColor;

    return { name, color, logoUrl, extracted: true };
  } catch (err) {
    return { name: null, color: '#2563eb', logoUrl: null, extracted: false, error: err.message };
  } finally {
    await browser.close();
  }
}

module.exports = { extractBrand };
