import { chromium } from 'playwright';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('https://itaplay.com.br', { waitUntil: 'networkidle', timeout: 45000 });
await p.waitForTimeout(2000);
await p.screenshot({ path: '.poc/itaplay-hero.png' });          // dobra
await p.screenshot({ path: '.poc/itaplay-full.png', fullPage: true });
await b.close();
console.log('screenshots ok');
