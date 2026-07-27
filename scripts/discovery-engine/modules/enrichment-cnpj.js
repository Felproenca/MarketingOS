'use strict';

/**
 * enrichment-cnpj.js — Valida um CNPJ já conhecido via BrasilAPI (fallback
 * ReceitaWS). Uso honesto dessas APIs: lookup unitário, não busca em massa
 * (ver discovery-places.js pro porquê da mudança de arquitetura).
 *
 * Onde o CNPJ vem de: extraído do site institucional (enrichment-website.js
 * procura por regex de CNPJ no rodapé/página de contato) — nunca inventado.
 * Se não houver CNPJ visível publicamente, o lead segue sem essa validação
 * (campo cnpj_enrichment = null), não é bloqueante.
 */

const BRASILAPI_URL = (cnpj) => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`;
const RECEITAWS_URL = (cnpj) => `https://receitaws.com.br/v1/cnpj/${cnpj}`;

const CNPJ_REGEX = /\b(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})\b/g;

/**
 * Validação de dígito verificador do CNPJ (algoritmo público, módulo 11).
 * Necessário porque a regex de formato sozinha casa qualquer sequência de 14
 * dígitos nesse padrão — inclusive número de telefone/pedido/protocolo que
 * coincide com o formato. Achado em teste funcional 2026-07-13: candidato
 * "19999999999999" (extraído de um site real) passava na regex mas a
 * BrasilAPI recusava com "CNPJ inválido" — dígito verificador nunca era
 * checado antes de gastar uma chamada de API.
 */
function isValidCnpj(digits) {
  if (!/^\d{14}$/.test(digits)) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false; // 00000000000000, 99999999999999 etc.

  const calcCheckDigit = (base, weights) => {
    const sum = weights.reduce((acc, w, i) => acc + w * Number(base[i]), 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calcCheckDigit(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d1 !== Number(digits[12])) return false;

  const d2 = calcCheckDigit(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d2 !== Number(digits[13])) return false;

  return true;
}

/** Extrai candidatos a CNPJ de um texto (site institucional, rodapé etc.) — só os com dígito verificador válido */
function extractCnpjCandidates(text = '') {
  const matches = [...text.matchAll(CNPJ_REGEX)].map((m) => onlyDigits(m[1]));
  return [...new Set(matches)].filter((d) => d.length === 14 && isValidCnpj(d));
}

function onlyDigits(s) {
  return String(s).replace(/\D/g, '');
}

/**
 * lookup(cnpjDigits) → { cnpj, razao_social, situacao_cadastral, data_abertura,
 *                         meses_desde_abertura, endereco, source } | null
 */
async function lookup(cnpjDigits) {
  if (!cnpjDigits || !isValidCnpj(cnpjDigits)) return null;

  const viaBrasilApi = await tryFetch(BRASILAPI_URL(cnpjDigits));
  if (viaBrasilApi) return normalizeBrasilApi(viaBrasilApi);

  const viaReceitaWs = await tryFetch(RECEITAWS_URL(cnpjDigits));
  if (viaReceitaWs && viaReceitaWs.status !== 'ERROR') return normalizeReceitaWs(viaReceitaWs);

  return null;
}

async function tryFetch(url) {
  try {
    // BrasilAPI/ReceitaWS ficam atrás de Cloudflare e retornam 403 pra
    // requisições sem User-Agent (o fetch nativo do Node não manda um por
    // padrão) — descoberto em teste funcional 2026-07-13.
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MarketingOS-DiscoveryEngine/1.0 (+contato via site institucional do lead)',
      },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function monthsSince(dateStr) {
  if (!dateStr) return null;
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
}

function normalizeBrasilApi(d) {
  return {
    cnpj: d.cnpj || null,
    razao_social: d.razao_social || null,
    situacao_cadastral: d.descricao_situacao_cadastral || null, // "ATIVA", "BAIXADA" etc.
    data_abertura: d.data_inicio_atividade || null,
    meses_desde_abertura: monthsSince(d.data_inicio_atividade),
    endereco: [d.logradouro, d.numero, d.bairro, d.municipio, d.uf].filter(Boolean).join(', ') || null,
    source: 'brasilapi',
  };
}

function normalizeReceitaWs(d) {
  return {
    cnpj: d.cnpj || null,
    razao_social: d.nome || null,
    situacao_cadastral: d.situacao || null,
    data_abertura: d.abertura || null,
    meses_desde_abertura: monthsSince(d.abertura),
    endereco: [d.logradouro, d.numero, d.bairro, d.municipio, d.uf].filter(Boolean).join(', ') || null,
    source: 'receitaws',
  };
}

module.exports = { lookup, extractCnpjCandidates, isValidCnpj };
