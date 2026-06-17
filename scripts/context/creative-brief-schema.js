'use strict';

function createEmptyCreativeBrief(clientSlug, outputType) {
  return {
    client_slug: clientSlug || '',
    generated_at: new Date().toISOString(),
    acquisition_objective: '',
    bottleneck: '',
    stage: '',
    thesis: '',
    tension: '',
    content_goal: '',
    output_type: outputType || '',
    references: [],
    principles: [],
    anti_dna: [],
    tone: '',
    visual_rules: [],
    creative_constraints: [],
    cta_strategy: '',
    reasoning: [],
    source_report: {
      loaded: [],
      missing: [],
      errors: [],
      generated_from: [],
    },
  };
}

function normalizeCreativeBrief(raw, fallback = {}) {
  const brief = createEmptyCreativeBrief(fallback.client_slug, fallback.output_type);
  const sourceReport = raw && raw.source_report ? raw.source_report : {};
  return {
    ...brief,
    ...raw,
    client_slug: raw.client_slug || raw.client || fallback.client_slug || '',
    generated_at: raw.generated_at || brief.generated_at,
    acquisition_objective: raw.acquisition_objective || raw.objetivo_aquisicao || fallback.acquisition_objective || '',
    bottleneck: raw.bottleneck || raw.gargalo || fallback.bottleneck || '',
    stage: raw.stage || raw.etapa_funil || fallback.stage || '',
    thesis: raw.thesis || raw.tese || '',
    tension: raw.tension || raw.tensao_explorada || '',
    content_goal: raw.content_goal || raw.objetivo || fallback.content_goal || '',
    output_type: raw.output_type || fallback.output_type || '',
    references: normalizeReferences(raw.references || raw.referencias_usadas),
    principles: arrayFrom(raw.principles || raw.principios || raw.principles_applied),
    anti_dna: arrayFrom(raw.anti_dna || raw.anti_dna_aplicado),
    tone: raw.tone || raw.tom || '',
    visual_rules: normalizeVisualRules(raw.visual_rules || raw.regras_visuais),
    creative_constraints: arrayFrom(raw.creative_constraints || raw.restricoes_criativas),
    cta_strategy: raw.cta_strategy || raw.estrategia_cta || '',
    reasoning: arrayFrom(raw.reasoning || raw.raciocinio),
    source_report: {
      loaded: arrayFrom(sourceReport.loaded),
      missing: arrayFrom(sourceReport.missing),
      errors: arrayFrom(sourceReport.errors),
      generated_from: arrayFrom(sourceReport.generated_from),
    },
  };
}

function validateCreativeBrief(brief) {
  // acquisition_objective é obrigatório: o objetivo de aquisição orienta toda a cadeia (virada-aquisicao.md)
  const required = ['acquisition_objective', 'thesis', 'tension', 'content_goal', 'output_type', 'tone', 'cta_strategy'];
  const missing = required.filter((key) => !brief[key]);
  if (!brief.references || !brief.references.length) missing.push('references');
  if (!brief.principles || !brief.principles.length) missing.push('principles');
  if (!brief.visual_rules || !brief.visual_rules.length) missing.push('visual_rules');
  return {
    valid: missing.length === 0,
    missing,
  };
}

function normalizeReferences(references) {
  return arrayFrom(references).map((reference, index) => {
    if (typeof reference === 'string') {
      return { id: `ref-${index + 1}`, name: reference, tension: '' };
    }
    return {
      id: reference.id || reference.slug || `ref-${index + 1}`,
      slug: reference.slug || '',
      name: reference.name || reference.reference || reference.id || `Referencia ${index + 1}`,
      tension: reference.tension || '',
      principle: reference.principle || reference.transferable_principle || '',
      score: reference.score || null,
    };
  });
}

function normalizeVisualRules(rules) {
  return arrayFrom(rules).map((rule) => {
    if (typeof rule === 'string') {
      return { type: 'rule', value: rule };
    }
    return rule;
  });
}

function arrayFrom(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

module.exports = {
  createEmptyCreativeBrief,
  normalizeCreativeBrief,
  validateCreativeBrief,
};
