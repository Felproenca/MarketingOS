#!/usr/bin/env node
/**
 * capture-reference.js — MarketingOS
 * Captura automática de referências visuais via Playwright.
 * Curadoria é o motor. Este script só acelera.
 *
 * Uso:
 *   node scripts/capture-reference.js --url https://linear.app
 *   node scripts/capture-reference.js --url https://stripe.com --video
 *   node scripts/capture-reference.js --url https://awwwards.com/... --client pontos-cardeais
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Config ────────────────────────────────────────────────────────────────────

const SCREENSHOTS_DIR = join(ROOT, 'intelligence/visual-references/screenshots');
const VIDEOS_DIR      = join(ROOT, 'intelligence/visual-references/videos');
const REFS_FILE       = join(ROOT, 'intelligence/visual-references.json');

const VIEWPORT = { width: 1440, height: 900 };
const SCROLL_DURATION_MS = 4000;
const VIDEO_DURATION_MS  = 8000;

// ── Args ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const url      = getArg('--url');
const client   = getArg('--client') || '';
const category = getArg('--category') || '';
const notes    = getArg('--notes') || '';
const captureVideo = hasFlag('--video');

if (!url) {
  console.error('❌  Informe a URL: node scripts/capture-reference.js --url <url>');
  process.exit(1);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureDirs() {
  [SCREENSHOTS_DIR, VIDEOS_DIR].forEach(d => {
    if (!existsSync(d)) mkdirSync(d, { recursive: true });
  });
}

function nextRefId() {
  try {
    const data = JSON.parse(readFileSync(REFS_FILE, 'utf-8'));
    const refs = data.references || [];
    if (refs.length === 0) return 'ref-001';
    const last = refs[refs.length - 1].reference_id || 'ref-000';
    const n = parseInt(last.replace('ref-', ''), 10) + 1;
    return `ref-${String(n).padStart(3, '0')}`;
  } catch {
    return 'ref-001';
  }
}

function detectStack(page) {
  return page.evaluate(() => {
    const scripts = Array.from(document.scripts).map(s => s.src || '');
    const detected = [];
    const checks = {
      'threejs':      s => /three(\.min)?\.js|three@/i.test(s),
      'gsap':         s => /gsap(\.min)?\.js|gsap@/i.test(s),
      'lenis':        s => /lenis/i.test(s),
      'barba':        s => /barba/i.test(s),
      'scrolltrigger':s => /ScrollTrigger/i.test(s),
      'react':        s => /react(\.min)?\.js|react@/i.test(s),
      'nextjs':       s => /_next\/static/i.test(s),
      'webgl':        () => !!document.querySelector('canvas'),
      'pixi':         s => /pixi(\.min)?\.js/i.test(s),
      'p5':           s => /p5(\.min)?\.js/i.test(s),
    };
    for (const [lib, fn] of Object.entries(checks)) {
      if (scripts.some(fn) || fn('')) detected.push(lib);
    }
    return [...new Set(detected)];
  });
}

async function scrollPage(page) {
  await page.evaluate(async (duration) => {
    await new Promise(resolve => {
      const start = performance.now();
      const height = document.body.scrollHeight - window.innerHeight;
      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        window.scrollTo(0, height * progress);
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }, SCROLL_DURATION_MS);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function capture() {
  ensureDirs();

  const refId = nextRefId();
  const screenshotPath = join(SCREENSHOTS_DIR, `${refId}.png`);
  const videoPath      = join(VIDEOS_DIR, `${refId}.webm`);

  console.log(`\n📸  MarketingOS — Captura de Referência`);
  console.log(`    ID:  ${refId}`);
  console.log(`    URL: ${url}\n`);

  const browser = await chromium.launch({ headless: true });

  let captureStatus = 'failed';
  let stackDetected = [];
  let title = '';

  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...(captureVideo ? {
        recordVideo: { dir: VIDEOS_DIR, size: { width: 1440, height: 900 } }
      } : {})
    });

    const page = await context.newPage();

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    title = await page.title();
    stackDetected = await detectStack(page);

    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });

    console.log(`✅  Screenshot salvo: ${screenshotPath}`);

    if (captureVideo) {
      console.log(`🎬  Gravando scroll (${VIDEO_DURATION_MS / 1000}s)...`);
      await scrollPage(page);
      await page.waitForTimeout(VIDEO_DURATION_MS - SCROLL_DURATION_MS);
    }

    await context.close();
    captureStatus = 'auto';

    if (captureVideo) {
      console.log(`✅  Vídeo salvo: ${videoPath}`);
    }

  } catch (err) {
    console.warn(`⚠️   Captura automática falhou: ${err.message}`);
    console.warn(`    Marcar como manual. Adicione screenshot manualmente em:`);
    console.warn(`    ${screenshotPath}`);
    captureStatus = 'failed';
  } finally {
    await browser.close();
  }

  const now = new Date().toISOString().split('T')[0];

  const refObject = {
    reference_id: refId,
    title: title || url,
    source: 'operator',
    category: category || '⚠️ PREENCHER',
    url,
    screenshot: captureStatus !== 'failed'
      ? `intelligence/visual-references/screenshots/${refId}.png`
      : '⚠️ CAPTURA MANUAL NECESSÁRIA',
    video_capture: captureVideo && captureStatus !== 'failed'
      ? `intelligence/visual-references/videos/${refId}.webm`
      : '',
    stack: stackDetected,
    stack_confidence: stackDetected.length > 0 ? 'detected' : 'inferred',
    visual_tags: ['⚠️ PREENCHER'],
    motion_tags: ['⚠️ PREENCHER'],
    interaction_tags: ['⚠️ PREENCHER'],
    industry: ['⚠️ PREENCHER'],
    best_for: ['⚠️ PREENCHER'],
    taxonomy: {
      tension_tags: ['⚠️ PREENCHER'],
      tempo: '⚠️ PREENCHER',
      densidade: '⚠️ PREENCHER',
      movimento: '⚠️ PREENCHER',
      profundidade: '⚠️ PREENCHER',
      emoção: ['⚠️ PREENCHER']
    },
    tension: '⚠️ OBRIGATÓRIO — sem tensão a referência não entra',
    why_it_matches: ['⚠️ PREENCHER'],
    what_to_steal: ['⚠️ PREENCHER'],
    what_not_to_copy: ['paleta', 'layout', 'copy', 'composição literal'],
    components: {
      motion: '⚠️ PREENCHER',
      '3d': '',
      scroll: '⚠️ PREENCHER',
      interaction: '⚠️ PREENCHER',
      typography: '⚠️ PREENCHER',
      color_behavior: '⚠️ PREENCHER'
    },
    transferable_principle: '⚠️ OBRIGATÓRIO — princípio abstrato transferível',
    capture_status: captureStatus,
    added_by: 'operator',
    added_at: now,
    client: client || '',
    notes: notes || '',
    used_in: [],
    performance_notes: ''
  };

  try {
    const data = JSON.parse(readFileSync(REFS_FILE, 'utf-8'));
    data.references = data.references || [];
    data.references.push(refObject);
    writeFileSync(REFS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n✅  Referência ${refId} inserida em visual-references.json`);
  } catch (err) {
    console.error(`❌  Erro ao inserir no banco: ${err.message}`);
    const fallback = join(ROOT, `intelligence/visual-references/${refId}-pending.json`);
    writeFileSync(fallback, JSON.stringify(refObject, null, 2), 'utf-8');
    console.warn(`    Salvo como pendente: ${fallback}`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋  PRÓXIMO PASSO — interpretar a referência
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use a skill-save-reference.md para interpretar:

  url: ${url}
  reference_id: ${refId}
  stack detectado: ${stackDetected.join(', ') || 'nenhum detectado — inferir visualmente'}
  capture_status: ${captureStatus}

Campos obrigatórios a preencher:
  → tension
  → transferable_principle
  → what_to_steal
  → why_it_matches

Referência não entra crua. Entra interpretada.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

capture().catch(err => {
  console.error('❌  Erro fatal:', err);
  process.exit(1);
});
