'use strict';

/**
 * analyzer.js — Playwright analisa site + Instagram de um lead.
 * Retorna diagnóstico estruturado que alimenta qualifier e message-builder.
 */

const { chromium } = require('playwright');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const PHONE_RE  = /(?:\+?55[\s\-]?)?(?:\(?\d{2}\)?[\s\-]?)(?:9\d{4}|\d{4})[\s\-]?\d{4}/g;
const EMAIL_RE  = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const EMAIL_BLOCK = ['example', 'seusite', 'seuemail', 'yourdomain', 'domain.com', 'wixpress'];
const IG_RE     = /instagram\.com\/(?!p\/|reel\/|tv\/|stories\/|explore\/)([a-zA-Z0-9._]{2,30})\/?(?:["'\s?#/]|$)/g;

async function analyze(lead) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ userAgent: UA, locale: 'pt-BR' });

  const analysis = {
    domain:    lead.domain,
    site:      null,
    instagram: null,
    contacts:  { email: null, whatsapp: null, phone: null },
    timestamp: new Date().toISOString(),
  };

  try {
    if (lead.url) {
      analysis.site     = await analyzeSite(context, lead.url);
      analysis.contacts = extractContacts(analysis.site.raw_text, analysis.site.raw_html);
    }

    const igHandle = analysis.site?.instagram_handle || lead.instagram;
    if (igHandle) {
      analysis.instagram = await analyzeInstagram(context, igHandle);
    }
  } finally {
    await browser.close();
  }

  // Propaga contatos para o lead
  lead.email    = analysis.contacts.email    || lead.email    || null;
  lead.whatsapp = analysis.contacts.whatsapp || lead.whatsapp || null;
  lead.phone    = analysis.contacts.phone    || lead.phone    || null;
  lead.instagram = analysis.site?.instagram_handle || lead.instagram || null;

  return analysis;
}

async function analyzeSite(context, url) {
  const page = await context.newPage();
  const result = {
    url,
    loads:            false,
    has_cta:          false,
    has_whatsapp:     false,
    has_form:         false,
    has_team_photo:   false,
    headline:         '',
    meta_description: '',
    instagram_handle: null,
    raw_text:         '',
    raw_html:         '',
    problems:         [],
  };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    result.loads = true;

    result.headline = await page.$eval('h1', el => el.textContent.trim()).catch(() => '');

    result.meta_description = await page.$eval(
      'meta[name="description"]',
      el => el.getAttribute('content') || ''
    ).catch(() => '');

    result.raw_text = await page.evaluate(
      () => document.body.innerText.substring(0, 5000)
    ).catch(() => '');

    result.raw_html = await page.content().catch(() => '');

    result.has_cta = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return /agendar|fale conosco|entre em contato|solicitar|quero|reservar|contratar/.test(text);
    }).catch(() => false);

    result.has_whatsapp = await page.evaluate(() => {
      return [...document.querySelectorAll('a[href]')]
        .some(l => /wa\.me|whatsapp\.com|api\.whatsapp/.test(l.href));
    }).catch(() => false);

    result.has_form = await page.$('form').then(f => !!f).catch(() => false);

    result.has_team_photo = await page.evaluate(() => {
      return [...document.querySelectorAll('img')]
        .map(i => (i.alt || '').toLowerCase())
        .some(a => /equipe|time|team|doutor|médico|dr\.|staff|sócio|fundador/.test(a));
    }).catch(() => false);

    // Instagram handle no site
    IG_RE.lastIndex = 0;
    const igMatch = IG_RE.exec(result.raw_html);
    if (igMatch) {
      const handle = igMatch[1];
      const SKIP = /^(instagram|accounts|reels?|explore|p|tv|stories|shoppingbag|marketingforbusiness|business)$/i;
      if (!SKIP.test(handle)) result.instagram_handle = handle;
    }

    result.problems = identifySiteProblems(result);

  } catch {
    result.loads = false;
    result.problems = ['site_offline_ou_lento'];
  }

  await page.close();
  return result;
}

async function analyzeInstagram(context, handle) {
  const page = await context.newPage();
  const result = {
    handle,
    accessible:   false,
    has_bio_link: false,
    has_cta_bio:  false,
    problems:     [],
  };

  try {
    await page.goto(`https://www.instagram.com/${handle}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Instagram bloqueia scrapers — se redirecionar para login, registrar e sair
    const currentUrl = page.url();
    if (currentUrl.includes('/accounts/login')) {
      result.problems.push('instagram_requer_login');
      await page.close();
      return result;
    }

    result.accessible = true;

    const pageText = await page.evaluate(
      () => document.body.innerText.toLowerCase()
    ).catch(() => '');

    result.has_bio_link = await page.$$('a[rel*="nofollow"]')
      .then(els => els.length > 0).catch(() => false);

    result.has_cta_bio = /whatsapp|agende|clique|link|bio|contato/.test(pageText);

    result.problems = identifyInstagramProblems(result);

  } catch {
    result.problems.push('instagram_nao_analisado');
  }

  await page.close();
  return result;
}

function identifySiteProblems(site) {
  const problems = [];

  if (!site.loads)          problems.push('site_offline');
  if (!site.has_cta)        problems.push('sem_cta_visivel');
  if (!site.has_whatsapp)   problems.push('sem_whatsapp');
  if (!site.has_form)       problems.push('sem_formulario');
  if (!site.has_team_photo) problems.push('sem_rosto_humano');

  const genericHeadlines = ['bem-vindo', 'welcome', 'home', 'início', 'melhor', 'qualidade', 'excelência'];
  if (genericHeadlines.some(g => site.headline.toLowerCase().includes(g))) {
    problems.push('headline_generica');
  }

  if (!site.meta_description || site.meta_description.length < 30) {
    problems.push('seo_fraco');
  }

  return problems;
}

function identifyInstagramProblems(ig) {
  const problems = [];
  if (!ig.accessible)   problems.push('instagram_privado');
  if (!ig.has_bio_link) problems.push('sem_link_na_bio');
  if (!ig.has_cta_bio)  problems.push('bio_sem_cta');
  return problems;
}

function extractContacts(text = '', html = '') {
  const contacts = { email: null, whatsapp: null, phone: null };

  // Email
  const allEmails = [
    ...(text.match(EMAIL_RE) || []),
    ...(html.match(EMAIL_RE) || []),
  ].filter(e => !EMAIL_BLOCK.some(b => e.toLowerCase().includes(b)));
  contacts.email = allEmails[0] || null;

  // WhatsApp do href
  const waMatch = html.match(/wa\.me\/(\d{10,13})/);
  if (waMatch) contacts.whatsapp = waMatch[1];

  // Telefone brasileiro
  const phoneMatches = [...new Set(text.match(PHONE_RE) || [])];
  if (phoneMatches.length) {
    const digits = phoneMatches[0].replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) contacts.phone = digits;
  }

  return contacts;
}

module.exports = { analyze };
