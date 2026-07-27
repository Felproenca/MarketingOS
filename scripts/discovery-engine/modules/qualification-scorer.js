'use strict';

/**
 * qualification-scorer.js — Etapa 4 (QualificationScorer).
 *
 * Config-driven: lê niche_profile.qualification.signals (cada um com weight
 * 0-1 e threshold_min) e aplica contra os dados coletados do lead. Framework
 * (FAINT/SPICED/MEDDIC) é só o rótulo declarado no profile — a lógica de
 * comparação é a mesma (peso × sinal passou/não passou), o que muda de
 * verdade entre frameworks é QUAIS sinais o profile lista.
 *
 * Shape esperado do `lead` (montado pelo contact-router a partir das etapas
 * anteriores — ver lib/store.js):
 * {
 *   places:   { rating, num_avaliacoes, categoria, ... },
 *   cnpj:     { situacao_cadastral, meses_desde_abertura, ... } | null,
 *   website:  { whatsapp_business_link, email_institucional,
 *               redes_sociais_linkadas, formulario_contato, loads } | null,
 * }
 *
 * Sinais conhecidos (extensível — ver SIGNAL_EXTRACTORS): um niche_profile
 * pode declarar um signal_id que este módulo não conhece; nesse caso o sinal
 * é ignorado (log de aviso), nunca inventado.
 */

/** signal_id → função que extrai o valor bruto do lead pra comparar com threshold_min */
const SIGNAL_EXTRACTORS = {
  cnpj_ativo_tempo: (lead) => lead.cnpj?.meses_desde_abertura ?? null,

  presenca_digital: (lead) => {
    const siteAtivo = Boolean(lead.website && lead.website.loads !== false);
    const redeSocialAtiva = Boolean(
      lead.website?.redes_sociais_linkadas && Object.keys(lead.website.redes_sociais_linkadas).length > 0
    );
    return siteAtivo && redeSocialAtiva;
  },

  volume_operacao_aparente: (lead) => lead.places?.num_avaliacoes ?? null,

  situacao_cadastral: (lead) => lead.cnpj?.situacao_cadastral ?? null,
};

/** Compara valor extraído contra threshold_min, tipo-aware */
function passesThreshold(value, thresholdMin) {
  if (value === null || value === undefined) return false;

  if (typeof thresholdMin === 'boolean') return value === thresholdMin;
  if (typeof thresholdMin === 'number') return Number(value) >= thresholdMin;
  if (typeof thresholdMin === 'string') return String(value).toUpperCase() === thresholdMin.toUpperCase();

  return false;
}

/**
 * score(lead, nicheProfile) → { score (0-100), tier (A|B|C|null), breakdown }
 */
function score(lead, nicheProfile) {
  const signals = nicheProfile.qualification.signals || [];
  const breakdown = [];
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const signal of signals) {
    const extractor = SIGNAL_EXTRACTORS[signal.signal_id];
    totalWeight += signal.weight;

    if (!extractor) {
      breakdown.push({ signal_id: signal.signal_id, status: 'unknown_signal', passed: false, weight: signal.weight });
      continue;
    }

    const value = extractor(lead);
    const passed = passesThreshold(value, signal.threshold_min);
    if (passed) earnedWeight += signal.weight;

    breakdown.push({
      signal_id: signal.signal_id,
      description: signal.description,
      value,
      threshold_min: signal.threshold_min,
      passed,
      weight: signal.weight,
    });
  }

  const points = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  const tier = tierFor(points, nicheProfile.qualification.tier_thresholds);

  return { score: points, tier, breakdown };
}

function tierFor(points, thresholds) {
  if (points >= thresholds.A) return 'A';
  if (points >= thresholds.B) return 'B';
  if (points >= thresholds.C) return 'C';
  return null; // abaixo de C → descartar, sem tier
}

module.exports = { score, SIGNAL_EXTRACTORS, passesThreshold };
