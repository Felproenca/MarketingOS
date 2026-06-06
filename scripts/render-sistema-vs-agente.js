#!/usr/bin/env node
'use strict';

// Render dedicado: carousel-sistema-vs-agente.html → 7 PNGs 1080×1080
// Uso: node scripts/render-sistema-vs-agente.js

const path = require('path');
const fs   = require('fs');
const { chromium } = require('playwright');

const HTML   = path.resolve(__dirname, '../clients/felipe-proenca/outputs/carousels/carousel-sistema-vs-agente.html');
const OUTDIR = path.resolve(__dirname, '../clients/felipe-proenca/outputs/carousels/sistema-vs-agente-slides');
const SLIDES = 7;

fs.mkdirSync(OUTDIR, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx     = await browser.newContext({
    viewport:         { width: 540, height: 540 },
    deviceScaleFactor: 2,                          // → 1080×1080 real
  });
  const page = await ctx.newPage();

  await page.goto(`file://${HTML}`, { waitUntil: 'networkidle' });

  // aguarda canvas inicializar
  await page.waitForTimeout(600);

  for (let i = 1; i <= SLIDES; i++) {
    // navega para o slide via JS
    await page.evaluate(n => window.goTo(n - 1), i);
    await page.waitForTimeout(500); // animação de transição

    const el  = page.locator(`#slide-${i}`).first();
    const out = path.join(OUTDIR, `slide-${String(i).padStart(2, '0')}.png`);
    await el.screenshot({ path: out });
    console.log(`✓ slide-${String(i).padStart(2, '0')}.png`);
  }

  await browser.close();
  console.log(`\n${SLIDES} slides em: ${OUTDIR}`);
})().catch(err => { console.error(err.message); process.exit(1); });
