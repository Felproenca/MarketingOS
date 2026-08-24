#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

const input = args(process.argv.slice(2));
const html = input.html && path.resolve(input.html);
const outDir = input.out && path.resolve(input.out);
const count = Number(input.slides || 8);
if (!html || !outDir || !fs.existsSync(html)) throw new Error('Uso: node scripts/render-commercial-carousel.js --html <arquivo> --out <pasta> --slides <n>');
fs.mkdirSync(outDir, { recursive: true });

const commercialCss = `
  :root { --ink:#171412; --paper:#f5efe7; --wine:#7e3f35; --gold:#c09a62; --quiet:#786d64; }
  body { margin:0!important; padding:0!important; display:block!important; background:#d8d0c8!important; color:var(--ink)!important; font-family: Inter, Arial, sans-serif!important; }
  .slide { width:1080px!important; height:1350px!important; margin:0!important; padding:92px!important; border:0!important; border-radius:0!important; display:flex!important; flex-direction:column!important; justify-content:flex-end!important; align-items:flex-start!important; gap:24px!important; position:relative!important; overflow:hidden!important; isolation:isolate!important; background:var(--paper)!important; color:var(--ink)!important; }
  .slide::after { content:""!important; position:absolute!important; inset:0!important; z-index:-1!important; pointer-events:none!important; opacity:1!important; background:radial-gradient(circle at 100% 0%, rgba(192,154,98,.25), transparent 34%), linear-gradient(135deg, transparent 0 65%, rgba(126,63,53,.08) 65% 66%, transparent 66%)!important; mask-image:none!important; }
  .slide::before { content:""!important; position:absolute!important; top:0!important; left:92px!important; width:116px!important; height:8px!important; background:var(--wine)!important; z-index:2!important; }
  .commercial-stage { position:absolute; z-index:-1; right:-120px; top:88px; width:610px; height:610px; border-radius:50%; border:1px solid rgba(126,63,53,.3); transform:rotate(-18deg); }
  .commercial-stage::before,.commercial-stage::after { content:""; position:absolute; border:1px solid rgba(192,154,98,.4); border-radius:50%; }
  .commercial-stage::before { inset:70px; }
  .commercial-stage::after { width:18px; height:18px; background:var(--wine); border:0; top:170px; left:130px; box-shadow:0 0 0 14px rgba(126,63,53,.08), 0 0 40px rgba(126,63,53,.28); }
  .commercial-rail { position:absolute; left:92px; top:92px; bottom:92px; width:2px; background:rgba(126,63,53,.16); }
  .commercial-rail span { position:absolute; left:-4px; width:10px; height:10px; border-radius:50%; background:var(--gold); }
  .commercial-rail span:nth-child(1){top:0}.commercial-rail span:nth-child(2){top:33%}.commercial-rail span:nth-child(3){top:66%}.commercial-rail span:nth-child(4){bottom:0;background:var(--wine)}
  .commercial-label { position:absolute; top:86px; left:136px; color:var(--wine); font-size:17px; font-weight:700; letter-spacing:.24em; text-transform:uppercase; }
  .motif-label { display:none!important; }
  .index { position:relative!important; margin:0!important; color:var(--wine)!important; font:700 24px/1 Inter,Arial,sans-serif!important; letter-spacing:.08em!important; }
  .role { position:relative!important; margin:0!important; color:var(--quiet)!important; font:700 16px/1 Inter,Arial,sans-serif!important; letter-spacing:.22em!important; text-transform:uppercase!important; }
  h1 { position:relative!important; margin:0!important; max-width:790px!important; color:var(--ink)!important; font:800 76px/.96 Inter,Arial,sans-serif!important; letter-spacing:-.045em!important; text-wrap:balance!important; }
  p { position:relative!important; margin:0!important; max-width:700px!important; color:var(--quiet)!important; font:400 31px/1.28 Inter,Arial,sans-serif!important; letter-spacing:-.01em!important; }
  .slide-gancho { justify-content:flex-end!important; background:linear-gradient(135deg,#211916,#38231f 58%,#7e3f35)!important; color:#fbf7f1!important; }
  .slide-gancho::before { background:var(--gold)!important; }
  .slide-gancho::after { background:radial-gradient(circle at 82% 18%,rgba(192,154,98,.5),transparent 25%), linear-gradient(135deg,transparent 0 58%,rgba(255,255,255,.07) 58% 59%,transparent 59%)!important; }
  .slide-gancho h1 { max-width:900px!important; color:#fbf7f1!important; font-size:122px!important; line-height:.9!important; }
  .slide-gancho p { color:#ead9c8!important; font-size:34px!important; max-width:660px!important; }
  .slide-gancho .index { color:var(--gold)!important; }
  .slide-gancho .role { color:#e3c8a7!important; }
  .slide-virada h1 { max-width:690px!important; font-size:92px!important; }
  .slide-diagnostico h1 { max-width:680px!important; }
  .slide-processo { background:#e9e0d5!important; }
  .slide-processo::after { background:linear-gradient(90deg,transparent 0 57%,rgba(126,63,53,.12) 57% 100%)!important; }
  .slide-orientacao { background:#f1eadf!important; }
  .slide-marca { background:#2b2421!important; }
  .slide-marca h1 { color:#fbf7f1!important; }
  .slide-marca p { color:#ddcabe!important; }
  .slide-marca .index,.slide-marca .role { color:#d9ae72!important; }
  .slide-cta { background:#7e3f35!important; }
  .slide-cta h1,.slide-cta p { color:#fff8ef!important; }
  .slide-cta .index,.slide-cta .role { color:#f0c991!important; }
  .slide-cta::after { background:radial-gradient(circle at 92% 12%,rgba(240,201,145,.38),transparent 31%),linear-gradient(135deg,transparent 0 62%,rgba(0,0,0,.16) 62% 63%,transparent 63%)!important; }
  .commercial-footer { position:absolute; left:92px; right:92px; bottom:54px; display:flex; justify-content:space-between; color:rgba(126,63,53,.62); font:600 13px/1 Inter,Arial,sans-serif; letter-spacing:.15em; text-transform:uppercase; }
`;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  await page.goto(`file://${html.replaceAll('\\', '/')}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: commercialCss });
  await page.evaluate((total) => {
    document.querySelectorAll('.slide').forEach((slide, index) => {
      const stage = document.createElement('div'); stage.className = 'commercial-stage'; slide.prepend(stage);
      const rail = document.createElement('div'); rail.className = 'commercial-rail'; rail.innerHTML = '<span></span><span></span><span></span><span></span>'; slide.prepend(rail);
      const label = document.createElement('div'); label.className = 'commercial-label'; label.textContent = index === 0 ? 'a pergunta antes da promessa' : ['leitura','reframe','critério','método','regra','posicionamento','próximo passo'][index - 1] || 'clareza'; slide.prepend(label);
      const footer = document.createElement('div'); footer.className = 'commercial-footer'; footer.innerHTML = `<span>conteúdo editorial</span><span>${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>`; slide.append(footer);
    });
  }, count);
  const slides = await page.locator('.slide').count();
  if (slides < 1) throw new Error('Nenhum slide encontrado.');
  const qa = [];
  for (let i = 1; i <= Math.min(count, slides); i += 1) {
    const locator = page.locator(`#slide-${i}`).first();
    const metrics = await locator.evaluate((el) => {
      const box = el.getBoundingClientRect();
      const content = [...el.querySelectorAll('h1,p')].map(node => node.getBoundingClientRect());
      return { width: el.clientWidth, height: el.clientHeight, overflowX: content.some(item => item.left < box.left || item.right > box.right), overflowY: content.some(item => item.top < box.top || item.bottom > box.bottom), title: el.querySelector('h1')?.textContent?.trim() || '' };
    });
    const file = path.join(outDir, `slide-${String(i).padStart(2, '0')}.png`);
    await locator.screenshot({ path: file });
    qa.push({ slide: i, ...metrics, file });
  }
  const result = { renderer: 'commercial-editorial-v1', format: '1080x1350', slides: qa.length, qa: { status: qa.every(item => item.width === 1080 && item.height === 1350 && !item.overflowX && !item.overflowY) ? 'passed' : 'failed', checks: qa } };
  fs.writeFileSync(path.join(outDir, '..', 'commercial-render-qa.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((error) => { console.error(error.message); process.exit(1); });
