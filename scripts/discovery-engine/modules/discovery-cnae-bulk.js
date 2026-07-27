'use strict';

/**
 * discovery-cnae-bulk.js — STUB documentado, não conectado a dado real.
 *
 * Esta é a fonte que o discovery-engine-spec.md original tinha em mente pra
 * busca por CNAE de verdade: os "Dados Abertos do CNPJ" da Receita Federal
 * (arquivo público, atualizado mensalmente, com todos os CNPJs ativos no
 * Brasil, campo CNAE incluso). Diferente de BrasilAPI/ReceitaWS (lookup
 * unitário), este dataset É filtrável por CNAE+UF de verdade — mas vem como
 * arquivos CSV/ZIP de vários GB, não como API.
 *
 * Fonte oficial: https://dados.gov.br/dados/conjuntos-dados/cadastro-nacional-da-pessoa-juridica---cnpj
 * (arquivos "Empresas", "Estabelecimentos" e "Simples" — o CNAE fiscal
 * principal está em Estabelecimentos.csv)
 *
 * Por que não está implementado agora: baixar (~4-6 GB compactado) e indexar
 * esse dataset não é viável dentro de uma sessão de agente. Fica como TODO
 * explícito, não fabricado.
 *
 * Como plugar quando o arquivo existir:
 *   1. Baixar os arquivos "Estabelecimentos*.zip" do mês mais recente
 *   2. Descompactar e filtrar localmente (grep/awk, DuckDB ou SQLite) por:
 *      - cnae_fiscal_principal IN (niche_profile.discovery.cnae_codes)
 *      - uf IN (niche_profile.discovery.region_scope.values), se type === 'uf'
 *      - situacao_cadastral === '02' (ATIVA)
 *   3. Implementar search(nicheProfile) abaixo lendo o resultado filtrado
 *      (ex.: um CSV pré-processado em ./data/cnae-index/<uf>.csv) e devolver
 *      no mesmo shape de discovery-places.js: { name, cnpj, address, source }
 *
 * Até lá, esta função lança — nunca finge que rodou uma busca que não existe.
 */

async function search(_nicheProfile) {
  throw new Error(
    'discovery-cnae-bulk não está conectado a dado real ainda. ' +
    'Baixe os Dados Abertos CNPJ da Receita (ver comentário no topo deste arquivo) ' +
    'e implemente a leitura antes de usar esta fonte. Use discovery-places.js por enquanto.'
  );
}

module.exports = { search };
