'use strict';

const FUNNEL_STAGES = [
  'awareness',
  'problem-aware',
  'solution-aware',
  'comparison',
  'decision',
  'retention',
  'expansion',
];

const INTENT_LEVELS = ['low', 'medium', 'high'];
const FRICTION_LEVELS = ['0', '1', '2', '3', '4'];

const FUNNEL_METADATA_FIELDS = [
  'funnel_stage',
  'intent_level',
  'friction_level',
  'lead_signal_expected',
  'qualification_goal',
  'primary_cta',
  'secondary_cta',
  'routing_destination',
  'next_best_action',
];

const LEGACY_KEYS = {
  stage: 'funnel_stage',
  funnelStage: 'funnel_stage',
  etapa_funil: 'funnel_stage',
  intent: 'intent_level',
  intentLevel: 'intent_level',
  friction: 'friction_level',
  frictionLevel: 'friction_level',
  expected_lead_signal: 'lead_signal_expected',
  leadSignalExpected: 'lead_signal_expected',
  signal: 'lead_signal_expected',
  cta: 'primary_cta',
  primaryCta: 'primary_cta',
  secondaryCta: 'secondary_cta',
  routing: 'routing_destination',
  routingDestination: 'routing_destination',
  nextBestAction: 'next_best_action',
};

function createEmptyFunnelMetadata(seed = {}) {
  return normalizeFunnelMetadata(seed, { preserveHypotheses: true });
}

function normalizeFunnelMetadata(input = {}, options = {}) {
  const source = flattenSource(input);
  const normalized = {};

  for (const field of FUNNEL_METADATA_FIELDS) {
    normalized[field] = stringValue(source[field]);
  }

  normalized.funnel_stage = normalizeEnum(normalized.funnel_stage, FUNNEL_STAGES);
  normalized.intent_level = normalizeEnum(normalized.intent_level, INTENT_LEVELS);
  normalized.friction_level = normalizeFriction(normalized.friction_level);

  if (options.defaults) {
    const defaults = normalizeFunnelMetadata(options.defaults);
    for (const field of FUNNEL_METADATA_FIELDS) {
      if (!normalized[field]) normalized[field] = defaults[field];
    }
  }

  return normalized;
}

function validateFunnelMetadata(input = {}, options = {}) {
  const metadata = normalizeFunnelMetadata(input);
  const missing = [];
  const invalid = [];

  for (const field of FUNNEL_METADATA_FIELDS) {
    if (field === 'secondary_cta' && options.allowEmptySecondaryCta !== false) continue;
    if (!metadata[field]) missing.push(field);
  }

  if (metadata.funnel_stage && !FUNNEL_STAGES.includes(metadata.funnel_stage)) invalid.push('funnel_stage');
  if (metadata.intent_level && !INTENT_LEVELS.includes(metadata.intent_level)) invalid.push('intent_level');
  if (metadata.friction_level && !FRICTION_LEVELS.includes(metadata.friction_level)) invalid.push('friction_level');

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    metadata,
  };
}

function assertFunnelMetadata(input = {}, options = {}) {
  const validation = validateFunnelMetadata(input, options);
  if (validation.valid) return validation.metadata;

  const parts = [];
  if (validation.missing.length) parts.push(`missing: ${validation.missing.join(', ')}`);
  if (validation.invalid.length) parts.push(`invalid: ${validation.invalid.join(', ')}`);
  const message = options.message || 'Funnel Metadata invalido';
  throw new Error(`${message} (${parts.join('; ')})`);
}

function inferFunnelMetadata(input = {}) {
  const outputType = stringValue(input.output_type || input.outputType).toLowerCase();
  const objective = stringValue(input.objective || input.objetivo || input.content_goal).toLowerCase();
  const cta = stringValue(input.cta || input.primary_cta || input.cta_strategy);

  let funnelStage = 'problem-aware';
  let intentLevel = 'medium';
  let frictionLevel = '1';
  let leadSignal = 'reply, comment, DM or click';
  let qualificationGoal = 'identify pain, channel and urgency';
  let primaryCta = cta || 'ask for a low-friction diagnosis';
  let secondaryCta = 'save or consume the next asset';
  let routingDestination = 'content or DM with context';
  let nextBestAction = 'deliver value, ask one qualifying question, then route by fit and intent';

  if (outputType === 'carousel' || outputType === 'post' || outputType === 'reel') {
    leadSignal = outputType === 'carousel' ? 'save, comment, DM or link click' : 'comment, reply, DM or profile click';
    routingDestination = 'Instagram DM or next content asset';
    primaryCta = cta || 'comment the keyword or send the asset for analysis';
  }

  if (outputType.includes('site') || outputType === 'landing') {
    funnelStage = 'solution-aware';
    frictionLevel = '2';
    leadSignal = 'CTA click, smart form submit or WhatsApp with context';
    qualificationGoal = 'capture business type, main bottleneck, channel and urgency';
    primaryCta = cta || 'start the diagnosis';
    secondaryCta = 'see proof or compare examples';
    routingDestination = 'smart form or WhatsApp with source context';
    nextBestAction = 'score lead and route to diagnosis, nurture or disqualification';
  }

  if (outputType.includes('offer') || objective.includes('venda') || objective.includes('convers')) {
    funnelStage = 'decision';
    intentLevel = 'high';
    frictionLevel = '3';
    leadSignal = 'diagnosis requested, form submitted or call requested';
    routingDestination = 'diagnosis or sales handoff';
    nextBestAction = 'qualify fit, urgency and authority before proposal';
  }

  return normalizeFunnelMetadata({
    funnel_stage: funnelStage,
    intent_level: intentLevel,
    friction_level: frictionLevel,
    lead_signal_expected: leadSignal,
    qualification_goal: qualificationGoal,
    primary_cta: primaryCta,
    secondary_cta: secondaryCta,
    routing_destination: routingDestination,
    next_best_action: nextBestAction,
  });
}

function formatFunnelMetadataMarkdown(input = {}) {
  const metadata = normalizeFunnelMetadata(input);
  return [
    '## Funnel Metadata',
    '',
    `- Funnel stage: ${metadata.funnel_stage}`,
    `- Intent level: ${metadata.intent_level}`,
    `- Friction level: ${metadata.friction_level}`,
    `- Expected lead signal: ${metadata.lead_signal_expected}`,
    `- Qualification goal: ${metadata.qualification_goal}`,
    `- Primary CTA: ${metadata.primary_cta}`,
    `- Secondary CTA: ${metadata.secondary_cta || 'nenhum'}`,
    `- Routing destination: ${metadata.routing_destination}`,
    `- Next best action: ${metadata.next_best_action}`,
  ].join('\n');
}

function flattenSource(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const source = {
    ...(raw.funnel_metadata && typeof raw.funnel_metadata === 'object' ? raw.funnel_metadata : {}),
    ...raw,
  };

  for (const [from, to] of Object.entries(LEGACY_KEYS)) {
    if (source[to] === undefined && source[from] !== undefined) {
      source[to] = source[from];
    }
  }

  return source;
}

function normalizeEnum(value, allowed) {
  const text = stringValue(value).toLowerCase();
  if (!text) return '';
  if (allowed.includes(text)) return text;
  return text;
}

function normalizeFriction(value) {
  const text = stringValue(value);
  if (!text) return '';
  const match = text.match(/[0-4]/);
  return match ? match[0] : text;
}

function stringValue(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

module.exports = {
  FUNNEL_METADATA_FIELDS,
  FUNNEL_STAGES,
  INTENT_LEVELS,
  FRICTION_LEVELS,
  assertFunnelMetadata,
  createEmptyFunnelMetadata,
  formatFunnelMetadataMarkdown,
  inferFunnelMetadata,
  normalizeFunnelMetadata,
  validateFunnelMetadata,
};
