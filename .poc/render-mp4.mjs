import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { readFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';

// args: --w 1080 --h 1920 --fps 30 --camz 22 --out .poc/nvestrategia-9x16.mp4
const A = process.argv.slice(2);
const arg = (f, d) => { const i = A.indexOf(f); return i !== -1 ? A[i + 1] : d; };
const W = +arg('--w', 1080), H = +arg('--h', 1920), FPS = +arg('--fps', 30);
const CAMZ = +arg('--camz', 22), OUT = arg('--out', '.poc/nvestrategia-9x16.mp4');
const FRAMEDIR = '.poc/frames';

if (existsSync(FRAMEDIR)) rmSync(FRAMEDIR, { recursive: true });
mkdirSync(FRAMEDIR, { recursive: true });

const file = pathToFileURL(resolve('.poc/nvestrategia-motion.html')).href;
const imgData = readFileSync('.poc/img-b64.txt', 'utf-8');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', m => logs.push(m.text()));
page.on('pageerror', e => logs.push('ERR ' + e.message));
await page.addInitScript((d) => { window.__IMG_DATA__ = d; }, imgData);
await page.addInitScript((z) => { window.__CAMZ = z; }, CAMZ);
await page.goto(file, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true && window.__CYCLE, { timeout: 8000 });

const CYCLE = await page.evaluate(() => window.__CYCLE);
const total = Math.round(CYCLE * FPS);
console.log(`ciclo ${CYCLE.toFixed(2)}s → ${total} frames @ ${FPS}fps  (${W}x${H}, camz ${CAMZ})`);

for (let f = 0; f < total; f++) {
  const t = (f / FPS);
  await page.evaluate(tt => { window.__FORCE_T = tt; }, t);
  await page.waitForTimeout(28);   // garante render do tempo forçado
  await page.screenshot({ path: `${FRAMEDIR}/f${String(f).padStart(4, '0')}.png` });
  if (f % 30 === 0) process.stdout.write(`\r  frame ${f}/${total}`);
}
console.log(`\r  frames ok (${total})            `);
await browser.close();

console.log('→ encodando MP4 com ffmpeg...');
execFileSync('ffmpeg', [
  '-y', '-framerate', String(FPS),
  '-i', `${FRAMEDIR}/f%04d.png`,
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
  '-crf', '18', '-preset', 'medium',
  '-movflags', '+faststart',
  OUT
], { stdio: 'inherit' });

console.log('\n✅ vídeo:', OUT);
console.log('logs build:', logs.slice(0, 2).join(' | '));
