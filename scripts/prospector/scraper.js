'use strict';
const { chromium } = require('playwright');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapeGoogleMaps(query, city, maxResults = 30) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'pt-BR' });
  const page = await ctx.newPage();

  const term = `${query} ${city}`;
  console.log(`\n🗺️  Google Maps: "${term}"`);

  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(term)}`, {
    waitUntil: 'networkidle',
    timeout: 30000,
  });

  // Aceita cookies se aparecer
  const cookieBtn = page.locator('button[aria-label*="Aceitar"], button[aria-label*="Accept"]');
  if (await cookieBtn.count() > 0) await cookieBtn.first().click();

  await page.waitForSelector('[role="feed"]', { timeout: 15000 }).catch(() => {});

  const leads = [];
  const seen = new Set();

  for (let round = 0; round < 25 && leads.length < maxResults; round++) {
    const links = await page.$$('[role="feed"] a[href*="/maps/place/"]');

    for (const link of links) {
      if (leads.length >= maxResults) break;
      const href = await link.getAttribute('href').catch(() => null);
      if (!href || seen.has(href)) continue;
      seen.add(href);

      await link.click();
      await delay(1800);

      const lead = await page.evaluate(() => {
        const txt = sel => document.querySelector(sel)?.textContent?.trim() || null;
        const attr = (sel, a) => document.querySelector(sel)?.getAttribute(a) || null;

        // Telefone: botão com data-item-id="phone:..."
        let phone = null;
        document.querySelectorAll('[data-item-id^="phone:"]').forEach(el => {
          if (!phone) phone = el.getAttribute('data-item-id').replace('phone:', '');
        });

        // Site
        let website = null;
        document.querySelectorAll('a[data-item-id="authority"]').forEach(el => {
          if (!website) website = el.getAttribute('href');
        });

        return {
          name: txt('h1.DUwDvf') || txt('h1[data-attrid="title"]'),
          phone,
          website,
          address: txt('button[data-item-id="address"]') || txt('[data-tooltip="Copiar endereço"]'),
          rating: txt('.F7nice > span[aria-hidden="true"]'),
          category: txt('button.DkEaL'),
          source: 'google-maps',
        };
      });

      if (lead.name) {
        leads.push(lead);
        const flags = [lead.phone ? '📞' : '', lead.website ? '🌐' : ''].filter(Boolean).join('');
        console.log(`  ✓ ${lead.name} ${flags}`);
      }
    }

    // Scroll do painel de resultados
    const moved = await page.evaluate(() => {
      const feed = document.querySelector('[role="feed"]');
      if (!feed) return false;
      const prev = feed.scrollTop;
      feed.scrollTop += 900;
      return feed.scrollTop !== prev;
    });

    if (!moved && round > 2) break;
    await delay(700);
  }

  await browser.close();
  return leads;
}

async function scrapeGoogleSearch(query, city, maxResults = 20) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'pt-BR' });
  const page = await ctx.newPage();

  const term = `${query} ${city}`;
  console.log(`\n🔍 Google Search: "${term}"`);

  const leads = [];
  let start = 0;

  while (leads.length < maxResults) {
    await page.goto(
      `https://www.google.com/search?q=${encodeURIComponent(term + ' contato')}&start=${start}&hl=pt-BR`,
      { waitUntil: 'domcontentloaded', timeout: 20000 }
    );

    const results = await page.evaluate(() => {
      const SKIP = ['google.', 'youtube.', 'facebook.', 'instagram.', 'twitter.', 'linkedin.', 'wikipedia.'];
      const items = [];
      document.querySelectorAll('#search .g a[href^="http"]').forEach(a => {
        const url = a.getAttribute('href');
        if (SKIP.some(s => url.includes(s))) return;
        const title = a.closest('.g')?.querySelector('h3')?.textContent?.trim() || '';
        const snippet = a.closest('.g')?.querySelector('.VwiC3b')?.textContent?.trim() || '';
        if (title && url) items.push({ name: title, website: url, snippet, source: 'google-search' });
      });
      return [...new Map(items.map(i => [i.website, i])).values()];
    });

    leads.push(...results);

    const hasNext = await page.$('#pnnext');
    if (!hasNext || leads.length >= maxResults) break;
    start += 10;
    await delay(1200);
  }

  await browser.close();
  return leads.slice(0, maxResults);
}

module.exports = { scrapeGoogleMaps, scrapeGoogleSearch };
