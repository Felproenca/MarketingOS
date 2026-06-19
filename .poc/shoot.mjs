import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { resolve } from 'path';
import { readFileSync } from 'fs';

const file = pathToFileURL(resolve('.poc/nvestrategia-motion.html')).href;
const imgData = readFileSync('.poc/img-b64.txt', 'utf-8');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', m => logs.push(m.text()));
page.on('pageerror', e => logs.push('ERR ' + e.message));
await page.addInitScript((d) => { window.__IMG_DATA__ = d; }, imgData);
await page.goto(file, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__ready === true && window.__CYCLE, { timeout: 8000 }).catch(()=>{});

// tempos absolutos no ciclo (s): ASSEMBLE 2.6 | STAND→4.4 | TOPPLE→6.2 | SHATTER→7.8 | AFTER→9.2
const shots = [
  { name: '1-em-pe',       t: 3.6 },
  { name: '2-tombando',    t: 5.3 },
  { name: '3-estilhacado', t: 7.0 },
  { name: '4-peao-so',     t: 8.6 },
];
for (const s of shots) {
  await page.evaluate(t => { window.__FORCE_T = t; }, s.t);
  await page.waitForTimeout(120);          // deixa 1+ frame renderizar no tempo forçado
  await page.screenshot({ path: `.poc/ato-${s.name}.png` });
}
console.log('logs:', logs.slice(0,3).join(' | '));
await browser.close();
