#!/usr/bin/env node
'use strict';

// MarketingOS — Renderer de Reel
//
// Modos:
//   --mode screencast  (padrão) gravar em tempo real via Playwright
//   --mode precise     frame-accurate: clock virtual + loop de screenshot → FFmpeg MP4
//
// Uso:
//   node scripts/render-reel.js --html reel.html --out saida.webm [--duration 30000]
//   node scripts/render-reel.js --html reel.html --out saida.mp4  [--duration 30000] --mode precise [--fps 60]

const path    = require('path');
const fs      = require('fs');
const { spawn }        = require('child_process');
const { chromium }     = require('playwright');

// ── Args ───────────────────────────────────────────────────────────────────

function getArg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : null;
}

const htmlArg    = getArg('html');
const outArg     = getArg('out');
const durationMs = parseInt(getArg('duration') || '30000', 10);
const mode       = getArg('mode') || 'screencast';
const fps        = parseInt(getArg('fps') || (mode === 'precise' ? '30' : '60'), 10);

if (!htmlArg || !outArg) {
  console.error('Uso: node scripts/render-reel.js --html <arquivo.html> --out <saida> [--duration 30000] [--mode screencast|precise] [--fps 60]');
  process.exit(1);
}

const htmlPath = path.resolve(htmlArg);
const outPath  = path.resolve(outArg);
const outDir   = path.dirname(outPath);

if (!fs.existsSync(htmlPath)) {
  console.error(`HTML não encontrado: ${htmlPath}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

// ── GPU flags (ativos em ambos os modos) ───────────────────────────────────

const GPU_ARGS = [
  '--use-gl=angle',               // ANGLE: OpenGL → D3D11 (Win) / Metal (Mac)
  '--enable-gpu',
  '--disable-software-rasterizer',
  '--enable-gpu-rasterization',
];

// ── window.REEL — config global injetado antes do HTML carregar ────────────
//
// Qualquer HTML/JS pode ler:
//   window.REEL.currentTime   → ms desde o início (atualizado frame a frame)
//   window.REEL.currentFrame  → índice do frame (0-based)
//   window.REEL.progress      → 0.0 → 1.0 (currentTime / durationMs)
//   window.REEL.fps           → frames por segundo do render
//   window.REEL.durationMs    → duração total em ms
//   window.REEL.width/height  → resolução do canvas

function makeConfigScript(fps, durationMs, width, height) {
  return `
window.REEL = {
  fps:         ${fps},
  durationMs:  ${durationMs},
  width:       ${width},
  height:      ${height},
  currentTime:  0,
  currentFrame: 0,
  progress:     0,
};
`;
}

// ── Screencast mode ────────────────────────────────────────────────────────

async function renderScreencast() {
  const browser = await chromium.launch({ args: GPU_ARGS });
  const ctx = await browser.newContext({
    viewport:          { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir:  outDir,
      size: { width: 1080, height: 1920 },
    },
  });

  const page = await ctx.newPage();
  await page.addInitScript(makeConfigScript(fps, durationMs, 1080, 1920));
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  console.log('\n   ⏺  Gravando (screencast)...');
  await page.waitForTimeout(durationMs);

  await ctx.close();
  await browser.close();

  const files = fs.readdirSync(outDir).filter(f => f.endsWith('.webm'));
  if (files.length === 0) {
    console.error('\n❌ Nenhum .webm gerado. Verifique o Playwright.');
    process.exit(1);
  }

  const generated = path.join(outDir, files[files.length - 1]);
  if (generated !== outPath) fs.renameSync(generated, outPath);

  console.log(`\n✅ Vídeo salvo: ${outPath}`);
  console.log('\n   Para converter para MP4:');
  console.log(`   ffmpeg -i "${outPath}" -c:v libx264 -pix_fmt yuv420p "${outPath.replace('.webm', '.mp4')}"\n`);
}

// ── Precise mode ───────────────────────────────────────────────────────────
//
// Funciona assim:
//   1. Injeta clock virtual que controla Date.now, performance.now e requestAnimationFrame
//   2. Pausa todas as CSS animations no t=0
//   3. Loop por frame: avança tempo virtual → avança CSS animations → ticks RAF → screenshot → pipe FFmpeg
//   4. FFmpeg monta MP4 diretamente do pipe — sem arquivos temporários

const CLOCK_SCRIPT = `
(() => {
  let __vt = 0;
  window.__advanceTime = (ms) => { __vt += ms; };

  // Sobrescreve APIs de tempo do JS
  Date.now = () => __vt;
  performance.now = () => __vt;

  // Sobrescreve requestAnimationFrame
  const _rafCbs = new Map();
  let _rafId = 1;
  window.requestAnimationFrame = (cb) => {
    const id = _rafId++;
    _rafCbs.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => _rafCbs.delete(id);
  window.__tickRAF = () => {
    const cbs = [..._rafCbs.entries()];
    _rafCbs.clear();
    for (const [, cb] of cbs) cb(__vt);
  };
})();
`;

async function renderPrecise() {
  const frameMs     = 1000 / fps;
  const totalFrames = Math.ceil(durationMs / frameMs);
  const outMp4      = outPath.endsWith('.mp4') ? outPath : outPath.replace(/\.\w+$/, '.mp4');

  // FFmpeg recebe frames JPEG via stdin e entrega MP4
  // JPEG é 3-5x mais rápido que PNG para encodar — qualidade 92% invisível no output final
  const ff = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(fps),
    '-i', 'pipe:0',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    outMp4,
  ]);

  ff.stderr.on('data', () => {}); // silencia output do ffmpeg

  const ffError = new Promise((_, reject) =>
    ff.on('close', code => { if (code !== 0) reject(new Error(`FFmpeg saiu com código ${code}`)); })
  );

  const browser = await chromium.launch({ args: GPU_ARGS });
  const ctx = await browser.newContext({
    viewport:          { width: 1080, height: 1920 },
    deviceScaleFactor: 1,
  });

  const page = await ctx.newPage();

  // REEL config + clock virtual injetados antes de qualquer script da página
  await page.addInitScript(makeConfigScript(fps, durationMs, 1080, 1920));
  await page.addInitScript(CLOCK_SCRIPT);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });

  // Garante fontes carregadas e qualquer init assíncrono da página
  await page.evaluate(() => document.fonts.ready);
  // Se a página sinaliza readiness própria (ex: sampleText), aguardar até 6s
  try {
    await page.waitForFunction(() => window.__REEL_READY !== false, { timeout: 6000 });
  } catch (_) { /* página sem __REEL_READY — ok */ }

  // Pausa todas as CSS animations no instante t=0
  await page.evaluate(() => {
    document.getAnimations().forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  });

  console.log(`\n   ⏺  Renderizando ${totalFrames} frames @ ${fps}fps (sem drift)...`);

  for (let i = 0; i < totalFrames; i++) {
    const t = i * frameMs;

    // Avança clock virtual + CSS animations + RAF callbacks + REEL state
    await page.evaluate(({ vt, fi, total, step }) => {
      if (window.REEL) {
        window.REEL.currentTime  = vt;
        window.REEL.currentFrame = fi;
        window.REEL.progress     = vt / total;
      }
      window.__advanceTime(step);
      document.getAnimations().forEach(a => { a.currentTime = vt; });
      window.__tickRAF && window.__tickRAF();
    }, { vt: t, fi: i, total: durationMs, step: frameMs });

    // Força recálculo de layout antes de capturar
    await page.evaluate(() => document.body.getBoundingClientRect());

    // Captura frame JPEG e envia direto para o FFmpeg
    const frame = await page.screenshot({ type: 'jpeg', quality: 92 });
    ff.stdin.write(frame);

    if (i % 30 === 0 || i === totalFrames - 1) {
      const pct = Math.round(((i + 1) / totalFrames) * 100);
      process.stdout.write(`\r   ⏺  Frame ${i + 1}/${totalFrames} (${pct}%)`);
    }
  }

  ff.stdin.end();
  await Promise.race([
    new Promise(resolve => ff.on('close', resolve)),
    ffError,
  ]);

  await ctx.close();
  await browser.close();

  console.log(`\n\n✅ Vídeo salvo: ${outMp4}\n`);
}

// ── Main ───────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n🎬 MarketingOS — Render de Reel');
  console.log(`   HTML     : ${htmlPath}`);
  console.log(`   Saída    : ${outPath}`);
  console.log(`   Duração  : ${durationMs / 1000}s`);
  console.log(`   Motor    : GPU (ANGLE) + ${mode === 'precise' ? `frame-accurate @ ${fps}fps` : 'screencast'}`);

  if (mode === 'precise') {
    await renderPrecise();
  } else {
    await renderScreencast();
  }
})().catch(err => {
  console.error('\n❌ Erro:', err.message);
  process.exit(1);
});
