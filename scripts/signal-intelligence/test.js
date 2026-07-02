'use strict';

const assert = require('assert');
const {
  calculateScore,
  freshnessMultiplier,
  evidenceMultiplier,
  normalizeProspect,
} = require('./index');

const today = new Date().toISOString().slice(0, 10);
const prospect = normalizeProspect({
  company: 'Empresa Teste',
  segment: 'estetica',
  city: 'Campinas',
  'event-type': 'active_ad',
  'event-description': 'esta anunciando uma oferta com prazo',
  'rupture-type': 'no_campaign_page',
  'rupture-description': 'o anuncio leva para uma pagina generica',
  fit: 'exact',
  capacity: 'verified_spend',
  'evidence-url': 'https://example.com/evidence',
  'observed-at': today,
  confidence: 'verified',
  offer: 'uma pagina de campanha por R$97',
});

assert.strictEqual(freshnessMultiplier(3), 1);
assert.strictEqual(freshnessMultiplier(31), 0);
assert.strictEqual(evidenceMultiplier({ url: 'x', observedAt: today, confidence: 'verified' }), 1);
assert.strictEqual(calculateScore(prospect).total, 92);
assert.strictEqual(calculateScore(prospect).eligible, true);
assert.strictEqual(calculateScore({
  ...prospect,
  evidence: { url: null, observedAt: today, confidence: 'verified' },
}).eligible, false);

console.log('signal-intelligence: tests passed');
