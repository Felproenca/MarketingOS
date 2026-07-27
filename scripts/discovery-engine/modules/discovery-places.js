'use strict';

/**
 * discovery-places.js — Etapa 1 real do pipeline (Discovery).
 *
 * Correção de arquitetura vs. discovery-engine-spec.md original: o spec
 * descrevia CNPJDiscoveryModule como busca por CNAE+UF via BrasilAPI/Minha
 * Receita/ReceitaWS. Testado empiricamente (2026-07-13): essas três APIs só
 * fazem lookup de UM CNPJ já conhecido (GET /cnpj/v1/{cnpj} → 200; tentativa
 * de filtro por CNAE+UF → 404). Não existe busca em massa nelas.
 *
 * Decisão (Felipe, 2026-07-13): usar Google Places Text Search como motor de
 * busca primário — ele busca de verdade por categoria+região. BrasilAPI vira
 * enriquecimento/validação (ver enrichment-cnpj.js), aplicado depois que o
 * CNPJ é conhecido (extraído do site institucional ou do texto do local no
 * Places). Dados Abertos CNPJ da Receita (arquivo bruto, filtrável por CNAE de
 * verdade) fica como fonte futura — ver discovery-cnae-bulk.js.
 *
 * Fonte: Google Places API (Text Search) — dado que a própria empresa
 * publicou para ser encontrada (compliance: niche_profile.compliance).
 */

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || null;
const TEXT_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

/**
 * Monta as queries de texto a partir do niche_profile.
 * region_scope.type === 'uf' | 'municipio' | 'raio_km' | 'nacional'
 */
function buildQueries(nicheProfile) {
  const categories = nicheProfile.discovery.google_places_categories || [];
  const scope = nicheProfile.discovery.region_scope;
  const regions = scope.type === 'nacional' ? ['Brasil'] : (scope.values || []);

  const queries = [];
  for (const category of categories) {
    for (const region of regions) {
      queries.push(`${category} em ${region}`);
    }
  }
  return queries;
}

/**
 * search(nicheProfile) → [{ place_id, name, address, phone, website, source }]
 * Não lança se faltar API key — retorna [] com aviso, seguindo a regra do
 * sistema de nunca bloquear por chave ausente.
 */
async function search(nicheProfile, { maxResults } = {}) {
  const cap = maxResults || nicheProfile.discovery.max_results_per_run || 100;

  if (!GOOGLE_PLACES_API_KEY) {
    console.warn('  ⚠ GOOGLE_PLACES_API_KEY não configurada — discovery via Places pulado.');
    console.warn('    Defina no .env pra ativar a busca. Sem isso, o Discovery Engine não tem fonte primária.');
    return [];
  }

  const queries = buildQueries(nicheProfile);
  const results = [];
  const seenPlaceIds = new Set();

  for (const query of queries) {
    if (results.length >= cap) break;

    let pageToken = null;
    let pageCount = 0;

    do {
      const url = new URL(TEXT_SEARCH_URL);
      url.searchParams.set('query', query);
      url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
      url.searchParams.set('language', 'pt-BR');
      url.searchParams.set('region', 'br');
      if (pageToken) url.searchParams.set('pagetoken', pageToken);

      // Google exige um pequeno delay entre paginação por pagetoken
      if (pageToken) await sleep(2000);

      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.warn(`  ⚠ Places API "${query}": ${data.status} — ${data.error_message || ''}`);
        break;
      }

      for (const place of data.results || []) {
        if (seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);

        results.push({
          place_id: place.place_id,
          name: place.name || null,
          address: place.formatted_address || null,
          rating: place.rating ?? null,
          num_avaliacoes: place.user_ratings_total ?? null,
          categoria: (place.types || [])[0] || null,
          source: 'google_places_text_search',
          query,
        });

        if (results.length >= cap) break;
      }

      pageToken = data.next_page_token || null;
      pageCount++;
    } while (pageToken && pageCount < 3 && results.length < cap); // Google limita a 3 páginas (60 results) por query
  }

  return results.slice(0, cap);
}

/**
 * enrichDetails(placeId) → { phone, website, opening_hours }
 * Chamado depois do search pra pegar telefone/site (Text Search não retorna).
 */
async function enrichDetails(placeId) {
  if (!GOOGLE_PLACES_API_KEY) return { phone: null, website: null, opening_hours: null };

  const url = new URL(DETAILS_URL);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('key', GOOGLE_PLACES_API_KEY);
  url.searchParams.set('fields', 'formatted_phone_number,website,opening_hours');
  url.searchParams.set('language', 'pt-BR');

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') return { phone: null, website: null, opening_hours: null };

    return {
      phone: data.result.formatted_phone_number || null,
      website: data.result.website || null,
      opening_hours: data.result.opening_hours?.weekday_text || null,
    };
  } catch (err) {
    console.warn(`  ⚠ Places Details falhou pra ${placeId}: ${err.message}`);
    return { phone: null, website: null, opening_hours: null };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { search, enrichDetails, buildQueries };
