#!/usr/bin/env node
/**
 * extract-structure.mjs — MarketingOS / Prova de Conceito L1
 * Extrator ESTRUTURAL: lê o DOM real e mede tokens em vez de inferir a olho.
 * Saída: JSON com design tokens medidos, seções, copy, stack e inventário de imagens.
 *
 * Uso:
 *   node scripts/extract-structure.mjs --url https://itaplay.com.br --out .poc/itaplay.json
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const args = process.argv.slice(2);
const getArg = (f) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : null; };
const url = getArg('--url');
const out = getArg('--out') || '.poc/structure.json';
if (!url) { console.error('Informe --url'); process.exit(1); }

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
console.log('→ abrindo', url);
await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
await page.waitForTimeout(2500);

const title = await page.title();

// ── Extração profunda dentro do browser ──────────────────────────────────────
const data = await page.evaluate(() => {
  const rgbToHex = (rgb) => {
    const m = rgb.match(/\d+/g);
    if (!m) return rgb;
    const [r, g, b, a] = m.map(Number);
    if (a === 0) return null; // transparente, ignorar
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const all = Array.from(document.querySelectorAll('body *')).slice(0, 4000);
  const colorBg = {}, colorText = {}, fonts = {}, sizes = {}, weights = {}, radius = {};

  const bump = (obj, key) => { if (key) obj[key] = (obj[key] || 0) + 1; };

  for (const el of all) {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) continue;
    bump(colorBg, rgbToHex(cs.backgroundColor));
    if (el.textContent && el.textContent.trim().length > 0)
      bump(colorText, rgbToHex(cs.color));
    bump(fonts, cs.fontFamily.split(',')[0].replace(/["']/g, '').trim());
    bump(sizes, Math.round(parseFloat(cs.fontSize)) + 'px');
    bump(weights, cs.fontWeight);
    if (cs.borderRadius && cs.borderRadius !== '0px') bump(radius, cs.borderRadius);
  }

  const top = (obj, n = 8) => Object.entries(obj)
    .sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([k, v]) => ({ value: k, count: v }));

  // Seções estruturais de primeiro nível
  const sectionEls = Array.from(document.querySelectorAll('header, nav, section, footer, main > div, [class*="section"], [class*="hero"], [class*="banner"]')).slice(0, 30);
  const sections = sectionEls.map(s => {
    const r = s.getBoundingClientRect();
    const heads = Array.from(s.querySelectorAll('h1,h2,h3')).slice(0, 4).map(h => h.textContent.trim().slice(0, 120)).filter(Boolean);
    const cta = Array.from(s.querySelectorAll('a,button')).slice(0, 6).map(b => b.textContent.trim().slice(0, 40)).filter(Boolean);
    return {
      tag: s.tagName.toLowerCase(),
      class: (s.className || '').toString().slice(0, 80),
      width: Math.round(r.width), height: Math.round(r.height),
      bg: rgbToHex(getComputedStyle(s).backgroundColor),
      headings: heads, ctas: [...new Set(cta)].slice(0, 4),
    };
  }).filter(s => s.height > 40);

  // Copy: todos os headings
  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).slice(0, 40)
    .map(h => ({ tag: h.tagName.toLowerCase(), text: h.textContent.trim().slice(0, 160) }))
    .filter(h => h.text);

  // Inventário de imagens
  const images = Array.from(document.querySelectorAll('img')).slice(0, 40).map(img => {
    const r = img.getBoundingClientRect();
    return { src: img.currentSrc || img.src, alt: (img.alt || '').slice(0, 60), w: Math.round(r.width), h: Math.round(r.height) };
  }).filter(i => i.src && i.w > 10);

  // Stack
  const scripts = Array.from(document.scripts).map(s => s.src || '');
  const libs = {
    threejs: /three(\.min)?\.js|three@/i, gsap: /gsap/i, lenis: /lenis/i,
    swiper: /swiper/i, jquery: /jquery/i, react: /react(\.|@)/i, nextjs: /_next\//i,
    wordpress: /wp-content|wp-includes/i, elementor: /elementor/i, framer: /framer/i,
    bootstrap: /bootstrap/i, fontawesome: /font-?awesome/i, slick: /slick/i,
  };
  const stack = Object.entries(libs).filter(([, rx]) => scripts.some(s => rx.test(s)) || rx.test(document.documentElement.outerHTML.slice(0, 50000))).map(([k]) => k);

  return {
    palette: { backgrounds: top(colorBg), text: top(colorText) },
    typography: { fonts: top(fonts), sizes: top(sizes, 12), weights: top(weights) },
    radius: top(radius, 5),
    sections, headings, images, stack,
    pageHeight: document.body.scrollHeight,
  };
});

await browser.close();

const result = { url, title, captured_at: new Date().toISOString(), ...data };
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2), 'utf-8');

console.log('\n✅ Estrutura extraída →', out);
console.log('   título:', title);
console.log('   stack:', data.stack.join(', ') || '(nenhuma detectada)');
console.log('   seções:', data.sections.length, '| headings:', data.headings.length, '| imagens:', data.images.length);
console.log('   bg dominante:', data.palette.backgrounds[0]?.value, '| texto:', data.palette.text[0]?.value);
console.log('   fontes:', data.typography.fonts.slice(0, 3).map(f => f.value).join(', '));
