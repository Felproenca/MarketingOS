'use strict';

const fs = require('fs');
const path = require('path');
const { buildContext } = require('./context-builder');
const { normalizeCreativeBrief, validateCreativeBrief } = require('./creative-brief-schema');
const { inferFunnelMetadata, normalizeFunnelMetadata } = require('../funnel/metadata');
const { validateStrategyDecision } = require('../strategy/decision-record');

function getCreativeBrief(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const clientSlug = options.client_slug || options.clientSlug || options.slug;
  const outputType = options.output_type || options.outputType || 'default';

  if (!clientSlug) {
    throw new Error('getCreativeBrief requires client_slug');
  }

  const briefPath = creativeBriefPath(rootDir, clientSlug, outputType);
  if (!options.force && fs.existsSync(briefPath)) {
    const existing = readJson(briefPath);
    const normalized = normalizeCreativeBrief(existing, { client_slug: clientSlug, output_type: outputType });
    return {
      brief: normalized,
      path: briefPath,
      generated: false,
      validation: validateCreativeBrief(normalized),
    };
  }

  const result = buildCreativeBrief({
    rootDir,
    client_slug: clientSlug,
    output_type: outputType,
    content_goal: options.content_goal || options.contentGoal || defaultContentGoal(outputType),
    acquisition_objective: options.acquisition_objective || options.acquisitionObjective || '',
    bottleneck: options.bottleneck || '',
    stage: options.stage || '',
    funnel_metadata: options.funnel_metadata || options.funnelMetadata || funnelOptionsFrom(options),
  });

  ensureDir(path.dirname(briefPath));
  fs.writeFileSync(briefPath, JSON.stringify(result.brief, null, 2), 'utf8');
  return {
    ...result,
    path: briefPath,
    generated: true,
  };
}

function buildCreativeBrief(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const clientSlug = options.client_slug || options.clientSlug || options.slug;
  const outputType = options.output_type || options.outputType || 'default';
  const context = buildContext({
    rootDir,
    client_slug: clientSlug,
    output_type: outputType,
  });

  const perception = context.perception || {};
  const strategyDecision = context.strategy_decision || {};
  const strategyValidation = validateStrategyDecision(strategyDecision, clientSlug);
  const strategicBasis = buildStrategicBasis(strategyDecision, strategyValidation, context.acquisition_diagnosis || {});
  const signature = perception.camada_3_assinatura || {};
  const direction = perception.camada_6_direcao_criativa || {};
  const visualDna = context.visual_dna && context.visual_dna.visual_dna ? context.visual_dna.visual_dna : {};
  const referenceSummary = context.reference_summary || {};
  const references = normalizeReferencesForBrief(context.references, referenceSummary);
  const principles = normalizePrinciples(referenceSummary);
  const antiDna = collectAntiDna(context, referenceSummary);
  const tension = signature.tensao_principal || signature.principal || referenceSummary.tensions && referenceSummary.tensions[0] || 'clareza contra ruido';
  const contentGoal = options.content_goal || defaultContentGoal(outputType);
  const ctaStrategy = buildCtaStrategy(outputType, direction);
  const funnelMetadata = normalizeFunnelMetadata(options.funnel_metadata || options.funnelMetadata || strategyDecision.funnel_metadata || funnelOptionsFrom(options), {
    defaults: inferFunnelMetadata({
      output_type: outputType,
      objective: options.acquisition_objective || contentGoal,
      cta: ctaStrategy,
    }),
  });

  const rawBrief = {
    client_slug: clientSlug,
    generated_at: new Date().toISOString(),
    acquisition_objective: options.acquisition_objective || strategyDecision.acquisition_objective || defaultAcquisitionObjective(outputType),
    bottleneck: options.bottleneck || strategyDecision.primary_bottleneck || strategicBasis.diagnosis_area || '',
    stage: options.stage || '',
    thesis: strategyDecision.market_thesis || buildThesis(outputType, tension, direction),
    tension,
    content_goal: contentGoal,
    output_type: outputType,
    references,
    principles,
    anti_dna: antiDna,
    tone: buildTone(direction, perception, context.branding),
    visual_rules: buildVisualRules(context.branding, visualDna, context.visual_dna || {}),
    creative_constraints: buildCreativeConstraints(direction, antiDna, referenceSummary),
    cta_strategy: ctaStrategy,
    strategic_basis: strategicBasis,
    funnel_metadata: funnelMetadata,
    funnel_stage: funnelMetadata.funnel_stage,
    intent_level: funnelMetadata.intent_level,
    friction_level: funnelMetadata.friction_level,
    lead_signal_expected: funnelMetadata.lead_signal_expected,
    qualification_goal: funnelMetadata.qualification_goal,
    primary_cta: funnelMetadata.primary_cta,
    secondary_cta: funnelMetadata.secondary_cta,
    routing_destination: funnelMetadata.routing_destination,
    next_best_action: funnelMetadata.next_best_action,
    reasoning: buildReasoning(perception, referenceSummary, visualDna),
    source_report: {
      loaded: context.context_report.loaded || [],
      missing: context.context_report.missing || [],
      errors: context.context_report.errors || [],
      generated_from: [
        'context-builder',
        'perception.json',
        'visual-dna.json',
        'reference-context.json',
        'brand-kit.json',
        'brand-intelligence.json',
        'strategy-decision.json',
        'acquisition-diagnosis.json',
      ],
    },
  };

  const brief = normalizeCreativeBrief(rawBrief, { client_slug: clientSlug, output_type: outputType });
  return {
    brief,
    context_report: context.context_report,
    validation: validateCreativeBrief(brief),
  };
}

function buildStrategicBasis(decision, validation, diagnosis) {
  const evidence = Array.isArray(decision.evidence) ? decision.evidence : [];
  const hypotheses = Array.isArray(decision.hypotheses) ? decision.hypotheses : [];
  const primary = diagnosis && diagnosis.primary_bottleneck ? diagnosis.primary_bottleneck : {};
  return {
    approved_strategy_decision: validation.valid,
    decision_question: decision.decision_question || '',
    primary_bottleneck: decision.primary_bottleneck || '',
    market_thesis: decision.market_thesis || '',
    evidence_ids: evidence.map((item) => item && item.id).filter(Boolean),
    hypothesis_ids: hypotheses.map((item) => item && item.id).filter(Boolean),
    diagnosis_area: primary.area || '',
    confidence: diagnosis && diagnosis._meta ? diagnosis._meta.confidence_score || '' : '',
  };
}

function funnelOptionsFrom(options) {
  return {
    funnel_stage: options.funnel_stage || options.funnelStage,
    intent_level: options.intent_level || options.intentLevel,
    friction_level: options.friction_level || options.frictionLevel,
    lead_signal_expected: options.lead_signal_expected || options.leadSignal || options.expected_lead_signal,
    qualification_goal: options.qualification_goal || options.qualificationGoal,
    primary_cta: options.primary_cta || options.primaryCta,
    secondary_cta: options.secondary_cta || options.secondaryCta,
    routing_destination: options.routing_destination || options.routingDestination || options.routing,
    next_best_action: options.next_best_action || options.nextBestAction,
  };
}

function creativeBriefPath(rootDir, clientSlug, outputType) {
  // Um arquivo por tipo de output — brief de carousel não pode sobrescrever o de reel.
  const type = outputType || 'default';
  return path.join(rootDir, 'clients', clientSlug, 'outputs', 'creative-direction', `creative-brief.${type}.json`);
}

function normalizeReferencesForBrief(references, referenceSummary) {
  const source = Array.isArray(references) && references.length
    ? references
    : referenceSummary && Array.isArray(referenceSummary.references_used) ? referenceSummary.references_used : [];
  return source.map((reference, index) => ({
    id: reference.id || reference.slug || `ref-${index + 1}`,
    slug: reference.slug || '',
    name: reference.name || reference.reference || reference.id || `Referencia ${index + 1}`,
    tension: reference.tension || '',
    principle: reference.transferable_principle || reference.principle || '',
    score: reference.score || null,
  }));
}

function normalizePrinciples(referenceSummary) {
  const principles = referenceSummary.principles_applied || referenceSummary.transferable_principles || [];
  return Array.isArray(principles) ? principles.filter(Boolean) : [principles].filter(Boolean);
}

function collectAntiDna(context, referenceSummary) {
  const constraints = Array.isArray(context.constraints) ? context.constraints : [];
  const whatNotToCopy = Array.isArray(referenceSummary.what_not_to_copy) ? referenceSummary.what_not_to_copy : [];
  return [...new Set(constraints.map((item) => item.value).concat(whatNotToCopy).filter(Boolean))].slice(0, 16);
}

function buildThesis(outputType, tension, direction) {
  const byType = direction && direction.por_tipo_de_entrega ? direction.por_tipo_de_entrega[outputType] : '';
  if (byType) return byType;
  if (outputType === 'carousel') {
    return `Ensinar a pensar antes de ensinar a executar, tornando visivel a tensao "${tension}".`;
  }
  return `Traduzir a tensao "${tension}" em uma decisao criativa reconhecivel.`;
}

function buildTone(direction, perception, branding) {
  const words = direction && Array.isArray(direction.palavras_de_marca) ? direction.palavras_de_marca.slice(0, 8).join(', ') : '';
  const feel = branding && branding.style && branding.style.feel ? branding.style.feel : '';
  const brandTone = branding && typeof branding.tone === 'string' ? branding.tone : '';
  const personality = branding && branding.identity && Array.isArray(branding.identity.personality)
    ? branding.identity.personality.slice(0, 6).join(', ')
    : '';
  const tagline = branding && typeof branding.tagline === 'string' ? branding.tagline : '';
  const desired = perception.camada_1_leitura_de_alma && perception.camada_1_leitura_de_alma.tom_desejado
    ? perception.camada_1_leitura_de_alma.tom_desejado
    : '';
  return [desired, brandTone, feel, personality ? `personalidade: ${personality}` : '', tagline ? `tagline: ${tagline}` : '', words ? `palavras de marca: ${words}` : ''].filter(Boolean).join(' | ');
}

function buildVisualRules(branding, visualDna, visualDnaRoot) {
  const palette = branding && (branding.palette || branding.colors) ? (branding.palette || branding.colors) : {};
  const typography = branding && branding.typography ? branding.typography : {};
  return [
    { type: 'palette', value: normalizePalette(palette) },
    { type: 'typography', value: normalizeTypography(typography) },
    { type: 'density', value: visualDna.densidade || '' },
    { type: 'contrast', value: visualDna.contraste || '' },
    { type: 'typographic_rhythm', value: visualDna.ritmo_tipografico || visualDna['ritmo_tipográfico'] || '' },
    { type: 'white_space', value: visualDna.presenca_branca || visualDna['presença_branca'] || '' },
    { type: 'motion', value: visualDna.movimento || '' },
    { type: 'spatial_logic', value: visualDnaRoot.spatial_logic || '' },
    { type: 'color_behavior', value: visualDnaRoot.color_behavior || '' },
  ].filter((rule) => rule.value && (!isObject(rule.value) || Object.keys(rule.value).length));
}

function buildCreativeConstraints(direction, antiDna, referenceSummary) {
  const prohibited = direction && Array.isArray(direction.palavras_proibidas) ? direction.palavras_proibidas : [];
  const notToCopy = Array.isArray(referenceSummary.what_not_to_copy) ? referenceSummary.what_not_to_copy : [];
  return [...new Set(prohibited.concat(antiDna).concat(notToCopy).filter(Boolean))].slice(0, 20);
}

function buildCtaStrategy(outputType, direction) {
  if (outputType === 'carousel') {
    return 'Convidar para ver a decisao antes da criacao, sem urgencia artificial.';
  }
  const questions = direction && Array.isArray(direction.perguntas_de_saida) ? direction.perguntas_de_saida : [];
  return questions[0] || 'Convidar para o proximo passo com clareza e sem pressao falsa.';
}

function buildReasoning(perception, referenceSummary, visualDna) {
  const reasoning = [];
  const signature = perception.camada_3_assinatura || {};
  if (signature.tensao_descricao) reasoning.push(signature.tensao_descricao);
  if (referenceSummary.why_these_references) reasoning.push(...referenceSummary.why_these_references);
  if (visualDna.densidade) reasoning.push(`Densidade visual herdada: ${visualDna.densidade}`);
  return reasoning.filter(Boolean).slice(0, 8);
}

function normalizePalette(palette) {
  return {
    background: colorValue(palette.background || palette['off-black'] || palette.surface),
    surface: colorValue(palette.surface || palette.neutral),
    text: colorValue(palette.text || palette.primary || palette['warm-white']),
    accent: colorValue(palette.gold || palette.accent || palette.terracota),
    muted: colorValue(palette.muted || palette.neutral || palette.nude),
    secondary: colorValue(palette.surface_2 || palette.secondary || palette.nude),
  };
}

function normalizeTypography(typography) {
  return {
    headline: fontFamilyName(typography.primary_font || typography.headline),
    body: fontFamilyName(typography.secondary_font || typography.body),
  };
}

function defaultContentGoal(outputType) {
  if (outputType === 'carousel') return 'Gerar autoridade fazendo a audiencia perceber a diferenca entre conteudo produzido e conteudo dirigido.';
  return 'Transformar direcao criativa em output reconhecivel.';
}

function defaultAcquisitionObjective(outputType) {
  // O objetivo de aquisicao orienta toda a cadeia (virada-aquisicao.md).
  if (outputType === 'carousel' || outputType === 'reel') {
    return 'Demonstrar capacidade de diagnostico — iniciar conversas sobre gargalos de aquisicao.';
  }
  return 'Tornar a aquisicao mais observavel — esta peca remove um gargalo ou inicia uma conversa comercial.';
}

function colorValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.hex || '';
}

function fontFamilyName(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const weighted = text.match(/^([A-Za-z ]+)\s+\d/);
  if (weighted) return weighted[1].trim();
  return text.split(/[—–-]/)[0].split(',')[0].trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const result = getCreativeBrief({
    client_slug: args.slug || args.client,
    output_type: args.output || args.type || 'carousel',
    rootDir: process.cwd(),
    force: Boolean(args.force),
    acquisition_objective: typeof args.objective === 'string' ? args.objective : '',
    bottleneck: typeof args.bottleneck === 'string' ? args.bottleneck : '',
    stage: typeof args.stage === 'string' ? args.stage : '',
    funnel_stage: args['funnel-stage'] || args.funnel_stage,
    intent_level: args['intent-level'] || args.intent_level,
    friction_level: args['friction-level'] || args.friction_level,
    lead_signal_expected: args['lead-signal'] || args.lead_signal_expected || args.expected_lead_signal,
    qualification_goal: args['qualification-goal'] || args.qualification_goal,
    primary_cta: args['primary-cta'] || args.primary_cta,
    secondary_cta: args['secondary-cta'] || args.secondary_cta,
    routing_destination: args.routing || args['routing-destination'] || args.routing_destination,
    next_best_action: args['next-action'] || args.next_best_action,
  });
  console.log(JSON.stringify({
    path: path.relative(process.cwd(), result.path).replace(/\\/g, '/'),
    generated: result.generated,
    validation: result.validation,
    brief: result.brief,
  }, null, 2));
}

function parseArgs(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      result[key] = true;
      continue;
    }
    result[key] = next;
    i += 1;
  }
  return result;
}

module.exports = {
  buildCreativeBrief,
  getCreativeBrief,
  creativeBriefPath,
};
