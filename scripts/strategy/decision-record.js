'use strict';

function validateStrategyDecision(raw, expectedClientSlug = '') {
  const record = raw && typeof raw === 'object' ? raw : {};
  const missing = [];
  const invalid = [];

  requiredText(record, 'client_slug', missing);
  requiredText(record, 'status', missing);
  requiredText(record, 'decision_question', missing);
  requiredText(record, 'acquisition_objective', missing);
  requiredText(record, 'primary_bottleneck', missing);
  requiredText(record, 'market_thesis', missing);
  requiredText(record, 'approved_by', missing);
  requiredText(record, 'approved_at', missing);
  if (record.status !== 'approved') invalid.push('status must be approved');
  if (expectedClientSlug && record.client_slug !== expectedClientSlug) {
    invalid.push(`client_slug must be ${expectedClientSlug}`);
  }

  const evidence = Array.isArray(record.evidence) ? record.evidence : [];
  if (evidence.length < 3) missing.push('evidence (at least 3)');
  const evidenceIds = new Set();
  const evidenceKinds = new Set();
  for (const item of evidence) {
    if (!item || typeof item !== 'object') {
      invalid.push('evidence contains invalid item');
      continue;
    }
    for (const key of ['id', 'kind', 'source', 'observed', 'implication']) {
      if (!String(item[key] || '').trim()) invalid.push(`evidence.${key} missing`);
    }
    if (item.id) evidenceIds.add(item.id);
    if (item.kind) evidenceKinds.add(item.kind);
  }
  if (!['audience', 'first_party', 'interview'].some((kind) => evidenceKinds.has(kind))) {
    missing.push('audience or first_party evidence');
  }
  if (!['market', 'competitor', 'platform'].some((kind) => evidenceKinds.has(kind))) {
    missing.push('market or alternative evidence');
  }

  const hypotheses = Array.isArray(record.hypotheses) ? record.hypotheses : [];
  if (hypotheses.length < 2) missing.push('hypotheses (at least 2)');
  for (const hypothesis of hypotheses) {
    if (!hypothesis || typeof hypothesis !== 'object') {
      invalid.push('hypotheses contains invalid item');
      continue;
    }
    for (const key of ['id', 'statement', 'lever', 'metric', 'decision_rule', 'window']) {
      if (!String(hypothesis[key] || '').trim()) invalid.push(`hypotheses.${key} missing`);
    }
    const links = Array.isArray(hypothesis.evidence_ids) ? hypothesis.evidence_ids : [];
    if (!links.length || links.some((id) => !evidenceIds.has(id))) {
      invalid.push('hypotheses.evidence_ids must reference evidence');
    }
  }

  const funnel = record.funnel_metadata || {};
  for (const key of [
    'funnel_stage', 'intent_level', 'friction_level', 'lead_signal_expected',
    'qualification_goal', 'primary_cta', 'routing_destination', 'next_best_action',
  ]) {
    if (!String(funnel[key] || '').trim()) missing.push(`funnel_metadata.${key}`);
  }

  return { valid: missing.length === 0 && invalid.length === 0, missing, invalid, record };
}

function requiredText(record, key, missing) {
  if (!String(record[key] || '').trim()) missing.push(key);
}

module.exports = { validateStrategyDecision };
