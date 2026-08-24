'use strict';

function createEmptyContext(clientSlug, outputType) {
  return {
    client: {},
    perception: {},
    branding: {},
    brand_intelligence: {},
    strategy_decision: {},
    acquisition_diagnosis: {},
    visual_dna: {},
    references: [],
    constraints: [],
    industry: {},
    output_type: outputType || '',
    client_slug: clientSlug || '',
    context_report: {
      loaded: [],
      missing: [],
      skipped: [],
      errors: [],
      sources: {},
      generated_at: new Date().toISOString(),
    },
  };
}

function normalizeReference(raw, sourcePath) {
  const semantic = raw && raw.semantic ? raw.semantic : {};
  const physical = raw && raw.physical ? raw.physical : {};
  const tags = semantic.tags || raw.tags || {};

  return {
    id: raw.id || '',
    slug: raw.slug || '',
    name: raw.name || '',
    source_path: sourcePath || '',
    url: physical.url || raw.url || '',
    tension: semantic.tension || raw.tension || '',
    transferable_principle:
      semantic.principio_transferivel ||
      semantic.transferable_principle ||
      raw.principio_transferivel ||
      raw.transferable_principle ||
      '',
    dimensions: semantic.dimensoes || raw.dimensoes || {},
    emotions: tags.emocao || raw.emocao || [],
    contexts: tags.contexto || raw.contexto || [],
    what_to_steal: semantic.absorver || semantic.what_to_steal || raw.absorver || raw.what_to_steal || [],
    what_not_to_copy:
      semantic.nunca_copiar ||
      semantic.what_not_to_copy ||
      raw.nunca_copiar ||
      raw.what_not_to_copy ||
      [],
    raw,
  };
}

function normalizeReferenceContext(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      references_used: [],
      tensions: [],
      transferable_principles: [],
      principles_applied: [],
      what_to_steal: [],
      what_not_to_copy: [],
      translation_for_this_brand: {},
      source: 'none',
    };
  }

  const referencesUsed = Array.isArray(raw.references_used) ? raw.references_used : [];
  const principlesApplied = arrayFrom(raw.principles_applied);
  const transferablePrinciples = arrayFrom(raw.transferable_principles || raw.principios_transferiveis);

  return {
    references_used: referencesUsed,
    tensions: arrayFrom(raw.tensions).concat(referencesUsed.map((ref) => ref.tension).filter(Boolean)),
    transferable_principles: transferablePrinciples.length ? transferablePrinciples : principlesApplied,
    principles_applied: principlesApplied,
    what_to_steal: arrayFrom(raw.what_to_steal || raw.absorver),
    what_not_to_copy: arrayFrom(raw.what_not_to_copy || raw.nunca_copiar),
    translation_for_this_brand: raw.translation_for_this_brand || {},
    source: raw.generated_by ? 'reference-context.json' : 'resolved',
    raw,
  };
}

function normalizeResolvedReferences(references) {
  const refs = Array.isArray(references) ? references : [];
  return {
    references_used: refs.map((ref) => ({
      id: ref.id,
      slug: ref.slug,
      name: ref.name,
      tension: ref.tension,
      score: ref.score,
    })),
    tensions: refs.map((ref) => ref.tension).filter(Boolean),
    transferable_principles: refs.map((ref) => ref.transferable_principle).filter(Boolean),
    principles_applied: refs.map((ref) => ref.transferable_principle).filter(Boolean),
    what_to_steal: refs.flatMap((ref) => arrayFrom(ref.what_to_steal)),
    what_not_to_copy: refs.flatMap((ref) => arrayFrom(ref.what_not_to_copy)),
    translation_for_this_brand: {},
    source: 'reference-resolver',
  };
}

function arrayFrom(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
}

module.exports = {
  createEmptyContext,
  normalizeReference,
  normalizeReferenceContext,
  normalizeResolvedReferences,
};
