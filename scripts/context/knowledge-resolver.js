'use strict';

const BASE_FILES = [
  { key: 'client', path: 'clients/{slug}/client.md', type: 'text', required: true },
  { key: 'branding', path: 'clients/{slug}/brand-kit.json', type: 'json', required: false },
];

const BRANDING_OUTPUTS = [
  { key: 'brand_intelligence', path: 'clients/{slug}/outputs/branding/brand-intelligence.json', type: 'json', required: false },
  { key: 'perception', path: 'clients/{slug}/outputs/branding/perception.json', type: 'json', required: false },
  { key: 'visual_dna', path: 'clients/{slug}/outputs/branding/visual-dna.json', type: 'json', required: false },
  { key: 'reference_context', path: 'clients/{slug}/outputs/branding/reference-context.json', type: 'json', required: false },
];

const STRATEGY_OUTPUTS = [
  { key: 'strategy_decision', path: 'clients/{slug}/outputs/strategy/strategy-decision.json', type: 'json', required: false },
  { key: 'acquisition_diagnosis', path: 'clients/{slug}/outputs/acquisition/acquisition-diagnosis.json', type: 'json', required: false },
];

const GLOBAL_FILES = [
  { key: 'reference_index', path: 'intelligence/reference-library/index.json', type: 'json', required: false },
];

const PROFILES = {
  carousel: {
    files: [
      ...BASE_FILES,
      ...BRANDING_OUTPUTS,
      ...STRATEGY_OUTPUTS,
      { key: 'benchmarks', path: 'intelligence/benchmarks.json', type: 'json', required: false, pick: 'content_performance.carousel' },
      ...GLOBAL_FILES,
    ],
    visual_dna_fields: [
      'visual_dna.densidade',
      'visual_dna.ritmo_tipografico',
      'visual_dna.ritmo_tipográfico',
      'visual_dna.presenca_branca',
      'visual_dna.presença_branca',
      'visual_dna.contraste',
      'visual_dna.temperatura',
      'visual_dna.textura',
      'motion_principles',
      'color_behavior',
      'spatial_logic',
    ],
    reference_limit: 3,
  },
  post: {
    files: [...BASE_FILES, ...BRANDING_OUTPUTS, ...STRATEGY_OUTPUTS, ...GLOBAL_FILES],
    reference_limit: 3,
  },
  site: {
    files: [...BASE_FILES, ...BRANDING_OUTPUTS, ...STRATEGY_OUTPUTS, ...GLOBAL_FILES],
    reference_limit: 5,
  },
  reel: {
    files: [...BASE_FILES, ...BRANDING_OUTPUTS, ...STRATEGY_OUTPUTS, ...GLOBAL_FILES],
    reference_limit: 3,
  },
  image: {
    files: [...BASE_FILES, ...BRANDING_OUTPUTS, ...STRATEGY_OUTPUTS, ...GLOBAL_FILES],
    reference_limit: 3,
  },
  default: {
    files: [...BASE_FILES, ...BRANDING_OUTPUTS, ...STRATEGY_OUTPUTS, ...GLOBAL_FILES],
    reference_limit: 3,
  },
};

function resolveKnowledgePlan(outputType) {
  const key = normalizeOutputType(outputType);
  return PROFILES[key] || PROFILES.default;
}

function normalizeOutputType(outputType) {
  const value = String(outputType || '').toLowerCase().trim();
  if (['carrossel', 'carousel', '/carousel', '/carrossel'].includes(value)) return 'carousel';
  if (['post', 'feed'].includes(value)) return 'post';
  if (['site', 'landing', 'landing-page'].includes(value)) return 'site';
  if (['reel', 'reels'].includes(value)) return 'reel';
  if (['imagem', 'image'].includes(value)) return 'image';
  return value || 'default';
}

module.exports = {
  resolveKnowledgePlan,
  normalizeOutputType,
};
