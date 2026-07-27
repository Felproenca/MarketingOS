'use strict';

/**
 * discovery-linkedin-assisted.js — Busca assistida no LinkedIn Sales Navigator.
 *
 * NÃO automatiza nada. Não faz scraping, não chama API não-oficial, não abre
 * navegador sozinho. Gera só o TEXTO da busca (keywords + filtros) que um
 * humano cola manualmente no Sales Navigator — é literalmente pra isso que a
 * ferramenta existe, e é o único jeito compliant de usar LinkedIn como fonte
 * de descoberta (ver niche_profile.compliance.excluded_sources).
 *
 * Depois da busca manual, o humano salva os resultados numa lista do Sales
 * Navigator e exporta o que for permitido pela própria interface (nome da
 * empresa, domínio se visível) pra um CSV simples — que entra no pipeline via
 * import-manual-leads.js, reaproveitando enrichment/qualification/routing.
 */

/**
 * buildSearchBrief(nicheProfile) → {
 *   boolean_query, title_filters, industry_filters, geography, instructions
 * }
 */
function buildSearchBrief(nicheProfile) {
  const categories = nicheProfile.discovery.google_places_categories || [];
  const scope = nicheProfile.discovery.region_scope;
  const geography = scope.type === 'nacional' ? 'Brasil' : (scope.values || []).join(', ');

  const booleanQuery = categories
    .map((c) => `"${c}"`)
    .join(' OR ');

  return {
    boolean_query: booleanQuery,
    title_filters: ['Sócio', 'Proprietário', 'Diretor', 'Gerente', 'Fundador'],
    industry_filters: ['Serviços financeiros', 'Bancos', 'Gestão de investimentos'],
    geography,
    company_size_hint: 'PJ pequeno/médio — filtrar por 1-50 funcionários, ajustar conforme resultado',
    instructions: buildInstructions(nicheProfile, booleanQuery, geography),
  };
}

function buildInstructions(nicheProfile, booleanQuery, geography) {
  return [
    `Busca assistida — ${nicheProfile.niche_label}`,
    '',
    '1. Abrir LinkedIn Sales Navigator (login normal, sem automação/extensão)',
    '2. Busca de Empresas (não de pessoas) com esses termos no campo de palavras-chave:',
    `   ${booleanQuery}`,
    '3. Filtros adicionais:',
    `   - Localização: ${geography}`,
    '   - Setor: Serviços financeiros, Bancos, Gestão de investimentos',
    '   - Porte: 1-50 funcionários (ajustar conforme volume de resultado)',
    '4. Revisar a lista manualmente — salvar só empresas que parecem reais/ativas',
    '   (nome consistente com o nicho, não perfil vazio/inativo)',
    '5. Salvar numa Lista do Sales Navigator (recurso nativo, não exportação)',
    '6. Preencher um CSV simples com nome + domínio do site (se visível na página',
    '   da empresa) + URL do LinkedIn da empresa — só dado que a própria empresa',
    '   publicou institucionalmente, nunca dado de perfil pessoal de funcionário',
    '7. Rodar: node scripts/discovery-engine/import-manual-leads.js',
    '   --niche=<niche_id> --file=<caminho do CSV>',
    '',
    'NUNCA: extensão de scraping, exportação em massa de perfis, automação de',
    'busca/paginação, ou qualquer coleta de dado de PESSOA física (nome de',
    'funcionário, e-mail pessoal) — só dado institucional da EMPRESA.',
  ].join('\n');
}

module.exports = { buildSearchBrief };
