'use strict';
const { chromium } = require('playwright');

const PHONE_RE = /(?:\+?55[\s\-]?)?(?:\(?\d{2}\)?[\s\-]?)(?:9\d{4}|\d{4})[\s\-]?\d{4}/g;
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const EMAIL_BLOCK = ['example', 'seusite', 'email@', 'seuemail', 'yourdomain', 'domain.com', 'wixpress'];

function cleanPhone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 13) return null;
  return digits;
}

async function extractContacts(page) {
  const text = await page.evaluate(() => document.body.innerText).catch(() => '');
  const html = await page.content().catch(() => '');

  const emails = [...new Set([
    ...(text.match(EMAIL_RE) || []),
    ...(html.match(EMAIL_RE) || []),
  ])].filter(e => !EMAIL_BLOCK.some(b => e.toLowerCase().includes(b)));

  const rawPhones = [...new Set([...(text.match(PHONE_RE) || [])])];
  const phones = rawPhones.map(cleanPhone).filter(Boolean);

  return { email: emails[0] || null, phones };
}

async function enrichLead(lead, browser) {
  if (!lead.website) return lead;

  const page = await browser.newPage();
  try {
    await page.goto(lead.website, { waitUntil: 'domcontentloaded', timeout: 12000 });

    // Tenta página de contato primeiro
    const contactHref = await page.evaluate(() => {
      const a = [...document.querySelectorAll('a')].find(el =>
        /contato|contact|fale.conosco/i.test(el.textContent + el.href)
      );
      return a?.href || null;
    });

    if (contactHref && contactHref !== page.url()) {
      await page.goto(contactHref, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    }

    const { email, phones } = await extractContacts(page);
    await page.close();
    return { ...lead, email, phones };
  } catch {
    await page.close().catch(() => {});
    return lead;
  }
}

async function enrichLeads(leads) {
  if (!leads.length) return leads;
  console.log(`\n🔎 Enriquecendo ${leads.length} leads...`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const enriched = [];

  for (const lead of leads) {
    process.stdout.write(`  → ${(lead.name || lead.website || '').slice(0, 40).padEnd(42)}`);
    const result = await enrichLead(lead, browser);
    const found = [result.email ? '📧' : '', result.phones?.length ? '📞' : ''].filter(Boolean).join(' ') || '—';
    console.log(found);
    enriched.push(result);
    await new Promise(r => setTimeout(r, 400));
  }

  await browser.close();
  return enriched;
}

module.exports = { enrichLeads };
