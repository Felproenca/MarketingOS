'use strict';

/**
 * enrichment-website.js — Etapa 3 (WebsiteEnrichmentModule).
 *
 * Scraping do site institucional (se existir, via URL do Places/GMB). Extrai
 * só o que a própria empresa publicou intencionalmente para contato — nunca
 * perfil pessoal, nunca grupo fechado (ver niche_profile.compliance).
 *
 * Respeita robots.txt por padrão (niche_profile.enrichment.respect_robots_txt).
 */

const { chromium } = require('playwright');
const { extractCnpjCandidates } = require('./enrichment-cnpj');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 MarketingOS-DiscoveryEngine/1.0';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const EMAIL_BLOCK = ['example', 'seusite', 'seuemail', 'yourdomain', 'domain.com', 'wixpress', 'sentry'];
const SOCIAL_DOMAINS = {
  instagram: /instagram\.com\/(?!p\/|reel\/|explore\/)([a-zA-Z0-9._]{2,30})/,
  linkedin: /linkedin\.com\/(company|in)\/([a-zA-Z0-9\-_%]{2,60})/,
  facebook: /facebook\.com\/(?!sharer|share)([a-zA-Z0-9.\-]{2,60})/,
};

/**
 * Checa /robots.txt do domínio e diz se o path alvo (default "/") é permitido
 * pro nosso user-agent (regra geral "*" — não temos entrada nomeada em nenhum
 * robots.txt real, então seguimos a diretiva genérica).
 */
async function isAllowedByRobots(baseUrl, path = '/') {
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).toString();
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return true; // sem robots.txt = sem restrição declarada
    const text = await res.text();
    return !isDisallowed(text, path);
  } catch {
    return true; // falha ao buscar robots.txt não deve travar o pipeline
  }
}

function isDisallowed(robotsTxt, path) {
  const lines = robotsTxt.split('\n').map((l) => l.trim());
  let applies = false;
  for (const line of lines) {
    if (/^user-agent:\s*\*/i.test(line)) { applies = true; continue; }
    if (/^user-agent:/i.test(line)) { applies = false; continue; }
    if (!applies) continue;
    const disallow = line.match(/^disallow:\s*(.*)$/i);
    if (disallow && disallow[1] && path.startsWith(disallow[1])) return true;
  }
  return false;
}

/**
 * enrich(websiteUrl, { respectRobots, timeoutSeconds }) → {
 *   whatsapp_business_link, email_institucional, formulario_contato,
 *   redes_sociais_linkadas, cnpj_candidates, blocked_by_robots
 * }
 */
async function enrich(websiteUrl, { respectRobots = true, timeoutSeconds = 10 } = {}) {
  const result = {
    whatsapp_business_link: null,
    email_institucional: null,
    formulario_contato: false,
    redes_sociais_linkadas: {},
    cnpj_candidates: [],
    blocked_by_robots: false,
    error: null,
  };

  if (!websiteUrl) return result;

  if (respectRobots) {
    const allowed = await isAllowedByRobots(websiteUrl, '/');
    if (!allowed) {
      result.blocked_by_robots = true;
      return result;
    }
  }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ userAgent: UA, locale: 'pt-BR' });
    const page = await context.newPage();

    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: timeoutSeconds * 1000 });

    const html = await page.content().catch(() => '');
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');

    // WhatsApp Business publicado
    const waMatch = html.match(/(?:wa\.me|api\.whatsapp\.com\/send)\/?(?:\?phone=)?(\d{10,13})/);
    if (waMatch) result.whatsapp_business_link = `https://wa.me/${waMatch[1]}`;

    // E-mail institucional
    const emails = [...(text.match(EMAIL_RE) || []), ...(html.match(EMAIL_RE) || [])]
      .filter((e) => !EMAIL_BLOCK.some((b) => e.toLowerCase().includes(b)));
    result.email_institucional = emails[0] || null;

    // Formulário de contato
    result.formulario_contato = await page.$('form').then((f) => !!f).catch(() => false);

    // Redes sociais linkadas
    for (const [network, regex] of Object.entries(SOCIAL_DOMAINS)) {
      const m = html.match(regex);
      if (m) result.redes_sociais_linkadas[network] = m[0].startsWith('http') ? m[0] : `https://${m[0]}`;
    }

    // Candidatos a CNPJ publicados no rodapé/página (pra enrichment-cnpj.js validar depois)
    result.cnpj_candidates = extractCnpjCandidates(text + ' ' + html);

    await page.close();
  } catch (err) {
    result.error = err.message;
  } finally {
    await browser.close();
  }

  return result;
}

module.exports = { enrich, isAllowedByRobots };
