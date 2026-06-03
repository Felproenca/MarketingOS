'use strict';

/**
 * discovery.js — Wraps existing scraper sources and normalizes output.
 * Returns: [{ domain, url, name, source }]
 */

const { scrapeGoogleMaps, scrapeGoogleSearch } = require('../prospector/scraper');

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function normalizeLead(raw) {
  const url = raw.website || null;
  return {
    name:   raw.name   || null,
    url,
    domain: url ? extractDomain(url) : null,
    phone:  raw.phone  || (raw.phones && raw.phones[0]) || null,
    source: raw.source || 'unknown',
  };
}

/**
 * search(query, maxResults)
 * query  — termo completo, ex: "clínica estética Rio de Janeiro"
 * Tenta Maps primeiro (dados estruturados), depois Google Search.
 */
async function search(query, maxResults = 30) {
  // Separa query e cidade heuristicamente para o scraper existente que
  // espera (query, city) separados. Se não tiver cidade, passa tudo como query.
  const parts = query.split(/\s+/);
  const cityWords = 2;
  const city  = parts.slice(-cityWords).join(' ');
  const term  = parts.slice(0, -cityWords).join(' ') || query;

  let rawLeads = [];

  try {
    const mapsLeads = await scrapeGoogleMaps(term, city, Math.ceil(maxResults / 2));
    rawLeads.push(...mapsLeads);
  } catch (err) {
    console.warn(`  ⚠ Google Maps falhou: ${err.message}`);
  }

  if (rawLeads.length < maxResults) {
    try {
      const searchLeads = await scrapeGoogleSearch(term, city, maxResults - rawLeads.length);
      rawLeads.push(...searchLeads);
    } catch (err) {
      console.warn(`  ⚠ Google Search falhou: ${err.message}`);
    }
  }

  // Normalizar + deduplica por domínio
  const seen = new Set();
  const leads = [];

  for (const raw of rawLeads) {
    const lead = normalizeLead(raw);
    if (!lead.domain || seen.has(lead.domain)) continue;
    seen.add(lead.domain);
    leads.push(lead);
  }

  return leads.slice(0, maxResults);
}

module.exports = { search };
